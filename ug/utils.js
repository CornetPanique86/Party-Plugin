"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leavequeue = exports.joinqueue = exports.countdownActionbar = exports.startGame = exports.stopGame = exports.spectateStop = exports.spectate = exports.getPlayerByName = void 0;
const form_1 = require("bdsx/bds/form");
const player_1 = require("bdsx/bds/player");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
const __1 = require("..");
const blockpos_1 = require("bdsx/bds/blockpos");
const effects_1 = require("bdsx/bds/effects");
const abilities_1 = require("bdsx/bds/abilities");
const event_1 = require("bdsx/event");
const common_1 = require("bdsx/common");
function getPlayerByName(name) {
    const plList = launcher_1.bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name)
            return plList[i];
    }
    return null;
}
exports.getPlayerByName = getPlayerByName;
let tpSpot;
// plus grand que le 1er, plus petit que le 2ème
const gameBounds = [{ x: -2000, y: -15, z: -2000 }, { x: 2000, y: 320, z: 2000 }];
const specIntervalObj = {
    init: function () {
        if (gameBounds[0].x > gameBounds[1].x || gameBounds[0].y > gameBounds[1].y || gameBounds[0].z > gameBounds[1].z) {
            _1.isGameRunning.isSpectateInitialized = false;
            console.log("Incorrect game bounds!");
            return;
        }
        _1.isGameRunning.isSpectateInitialized = true;
        this.interval = setInterval(() => this.intervalFunc(), 1000);
        event_1.events.playerPickupItem.on(this.playerPickupItem);
    },
    playerPickupItem: function (e) {
        if (e.player.hasTag("spectator"))
            return common_1.CANCEL;
    },
    intervalFunc: function () {
        // let pause = 0;
        const players = launcher_1.bedrockServer.level.getPlayers();
        for (const specPl of players) {
            if (!specPl.hasTag("spectator"))
                continue;
            const { x, y, z } = specPl.getPosition();
            if (x < gameBounds[0].x || x > gameBounds[1].x || y < gameBounds[0].y || y > gameBounds[1].y || z < gameBounds[0].z || z > gameBounds[1].z) {
                specPl.sendMessage("§cOut of bounds!");
                specPl.teleport(tpSpot);
                specPl.getAbilities().setAbility(abilities_1.AbilitiesIndex.Flying, true);
                specPl.syncAbilities();
                continue;
            }
            for (const player2 of players) {
                if (player2.getNameTag() === specPl.getNameTag())
                    continue;
                if (!(player2.hasTag("bedwars") || player2.hasTag("hikabrain") || player2.hasTag("hidenseek")))
                    continue;
                if (specPl.distanceTo(player2.getPosition()) < 8) {
                    specPl.teleport(tpSpot);
                    specPl.getAbilities().setAbility(abilities_1.AbilitiesIndex.Flying, true);
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
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
        event_1.events.playerPickupItem.remove(this.playerPickupItem);
    }
};
function spectate(pl) {
    pl.setGameType(player_1.GameType.Adventure);
    pl.addTag("spectator");
    if (!pl.hasTag("bedwars")) {
        pl.sendMessage("§7§oYou have entered spectator mode. Type §r§7/spectate §oto leave");
        pl.removeFakeScoreboard();
    }
    pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Invisibility, 99999, 255, false, false, false));
    pl.teleport(tpSpot);
    const abilities = pl.getAbilities();
    abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.Flying, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, false);
    abilities.setAbility(abilities_1.AbilitiesIndex.OpenContainers, false);
    pl.syncAbilities();
}
exports.spectate = spectate;
function spectateStop(pl, tp = _1.lobbyCoords) {
    pl.teleport(tp);
    pl.removeTag("spectator");
    pl.removeEffect(effects_1.MobEffectIds.Invisibility);
    const abilities = pl.getAbilities();
    abilities.setAbility(abilities_1.AbilitiesIndex.Flying, false);
    abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, false);
    abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, false);
    abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, false);
    abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.OpenContainers, true);
    pl.syncAbilities();
}
exports.spectateStop = spectateStop;
let participants = [];
function stopGame() {
    _1.isGameRunning.game = _1.Games.none;
    _1.isGameRunning.isRunning = false;
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => { if (pl.hasTag("spectator"))
        spectateStop(pl); });
    specIntervalObj.stop();
    participants = [];
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
    launcher_1.bedrockServer.executeCommand("tp @a 0 105 0");
    launcher_1.bedrockServer.executeCommand("gamemode a @a");
    launcher_1.bedrockServer.executeCommand("spawnpoint @a 0 105 0");
    launcher_1.bedrockServer.executeCommand("clear @a");
    launcher_1.bedrockServer.executeCommand("effect @a clear");
    launcher_1.bedrockServer.executeCommand("tag @a remove bedwars");
    launcher_1.bedrockServer.executeCommand("tag @a remove hikabrain");
    launcher_1.bedrockServer.executeCommand("tag @a remove hidenseek");
}
exports.stopGame = stopGame;
async function startGame(game, players, sec, title = "§aStarting in...") {
    if (players.length < 2)
        return null;
    participants = [];
    launcher_1.bedrockServer.executeCommand("title @a times 0 30 0");
    launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)(`A ${game} game is starting in ${sec} seconds!`), __1.LogInfo.info}`);
    launcher_1.bedrockServer.executeCommand("playsound note.harp @a");
    players.forEach(pl => joinForm(pl, game, sec));
    try {
        const result = await countdownQueue(sec, title);
        if (result) {
            if (participants.length < 2) {
                launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)(`The ${game} game was §ccancelled§r. Not enough players!`, __1.LogInfo.info)}`);
                return null;
            }
            _1.isGameRunning.game = game;
            _1.isGameRunning.isRunning = true;
            switch (game) {
                case _1.Games.bedwars:
                    tpSpot = blockpos_1.Vec3.create(-1000, 115, -1000);
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
                case _1.Games.hikabrain:
                    tpSpot = blockpos_1.Vec3.create(-240, 37, -237);
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
                case _1.Games.hidenseek:
                    tpSpot = blockpos_1.Vec3.create(0, 150, 0);
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
                    tpSpot = _1.lobbyCoords;
            }
            specIntervalObj.init();
            return participants;
        }
    }
    catch (error) {
        console.log(error.message);
    }
    return null;
}
exports.startGame = startGame;
function countdownQueue(sec, title) {
    return new Promise((resolve, reject) => {
        const countdownInterval = setInterval(() => {
            launcher_1.bedrockServer.executeCommand("playsound random.click @a");
            launcher_1.bedrockServer.executeCommand(`title @a title ${title}`);
            sec <= 3 ? launcher_1.bedrockServer.executeCommand(`title @a subtitle §l§4${sec}`) : launcher_1.bedrockServer.executeCommand(`title @a subtitle §l§7${sec}`);
            sec--;
            if (sec <= -1) {
                clearInterval(countdownInterval);
                resolve(true);
            }
            ;
        }, 1000);
    });
}
function countdownActionbar(sec, pls, actionbar, title) {
    return new Promise((resolve, reject) => {
        const red = "§4", gray = "§7";
        let str = "";
        for (let i = 0; i <= sec; i++) {
            str += "■";
        }
        const countdownInterval = setInterval(() => {
            str = str.slice(0, -1);
            pls.forEach(pl => {
                // slice -> remove long numbers like 0.60000000001
                launcher_1.bedrockServer.executeCommand(`execute at "${pl}" run playsound note.banjo @p ~~~ 1 ${(sec / 10 + 0.4).toString().slice(0, 3)}`);
                if (!actionbar)
                    launcher_1.bedrockServer.executeCommand(`title "${pl}" title ${!title ? "§r" : title}`);
                sec <= 3 ? launcher_1.bedrockServer.executeCommand(`title "${pl}" ${actionbar ? "actionbar" : "subtitle"} §l${red + str}`)
                    : launcher_1.bedrockServer.executeCommand(`title "${pl}" ${actionbar ? "actionbar" : "subtitle"} §l${gray + str}`);
            });
            sec--;
            if (sec <= -1) {
                clearInterval(countdownInterval);
                resolve(true);
            }
            ;
        }, 1000);
    });
}
exports.countdownActionbar = countdownActionbar;
async function joinForm(pl, game, sec) {
    const ni = pl.getNetworkIdentifier();
    const playForm = await form_1.Form.sendTo(ni, {
        type: "modal",
        title: `Play ${game}?`,
        content: `A §a${game} §rgame is starting in ${sec} seconds.\n§l§6> §r§eTo participate press §l'Yes'`,
        button1: "§2YES",
        button2: "§cnah"
    });
    if (playForm) {
        addParticipant(pl.getName());
    }
    else {
        const playConfirmForm = await form_1.Form.sendTo(ni, {
            type: "modal",
            title: `Confirm: Play ${game}?`,
            content: "Um like actually? Tbh I thought it's a misclick so pls confirm just to be sure",
            button1: "§cConfirm (no play)",
            button2: "§2Play :)"
        });
        if (!playConfirmForm) {
            addParticipant(pl.getName());
        }
        else {
            launcher_1.bedrockServer.executeCommand(`tellraw "${pl.getName()}" ${(0, __1.rawtext)("§7§oOk fine... But you can always reconsider and enter §f/joinqueue§7!")}`);
        }
    }
}
function addParticipant(pl) {
    // console.log("recieved addParticipant " + pl);
    if (_1.isGameRunning.isRunning) {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)("A game is already running! (duh)", __1.LogInfo.error)}`);
        return;
    }
    else if (participants.includes(pl)) {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)("You're already in the queue (stop trying to break the code. But anyway I outplayed you)", __1.LogInfo.error)}`);
        return;
    }
    participants.push(pl);
    participants.forEach(pl1 => {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl1}" ${(0, __1.rawtext)(`§l§7Queue> §a+ §r${pl} §7joined the queue`)}`);
    });
    launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)(`§l§7Queue> §r§7you joined the queue. §oType §f/leavequeue §7to leave`)}`);
}
function removeParticipant(pl) {
    if (_1.isGameRunning.isRunning) {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)("A game is already running, so queue is empty (duh)", __1.LogInfo.error)}`);
        return;
    }
    if (participants.includes(pl)) {
        participants.splice(participants.indexOf(pl), 1);
    }
    participants.forEach(pl1 => {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl1}" ${(0, __1.rawtext)(`§l§7Queue> §c- §r${pl} §7left the queue`)}`);
    });
    launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)(`§l§7Queue> §r§7you left the queue.`)}`);
}
function joinqueue(origin, output) {
    const pl = origin.getEntity();
    if (pl !== null && pl.isPlayer()) {
        addParticipant(pl.getNameTag());
        return;
    }
    else {
        output.error("Need 2 be player to execute");
        return;
    }
}
exports.joinqueue = joinqueue;
function leavequeue(origin, output) {
    const pl = origin.getEntity();
    if (pl !== null && pl.isPlayer()) {
        removeParticipant(pl.getNameTag());
        return;
    }
    else {
        output.error("Need 2 be player to execute");
        return;
    }
}
exports.leavequeue = leavequeue;
event_1.events.serverClose.on(() => specIntervalObj.stop());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3Q0FBcUM7QUFDckMsNENBQW1EO0FBQ25ELDRDQUE4QztBQUM5Qyx3QkFBc0Q7QUFHdEQsMEJBQXNDO0FBQ3RDLGdEQUF5QztBQUN6Qyw4Q0FBbUU7QUFDbkUsa0RBQW9EO0FBQ3BELHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFJckMsU0FBZ0IsZUFBZSxDQUFDLElBQVk7SUFDeEMsTUFBTSxNQUFNLEdBQUcsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDaEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSTtZQUFFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3hEO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQU5ELDBDQU1DO0FBRUQsSUFBSSxNQUFZLENBQUM7QUFDakIsZ0RBQWdEO0FBQ2hELE1BQU0sVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRWxGLE1BQU0sZUFBZSxHQUFHO0lBQ3BCLElBQUksRUFBRTtRQUNGLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcs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