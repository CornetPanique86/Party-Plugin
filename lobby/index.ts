import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { logPrefix, rawtext } from "..";
import "./commands";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { Actor, ActorDefinitionIdentifier, ActorType, DimensionId } from "bdsx/bds/actor";
import { createCItemStack } from "../utils";
import { readFileSync } from "fs";
import { join } from "path";
import { bedrockServer } from "bdsx/launcher";
import { Form } from "bdsx/bds/form";
import { storageManager } from "bdsx/storage";
import { Player } from "bdsx/bds/player";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";

export const lobbyCoords: Vec3 = Vec3.create(0.5, -2, 0.5);

console.log(logPrefix + "Lobby plugin loaded");

let landmarks:any;
export function reloadLandmarksVar(): string {
    try {
        landmarks = JSON.parse(readFileSync(join(process.cwd(), "..", "plugins", "Party-Plugin", "lobby", "landmarks.json"), 'utf-8')) || {};
        return "Reloaded landmarks.json";
    } catch (e) {
        console.error(e);
        landmarks = {};
        return "File read error";
    }
}
reloadLandmarksVar();

export function landmarksReset():string {
    for (const key in landmarks) {
        if (Object.prototype.hasOwnProperty.call(landmarks, key)) {
            bedrockServer.executeCommand("hologram remove " + key);
            const landmark = landmarks[key];
            const tellraw = `§l${landmark.title}\n§r§f${landmark.subtitle}\n§7${landmark.author}\n§7§o${landmark.date}`;
            const pos = landmark.pos || [0, -1, 0];
            bedrockServer.executeCommand(`hologram create raw ${key} ${rawtext(tellraw)} ${pos[0]} ${pos[1]} ${pos[2]}`);
        }
    }
    return "Landmarks reset successfully";
}

export function landmarksASReset():string {
    for (const key in landmarks) {
        if (Object.prototype.hasOwnProperty.call(landmarks, key)) {
            const pos = landmarks[key].pos || [0, -1, 0];
            bedrockServer.executeCommand("kill @e[type=armor_stand,name=" + key + "]");
            // summon armor stand
            const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
            if (!region) continue;
            const identifier = ActorDefinitionIdentifier.constructWith("minecraft:armor_stand");
            const entity = Actor.summonAt(region, Vec3.create(pos[0]+0.5, pos[1], pos[2]+0.5), identifier);
            identifier.destruct();
            if (entity === null) {
                console.log("Can't spawn the entity");
                continue;
            }
            entity.setNameTag(key);
        }
    }
    return "Landmarks armor stands resummoned successfully";
}

events.playerJoin.on(async e => {
    const pl = e.player;
    if (pl.hasTag("admin")) return;
    pl.runCommand("clear");
    const item = createCItemStack({
        item: "red_dye",
        amount: 1,
        name: "§r§bBack to hub"
    });
    pl.addItem(item);
    pl.getInventory().swapSlots(0, 8);
    pl.sendInventory();
    item.destruct();
    pl.teleport(lobbyCoords);
});

events.playerInteract.on(async e => {
    if (e.victim.getEntityTypeId() !== ActorType.ArmorStand) return;
    if (!Object.prototype.hasOwnProperty.call(landmarks, e.victim.getNameTag())) return;
    const key = e.victim.getNameTag();
    const landmark = landmarks[key];
    const pl = e.player;

    const db = await storageManager.get<string[]>(pl);
    if (!db.isLoaded) return;
    if (db.data === undefined) {
        // Initialize player storage
        db.init([]);
    }

    const discoveredLandmarks: string[] = db.data;
    let status: boolean = false;
    if (!discoveredLandmarks.includes(key)) { // Just discovered
        discoveredLandmarks.push(key);
        pl.sendMessage(`§aYou found the §l§f${landmark.title} §r§f(${landmark.subtitle}§f) §alandmark! §f${discoveredLandmarks.length}§7/§f30`);
        pl.playSound("random.levelup");
        status = true;
    }
    storageManager.close(pl);


    Form.sendTo(pl.getNetworkIdentifier(), {
        type: "custom_form",
        title: landmark.title,
        content: [
            {
                type: "label",
                text: `§6Status: ${status ? "§aDiscovered" : "§4Already Found"}\n§r§l${landmark.title}§r§7, §r${landmark.subtitle}\n§7Builder: §r${landmark.author}\n§7Date: §r${landmark.date}\n\n${landmark.content}`
            }
        ]
    });
});

let ticks = 0;
let pkStartAS: Actor | undefined,
    pkEndAS: Actor | undefined;
bedrockServer.level.getEntities().forEach(actor => {
    if (actor.getEntityTypeId() === ActorType.ArmorStand) {
        if (actor.getNameTag() === "pkStart") pkStartAS = actor
        else if (actor.getNameTag() === "pkEnd") pkEndAS = actor;
    }
});
const tickInterval = setInterval(() => {
    ticks++;

    bedrockServer.level.getPlayers().forEach(pl => {
        const pos = pl.getPosition();
        if (pl.hasTag("parkour")) {

        } else {
            if (!pkStartAS || !pkEndAS) return;
            if (pkStartAS?.distanceTo(pos) < 0.5) {

            } else if (pkEndAS?.distanceTo(pos) < 0.5) {

            }
        }
    })

    if (ticks === 20*60) { // Every 60 seconds
        bedrockServer.level.getEntities().forEach(actor => {
            if (actor.getEntityTypeId() === ActorType.ArmorStand) {
                console.log(actor.getNameTag());
                actor.addEffect(MobEffectInstance.create(MobEffectIds.Invisibility, 9999, 255, false, false, false));
            }
        })
    }
}, 50);

events.itemUse.on(e => {
    const item = e.itemStack;
    if (item.getCustomName() === "§r§bBack to hub") {
        e.player.runCommand("spawn");
    }
});

events.playerDropItem.on(() => {
    return CANCEL;
});

events.playerDimensionChange.on(e => {
    if (e.dimension === DimensionId.Nether) return CANCEL;
});

events.serverClose.on(() => {
    clearInterval(tickInterval);
});