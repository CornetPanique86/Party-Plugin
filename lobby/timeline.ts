import { DimensionId } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { events } from "bdsx/event";
import { PlayerJoinEvent } from "bdsx/event_impl/entityevent";
import { bedrockServer } from "bdsx/launcher";
import { lobbyCoords } from ".";
import { createCItemStack } from "../utils";

export let isTimelineRunning = false;
const timelineSpawn = Vec3.create(-6.5, 48, 0.5);

export function startTimeline() {
    bedrockServer.executeCommand("clear @a red_dye");
    bedrockServer.level.getPlayers().forEach(pl => {
        pl.teleport(timelineSpawn, DimensionId.TheEnd);
    });
    startListeners();
    gameIntervalObj.init();
    isTimelineRunning = true;
}

export function stopTimeline() {
    stopListeners();
    gameIntervalObj.stop();
    bedrockServer.level.getPlayers().forEach(pl => {
        pl.teleport(lobbyCoords, DimensionId.Overworld);
        const item = createCItemStack({
            item: "red_dye",
            amount: 1,
            name: "§r§bBack to hub"
        });
        pl.addItem(item);
        pl.getInventory().swapSlots(0, 8);
        pl.sendInventory();
    });
    isTimelineRunning = false;
}

const playerJoinLis = async (e: PlayerJoinEvent) => {
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    pl.teleport(timelineSpawn, DimensionId.TheEnd);
}

function startListeners() {
    events.playerJoin.on(playerJoinLis);
}
function stopListeners() {
    events.playerJoin.remove(playerJoinLis);
}

const gameIntervalObj = {
    init: function() {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function() {
        if (bedrockServer.isClosed()) {
            this.stop;
            return;
        }
        bedrockServer.level.getPlayers().forEach(pl => {
            if (pl.getPosition().x < 0) return;
            const x = Math.floor(pl.getPosition().x / 3);
            const dateInMil = x * 86400000 + 1562889600000; // Millis in a day  +  12th jul 2019 (DragonNest birth)
            const date = new Date(dateInMil);
            pl.sendActionbar(date.toString().substring(0, 15));
        })
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval);
    }
}

events.serverClose.on(() => {
    gameIntervalObj.stop();
})
