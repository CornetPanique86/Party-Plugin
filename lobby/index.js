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
exports.lobbyCoords = blockpos_1.Vec3.create(0.5, -2, 0.5);
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
    const pl = e.player;
    if (pl.hasTag("admin"))
        return;
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
        pl.sendMessage(`§aYou found the §l§f${landmark.title} §r§f(${landmark.subtitle}§f) §alandmark! §f${discoveredLandmarks.length}§7/§f30`);
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
async function storePkTime(plName, time) {
    const pkTimes = await storage_1.storageManager.get("pkTimes");
    if (pkTimes.data === undefined) {
        // initialize
        pkTimes.init({});
    }
    if (pkTimes.data[plName] < time)
        return; // Not a high score
    pkTimes.data[plName] = time;
    launcher_1.bedrockServer.executeCommand("hologram remove pkLb");
    const sortedTimes = Object.entries(pkTimes.data);
    // Sort the array based on the values (ascending order)
    sortedTimes.sort((a, b) => a[1] - b[1]);
    let lbStr = "§l§eParkour times";
    sortedTimes.forEach((value, index) => {
        lbStr += `\n§7${index + 1}. §f${value[0]} §8- §6${millisToMinutesAndSeconds(value[1])}`;
    });
    launcher_1.bedrockServer.executeCommand(`hologram create raw pkLb ${(0, __1.rawtext)(lbStr)} 11 0 9`);
    storage_1.storageManager.close("pkTimes");
}
let ticks = 0;
const startPkPos = [15, 0, 8], endPkPos = [-79, 68, 9], checkpoint1 = [7, 35, -40], checkpoint2 = [-46, 96, -68];
const plPkTime = new Map(); // [time, elytraLoops, checkpoint]
const tickInterval = setInterval(() => {
    ticks++;
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
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
                    pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.SlowFalling, 20 * 30));
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
                    else if ((blockpos.x < -41 && blockpos.x > -45) && (blockpos.y < 67 && blockpos.y > 58) && (blockpos.z < -27 && blockpos.z > -36)) { // SECOND LOOP
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
                const elytra = (0, utils_1.createCItemStack)({
                    item: "elytra",
                    amount: 1,
                    lore: ["Go through all 3 loops!"]
                });
                pl.setArmor(inventory_1.ArmorSlot.Chest, elytra);
                pl.sendMessage("§l§6> §r§eGo through all 3 loops!");
                pl.addTag("parkourElytra");
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
    pl.playSound("note.snare");
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
        plLeavePk(pl);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnREFBbUQ7QUFDbkQsMEJBQXdDO0FBQ3hDLHNCQUFvQjtBQUNwQixzQ0FBb0M7QUFDcEMsd0NBQXFDO0FBQ3JDLDBDQUEwRjtBQUMxRixvQ0FBNEM7QUFDNUMsMkJBQWtDO0FBQ2xDLCtCQUE0QjtBQUM1Qiw0Q0FBOEM7QUFDOUMsd0NBQXFDO0FBQ3JDLDBDQUE4QztBQUU5Qyw4Q0FBbUU7QUFFbkUsa0RBQStDO0FBRWxDLFFBQUEsV0FBVyxHQUFTLGVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBUyxHQUFHLHFCQUFxQixDQUFDLENBQUM7QUFFL0MsSUFBSSxTQUFhLENBQUM7QUFDbEIsU0FBZ0Isa0JBQWtCO0lBQzlCLElBQUk7UUFDQSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JJLE9BQU8seUJBQXlCLENBQUM7S0FDcEM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNmLE9BQU8saUJBQWlCLENBQUM7S0FDNUI7QUFDTCxDQUFDO0FBVEQsZ0RBU0M7QUFDRCxrQkFBa0IsRUFBRSxDQUFDO0FBRXJCLFNBQWdCLGNBQWM7SUFDMUIsS0FBSyxNQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUU7UUFDekIsSUFBSSxNQUFNLENBQUMs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