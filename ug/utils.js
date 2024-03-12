"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leavequeue = exports.joinqueue = exports.countdownActionbar = exports.startGame = exports.stopGame = exports.createCItemStack = exports.getPlayerByName = void 0;
const form_1 = require("bdsx/bds/form");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
const __1 = require("..");
const inventory_1 = require("bdsx/bds/inventory");
const enchants_1 = require("bdsx/bds/enchants");
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
let participants = [];
function stopGame() {
    _1.isGameRunning.game = _1.Games.none;
    _1.isGameRunning.isRunning = false;
    participants = [];
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
    launcher_1.bedrockServer.executeCommand("tp @a[tag=bedwars] 0 105 0");
    launcher_1.bedrockServer.executeCommand("clear @a[tag=bedwars]");
    launcher_1.bedrockServer.executeCommand("effect @a[tag=bedwars] clear");
    launcher_1.bedrockServer.executeCommand("tag @a remove bedwars");
}
exports.stopGame = stopGame;
async function startGame(game, players, sec, title = "§aStarting in...") {
    if (players.length < 2)
        return null;
    launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)(`A ${game} game is starting in ${sec} seconds!`), __1.LogInfo.info}`);
    launcher_1.bedrockServer.executeCommand("playsound note.harp @a");
    players.forEach(pl => joinForm(pl, game));
    try {
        const result = await countdownQueue(sec, title);
        if (result) {
            if (participants.length < 2) {
                launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("The bedwars game was §ccancelled§r. Not enough players!", __1.LogInfo.info)}`);
                return null;
            }
            _1.isGameRunning.game = game;
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
        // console.log("First form " + participants[0] + participants[1]);
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
            // console.log("Second form " + participants[0] + participants[1]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3Q0FBcUM7QUFFckMsNENBQThDO0FBQzlDLHdCQUF5QztBQUd6QywwQkFBc0M7QUFDdEMsa0RBQStDO0FBQy9DLGdEQUFtRTtBQUduRSxTQUFnQixlQUFlLENBQUMsSUFBWTtJQUN4QyxNQUFNLE1BQU0sR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJO1lBQUUsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDeEQ7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBTkQsMENBTUM7QUFlRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFjO0lBQzNDLE1BQU0sQ0FBQyxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVM7UUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUztRQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7UUFDaEMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLO1lBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFL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