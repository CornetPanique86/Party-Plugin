"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leavequeue = exports.joinqueue = exports.countdownActionbar = exports.startGame = exports.stopGame = exports.spectateStop = exports.spectate = exports.createCItemStack = exports.getPlayerByName = void 0;
const form_1 = require("bdsx/bds/form");
const player_1 = require("bdsx/bds/player");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
const __1 = require("..");
const inventory_1 = require("bdsx/bds/inventory");
const enchants_1 = require("bdsx/bds/enchants");
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
function createCItemStack(item) {
    const i = inventory_1.ItemStack.constructWith(item.item, item.amount, item.data);
    if (item.name !== undefined)
        i.setCustomName(item.name);
    if (item.lore !== undefined)
        i.setCustomLore(item.lore);
    if (item.enchantment !== undefined) {
        if (item.enchantment.level > 32767)
            item.enchantment.level = 32767;
        if (item.enchantment.level < -32767)
            item.enchantment.level = -32767;
        enchants_1.EnchantUtils.applyEnchant(i, item.enchantment.enchant, item.enchantment.level, item.enchantment.isUnsafe);
    }
    return i;
}
exports.createCItemStack = createCItemStack;
let tpSpot;
// plus grand que le 1er, plus petit que le 2ème
const gameBounds = [{ x: -2000, y: -15, z: -2000 }, { x: 2000, y: 320, z: 2000 }];
const specIntervalObj = {
    init: function () {
        console.log("called specIntervalObj.init()");
        console.log("tpSpot: " + tpSpot.x, tpSpot.y, tpSpot.z);
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
                if (!(player2.hasTag("bedwars") || player2.hasTag("hikabrain")))
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
                default:
                    tpSpot = _1.lobbyCoords;
            }
            console.log("calling specIntervalObj.init()");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3Q0FBcUM7QUFDckMsNENBQW1EO0FBQ25ELDRDQUE4QztBQUM5Qyx3QkFBc0Q7QUFHdEQsMEJBQXNDO0FBQ3RDLGtEQUErQztBQUMvQyxnREFBbUU7QUFDbkUsZ0RBQXlDO0FBQ3pDLDhDQUFtRTtBQUNuRSxrREFBb0Q7QUFDcEQsc0NBQW9DO0FBQ3BDLHdDQUFxQztBQUlyQyxTQUFnQixlQUFlLENBQUMsSUFBWTtJQUN4QyxNQUFNLE1BQU0sR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJO1lBQUUsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDeEQ7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBTkQsMENBTUM7QUFlRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFjO0lBQzNDLE1BQU0sQ0FBQyxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVM7UUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUztRQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVB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