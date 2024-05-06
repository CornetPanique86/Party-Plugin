import { Form } from "bdsx/bds/form";
import { GameType, Player } from "bdsx/bds/player";
import { bedrockServer } from "bdsx/launcher";
import { Games, isGameRunning, lobbyCoords } from ".";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { CommandOutput } from "bdsx/bds/command";
import { LogInfo, rawtext } from "..";
import { Vec3 } from "bdsx/bds/blockpos";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { PlayerPickupItemEvent } from "bdsx/event_impl/entityevent";


export function getPlayerByName(name: string): Player | null {
    const plList = bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name) return plList[i]
    }
    return null;
}

let tpSpot: Vec3;
// plus grand que le 1er, plus petit que le 2ème
const gameBounds = [{ x: -2000, y: -15, z: -2000 }, { x: 2000, y: 320, z: 2000 }];

const specIntervalObj = {
    init: function() {
        if (gameBounds[0].x > gameBounds[1].x || gameBounds[0].y > gameBounds[1].y || gameBounds[0].z > gameBounds[1].z) {
            isGameRunning.isSpectateInitialized = false;
            console.log("Incorrect game bounds!");
            return;
        }
        isGameRunning.isSpectateInitialized = true;

        this.interval = setInterval(() => this.intervalFunc(), 1000);

        events.playerPickupItem.on(this.playerPickupItem);
    },
    playerPickupItem: function(e: PlayerPickupItemEvent) {
        if (e.player.hasTag("spectator")) return CANCEL;
    },
    intervalFunc: function() {
        // let pause = 0;
        const players = bedrockServer.level.getPlayers();
        for (const specPl of players) {
            if (!specPl.hasTag("spectator")) continue;
            const {x, y, z} = specPl.getPosition();
            if (x < gameBounds[0].x || x > gameBounds[1].x  ||  y < gameBounds[0].y || y > gameBounds[1].y  || z < gameBounds[0].z || z > gameBounds[1].z) {
                specPl.sendMessage("§cOut of bounds!");
                specPl.teleport(tpSpot);
                specPl.getAbilities().setAbility(AbilitiesIndex.Flying, true);
                specPl.syncAbilities();
                continue;
            }
            for (const player2 of players) {
                if (player2.getNameTag() === specPl.getNameTag()) continue;
                if (!(player2.hasTag("bedwars") || player2.hasTag("hikabrain") || player2.hasTag("hidenseek"))) continue;
                if (specPl.distanceTo(player2.getPosition()) < 8) {
                    specPl.teleport(tpSpot);
                    specPl.getAbilities().setAbility(AbilitiesIndex.Flying, true);
                    specPl.syncAbilities();
                    break;
                }
            }
            // if (pause === 5) {
            //     specPl.runCommand("clear");
            // }
        }
        // pause >= 5 ? pause=0 : pause++;
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval);
        events.playerPickupItem.remove(this.playerPickupItem);
    }
}

export function spectate(pl: Player) {
    pl.setGameType(GameType.Adventure);
    pl.addTag("spectator");
    if (!pl.hasTag("bedwars")) {
        pl.sendMessage("§7§oYou have entered spectator mode. Type §r§7/spectate §oto leave");
        pl.removeFakeScoreboard();
    }
    pl.addEffect(MobEffectInstance.create(MobEffectIds.Invisibility, 99999, 255, false, false, false));
    pl.teleport(tpSpot);
    const abilities = pl.getAbilities();
    abilities.setAbility(AbilitiesIndex.MayFly, true);
    abilities.setAbility(AbilitiesIndex.Flying, true);
    abilities.setAbility(AbilitiesIndex.NoClip, true);
    abilities.setAbility(AbilitiesIndex.Invulnerable, true);
    abilities.setAbility(AbilitiesIndex.AttackPlayers, false);
    abilities.setAbility(AbilitiesIndex.OpenContainers, false);
    pl.syncAbilities();
}
export function spectateStop(pl: Player, tp: Vec3 = lobbyCoords) {
    pl.teleport(tp);
    pl.removeTag("spectator");
    pl.removeEffect(MobEffectIds.Invisibility);
    const abilities = pl.getAbilities();
    abilities.setAbility(AbilitiesIndex.Flying, false);
    abilities.setAbility(AbilitiesIndex.MayFly, false);
    abilities.setAbility(AbilitiesIndex.NoClip, false);
    abilities.setAbility(AbilitiesIndex.Invulnerable, false);
    abilities.setAbility(AbilitiesIndex.AttackPlayers, true);
    abilities.setAbility(AbilitiesIndex.OpenContainers, true);
    pl.syncAbilities();
}

