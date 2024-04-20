"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plLeavePk = exports.landmarksASReset = exports.landmarksReset = exports.reloadLandmarksVar = exports.lobbyCoords = void 0;
const blockpos_1 = require("bdsx/bds/blockpos");
const __1 = require("..");
require("./commands");
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
const tickInterval = setInterval(() => {
    ticks++;
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
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
                if (insideBlock.getName() === "minecraft:structure_void") {
                    if ((blockpos.x < -13 && blockpos.x > -19) && (blockpos.y < 90 && blockpos.y > 82) && (blockpos.z < -46 && blockpos.z > -52)) { // FIRST LOOP
                        if (loops === 0) {
                            loops = 1;
                            pl.playSound("random.pop");
                        }
                    }
                    else if ((blockpos.x < -40 && blockpos.x > -46) && (blockpos.y < 68 && blockpos.y > 58) && (blockpos.z < -27 && blockpos.z > -36)) { // SECOND LOOP
                        if (loops === 1) {
                            loops = 2;
                            pl.playSound("random.pop");
                        }
                        else if (loops === 0) {
                            pl.sendTitle("§r", "§cIt appears you haven't gone through the previous loops");
                        }
                    }
                    else if ((blockpos.x < -63 && blockpos.x > -67) && (blockpos.y < 75 && blockpos.y > 69) && (blockpos.z < -25 && blockpos.z > -31)) { // THIRD LOOP
                        if (loops === 2) {
                            loops = 3;
                            pl.playSound("random.orb");
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
        launcher_1.bedrockServer.level.getEntities().forEach(actor => {
            if (actor.getEntityTypeId() === actor_1.ActorType.ArmorStand && actor.getNameTag().length > 0) {
                actor.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Invisibility, 9999, 255, false, false, false));
            }
        });
    }
}, 50);
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
event_1.events.serverClose.on(() => {
    clearInterval(tickInterval);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnREFBbUQ7QUFDbkQsMEJBQXdDO0FBQ3hDLHNCQUFvQjtBQUNwQixzQ0FBb0M7QUFDcEMsd0NBQXFDO0FBQ3JDLDBDQUE0RztBQUM1RyxvQ0FBNEM7QUFDNUMsMkJBQWtDO0FBQ2xDLCtCQUE0QjtBQUM1Qiw0Q0FBOEM7QUFDOUMsd0NBQXFDO0FBQ3JDLDBDQUE4QztBQUU5Qyw4Q0FBbUU7QUFFbkUsa0RBQStDO0FBQy9DLHlDQUErQztBQUVsQyxRQUFBLFdBQVcsR0FBUyxlQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUUzRCxNQUFNLE9BQU8sR0FBRyx3QkFBYyxDQUFDLE9BQU8sQ0FBaUIsU0FBUyxDQUFDLENBQUM7QUFDbEUsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtJQUM1QixhQUFhO0lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNwQjtBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBUyxHQUFHLHFCQUFxQixDQUFDLENBQUM7QUFFL0MsSUFBSSxTQUFhLENBQUM7QUFDbEIsU0FBZ0Isa0JBQWtCO0lBQzlCLElBQUk7UUFDQSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JJLE9BQU8seUJBQXlCLENBQUM7S0FDcEM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFD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