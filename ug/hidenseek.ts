import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { startGame, stopGame } from "./utils";
import { Games, lobbyCoords } from ".";
import { events } from "bdsx/event";
import { PlayerAttackEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";
import { Player } from "bdsx/bds/player";
import { ActorDamageCause } from "bdsx/bds/actor";
import { CANCEL } from "bdsx/common";

export async function hidenseekstart(param: { option: string }, origin: CommandOrigin, output: CommandOutput) {
    // /hidenseek stop
    if (param.option === "stop") {

        return;
    }

    // /hidenseek start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? origin.getEntity()!.runCommand("tellraw @s " +rawtext("Minimum 2 players to start", LogInfo.error))
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.hidenseek, bedrockServer.level.getPlayers(), 10);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting hide 'n' seek", LogInfo.error)}`);
        console.log(err);
        return;
    }
}

// 0 = hider; 1 = seeker   string: playerName
const teams = new Map<string, number>();

function setup(pls: string[]) {
    bedrockServer.executeCommand("tag @a remove hidenseek");
    const seekerIndex = Math.floor(Math.random() * pls.length);
    pls.forEach((pl, index) => {
        bedrockServer.executeCommand(`tag "${pl}" add hidenseek`);
        bedrockServer.executeCommand(`spawnpoint "${pl}" 0 105 0`);
        if (index === seekerIndex) {
            teams.set(pl, 1);
            bedrockServer.executeCommand("tellraw @a[tag=hidenseek] " + rawtext(pl + "§7is a §lseeker§r§7!"));
            bedrockServer.executeCommand(`tp "${pl}" 1 122 -20`);
            bedrockServer.executeCommand(`inputpermission set "${pl}" movement disabled`);
            bedrockServer.executeCommand(`effect "${pl}" blindness 9999 255 true`);
            bedrockServer.executeCommand(`title "${pl}" title §7You are the seeker`);
            bedrockServer.executeCommand(`give "${pl}" iron_sword`);
        } else {
            teams.set(pl, 0);
            bedrockServer.executeCommand(`event entity "${pl}" ug:hide_name`);
        };
    });


    startListeners();
    gameIntervalObj.init(20*1000);
}

function end(hidersWon = false) {
    let hiders = false;
    let seekers = false;
    teams.forEach((value, key) => {
        if (value === 0) hiders = true
        else if (value === 1) seekers = true;
    });
    if (!hidersWon && (hiders && seekers)) return;

    let winnersStr = "";
    teams.forEach((value, key) => {
        if ((hiders && value === 0) || (!hidersWon && seekers && value === 1)) {
            winnersStr += key + ", ";
            bedrockServer.executeCommand(`playanimation "${key}" animation.player.wincelebration a`);
        }
    });
    winnersStr = winnersStr.substring(0, winnersStr.length - 2);

    bedrockServer.executeCommand("playsound note.harp @a");

    bedrockServer.executeCommand("tellraw @a " + rawtext(`
§7------------------
§l§6${hiders ? "Hiders" : "Seekers"} §aWON!
§r${winnersStr}
§7------------------`));
    stop();
}

function stop() {
    for (const player of bedrockServer.level.getPlayers()) {
        player.removeFakeScoreboard();
        player.runCommand(`event entity @s ug:show_name`);
    }
    gameIntervalObj.stop();
    stopListeners();
    stopGame();
}

// -------------
//   LISTENERS
// -------------

const gameIntervalObj = {
    stage: {
        name: "Unknown",
        n: 0
    },
    time: 0 as unknown as number,
    init: function(timeArg: number) {
        this.stage.name = "Time to hide:"
        this.time = timeArg;
        this.interval = setInterval(() => this.intervalFunc(), 100);
    },
    seek: function(timeArg: number) {
        teams.forEach((value, key) => {
            if (value === 1) {
                bedrockServer.executeCommand(`tp "${key}" 0 105 0`);
                bedrockServer.executeCommand(`effect "${key}" clear`);
                bedrockServer.executeCommand(`effect "${key}" resistance 9999 255 true`);
                bedrockServer.executeCommand(`inputpermission set "${key}" movement enabled`);
            }
        })

        this.stage.name = "Hiders win in:";
        this.stage.n = 1;
        this.time = timeArg;
    },
    intervalFunc: function() {
        const timer = this.millisToMinutesAndSeconds(this.time);
        for (const player of bedrockServer.level.getPlayers()) {
            if (this.time <= 5000 && (this.time % 1000) === 0) player.playSound("random.click");
            player.setFakeScoreboard("§l§bHide §9'n' §3seek", [this.stage.name, timer]);
            player.addEffect(MobEffectInstance.create(MobEffectIds.Saturation, 20*60, 255, false, false, false));
        }
        if (this.time-100 <= 0) {
            if (this.stage.n === 0) {
                this.seek(5*60*1000);
            } else end(true);
        } else this.time -= 100;
    },
    interval: 0 as unknown as NodeJS.Timeout,
    millisToMinutesAndSeconds(millis: number) {
        let minutes = Math.floor(millis / 60000);
        let seconds = Number(((millis % 60000) / 1000).toFixed(0));
        let milliseconds = (millis % 1000);

        return (
            seconds == 60 ?
            (minutes+1) + ":00." + (milliseconds === 0 ? "000" : milliseconds) :
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (milliseconds === 0 ? "000" : milliseconds)
        );
    },
    stop: function(){
        clearInterval(this.interval);
    }
}

const playerRespawnLis = (e: PlayerRespawnEvent) => {
    if (!e.player.hasTag("hidenseek")) return;

    const pl = e.player;
    (async () => {
        while (!pl.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        if (!teams.has(pl.getNameTag())) return;
        const role = teams.get(pl.getNameTag());
        if (role === 0) {
            bedrockServer.executeCommand("tellraw @a[tag=hidenseek] " + rawtext(pl.getNameTag() + "§7is now a §lseeker§r§7!"));
            pl.sendTitle("§7You are now a seeker");
            pl.runCommand("give @s iron_sword");
            pl.addEffect(MobEffectInstance.create(MobEffectIds.Resistance, 20*9999, 15, false, false, false));
            teams.set(pl.getNameTag(), 1);
            end();
        } else {
            pl.runCommand("give @s iron_sword");
            pl.addEffect(MobEffectInstance.create(MobEffectIds.Resistance, 20*9999, 15, false, false, false));
        }
    })();
}

const playerJoinLis = (e: PlayerJoinEvent) => {
    if (!e.player.hasTag("hidenseek")) return;
    const pl = e.player;
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        pl.runCommand("clear @s");
        pl.runCommand(`event entity @s ug:show_name`);
        pl.teleport(lobbyCoords);
        pl.removeAllEffects();
        pl.removeTag("hidenseek");
    })();
}

const playerLeftLis = (e: PlayerLeftEvent) => {
    if (!e.player.hasTag("hidenseek")) return;
    const plName = e.player.getNameTag();
    teams.delete(plName);
    bedrockServer.executeCommand("tellraw @a[tag=hidenseek] " +rawtext(plName + "§7was §celiminated§7."));

    if (bedrockServer.level.getActivePlayerCount() < 2) {
        end();
        return;
    }
    end();
}

function startListeners() {
    events.playerRespawn.on(playerRespawnLis);
    events.playerJoin.on(playerJoinLis);
    events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    events.playerRespawn.remove(playerRespawnLis);
    events.playerJoin.remove(playerJoinLis);
    events.playerLeft.remove(playerLeftLis);
}

events.serverClose.on(() => {
    gameIntervalObj.stop();
});