let participants: string[] = []

export function stopGame() {
    isGameRunning.game = Games.none;
    isGameRunning.isRunning = false;
    bedrockServer.level.getPlayers().forEach(pl => { if (pl.hasTag("spectator")) spectateStop(pl) });
    specIntervalObj.stop();
    participants = [];
    bedrockServer.executeCommand("kill @e[type=item]");
    bedrockServer.executeCommand("tp @a 0 105 0");
    bedrockServer.executeCommand("gamemode a @a");
    bedrockServer.executeCommand("spawnpoint @a 0 105 0");
    bedrockServer.executeCommand("clear @a");
    bedrockServer.executeCommand("effect @a clear");
    bedrockServer.executeCommand("tag @a remove bedwars");
    bedrockServer.executeCommand("tag @a remove hikabrain");
    bedrockServer.executeCommand("tag @a remove hidenseek");
}

export async function startGame(game: Games, players: Player[], sec: number, title: string = "§aStarting in..."): Promise<string[] | null> {
    if (players.length < 2) return null;
    participants = [];
    bedrockServer.executeCommand("title @a times 0 30 0");
    bedrockServer.executeCommand(`tellraw @a ${rawtext(`A ${game} game is starting in ${sec} seconds!`), LogInfo.info}`);
    bedrockServer.executeCommand("playsound note.harp @a");
    players.forEach(pl => joinForm(pl, game, sec));
    try {
        const result = await countdownQueue(sec, title);
        if (result) {
            if (participants.length < 2) {
                bedrockServer.executeCommand(`tellraw @a ${rawtext(`The ${game} game was §ccancelled§r. Not enough players!`, LogInfo.info)}`);
                return null;
            }
            isGameRunning.game = game;
            isGameRunning.isRunning = true;
            switch (game) {
                case Games.bedwars:
                    tpSpot = Vec3.create(-1000, 115, -1000);
                    gameBounds[0] = {
                        x: -1060,
                        y: 10,
                        z: -1060
                    };
                    gameBounds[1] = {
                        x: -930,
                        y: 120,
                        z: -930
                    };
                    break;
                case Games.hikabrain:
                    tpSpot = Vec3.create(-240, 37, -237);
                    gameBounds[0] = {
                        x: -266,
                        y: -15,
                        z: -251
                    };
                    gameBounds[1] = {
                        x: -215,
                        y: 60,
                        z: -222
                    };
                    break;
                case Games.hidenseek:
                    tpSpot = Vec3.create(0, 150, 0);
                    gameBounds[0] = {
                        x: -80,
                        y: 90,
                        z: -81
                    };
                    gameBounds[1] = {
                        x: 80,
                        y: 200,
                        z: 80
                    };
                    break;
                default:
                    tpSpot = lobbyCoords;
            }
            specIntervalObj.init();
            return participants;
        }
    } catch (error) {
        console.log(error.message);
    }
    return null;
}

function countdownQueue(sec: number, title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const countdownInterval = setInterval(() => {
            bedrockServer.executeCommand("playsound random.click @a");
            bedrockServer.executeCommand(`title @a title ${title}`);
            sec <= 3 ? bedrockServer.executeCommand(`title @a subtitle §l§4${sec}`) : bedrockServer.executeCommand(`title @a subtitle §l§7${sec}`);
            sec--;
            if (sec <= -1) {
                clearInterval(countdownInterval);
                resolve(true);
            };
        }, 1000);
    });
}

