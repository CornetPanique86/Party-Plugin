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
    if ((pl.hasTag("bedwars") || pl.hasTag("hikabrain") || !exports.isGameRunning.isRunning)) {
        pl.removeTag("bedwars");
        pl.removeTag("hikabrain");
        pl.removeAllEffects();
        launcher_1.bedrockServer.executeCommand(`clear ${pl.getNameTag()}`);
        pl.teleport(blockpos_1.Vec3.create(0, 105, 0));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQkFBa0I7QUFDbEIsc0NBQW9DO0FBQ3BDLDBCQUErQjtBQUMvQixzQkFBb0I7QUFDcEIsZ0RBQXlDO0FBQ3pDLDRDQUE4QztBQUM5Qyw4Q0FBd0M7QUFDeEMsNENBQStDO0FBQy9DLGdEQUE2QztBQUU3QyxJQUFZLEtBSVg7QUFKRCxXQUFZLEtBQUs7SUFDYixzQkFBYSxDQUFBO0lBQ2IsNEJBQW1CLENBQUE7SUFDbkIsZ0NBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQUpXLEtBQUsscUJBQUwsS0FBSyxRQUloQjtBQUtZLFFBQUEsYUFBYSxHQUFrQjtJQUN4QyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7SUFDaEIsU0FBUyxFQUFFLEtBQUs7Q0FDbkIsQ0FBQztBQUVXLFFBQUEsV0FBVyxHQUFTLGVBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUV4RCxTQUFTLG9CQUFvQjtJQUN6QixNQUFNLFVBQVUsR0FBRyxxRUFBcUUsQ0FBQztJQUN6RixNQUFNLFNBQVMsR0FBRyxjQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSx5QkFBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDckIsSUFDSSx1QkFBVSxDQUFDLEtBQUssQ0FDWixpQ0FBaUMsRUFDakMsVUFBVSxFQUNWLE1BQU0sRUFDTixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUNyQixrQkFBa0I7SUFDbEI7UUFDSSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ3hDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNsQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDaEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUM1QixJQUFJO1FBQ0osSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7S0FDL0IsQ0FDSixFQUNIO1FBQ0UsMkJBQTJCO1FBQzNCLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JELEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDL0I7SUFDRCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEIsQ0FBQztBQUNELG9CQUFvQixFQUFFLENBQUM7QUFHdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFTLEdBQUcsa0JBQWtCLENBQUMsQ0FBQztBQUU1QyxjQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNyQixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BCLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxxQkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzlFLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0Qix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekQsRUFBRSxDQUFDLFFBQVEsQ0FBQyxlQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2QztBQUNMLENBQUMsQ0FBQyxDQUFBIn0=