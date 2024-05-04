import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { logPrefix, rawtext } from "..";
import "./commands";
import "./music";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { Actor, ActorDamageCause, ActorDefinitionIdentifier, ActorType, DimensionId } from "bdsx/bds/actor";
import { createCItemStack } from "../utils";
import { readFileSync } from "fs";
import { join } from "path";
import { bedrockServer } from "bdsx/launcher";
import { Form } from "bdsx/bds/form";
import { storageManager } from "bdsx/storage";
import { Player } from "bdsx/bds/player";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";
import { PlayerInteractEvent } from "bdsx/event_impl/entityevent";
import { ArmorSlot } from "bdsx/bds/inventory";
import { isTimelineRunning } from "./timeline";

export const lobbyCoords: Vec3 = Vec3.create(0.5, -2, 0.5);

const pkTimes = storageManager.getSync<StoragePkTimes>("pkTimes");
if (pkTimes.data === undefined) {
    // initialize
    pkTimes.init({});
}

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
    if (isTimelineRunning) return;
    const pl = e.player;
    if (pl.hasTag("admin")) return;

    if (pl.hasTag("parkour")) {
        pl.removeTag("parkour");
        pl.removeTag("parkourElytra");
    }

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

events.playerInteract.on(playerInteractLis);
async function playerInteractLis(e: PlayerInteractEvent) {
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
        pl.sendMessage(`§aYou found the §l§f${landmark.title} §r§f(${landmark.subtitle}§f) §alandmark! §f${discoveredLandmarks.length}§7/§f32`);
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
}

events.playerInteract.onAfter(e => {
    if (e.victim.getEntityTypeId() === ActorType.ArmorStand) return CANCEL;
}, playerInteractLis);


function millisToMinutesAndSeconds(millis: number) {
    let minutes = Math.floor(millis / 60000);
    let seconds = Number(((millis % 60000) / 1000).toFixed(0));
    let milliseconds = (millis % 1000);

    return (
        seconds == 60 ?
        (minutes+1) + ":00." + (milliseconds === 0 ? "000" : milliseconds) :
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (milliseconds === 0 ? "000" : milliseconds)
    );
}

type StoragePkTimes = {
    [player: string]: number
}
function storePkTime(plName: string, time: number) {
    if (pkTimes.data[plName] < time) return; // Not a high score
    pkTimes.data[plName] = time;

    bedrockServer.executeCommand("hologram remove pkLb");
    const times = JSON.parse(JSON.stringify(pkTimes.data)); // Deep copy = no referencing
    const sortedTimes: [string, number][] = Object.entries(times);

    // Sort the array based on the values (ascending order)
    sortedTimes.sort((a, b) => a[1] - b[1]);
    let lbStr = "§l§eParkour times"
    sortedTimes.forEach((value, index) => {
        lbStr += `\n§7${index+1}. §f${value[0]} §8- §6${millisToMinutesAndSeconds(value[1])}`
    });
    bedrockServer.executeCommand(`hologram create raw pkLb ${rawtext(lbStr)} 11 0 9`);
}

let ticks = 0;
const startPkPos = [15, 0, 8],
      endPkPos = [-79, 68, 9],
      checkpoint1 = [7, 35, -40],
      checkpoint2 = [-46, 96, -68];
const plPkTime = new Map<Player, [number, number, number]>(); // [time, elytraLoops, checkpoint]