export function countdownActionbar(sec: number, pls: string[], actionbar: boolean, title?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const red = "§4",
              gray = "§7";
        let str = "";
        for (let i = 0; i <= sec; i++) {
            str += "■";
        }
        const countdownInterval = setInterval(() => {
            str = str.slice(0, -1);
            pls.forEach(pl => {
                // slice -> remove long numbers like 0.60000000001
                bedrockServer.executeCommand(`execute at "${pl}" run playsound note.banjo @p ~~~ 1 ${(sec/10 + 0.4).toString().slice(0, 3)}`);
                if (!actionbar) bedrockServer.executeCommand(`title "${pl}" title ${!title ? "§r" : title}`);
                sec <= 3 ? bedrockServer.executeCommand(`title "${pl}" ${actionbar ? "actionbar" : "subtitle"} §l${red + str}`)
                         : bedrockServer.executeCommand(`title "${pl}" ${actionbar ? "actionbar" : "subtitle"} §l${gray + str}`);
            });
            sec--;
            if (sec <= -1) {
                clearInterval(countdownInterval);
                resolve(true);
            };
        }, 1000);
    });
}

async function joinForm(pl: Player, game: string, sec: number) {
    const ni = pl.getNetworkIdentifier();
    const playForm = await Form.sendTo(ni, {
        type: "modal",
        title: `Play ${game}?`,
        content: `A §a${game} §rgame is starting in ${sec} seconds.\n§l§6> §r§eTo participate press §l'Yes'`,
        button1: "§2YES",
        button2: "§cnah"
    });
    if (playForm) {
        addParticipant(pl.getName());
    } else {
        const playConfirmForm = await Form.sendTo(ni, {
            type: "modal",
            title: `Confirm: Play ${game}?`,
            content: "Um like actually? Tbh I thought it's a misclick so pls confirm just to be sure",
            button1: "§cConfirm (no play)",
            button2: "§2Play :)"
        });

        if (!playConfirmForm) {
            addParticipant(pl.getName());
        } else {
            bedrockServer.executeCommand(`tellraw "${pl.getName()}" ${rawtext("§7§oOk fine... But you can always reconsider and enter §f/joinqueue§7!")}`)
        }
    }
}

function addParticipant(pl: string) {
    // console.log("recieved addParticipant " + pl);
    if (isGameRunning.isRunning) {
        bedrockServer.executeCommand(`tellraw "${pl}" ${rawtext("A game is already running! (duh)", LogInfo.error)}`);
        return;
    } else if (participants.includes(pl)) {
        bedrockServer.executeCommand(`tellraw "${pl}" ${rawtext("You're already in the queue (stop trying to break the code. But anyway I outplayed you)", LogInfo.error)}`);
        return;
    }
    participants.push(pl);
    participants.forEach(pl1 => {
        bedrockServer.executeCommand(`tellraw "${pl1}" ${rawtext(`§l§7Queue> §a+ §r${pl} §7joined the queue`)}`);
    });
    bedrockServer.executeCommand(`tellraw "${pl}" ${rawtext(`§l§7Queue> §r§7you joined the queue. §oType §f/leavequeue §7to leave`)}`);
}

function removeParticipant(pl: string) {
    if (isGameRunning.isRunning) {
        bedrockServer.executeCommand(`tellraw "${pl}" ${rawtext("A game is already running, so queue is empty (duh)", LogInfo.error)}`);
        return;
    }
    if (participants.includes(pl)) {
        participants.splice(participants.indexOf(pl), 1);
    }
    participants.forEach(pl1 => {
        bedrockServer.executeCommand(`tellraw "${pl1}" ${rawtext(`§l§7Queue> §c- §r${pl} §7left the queue`)}`);
    });
    bedrockServer.executeCommand(`tellraw "${pl}" ${rawtext(`§l§7Queue> §r§7you left the queue.`)}`);
}

export function joinqueue(origin: CommandOrigin, output: CommandOutput) {
    const pl = origin.getEntity();
    if (pl !== null && pl.isPlayer()) {
        addParticipant(pl.getNameTag());
        return;
    } else {
        output.error("Need 2 be player to execute");
        return;
    }
}

export function leavequeue(origin: CommandOrigin, output: CommandOutput) {
    const pl = origin.getEntity();
    if (pl !== null && pl.isPlayer()) {
        removeParticipant(pl.getNameTag());
        return;
    } else {
        output.error("Need 2 be player to execute");
        return;
    }
}

events.serverClose.on(() => specIntervalObj.stop());