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
    const speedBoots = (0, utils_1.createCItemStack)({
        item: "iron_boots",
        name: "§r§fSpeed §iboots"
    });
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        pl.teleport(timelineSpawn, actor_1.DimensionId.TheEnd);
        pl.addItem(speedBoots);
        pl.sendInventory();
    });
    speedBoots.destruct();
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
    launcher_1.bedrockServer.executeCommand("clear @a iron_boots");
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
            if (pl.getPosition().x > 5170) {
                pl.sendActionbar("?§k?§r? E§kr§rror§k: §rda§kt§re u§kn§rkn§ko§rwn ?§k?§r?");
                return;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0aW1lbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBNkM7QUFDN0MsZ0RBQXlDO0FBQ3pDLHNDQUFvQztBQUVwQyw0Q0FBOEM7QUFDOUMsd0JBQWdDO0FBQ2hDLG9DQUE0QztBQUVqQyxRQUFBLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUNyQyxNQUFNLGFBQWEsR0FBRyxlQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUVqRCxTQUFnQixhQUFhO0lBQ3pCLHdCQUFhLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakQsTUFBTSxVQUFVLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQztRQUNoQyxJQUFJLEVBQUUsWUFBWTtRQUNsQixJQUFJLEVBQUUsbUJBQW1CO0tBQzVCLENBQUMsQ0FBQztJQUNILHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUMxQyxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkIsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3RCLGNBQWMsRUFBRSxDQUFDO0lBQ2pCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2Qix5QkFBaUIsR0FBRyxJQUFJLENBQUM7QUFDN0IsQ0FBQztBQWhCRCxzQ0FnQkM7QUFFRCxTQUFnQixZQUFZO0lBQ3hCLGFBQWEsRUFBRSxDQUFDO0lBQ2hCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2Qix3QkFBYSxDQUFDLEtBQUssQ0FB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