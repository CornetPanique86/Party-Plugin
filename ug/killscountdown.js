"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKillsCountdown = void 0;
const __1 = require("..");
const launcher_1 = require("bdsx/launcher");
const utils_1 = require("./utils");
const event_1 = require("bdsx/event");
const packets_1 = require("bdsx/bds/packets");
async function startKillsCountdown(param, origin, time) {
    // /killscountdown stop
    if (param === "stop" || time === undefined) {
        stop();
        return;
    }
    // /killscountdown start
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.runCommand("tellraw @s " + (0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error));
        return;
    }
    launcher_1.bedrockServer.executeCommand("effect @a weakness 9999 255 true");
    launcher_1.bedrockServer.executeCommand("scoreboard objectives remove killstreak");
    let pls = [];
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => pls.push(pl.getNameTag()));
    (0, utils_1.countdownActionbar)(5, pls, false, "Starting...")
        .then(() => {
        setup(time);
    })
        .catch(err => {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Error while starting a kill countdown", __1.LogInfo.error));
        console.log(err);
    });
}
exports.startKillsCountdown = startKillsCountdown;
const playerStats = new Map();
function setup(gameIntervalTime) {
    launcher_1.bedrockServer.executeCommand("title @a title ");
    launcher_1.bedrockServer.executeCommand("title @a subtitle §4May the best murderer win...");
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        pl.playSound("mob.enderdragon.growl", pl.getPosition(), 0.2);
        playerStats.set(pl.getNameTag(), { deaths: 0, kills: 0 });
    });
    // bedrockServer.executeCommand("execute as @a run playsound mob.enderdragon.growl @s ~~~ 0.2");
    launcher_1.bedrockServer.executeCommand("scoreboard objectives add killstreak dummy §5§lKills");
    launcher_1.bedrockServer.executeCommand("scoreboard players add @a killstreak 0");
    launcher_1.bedrockServer.executeCommand("scoreboard objectives setdisplay sidebar killstreak");
    launcher_1.bedrockServer.executeCommand("effect @a clear");
    gameIntervalObj.init(gameIntervalTime * 1000);
    startListeners();
}
function end() {
    var _a, _b, _c, _d, _e, _f;
    launcher_1.bedrockServer.executeCommand("playsound note.harp @a");
    const entries = Array.from(playerStats.entries());
    // Sort the entries based on their values in descending order
    entries.sort((a, b) => b[1].kills - a[1].kills);
    // Get the keys of the top 3 entries
    const top3Pls = entries.slice(0, 3).map(entry => entry[0]);
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`
§7------------------
§a1. §f${top3Pls[0]}§7: §6${(_a = playerStats.get(top3Pls[0])) === null || _a === void 0 ? void 0 : _a.kills}§7-§4${(_b = playerStats.get(top3Pls[0])) === null || _b === void 0 ? void 0 : _b.deaths}
§e2. §f${top3Pls[1]}§7: §6${(_c = playerStats.get(top3Pls[1])) === null || _c === void 0 ? void 0 : _c.kills}§7-§4${(_d = playerStats.get(top3Pls[1])) === null || _d === void 0 ? void 0 : _d.deaths}
§63. §f${top3Pls[2]}§7: §6${(_e = playerStats.get(top3Pls[2])) === null || _e === void 0 ? void 0 : _e.kills}§7-§4${(_f = playerStats.get(top3Pls[2])) === null || _f === void 0 ? void 0 : _f.deaths}
§7------------------`));
    launcher_1.bedrockServer.executeCommand(`playanimation "${top3Pls[0]}" animation.player.wincelebration a`);
    stop();
}
function stop() {
    for (const player of launcher_1.bedrockServer.level.getPlayers()) {
        player.removeBossBar();
    }
    launcher_1.bedrockServer.executeCommand("scoreboard objectives setdisplay sidebar");
    gameIntervalObj.stop();
    stopListeners();
    playerStats.clear();
    (0, utils_1.stopGame)();
}
const gameIntervalObj = {
    time: 0,
    init: function (timeArg) {
        this.time = timeArg;
        this.interval = setInterval(() => this.intervalFunc(), 100);
    },
    intervalFunc: function () {
        const timer = this.millisToMinutesAndSeconds(this.time);
        let displayTime = timer;
        let bossBarColor = packets_1.BossEventPacket.Colors.Blue;
        if (this.time <= 15000) {
            displayTime = "§4" + timer;
            bossBarColor = packets_1.BossEventPacket.Colors.Red;
        }
        else if (this.time <= 30000) {
            displayTime = "§6" + timer;
            bossBarColor = packets_1.BossEventPacket.Colors.Yellow;
        }
        else if (this.time <= 45000) {
            displayTime = "§d" + timer;
            bossBarColor = packets_1.BossEventPacket.Colors.Purple;
        }
        else if (this.time <= 60000) {
            displayTime = "§5" + timer;
            bossBarColor = packets_1.BossEventPacket.Colors.Purple;
        }
        for (const player of launcher_1.bedrockServer.level.getPlayers()) {
            if (this.time <= 5000 && (this.time % 1000) === 0)
                player.playSound("random.click");
            player.setBossBar(displayTime, 100, bossBarColor);
        }
        this.time - 100 <= 0 ? end() : this.time -= 100;
    },
    interval: 0,
    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = Number(((millis % 60000) / 1000).toFixed(0));
        let milliseconds = (millis % 1000);
        return (seconds == 60 ?
            (minutes + 1) + ":00." + (milliseconds === 0 ? "000" : milliseconds) :
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (milliseconds === 0 ? "000" : milliseconds));
    },
    stop: function () {
        clearInterval(this.interval);
    }
};
const entityDieLis = (e) => {
    var _a;
    if (e.entity.getIdentifier() !== "minecraft:player")
        return;
    if (!((_a = e.damageSource.getDamagingEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()))
        return;
    const victim = e.entity.getNameTag();
    const attacker = e.damageSource.getDamagingEntity().getNameTag();
    if (!playerStats.has(victim) || !playerStats.has(attacker))
        return;
    playerStats.get(victim).deaths++;
    playerStats.get(attacker).kills++;
    launcher_1.bedrockServer.executeCommand(`scoreboard players add "${attacker}" killstreak 1`);
};
function startListeners() {
    event_1.events.entityDie.on(entityDieLis);
}
function stopListeners() {
    event_1.events.entityDie.remove(entityDieLis);
}
event_1.events.serverClose.on(() => {
    gameIntervalObj.stop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2lsbHNjb3VudGRvd24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJraWxsc2NvdW50ZG93bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwwQkFBc0M7QUFDdEMsNENBQThDO0FBQzlDLG1DQUF1RDtBQUN2RCxzQ0FBb0M7QUFFcEMsOENBQW1EO0FBRTVDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFFLElBQWE7SUFDbEYsdUJBQXVCO0lBQ3ZCLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3hDLElBQUksRUFBRSxDQUFDO1FBQ1AsT0FBTztLQUNWO0lBRUQsd0JBQXdCO0lBQ3hCLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDakQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUcsSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEYsT0FBTztLQUNWO0lBQ0Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUNqRSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0lBQ3hFLElBQUksR0FBRyxHQUFhLEVBQUUsQ0FBQztJQUN2Qix3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUUsSUFBQSwwQkFBa0IsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUM7U0FDM0MsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNQLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDVCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEdBQUcsSUFBQSxXQUFPLEVBQUMsdUNBQXVDLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztBQUNYLENBQUM7QUF4QkQsa0RBd0JDO0FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7QUFFekUsU0FBUyxLQUFLLENBQUMsZ0JBQXdCO0lBQ25DLHdCQUFhLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakQsd0JBQWEsQ0FBQyxjQUFjLENBQUMsa0RBQWtELENBQUMsQ0FBQztJQUNqRix3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDMUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlELENBQUMsQ0FBQyxDQUFDO0lBQ0gsZ0dBQWdHO0lBQ2hHLHdCQUFhLENBQUMsY0FBYyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7SUFDckYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUN2RSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0lBQ3BGLHdCQUFhLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDaEQsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxjQUFjLEVBQUUsQ0FBQztBQUNyQixDQUFDO0FBRUQsU0FBUyxHQUFHOztJQUNSLHdCQUFhLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFFdkQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNsRCw2REFBNkQ7SUFDN0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELG9DQUFvQztJQUNwQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEdBQUcsSUFBQSxXQUFPLEVBQUM7O1NBRWhELE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxNQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFFLEtBQUssU0FBUyxNQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFFLE1BQU07U0FDakcsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLE1BQUEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQUUsS0FBSyxTQUFTLE1BQUEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQUUsTUFBTTtTQUNqRyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsTUFBQSxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBRSxLQUFLLFNBQVMsTUFBQSxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBRSxNQUFNO3FCQUNyRixDQUFDLENBQUMsQ0FBQztJQUNwQix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ2hHLElBQUksRUFBRSxDQUFDO0FBQ1gsQ0FBQztBQUVELFNBQVMsSUFBSTtJQUNULEtBQUssTUFBTSxNQUFNLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUU7UUFDbkQsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzFCO0lBQ0Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUN6RSxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsYUFBYSxFQUFFLENBQUM7SUFDaEIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLElBQUEsZ0JBQVEsR0FBRSxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0sZUFBZSxHQUFHO0lBQ3BCLElBQUksRUFBRSxDQUFzQjtJQUM1QixJQUFJLEVBQUUsVUFBUyxPQUFlO1FBQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxZQUFZLEdBQUcseUJBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQy9DLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDcEIsV0FBVyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7WUFDM0IsWUFBWSxHQUFHLHlCQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztTQUM3QzthQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDM0IsV0FBVyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7WUFDM0IsWUFBWSxHQUFHLHlCQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUNoRDthQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDM0IsV0FBVyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7WUFDM0IsWUFBWSxHQUFHLHlCQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUNoRDthQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDM0IsV0FBVyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7WUFDM0IsWUFBWSxHQUFHLHlCQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUNoRDtRQUNELEtBQUssTUFBTSxNQUFNLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDbkQsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUNyRDtRQUNELElBQUksQ0FBQyxJQUFJLEdBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDO0lBQ2xELENBQUM7SUFDRCxRQUFRLEVBQUUsQ0FBOEI7SUFDeEMseUJBQXlCLENBQUMsTUFBYztRQUNwQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLFlBQVksR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVuQyxPQUFPLENBQ0gsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUMxRyxDQUFDO0lBQ04sQ0FBQztJQUNELElBQUksRUFBRTtRQUNGLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNKLENBQUE7QUFFRCxNQUFNLFlBQVksR0FBRyxDQUFDLENBQWlCLEVBQUUsRUFBRTs7SUFDdkMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxLQUFLLGtCQUFrQjtRQUFFLE9BQU87SUFDNUQsSUFBSSxDQUFDLENBQUEsTUFBQSxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLDBDQUFFLFFBQVEsRUFBRSxDQUFBO1FBQUUsT0FBTztJQUM1RCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3JDLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNsRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQUUsT0FBTztJQUNuRSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkMsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMkJBQTJCLFFBQVEsZ0JBQWdCLENBQUMsQ0FBQztBQUN0RixDQUFDLENBQUE7QUFFRCxTQUFTLGNBQWM7SUFDbkIsY0FBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUNELFNBQVMsYUFBYTtJQUNsQixjQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBQ0QsY0FBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQSJ9