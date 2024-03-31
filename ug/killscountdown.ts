import { Player } from "bdsx/bds/player";
import { LogInfo, rawtext } from "..";
import { bedrockServer } from "bdsx/launcher";
import { countdownActionbar, stopGame } from "./utils";
import { events } from "bdsx/event";
import { EntityDieEvent } from "bdsx/event_impl/entityevent";
import { BossEventPacket } from "bdsx/bds/packets";

export async function startKillsCountdown(param: string, origin: Player, time?: number) {
    // /killscountdown stop
    if (param === "stop" || time === undefined) {
        stop();
        return;
    }

    // /killscountdown start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.runCommand("tellraw @s " + rawtext("Minimum 2 players to start", LogInfo.error));
        return;
    }
    bedrockServer.executeCommand("effect @a weakness 9999 255 true");
    bedrockServer.executeCommand("scoreboard objectives remove killstreak");
    let pls: string[] = [];
    bedrockServer.level.getPlayers().forEach(pl => pls.push(pl.getNameTag()));
    countdownActionbar(5, pls, false, "Starting...")
        .then(() => {
            setup(time);
        })
        .catch(err => {
            bedrockServer.executeCommand("tellraw @a " + rawtext("Error while starting a kill countdown", LogInfo.error));
            console.log(err);
        });
}

const playerStats = new Map<string, { deaths: number, kills: number }>();

function setup(gameIntervalTime: number) {
    bedrockServer.executeCommand("title @a title ");
    bedrockServer.executeCommand("title @a subtitle §4May the best murderer win...");
    bedrockServer.level.getPlayers().forEach(pl => {
        pl.playSound("mob.enderdragon.growl", pl.getPosition(), 0.2);
        playerStats.set(pl.getNameTag(), { deaths: 0, kills: 0 });
    });
    // bedrockServer.executeCommand("execute as @a run playsound mob.enderdragon.growl @s ~~~ 0.2");
    bedrockServer.executeCommand("scoreboard objectives add killstreak dummy §5§lKills");
    bedrockServer.executeCommand("scoreboard players add @a killstreak 0");
    bedrockServer.executeCommand("scoreboard objectives setdisplay sidebar killstreak");
    bedrockServer.executeCommand("effect @a clear");
    gameIntervalObj.init(gameIntervalTime*1000);
    startListeners();
}

function end() {
    bedrockServer.executeCommand("playsound note.harp @a");

    const entries = Array.from(playerStats.entries());
    // Sort the entries based on their values in descending order
    entries.sort((a, b) => b[1].kills - a[1].kills);
    // Get the keys of the top 3 entries
    const top3Pls = entries.slice(0, 3).map(entry => entry[0]);

    bedrockServer.executeCommand("tellraw @a " + rawtext(`
§7------------------
§a1. §f${top3Pls[0]}§7: §6${playerStats.get(top3Pls[0])?.kills}§7-§4${playerStats.get(top3Pls[0])?.deaths}
§e2. §f${top3Pls[1]}§7: §6${playerStats.get(top3Pls[1])?.kills}§7-§4${playerStats.get(top3Pls[1])?.deaths}
§63. §f${top3Pls[2]}§7: §6${playerStats.get(top3Pls[2])?.kills}§7-§4${playerStats.get(top3Pls[2])?.deaths}
§7------------------`));
    bedrockServer.executeCommand(`playanimation "${top3Pls[0]}" animation.player.wincelebration a`);
    stop();
}

function stop() {
    for (const player of bedrockServer.level.getPlayers()) {
        player.removeBossBar();
    }
    bedrockServer.executeCommand("scoreboard objectives setdisplay sidebar");
    gameIntervalObj.stop();
    stopListeners();
    playerStats.clear();
    stopGame();
}

const gameIntervalObj = {
    time: 0 as unknown as number,
    init: function(timeArg: number) {
        this.time = timeArg;
        this.interval = setInterval(() => this.intervalFunc(), 100);
    },
    intervalFunc: function() {
        const timer = this.millisToMinutesAndSeconds(this.time);
        let displayTime = timer;
        let bossBarColor = BossEventPacket.Colors.Blue;
        if (this.time <= 15000) {
            displayTime = "§4" + timer;
            bossBarColor = BossEventPacket.Colors.Red;
        } else if (this.time <= 30000) {
            displayTime = "§6" + timer;
            bossBarColor = BossEventPacket.Colors.Yellow;
        } else if (this.time <= 45000) {
            displayTime = "§d" + timer;
            bossBarColor = BossEventPacket.Colors.Purple;
        } else if (this.time <= 60000) {
            displayTime = "§5" + timer;
            bossBarColor = BossEventPacket.Colors.Purple;
        }
        for (const player of bedrockServer.level.getPlayers()) {
            if (this.time <= 5000 && (this.time % 1000) === 0) player.playSound("random.click");
            player.setBossBar(displayTime, 100, bossBarColor);
        }
        this.time-100 <= 0 ? end() : this.time -= 100;
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

const entityDieLis = (e: EntityDieEvent) => {
    if (e.entity.getIdentifier() !== "minecraft:player") return;
    if (!e.damageSource.getDamagingEntity()?.isPlayer()) return;
    const victim = e.entity.getNameTag();
    const attacker = e.damageSource.getDamagingEntity()!.getNameTag();
    if (!playerStats.has(victim) || !playerStats.has(attacker)) return;
    playerStats.get(victim)!.deaths++;
    playerStats.get(attacker)!.kills++;
    bedrockServer.executeCommand(`scoreboard players add "${attacker}" killstreak 1`);
}

function startListeners() {
    events.entityDie.on(entityDieLis);
}
function stopListeners() {
    events.entityDie.remove(entityDieLis);
}
events.serverClose.on(() => {
    gameIntervalObj.stop();
})