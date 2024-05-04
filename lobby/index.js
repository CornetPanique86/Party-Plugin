"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plLeavePk = exports.landmarksASReset = exports.landmarksReset = exports.reloadLandmarksVar = exports.lobbyCoords = void 0;
const blockpos_1 = require("bdsx/bds/blockpos");
const __1 = require("..");
require("./commands");
require("./music");
const event_1 = require("bdsx/event");
const common_1 = require("bdsx/common");
const actor_1 = require("bdsx/bds/actor");
const utils_1 = require("../utils");
const fs_1 = require("fs");
const path_1 = require("path");
const launcher_1 = require("bdsx/launcher");
const form_1 = require("bdsx/bds/form");
const storage_1 = require("bdsx/storage");
const effects_1 = require("bdsx/bds/effects");
const inventory_1 = require("bdsx/bds/inventory");
const timeline_1 = require("./timeline");
exports.lobbyCoords = blockpos_1.Vec3.create(0.5, -2, 0.5);
const pkTimes = storage_1.storageManager.getSync("pkTimes");
if (pkTimes.data === undefined) {
    // initialize
    pkTimes.init({});
}
console.log(__1.logPrefix + "Lobby plugin loaded");
let landmarks;
function reloadLandmarksVar() {
    try {
        landmarks = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), "..", "plugins", "Party-Plugin", "lobby", "landmarks.json"), 'utf-8')) || {};
        return "Reloaded landmarks.json";
    }
    catch (e) {
        console.error(e);
        landmarks = {};
        return "File read error";
    }
}
exports.reloadLandmarksVar = reloadLandmarksVar;
reloadLandmarksVar();
function landmarksReset() {
    for (const key in landmarks) {
        if (Object.prototype.hasOwnProperty.call(landmarks, key)) {
            launcher_1.bedrockServer.executeCommand("hologram remove " + key);
            const landmark = landmarks[key];
            const tellraw = `§l${landmark.title}\n§r§f${landmark.subtitle}\n§7${landmark.author}\n§7§o${landmark.date}`;
            const pos = landmark.pos || [0, -1, 0];
            launcher_1.bedrockServer.executeCommand(`hologram create raw ${key} ${(0, __1.rawtext)(tellraw)} ${pos[0]} ${pos[1]} ${pos[2]}`);
        }
    }
    return "Landmarks reset successfully";
}
exports.landmarksReset = landmarksReset;
function landmarksASReset() {
    var _a;
    for (const key in landmarks) {
        if (Object.prototype.hasOwnProperty.call(landmarks, key)) {
            const pos = landmarks[key].pos || [0, -1, 0];
            launcher_1.bedrockServer.executeCommand("kill @e[type=armor_stand,name=" + key + "]");
            // summon armor stand
            const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
            if (!region)
                continue;
            const identifier = actor_1.ActorDefinitionIdentifier.constructWith("minecraft:armor_stand");
            const entity = actor_1.Actor.summonAt(region, blockpos_1.Vec3.create(pos[0] + 0.5, pos[1], pos[2] + 0.5), identifier);
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
exports.landmarksASReset = landmarksASReset;
event_1.events.playerJoin.on(async (e) => {
    if (timeline_1.isTimelineRunning)
        return;
    const pl = e.player;
    if (pl.hasTag("admin"))
        return;
    if (pl.hasTag("parkour")) {
        pl.removeTag("parkour");
        pl.removeTag("parkourElytra");
    }
    pl.runCommand("clear");
    const item = (0, utils_1.createCItemStack)({
        item: "red_dye",
        amount: 1,
        name: "§r§bBack to hub"
    });
    pl.addItem(item);
    pl.getInventory().swapSlots(0, 8);
    pl.sendInventory();
    item.destruct();
    pl.teleport(exports.lobbyCoords);
});
event_1.events.playerInteract.on(playerInteractLis);
async function playerInteractLis(e) {
    if (e.victim.getEntityTypeId() !== actor_1.ActorType.ArmorStand)
        return;
    if (!Object.prototype.hasOwnProperty.call(landmarks, e.victim.getNameTag()))
        return;
    const key = e.victim.getNameTag();
    const landmark = landmarks[key];
    const pl = e.player;
    const db = await storage_1.storageManager.get(pl);
    if (!db.isLoaded)
        return;
    if (db.data === undefined) {
        // Initialize player storage
        db.init([]);
    }
    const discoveredLandmarks = db.data;
    let status = false;
    if (!discoveredLandmarks.includes(key)) { // Just discovered
        discoveredLandmarks.push(key);
        pl.sendMessage(`§aYou found the §l§f${landmark.title} §r§f(${landmark.subtitle}§f) §alandmark! §f${discoveredLandmarks.length}§7/§f32`);
        pl.playSound("random.levelup");
        status = true;
    }
    storage_1.storageManager.close(pl);
    form_1.Form.sendTo(pl.getNetworkIdentifier(), {
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
event_1.events.playerInteract.onAfter(e => {
    if (e.victim.getEntityTypeId() === actor_1.ActorType.ArmorStand)
        return common_1.CANCEL;
}, playerInteractLis);
function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = Number(((millis % 60000) / 1000).toFixed(0));
    let milliseconds = (millis % 1000);
    return (seconds == 60 ?
        (minutes + 1) + ":00." + (milliseconds === 0 ? "000" : milliseconds) :
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (milliseconds === 0 ? "000" : milliseconds));
}
function storePkTime(plName, time) {
    if (pkTimes.data[plName] < time)
        return; // Not a high score
    pkTimes.data[plName] = time;
    launcher_1.bedrockServer.executeCommand("hologram remove pkLb");
    const times = JSON.parse(JSON.stringify(pkTimes.data)); // Deep copy = no referencing
    const sortedTimes = Object.entries(times);
    // Sort the array based on the values (ascending order)
    sortedTimes.sort((a, b) => a[1] - b[1]);
    let lbStr = "§l§eParkour times";
    sortedTimes.forEach((value, index) => {
        lbStr += `\n§7${index + 1}. §f${value[0]} §8- §6${millisToMinutesAndSeconds(value[1])}`;
    });
    launcher_1.bedrockServer.executeCommand(`hologram create raw pkLb ${(0, __1.rawtext)(lbStr)} 11 0 9`);
}
let ticks = 0;
const startPkPos = [15, 0, 8], endPkPos = [-79, 68, 9], checkpoint1 = [7, 35, -40], checkpoint2 = [-46, 96, -68];
const plPkTime = new Map(); // [time, elytraLoops, checkpoint]
event_1.events.levelTick.on(e => {
    const level = e.level;
    ticks++;
    level.getPlayers().forEach(pl => {
        // SPEED BOOTS
        if (pl.getArmor(inventory_1.ArmorSlot.Feet).getName() === "minecraft:iron_boots")
            pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Speed, 5, 15, false, false, false));
        if (timeline_1.isTimelineRunning)
            return;
        const pos = pl.getPosition();
        if (pl.hasTag("parkour") && pl.isPlayerInitialized()) {
            if (!plPkTime.has(pl))
                return;
            let time = plPkTime.get(pl)[0];
            let checkpoint = plPkTime.get(pl)[2];
            const floorPos = {
                x: Math.floor(pos.x),
                y: Math.floor(pos.y),
                z: Math.floor(pos.z)
            };
            if (floorPos.x === startPkPos[0] && (floorPos.y - 1) === startPkPos[1] && floorPos.z === startPkPos[2]) { // Restart parkour
                time = 0;
            }
            else if (floorPos.x === endPkPos[0] && (floorPos.y - 1) === endPkPos[1] && floorPos.z === endPkPos[2]) { // End parkour
                if (plPkTime.get(pl)[1] === 3) { // If made the 3 loops
                    pl.removeTag("parkour");
                    pl.removeTag("parkourElytra");
                    if (!plPkTime.has(pl))
                        return;
                    pl.sendTitle("§6Parkour ended", "§7Time: §f" + millisToMinutesAndSeconds(time));
                    pl.playSound("random.totem");
                    storePkTime(pl.getNameTag(), time);
                    plPkTime.delete(pl);
                    pl.runCommand("clear @s elytra");
                    pl.runCommand("clear @s light_weighted_pressure_plate");
                    pl.runCommand("clear @s wooden_door");
                    pl.runCommand("clear @s iron_door");
                    pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.SlowFalling, 20 * 15));
                    const speedBoots = (0, utils_1.createCItemStack)({
                        item: "iron_boots",
                        name: "§r§fSpeed §iboots"
                    });
                    pl.addItem(speedBoots);
                    pl.sendInventory();
                    speedBoots.destruct();
                }
            }
            else if (floorPos.x === checkpoint1[0] && (floorPos.y - 1) === checkpoint1[1] && floorPos.z === checkpoint1[2]) { // CHECKPOINT 1
                if (checkpoint === 0) {
                    checkpoint++;
                    pl.sendTitle("§r", "§aCheckpoint 1");
                    pl.playSound("random.click");
                }
            }
            else if (floorPos.x === checkpoint2[0] && (floorPos.y - 1) === checkpoint2[1] && floorPos.z === checkpoint2[2]) { // CHECKPOINT 2
                if (checkpoint === 1) {
                    checkpoint++;
                    pl.sendTitle("§r", "§aCheckpoint 2");
                    pl.playSound("random.click");
                }
                else if (checkpoint === 0) {
                    pl.sendTitle("§r", "§cYou missed checkpoint 1!");
                }
            }
            else if (pl.hasTag("parkourElytra")) { // If player is at elytra section
                let loops = plPkTime.get(pl)[1];
                const region = pl.getRegion();
                const blockpos = blockpos_1.BlockPos.create(floorPos.x, floorPos.y, floorPos.z);
                const insideBlock = region.getBlock(blockpos);
                const dim = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld);
                if (insideBlock.getName() === "minecraft:structure_void") {
                    if ((blockpos.x < -13 && blockpos.x > -19) && (blockpos.y < 90 && blockpos.y > 82) && (blockpos.z < -46 && blockpos.z > -52)) { // FIRST LOOP
                        if (loops === 0) {
                            loops = 1;
                            pl.playSound("random.pop");
                            if (dim)
                                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:sonic_explosion", pos, dim);
                        }
                    }
                    else if ((blockpos.x < -40 && blockpos.x > -46) && (blockpos.y < 68 && blockpos.y > 58) && (blockpos.z < -27 && blockpos.z > -36)) { // SECOND LOOP
                        if (loops === 1) {
                            loops = 2;
                            pl.playSound("random.pop");
                            if (dim)
                                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:sonic_explosion", pos, dim);
                        }
                        else if (loops === 0) {
                            pl.sendTitle("§r", "§cIt appears you haven't gone through the previous loops");
                        }
                    }
                    else if ((blockpos.x < -63 && blockpos.x > -67) && (blockpos.y < 75 && blockpos.y > 69) && (blockpos.z < -25 && blockpos.z > -31)) { // THIRD LOOP
                        if (loops === 2) {
                            loops = 3;
                            pl.playSound("random.orb");
                            if (dim)
                                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:sonic_explosion", pos, dim);
                        }
                        else if (loops < 2) {
                            pl.sendTitle("§r", "§cIt appears you haven't gone through the previous loops");
                        }
                    }
                }
                pl.sendActionbar(`§2Loops: §a${loops}§2/§a3\n§6Time: §f${millisToMinutesAndSeconds(time)}`);
                time += 50;
                plPkTime.set(pl, [time, loops, checkpoint]);
                return;
            }
            else if ((floorPos.x < -28 && floorPos.x > -33) && (floorPos.y < 101 && floorPos.y > 97) && (floorPos.z > -67 && floorPos.z < -62)) {
                // Player enters elytra section
                if (checkpoint === 2) {
                    const elytra = (0, utils_1.createCItemStack)({
                        item: "elytra",
                        amount: 1,
                        lore: ["Go through all 3 loops!"]
                    });
                    pl.setArmor(inventory_1.ArmorSlot.Chest, elytra);
                    pl.sendMessage("§l§6> §r§eGo through all 3 loops!");
                    pl.addTag("parkourElytra");
                }
                else {
                    pl.sendTitle("§r", "§cIt appears you haven't gone through all checkpoints");
                }
            }
            pl.sendActionbar("§6Time: §f" + millisToMinutesAndSeconds(time));
            time += 50;
            plPkTime.set(pl, [time, 0, checkpoint]);
        }
        else { // Start parkour
            if (Math.floor(pos.x) === startPkPos[0] && (Math.floor(pos.y) - 1) === startPkPos[1] && Math.floor(pos.z) === startPkPos[2]) {
                const item1 = (0, utils_1.createCItemStack)({
                    item: "light_weighted_pressure_plate",
                    amount: 1,
                    name: "§r§3Checkpoint"
                });
                const item2 = (0, utils_1.createCItemStack)({
                    item: "wooden_door",
                    amount: 1,
                    name: "§r§eRestart"
                });
                const item3 = (0, utils_1.createCItemStack)({
                    item: "iron_door",
                    amount: 1,
                    name: "§r§cLeave parkour"
                });
                pl.addItem(item1);
                pl.addItem(item2);
                pl.addItem(item3);
                pl.sendInventory();
                item1.destruct();
                item2.destruct();
                item3.destruct();
                pl.runCommand("clear @s iron_boots");
                pl.addTag("parkour");
                plPkTime.set(pl, [0, 0, 0]);
                pl.sendTitle("§r", "§aParkour started");
                pl.playSound("note.harp");
            }
        }
    });
    if (ticks === 20 * 60) { // Every 60 seconds
        ticks = 0;
        launcher_1.bedrockServer.executeCommand("effect @a saturation 9999 255 true");
        level.getEntities().forEach(actor => {
            if (actor.getEntityTypeId() === actor_1.ActorType.ArmorStand && actor.getNameTag().length > 0) {
                actor.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Invisibility, 9999, 255, false, false, false));
            }
        });
    }
});
function plLeavePk(pl) {
    pl.removeTag("parkour");
    pl.removeTag("parkourElytra");
    plPkTime.delete(pl);
    pl.runCommand("clear @s elytra");
    pl.runCommand("clear @s light_weighted_pressure_plate");
    pl.runCommand("clear @s wooden_door");
    pl.runCommand("clear @s iron_door");
}
exports.plLeavePk = plLeavePk;
event_1.events.itemUse.on(e => {
    const item = e.itemStack;
    const pl = e.player;
    if (item.getCustomName() === "§r§bBack to hub") {
        pl.runCommand("spawn");
    }
    else if (item.getCustomName() === "§r§3Checkpoint") {
        if (plPkTime.has(pl)) {
            switch (plPkTime.get(pl)[2]) {
                case 1:
                    pl.teleport(blockpos_1.Vec3.create(checkpoint1[0], checkpoint1[1], checkpoint1[2]));
                    break;
                case 2:
                    pl.teleport(blockpos_1.Vec3.create(checkpoint2[0], checkpoint2[1], checkpoint2[2]));
                    break;
                case 0:
                default:
                    pl.teleport(blockpos_1.Vec3.create(15.5, 0, 8.5));
            }
        }
    }
    else if (item.getCustomName() === "§r§eRestart") {
        pl.teleport(blockpos_1.Vec3.create(15.5, 0, 8.5));
    }
    else if (item.getCustomName() === "§r§cLeave parkour") {
        pl.playSound("note.snare");
        plLeavePk(pl);
    }
});
event_1.events.entityHurt.on(e => {
    if (!e.entity.isPlayer())
        return;
    const pl = e.entity;
    if (e.damageSource.cause === actor_1.ActorDamageCause.Fall && pl.hasTag("parkour"))
        return common_1.CANCEL;
});
event_1.events.playerAttack.on(() => {
    return common_1.CANCEL;
});
event_1.events.chestOpen.on(() => {
    return common_1.CANCEL;
});
event_1.events.playerDropItem.on(() => {
    return common_1.CANCEL;
});
event_1.events.playerDimensionChange.on(e => {
    if (e.dimension === actor_1.DimensionId.Nether)
        return common_1.CANCEL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnREFBbUQ7QUFDbkQsMEJBQXdDO0FBQ3hDLHNCQUFvQjtBQUNwQixtQkFBaUI7QUFDakIsc0NBQW9DO0FBQ3BDLHdDQUFxQztBQUNyQywwQ0FBNEc7QUFDNUcsb0NBQTRDO0FBQzVDLDJCQUFrQztBQUNsQywrQkFBNEI7QUFDNUIsNENBQThDO0FBQzlDLHdDQUFxQztBQUNyQywwQ0FBOEM7QUFFOUMsOENBQW1FO0FBRW5FLGtEQUErQztBQUMvQyx5Q0FBK0M7QUFFbEMsUUFBQSxXQUFXLEdBQVMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFM0QsTUFBTSxPQUFPLEdBQUcsd0JBQWMsQ0FBQyxPQUFPLENBQWlCLFNBQVMsQ0FBQyxDQUFDO0FBQ2xFLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7SUFDNUIsYUFBYTtJQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDcEI7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQVMsR0FBRyxxQkFBcUIsQ0FBQyxDQUFDO0FBRS9DLElBQUksU0FBYSxDQUFDO0FBQ2xCLFNBQWdCLGtCQUFrQjtJQUM5QixJQUFJO1FBQ0EsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNySSxPQUFPLHlCQUF5QixDQUFDO0tBQ3BDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMs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