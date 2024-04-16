"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopTimeline = exports.startTimeline = exports.isTimelineRunning = void 0;
const actor_1 = require("bdsx/bds/actor");
const blockpos_1 = require("bdsx/bds/blockpos");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
const utils_1 = require("../utils");
exports.isTimelineRunning = false;
const timelineSpawn = blockpos_1.Vec3.create(-6.5, 48, 0.5);
function startTimeline() {
    launcher_1.bedrockServer.executeCommand("clear @a red_dye");
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        pl.teleport(timelineSpawn, actor_1.DimensionId.TheEnd);
    });
    startListeners();
    gameIntervalObj.init();
    exports.isTimelineRunning = true;
}
exports.startTimeline = startTimeline;
function stopTimeline() {
    stopListeners();
    gameIntervalObj.stop();
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        pl.teleport(_1.lobbyCoords, actor_1.DimensionId.Overworld);
        const item = (0, utils_1.createCItemStack)({
            item: "red_dye",
            amount: 1,
            name: "§r§bBack to hub"
        });
        pl.addItem(item);
        pl.getInventory().swapSlots(0, 8);
        pl.sendInventory();
    });
    exports.isTimelineRunning = false;
}
exports.stopTimeline = stopTimeline;
const playerJoinLis = async (e) => {
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    pl.teleport(timelineSpawn, actor_1.DimensionId.TheEnd);
};
function startListeners() {
    event_1.events.playerJoin.on(playerJoinLis);
}
function stopListeners() {
    event_1.events.playerJoin.remove(playerJoinLis);
}
const gameIntervalObj = {
    init: function () {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function () {
        if (launcher_1.bedrockServer.isClosed()) {
            this.stop;
            return;
        }
        launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
            if (pl.getPosition().x < 0)
                return;
            const x = Math.floor(pl.getPosition().x / 3);
            const dateInMil = x * 86400000 + 1562889600000; // Millis in a day  +  12th jul 2019 (DragonNest birth)
            const date = new Date(dateInMil);
            pl.sendActionbar(date.toString().substring(0, 15));
        });
    },
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
    }
};
event_1.events.serverClose.on(() => {
    gameIntervalObj.stop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0aW1lbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBNkM7QUFDN0MsZ0RBQXlDO0FBQ3pDLHNDQUFvQztBQUVwQyw0Q0FBOEM7QUFDOUMsd0JBQWdDO0FBQ2hDLG9DQUE0QztBQUVqQyxRQUFBLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUNyQyxNQUFNLGFBQWEsR0FBRyxlQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUVqRCxTQUFnQixhQUFhO0lBQ3pCLHdCQUFhLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakQsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQzFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLG1CQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFDSCxjQUFjLEVBQUUsQ0FBQztJQUNqQixlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIseUJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLENBQUM7QUFSRCxzQ0FRQztBQUVELFNBQWdCLFlBQVk7SUFDeEIsYUFBYSxFQUFFLENBQUM7SUFDaEIsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZCLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUMxQyxFQUFFLENBQUMsUUFBUSxDQUFDLGNBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sSUFBSSxHQUFHLElBQUEsd0JBQWdCLEVBQUM7WUFDMUIsSUFBSSxFQUFFLFNBQVM7WUFDZixNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksRUFBRSxpQkFB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