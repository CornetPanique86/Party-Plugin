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
var Games;
(function (Games) {
    Games["none"] = "None";
    Games["bedwars"] = "Bedwars";
    Games["hikabrain"] = "Hikabrain";
})(Games || (exports.Games = Games = {}));
exports.isGameRunning = {
    game: Games.none,
    isRunning: false
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
        0xe8, 0xe0, 0x3c, 0xfb, 0xFF,
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
event_1.events.playerJoin.on(e => {
    const pl = e.player;
    if (!exports.isGameRunning.isRunning) { // If game is not running
        if (pl.hasTag("bedwars") || pl.hasTag("hikabrain")) {
            pl.removeTag("bedwars");
            pl.removeTag("hikabrain");
        }
        if (pl.hasTag("spectator")) {
            (0, utils_1.spectateStop)(pl);
        }
        pl.removeAllEffects();
        launcher_1.bedrockServer.executeCommand(`clear ${pl.getNameTag()}`);
        pl.teleport(blockpos_1.Vec3.create(0, 105, 0));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQkFBa0I7QUFDbEIsc0NBQW9DO0FBQ3BDLDBCQUErQjtBQUMvQixzQkFBb0I7QUFDcEIsZ0RBQXlDO0FBQ3pDLDRDQUE4QztBQUM5Qyw4Q0FBd0M7QUFDeEMsNENBQStDO0FBQy9DLGdEQUE2QztBQUM3QyxtQ0FBdUM7QUFFdkMsSUFBWSxLQUlYO0FBSkQsV0FBWSxLQUFLO0lBQ2Isc0JBQWEsQ0FBQTtJQUNiLDRCQUFtQixDQUFBO0lBQ25CLGdDQUF1QixDQUFBO0FBQzNCLENBQUMsRUFKVyxLQUFLLHFCQUFMLEtBQUssUUFJaEI7QUFLWSxRQUFBLGFBQWEsR0FBa0I7SUFDeEMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO0lBQ2hCLFNBQVMsRUFBRSxLQUFLO0NBQ25CLENBQUM7QUFFVyxRQUFBLFdBQVcsR0FBUyxlQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFeEQsU0FBUyxvQkFBb0I7SUFDekIsTUFBTSxVQUFVLEdBQUcscUVBQXFFLENBQUM7SUFDekYsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sUUFBUSxHQUFHLElBQUkseUJBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLElBQ0ksdUJBQVUsQ0FBQyxLQUFLLENBQ1osaUNBQWlDLEVBQ2pDLFVBQVUsRUFDVixNQUFNLEVBQ04sU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDckIsa0JBQWtCO0lBQ2xCO1FBQ0ksSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN4QyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDbEMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ2hCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDdEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDNUIsSUFBSTtRQUNKLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0tBQy9CLENBQ0osRUFDSDtRQUNFLDJCQUEyQjtRQUMzQixNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRCxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9CO0lBQ0QsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUFDRCxvQkFBb0IsRUFBRSxDQUFDO0FBR3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBUyxHQUFHLGtCQUFrQixDQUFDLENBQUM7QUFFNUMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDckIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixJQUFJLENBQUMscUJBQWEsQ0FBQyxTQUFTLEVBQUUsRUFBRSx5QkFBeUI7UUFDckQsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3hCLElBQUEsb0JBQVksRUFBQyxFQUFFLENBQUMsQ0FBQztTQUNwQjtRQUNELEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3RCLHdCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RCxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZDO0FBQ0wsQ0FBQyxDQUFDLENBQUEifQ==