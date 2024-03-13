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
    participants = [];
    launcher_1.bedrockServer.executeCommand("title @a times 0 30 0");
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
            _1.isGameRunning.isRunning = true;
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