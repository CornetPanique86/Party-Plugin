// On server start
import { events } from "bdsx/event";
import { logPrefix } from "..";
import "./commands";
import { Vec3 } from "bdsx/bds/blockpos";
import { bedrockServer } from "bdsx/launcher";
import { proc } from "bdsx/bds/symbols";
import { MemoryUnlocker } from "bdsx/unlocker";
import { procHacker } from "bdsx/prochacker";
import { spectateStop } from "./utils";
import { CANCEL } from "bdsx/common";
import { ActorDamageCause } from "bdsx/bds/actor";

export enum Games {
    none = "None",
    bedwars = "Bedwars",
    hikabrain = "Hikabrain",
    hidenseek = "Hide 'n' Seek"
}
type IsGameRunning = {
    game: Games;
    isRunning: boolean;
    isSpectateInitialized: boolean;
}
export const isGameRunning: IsGameRunning = {
    game: Games.none,
    isRunning: false,
    isSpectateInitialized: false
};

export const lobbyCoords: Vec3 = Vec3.create(0, 106, 0);

function unlock_limit_of_fill(): void {
    const symbolName = "?execute@FillCommand@@UEBAXAEBVCommandOrigin@@AEAVCommandOutput@@@Z";
    const symbolPtr = proc[symbolName];
    const unlocker = new MemoryUnlocker(symbolPtr, 0x1f);
    const offset = 0x137;
    if (
        procHacker.check(
            "unlocking-limit-of-fill-command",
            symbolName,
            offset,
            symbolPtr.add(offset),
            // prettier-ignore
            [
                0x41, 0x81, 0xff, 0x00, 0x80, 0x00, 0x00,
                0x0f, 0x8e, 0xb2, 0x01, 0x00, 0x00,
                0x41, 0x8b, 0xd7,
                0x48, 0x8d, 0x4d, 0xf0,
                0xe8, 0xa0, 0x6c, 0xbf, 0xFF,
                0x90,
                0xba, 0x00, 0x80, 0x00, 0x00,
            ],
        )
    ) {
        // limit 0x8000 to 0x800000
        const p1 = symbolPtr.add(0x13a);
        const buf = new Uint8Array([0x00, 0x00, 0x80, 0x00]);
        p1.setBuffer(buf);
        p1.add(0x18).setBuffer(buf);
    }
    unlocker.done();
}
unlock_limit_of_fill();


console.log(logPrefix + "UG plugin loaded");

events.entityHurt.on(e => {
    if (!e.entity.isPlayer()) return;
    const pl = e.entity;
    if (pl.hasTag("bedwars") || pl.hasTag("hikabrain")) return;
    if (e.damageSource.cause === ActorDamageCause.Fall) return CANCEL;
});

events.playerJoin.on(e => {
    const pl = e.player;
    if (!isGameRunning.isRunning) { // If game is not running
        if (pl.hasTag("bedwars") || pl.hasTag("hikabrain") || pl.hasTag("hidenseek")) {
            pl.removeTag("bedwars");
            pl.removeTag("hikabrain");
            pl.removeTag("hidenseek");
            pl.runCommand(`event entity @s ug:show_name`);
        }
        if (pl.hasTag("spectator")) {
            spectateStop(pl);
        }
        pl.removeAllEffects();
        bedrockServer.executeCommand(`clear ${pl.getNameTag()}`);
        pl.teleport(Vec3.create(0, 105, 0));
    }
});