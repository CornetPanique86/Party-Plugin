"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameRunning = exports.Games = void 0;
// On server start
const event_1 = require("bdsx/event");
const __1 = require("..");
require("./commands");
const blockpos_1 = require("bdsx/bds/blockpos");
const launcher_1 = require("bdsx/launcher");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQkFBa0I7QUFDbEIsc0NBQW9DO0FBQ3BDLDBCQUErQjtBQUMvQixzQkFBb0I7QUFDcEIsZ0RBQXlDO0FBQ3pDLDRDQUE4QztBQUU5QyxJQUFZLEtBSVg7QUFKRCxXQUFZLEtBQUs7SUFDYixzQkFBYSxDQUFBO0lBQ2IsNEJBQW1CLENBQUE7SUFDbkIsZ0NBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQUpXLEtBQUsscUJBQUwsS0FBSyxRQUloQjtBQUtVLFFBQUEsYUFBYSxHQUFrQjtJQUN0QyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7SUFDaEIsU0FBUyxFQUFFLEtBQUs7Q0FDbkIsQ0FBQztBQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBUyxHQUFHLGtCQUFrQixDQUFDLENBQUM7QUFFNUMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDckIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMscUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM5RSxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdEIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELEVBQUUsQ0FBQyxRQUFRLENBQUMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkM7QUFDTCxDQUFDLENBQUMsQ0FBQSJ9