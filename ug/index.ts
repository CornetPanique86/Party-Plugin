// On server start
import { events } from "bdsx/event";
import { logPrefix } from "..";
import "./commands";
import { Vec3 } from "bdsx/bds/blockpos";
import { bedrockServer } from "bdsx/launcher";

export enum Games {
    none = "None",
    bedwars = "Bedwars",
    hikabrain = "Hikabrain"
}
type IsGameRunning = {
    game: Games;
    isRunning: boolean;
}
export const isGameRunning: IsGameRunning = {
    game: Games.none,
    isRunning: false
};

export const lobbyCoords: Vec3 = Vec3.create(0, 106, 0);

console.log(logPrefix + "UG plugin loaded");

events.playerJoin.on(e => {
    const pl = e.player;
    if ((pl.hasTag("bedwars") || pl.hasTag("hikabrain") || !isGameRunning.isRunning)) {
        pl.removeTag("bedwars");
        pl.removeTag("hikabrain");
        pl.removeAllEffects();
        bedrockServer.executeCommand(`clear ${pl.getNameTag()}`);
        pl.teleport(Vec3.create(0, 105, 0));
    }
})