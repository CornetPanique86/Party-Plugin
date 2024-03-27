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
const specIntervalObj = {
    init: function () {
        console.log("called specIntervalObj.init()");
        console.log("tpSpot: " + tpSpot.x, tpSpot.y, tpSpot.z);
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
            for (const player2 of players) {
                if (player2.getNameTag() === specPl.getNameTag())
                    continue;
                if (!(player2.hasTag("bedwars") || player2.hasTag("hikabrain")))
                    continue;
                if (specPl.distanceTo(player2.getPosition()) < 8) {
                    specPl.teleport(tpSpot);
                    specPl.getAbilities().setAbility(abilities_1.AbilitiesIndex.Flying, true);
                    specPl.syncAbilities();
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
    players.forEach(pl => joinForm(pl, game));
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
                    break;
                case _1.Games.hikabrain:
                    tpSpot = blockpos_1.Vec3.create(0, 106, 0);
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
async function joinForm(pl, game) {
    const ni = pl.getNetworkIdentifier();
    const playForm = await form_1.Form.sendTo(ni, {
        type: "modal",
        title: `Play ${game}?`,
        content: `A §a${game} §rgame is starting in 15 seconds.\n§l§6> §r§eTo participate press §l'Yes'`,
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