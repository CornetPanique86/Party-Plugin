"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lobbyCoords = exports.isGameRunning = exports.Games = void 0;
// On server start
const event_1 = require("bdsx/event");
const __1 = require("..");
require("./commands");
const blockpos_1 = require("bdsx/bds/blockpos");
const launcher_1 = require("bdsx/launcher");
const symbols_1 = require("bdsx/bds/symbols");
const unlocker_1 = require("bdsx/unlocker");
const prochacker_1 = require("bdsx/prochacker");
const utils_1 = require("./utils");
const common_1 = require("bdsx/common");
const actor_1 = require("bdsx/bds/actor");
var Games;
(function (Games) {
    Games["none"] = "None";
    Games["bedwars"] = "Bedwars";
    Games["hikabrain"] = "Hikabrain";
    Games["hidenseek"] = "Hide 'n' Seek";
})(Games || (exports.Games = Games = {}));
exports.isGameRunning = {
    game: Games.none,
    isRunning: false,
    isSpectateInitialized: false
};
exports.lobbyCoords = blockpos_1.Vec3.create(0, 106, 0);
function unlock_limit_of_fill() {
    const symbolName = "?execute@FillCommand@@UEBAXAEBVCommandOrigin@@AEAVCommandOutput@@@Z";
    const symbolPtr = symbols_1.proc[symbolName];
    const unlocker = new unlocker_1.MemoryUnlocker(symbolPtr, 0x1f);
    const offset = 0x137;
    if (prochacker_1.procHacker.check("unlocking-limit-of-fill-command", symbolName, offset, symbolPtr.add(offset), 
    // prettier-ignore
    [
        0x41, 0x81, 0xff, 0x00, 0x80, 0x00, 0x00,
        0x0f, 0x8e, 0xb2, 0x01, 0x00, 0x00,
        0x41, 0x8b, 0xd7,
        0x48, 0x8d, 0x4d, 0xf0,
        0xe8, 0x10, 0x33, 0xfb, 0xFF,
        0x90,
        0xba, 0x00, 0x80, 0x00, 0x00,
    ])) {
        // limit 0x8000 to 0x800000
        const p1 = symbolPtr.add(0x13a);
        const buf = new Uint8Array([0x00, 0x00, 0x80, 0x00]);
        p1.setBuffer(buf);
        p1.add(0x18).setBuffer(buf);
    }
    unlocker.done();
}
unlock_limit_of_fill();
console.log(__1.logPrefix + "UG plugin loaded");
event_1.events.entityHurt.on(e => {
    if (!e.entity.isPlayer())
        return;
    const pl = e.entity;
    if (pl.hasTag("bedwars") || pl.hasTag("hikabrain"))
        return;
    if (e.damageSource.cause === actor_1.ActorDamageCause.Fall)
        return common_1.CANCEL;
});
event_1.events.playerJoin.on(e => {
    const pl = e.player;
    if (!exports.isGameRunning.isRunning) { // If game is not running
        if (pl.hasTag("bedwars") || pl.hasTag("hikabrain") || pl.hasTag("hidenseek")) {
            pl.removeTag("bedwars");
            pl.removeTag("hikabrain");
            pl.removeTag("hidenseek");
            pl.runCommand(`event entity @s ug:show_name`);
        }
        if (pl.hasTag("spectator")) {
            (0, utils_1.spectateStop)(pl);
        }
        pl.removeAllEffects();
        launcher_1.bedrockServer.executeCommand(`clear ${pl.getNameTag()}`);
        pl.teleport(blockpos_1.Vec3.create(0, 105, 0));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQkFBa0I7QUFDbEIsc0NBQW9DO0FBQ3BDLDBCQUErQjtBQUMvQixzQkFBb0I7QUFDcEIsZ0RBQXlDO0FBQ3pDLDRDQUE4QztBQUM5Qyw4Q0FBd0M7QUFDeEMsNENBQStDO0FBQy9DLGdEQUE2QztBQUM3QyxtQ0FBdUM7QUFDdkMsd0NBQXFDO0FBQ3JDLDBDQUFrRDtBQUVsRCxJQUFZLEtBS1g7QUFMRCxXQUFZLEtBQUs7SUFDYixzQkFBYSxDQUFBO0lBQ2IsNEJBQW1CLENBQUE7SUFDbkIsZ0NBQXVCLENBQUE7SUFDdkIsb0NBQTJCLENBQUE7QUFDL0IsQ0FBQyxFQUxXLEtBQUsscUJBQUwsS0FBSyxRQUtoQjtBQU1ZLFFBQUEsYUFBYSxHQUFrQjtJQUN4QyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7SUFDaEIsU0FBUyxFQUFFLEtBQUs7SUFDaEIscUJBQXFCLEVBQUUsS0FBSztDQUMvQixDQUFDO0FBRVcsUUFBQSxXQUFXLEdBQVMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXhELFNBQVMsb0JBQW9CO0lBQ3pCLE1BQU0sVUFBVSxHQUFHLHFFQUFxRSxDQUFDO0lBQ3pGLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNyQixJQUNJLHVCQUFVLENBQUMsS0FBSyxDQUNaLGlDQUFpQyxFQUNqQyxVQUFVLEVBQ1YsTUFBTSxFQUNOLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3JCLGtCQUFrQjtJQUNsQjtRQUNJLElBQUksRUFBRSxJQUFJLEVBQUUs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