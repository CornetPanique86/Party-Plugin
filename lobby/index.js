"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.landmarksASReset = exports.landmarksReset = exports.reloadLandmarksVar = exports.lobbyCoords = void 0;
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
event_1.events.playerInteract.on(async (e) => {
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
    console.log(discoveredLandmarks);
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
});
event_1.events.itemUse.on(e => {
    const item = e.itemStack;
    if (item.getCustomName() === "§r§bBack to hub") {
        e.player.runCommand("spawn");
    }
});
event_1.events.playerDropItem.on(() => {
    return common_1.CANCEL;
});
event_1.events.playerDimensionChange.on(e => {
    if (e.dimension === actor_1.DimensionId.Nether)
        return common_1.CANCEL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnREFBeUM7QUFDekMsMEJBQXdDO0FBQ3hDLHNCQUFvQjtBQUNwQixzQ0FBb0M7QUFDcEMsd0NBQXFDO0FBQ3JDLDBDQUEwRjtBQUMxRixvQ0FBNEM7QUFDNUMsMkJBQWtDO0FBQ2xDLCtCQUE0QjtBQUM1Qiw0Q0FBOEM7QUFDOUMsd0NBQXFDO0FBQ3JDLDBDQUE4QztBQUdqQyxRQUFBLFdBQVcsR0FBUyxlQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUUzRCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQVMsR0FBRyxxQkFBcUIsQ0FBQyxDQUFDO0FBRS9DLElBQUksU0FBYSxDQUFDO0FBQ2xCLFNBQWdCLGtCQUFrQjtJQUM5QixJQUFJO1FBQ0EsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNySSxPQUFPLHlCQUF5QixDQUFDO0tBQ3BDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDZixPQUFPLGlCQUFpQixDQUFDO0tBQzVCO0FBQ0wsQ0FBQztBQVRELGdEQVNDO0FBQ0Qsa0JBQWtCLEVBQUUsQ0FBQztBQUVyQixTQUFnQixjQUFjO0lBQzFCLEtBQUssTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFO1FBQ3pCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxD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