events.levelTick.on(e => {
    const level = e.level;
    ticks++;

    level.getPlayers().forEach(pl => {
        // SPEED BOOTS
        if (pl.getArmor(ArmorSlot.Feet).getName() === "minecraft:iron_boots")
            pl.addEffect(MobEffectInstance.create(MobEffectIds.Speed, 5, 15, false, false, false));

        if (isTimelineRunning) return;
        const pos = pl.getPosition();
        if (pl.hasTag("parkour") && pl.isPlayerInitialized()) {
            if (!plPkTime.has(pl)) return;
            let time = plPkTime.get(pl)![0];
            let checkpoint = plPkTime.get(pl)![2];
            const floorPos = {
                x: Math.floor(pos.x),
                y: Math.floor(pos.y),
                z: Math.floor(pos.z)
            }

            if (floorPos.x === startPkPos[0] && (floorPos.y - 1) === startPkPos[1] && floorPos.z  === startPkPos[2]) { // Restart parkour
                time = 0;
            } else if (floorPos.x === endPkPos[0] && (floorPos.y - 1) === endPkPos[1] && floorPos.z  === endPkPos[2]) { // End parkour
                if (plPkTime.get(pl)![1] === 3) { // If made the 3 loops
                    pl.removeTag("parkour");
                    pl.removeTag("parkourElytra");
                    if (!plPkTime.has(pl)) return;
                    pl.sendTitle("§6Parkour ended", "§7Time: §f" + millisToMinutesAndSeconds(time));
                    pl.playSound("random.totem");
                    storePkTime(pl.getNameTag(), time);
                    plPkTime.delete(pl);

                    pl.runCommand("clear @s elytra");
                    pl.runCommand("clear @s light_weighted_pressure_plate");
                    pl.runCommand("clear @s wooden_door");
                    pl.runCommand("clear @s iron_door");
                    pl.addEffect(MobEffectInstance.create(MobEffectIds.SlowFalling, 20*15));

                    const speedBoots = createCItemStack({
                        item: "iron_boots",
                        name: "§r§fSpeed §iboots"
                    });
                    pl.addItem(speedBoots);
                    pl.sendInventory();
                    speedBoots.destruct();
                }
            } else if (floorPos.x === checkpoint1[0] && (floorPos.y - 1) === checkpoint1[1] && floorPos.z  === checkpoint1[2]) { // CHECKPOINT 1
                if (checkpoint === 0) {
                    checkpoint++;
                    pl.sendTitle("§r", "§aCheckpoint 1");
                    pl.playSound("random.click");
                }
            } else if (floorPos.x === checkpoint2[0] && (floorPos.y - 1) === checkpoint2[1] && floorPos.z  === checkpoint2[2]) { // CHECKPOINT 2
                if (checkpoint === 1) {
                    checkpoint++;
                    pl.sendTitle("§r", "§aCheckpoint 2");
                    pl.playSound("random.click");
                } else if (checkpoint === 0) {
                    pl.sendTitle("§r", "§cYou missed checkpoint 1!");
                }
            }
            else if (pl.hasTag("parkourElytra")) { // If player is at elytra section
                let loops = plPkTime.get(pl)![1];
                const region = pl.getRegion();
                const blockpos = BlockPos.create(floorPos.x, floorPos.y, floorPos.z);
                const insideBlock = region.getBlock(blockpos);
                const dim = bedrockServer.level.getDimension(DimensionId.Overworld);
                if (insideBlock.getName() === "minecraft:structure_void") {
                    if ((blockpos.x < -13 && blockpos.x > -19) && (blockpos.y < 90 && blockpos.y > 82) && (blockpos.z < -46 && blockpos.z > -52)) { // FIRST LOOP
                        if (loops === 0) {
                            loops = 1;
                            pl.playSound("random.pop");
                            if (dim) bedrockServer.level.spawnParticleEffect("minecraft:sonic_explosion", pos, dim);
                        }
                    } else if ((blockpos.x < -40 && blockpos.x > -46) && (blockpos.y < 68 && blockpos.y > 58) && (blockpos.z < -27 && blockpos.z > -36)) { // SECOND LOOP
                        if (loops === 1) {
                            loops = 2;
                            pl.playSound("random.pop");
                            if (dim) bedrockServer.level.spawnParticleEffect("minecraft:sonic_explosion", pos, dim);
                        } else if (loops === 0) {
                            pl.sendTitle("§r", "§cIt appears you haven't gone through the previous loops");
                        }
                    } else if ((blockpos.x < -63 && blockpos.x > -67) && (blockpos.y < 75 && blockpos.y > 69) && (blockpos.z < -25 && blockpos.z > -31)) { // THIRD LOOP
                        if (loops === 2) {
                            loops = 3;
                            pl.playSound("random.orb");
                            if (dim) bedrockServer.level.spawnParticleEffect("minecraft:sonic_explosion", pos, dim);
                        } else if (loops < 2) {
                            pl.sendTitle("§r", "§cIt appears you haven't gone through the previous loops");
                        }
                    }
                }
                pl.sendActionbar(`§2Loops: §a${loops}§2/§a3\n§6Time: §f${millisToMinutesAndSeconds(time)}`);
                time += 50;
                plPkTime.set(pl, [time, loops, checkpoint]);
                return;
            } else if ((floorPos.x < -28 && floorPos.x > -33) && (floorPos.y < 101 && floorPos.y > 97) && (floorPos.z > -67 && floorPos.z < -62)) {
                // Player enters elytra section
                if (checkpoint === 2) {
                    const elytra = createCItemStack({
                        item: "elytra",
                        amount: 1,
                        lore: ["Go through all 3 loops!"]
                    });
                    pl.setArmor(ArmorSlot.Chest, elytra);
                    pl.sendMessage("§l§6> §r§eGo through all 3 loops!");
                    pl.addTag("parkourElytra");
                } else {
                    pl.sendTitle("§r", "§cIt appears you haven't gone through all checkpoints");
                }
            }

            pl.sendActionbar("§6Time: §f" + millisToMinutesAndSeconds(time));
            time += 50;
            plPkTime.set(pl, [time, 0, checkpoint]);
        } else { // Start parkour
            if (Math.floor(pos.x) === startPkPos[0] && (Math.floor(pos.y) - 1) === startPkPos[1] && Math.floor(pos.z)  === startPkPos[2]) {
                const item1 = createCItemStack({
                    item: "light_weighted_pressure_plate",
                    amount: 1,
                    name: "§r§3Checkpoint"
                });
                const item2 = createCItemStack({
                    item: "wooden_door",
                    amount: 1,
                    name: "§r§eRestart"
                });
                const item3 = createCItemStack({
                    item: "iron_door",
                    amount: 1,
                    name: "§r§cLeave parkour"
                });
                pl.addItem(item1);   pl.addItem(item2);   pl.addItem(item3);
                pl.sendInventory();
                item1.destruct();   item2.destruct();   item3.destruct();

                pl.runCommand("clear @s iron_boots");
                pl.addTag("parkour");
                plPkTime.set(pl, [0, 0, 0]);
                pl.sendTitle("§r", "§aParkour started");
                pl.playSound("note.harp");
            }
        }
    });

    if (ticks === 20*60) { // Every 60 seconds
        ticks = 0;
        bedrockServer.executeCommand("effect @a saturation 9999 255 true");
        level.getEntities().forEach(actor => {
            if (actor.getEntityTypeId() === ActorType.ArmorStand && actor.getNameTag().length > 0) {
                actor.addEffect(MobEffectInstance.create(MobEffectIds.Invisibility, 9999, 255, false, false, false));
            }
        });
    }
});
export function plLeavePk(pl: Player) {
    pl.removeTag("parkour");
    pl.removeTag("parkourElytra");
    plPkTime.delete(pl);
    pl.runCommand("clear @s elytra");
    pl.runCommand("clear @s light_weighted_pressure_plate");
    pl.runCommand("clear @s wooden_door");
    pl.runCommand("clear @s iron_door");
}

