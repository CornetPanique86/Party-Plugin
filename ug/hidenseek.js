"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hidenseekstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
const event_1 = require("bdsx/event");
const effects_1 = require("bdsx/bds/effects");
async function hidenseekstart(param, origin, output) {
    var _a;
    // /hidenseek stop
    if (param.option === "stop") {
        return;
    }
    // /hidenseek start
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? origin.getEntity().runCommand("tellraw @s " + (0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error))
            : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await (0, utils_1.startGame)(_1.Games.hidenseek, launcher_1.bedrockServer.level.getPlayers(), 10);
        if (participants !== null)
            setup(participants);
    }
    catch (err) {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while starting hide 'n' seek", __1.LogInfo.error)}`);
        console.log(err);
        return;
    }
}
exports.hidenseekstart = hidenseekstart;
// 0 = hider; 1 = seeker   string: playerName
const teams = new Map();
function setup(pls) {
    launcher_1.bedrockServer.executeCommand("tag @a remove hidenseek");
    const seekerIndex = Math.floor(Math.random() * pls.length);
    pls.forEach((pl, index) => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add hidenseek`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}" 0 105 0`);
        if (index === seekerIndex) {
            teams.set(pl, 1);
            launcher_1.bedrockServer.executeCommand(`tp "${pl}" 1 122 -20`);
            launcher_1.bedrockServer.executeCommand(`inputpermission set "${pl}" movement disabled`);
            launcher_1.bedrockServer.executeCommand(`effect "${pl}" blindness 9999 255 true`);
            launcher_1.bedrockServer.executeCommand(`title "${pl}" title §7You are the seeker`);
            launcher_1.bedrockServer.executeCommand(`give "${pl}" iron_sword`);
        }
        else {
            teams.set(pl, 0);
            launcher_1.bedrockServer.executeCommand(`event entity "${pl}" ug:hide_name`);
        }
        ;
    });
    startListeners();
    gameIntervalObj.init(20 * 1000);
}
function end() {
    let hiders = false;
    let seekers = false;
    teams.forEach((value, key) => {
        if (value === 0)
            hiders = true;
        else if (value === 1)
            seekers = true;
    });
    if (hiders && seekers)
        return;
    let winnersStr = "";
    teams.forEach((value, key) => {
        if ((hiders && value === 0) || (seekers && value === 1)) {
            winnersStr += key + ", ";
            launcher_1.bedrockServer.executeCommand(`playanimation "${key}" animation.player.wincelebration a`);
        }
    });
    winnersStr = winnersStr.substring(0, winnersStr.length - 2);
    launcher_1.bedrockServer.executeCommand("playsound note.harp @a");
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`
§7------------------
§l§6${hiders ? "Hiders" : "Seekers"} §aWON!
§r${winnersStr}
§7------------------`));
    stop();
}
function stop() {
    for (const player of launcher_1.bedrockServer.level.getPlayers()) {
        player.removeFakeScoreboard();
        player.runCommand(`event entity @s ug:show_name`);
    }
    gameIntervalObj.stop();
    stopListeners();
    (0, utils_1.stopGame)();
}
// -------------
//   LISTENERS
// -------------
const gameIntervalObj = {
    stage: {
        name: "Unknown",
        n: 0
    },
    time: 0,
    init: function (timeArg) {
        this.stage.name = "Time to hide:";
        this.time = timeArg;
        this.interval = setInterval(() => this.intervalFunc(), 100);
    },
    seek: function (timeArg) {
        teams.forEach((value, key) => {
            if (value === 1) {
                launcher_1.bedrockServer.executeCommand(`tp "${key}" 0 105 0`);
                launcher_1.bedrockServer.executeCommand(`effect "${key}" clear`);
                launcher_1.bedrockServer.executeCommand(`effect "${key}" resistance 9999 255 true`);
                launcher_1.bedrockServer.executeCommand(`inputpermission set "${key}" movement enabled`);
            }
        });
        this.stage.name = "Hiders win in:";
        this.stage.n = 1;
        this.time = timeArg;
    },
    intervalFunc: function () {
        const timer = this.millisToMinutesAndSeconds(this.time);
        for (const player of launcher_1.bedrockServer.level.getPlayers()) {
            if (this.time <= 5000 && (this.time % 1000) === 0)
                player.playSound("random.click");
            player.setFakeScoreboard("§l§bHide §9'n' §3seek", [this.stage.name, timer]);
            player.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Saturation, 20 * 60, 255, false, false, false));
        }
        if (this.time - 100 <= 0) {
            if (this.stage.n === 0) {
                this.seek(5 * 60 * 1000);
            }
            else
                end();
        }
        else
            this.time -= 100;
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
const playerRespawnLis = (e) => {
    if (!e.player.hasTag("hidenseek"))
        return;
    const pl = e.player;
    (async () => {
        while (!pl.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        if (!teams.has(pl.getNameTag()))
            return;
        const role = teams.get(pl.getNameTag());
        if (role === 0) {
            pl.sendTitle("§7You are now a seeker");
            pl.runCommand("give @s iron_sword");
            pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Resistance, 20 * 9999, 15, false, false, false));
            teams.set(pl.getNameTag(), 1);
            end();
        }
        else {
            pl.runCommand("give @s iron_sword");
            pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Resistance, 20 * 9999, 15, false, false, false));
        }
    })();
};
const playerJoinLis = (e) => {
    if (!e.player.hasTag("hidenseek"))
        return;
    const pl = e.player;
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        pl.runCommand("clear @s");
        pl.runCommand(`event entity @s ug:show_name`);
        pl.teleport(_1.lobbyCoords);
        pl.removeAllEffects();
        pl.removeTag("hidenseek");
    })();
};
const playerLeftLis = (e) => {
    if (!e.player.hasTag("hidenseek"))
        return;
    const plName = e.player.getNameTag();
    teams.delete(plName);
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hidenseek] " + (0, __1.rawtext)(plName + "§7was §celiminated§7."));
    if (launcher_1.bedrockServer.level.getActivePlayerCount() < 2) {
        end();
        return;
    }
    end();
};
function startListeners() {
    event_1.events.playerRespawn.on(playerRespawnLis);
    event_1.events.playerJoin.on(playerJoinLis);
    event_1.events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    event_1.events.playerRespawn.remove(playerRespawnLis);
    event_1.events.playerJoin.remove(playerJoinLis);
    event_1.events.playerLeft.remove(playerLeftLis);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlkZW5zZWVrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGlkZW5zZWVrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQThDO0FBQzlDLHdCQUF1QztBQUN2QyxzQ0FBb0M7QUFFcEMsOENBQW1FO0FBSzVELEtBQUssVUFBVSxjQUFjLENBQUMsS0FBeUIsRUFBRSxNQUFxQixFQUFFLE1BQXFCOztJQUN4RyxrQkFBa0I7SUFDbEIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUV6QixPQUFPO0tBQ1Y7SUFFRCxtQkFBbUI7SUFDbkIsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUUsSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDeEUsT0FBTztLQUNWO0lBQ0QsSUFBSTtRQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBQSxpQkFBUyxFQUFDLFFBQUssQ0FBQyxTQUFTLEVBQUUsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUYsSUFBSSxZQUFZLEtBQUssSUFBSTtZQUFFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNsRDtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1Ysd0JBQWEsQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFBLFdBQU8sRUFBQyxvQ0FBb0MsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FB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