events.itemUse.on(e => {
    const item = e.itemStack;
    const pl = e.player;
    if (item.getCustomName() === "§r§bBack to hub") {
        pl.runCommand("spawn");
    } else if (item.getCustomName() === "§r§3Checkpoint") {
        if (plPkTime.has(pl)) {
            switch (plPkTime.get(pl)![2]) {
                case 1:
                    pl.teleport(Vec3.create(checkpoint1[0], checkpoint1[1], checkpoint1[2]));
                    break;
                case 2:
                    pl.teleport(Vec3.create(checkpoint2[0], checkpoint2[1], checkpoint2[2]));
                    break;
                case 0:
                default:
                    pl.teleport(Vec3.create(15.5, 0, 8.5));
            }
        }
    } else if (item.getCustomName() === "§r§eRestart") {
        pl.teleport(Vec3.create(15.5, 0, 8.5));
    } else if (item.getCustomName() === "§r§cLeave parkour") {
        pl.playSound("note.snare");
        plLeavePk(pl);
    }
});

events.entityHurt.on(e => {
    if (!e.entity.isPlayer()) return;
    const pl = e.entity;
    if (e.damageSource.cause === ActorDamageCause.Fall && pl.hasTag("parkour")) return CANCEL;
});

events.playerAttack.on(() => {
    return CANCEL;
})

events.chestOpen.on(() => {
    return CANCEL;
});

events.playerDropItem.on(() => {
    return CANCEL;
});

events.playerDimensionChange.on(e => {
    if (e.dimension === DimensionId.Nether) return CANCEL;
});
