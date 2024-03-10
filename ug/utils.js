"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leavequeue = exports.joinqueue = exports.countdownActionbar = exports.startGame = exports.stopGame = exports.createCItemStack = exports.getPlayerByName = void 0;
const form_1 = require("bdsx/bds/form");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
const __1 = require("..");
const inventory_1 = require("bdsx/bds/inventory");
const enchants_1 = require("bdsx/bds/enchants");
const nbt_1 = require("bdsx/bds/nbt");
function getPlayerByName(name) {
    const plList = launcher_1.bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name)
            return plList[i];
    }
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
    if (item.color !== undefined) {
        const tag = i.save();
        const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "customColor": nbt_1.NBT.int(item.color), "minecraft:item_lock": nbt_1.NBT.byte(2), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
        i.load(nbt);
    }
    return i;
}
exports.createCItemStack = createCItemStack;
let participants = [];
function stopGame() {
    _1.isGameRunning.game = _1.Games.none;
    _1.isGameRunning.isRunning = false;
    participants = [];
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
        const result = await countdownQueue(15, title);
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
function countdownActionbar(sec, pls) {
    return new Promise((resolve, reject) => {
        const red = "§4", gray = "§7";
        let str = "";
        for (let i = 0; i < sec; i++) {
            str += "■";
        }
        const countdownInterval = setInterval(() => {
            str = str.slice(0, -1);
            pls.forEach(pl => {
                launcher_1.bedrockServer.executeCommand(`execute as "${pl}" run playsound random.click @s ~~~ 1 ${sec / 10 + 0.2}`);
                sec <= 3 ? launcher_1.bedrockServer.executeCommand(`title "${pl}" actionbar §l${red + str}`)
                    : launcher_1.bedrockServer.executeCommand(`title "${pl}" actionbar §l${gray + str}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3Q0FBcUM7QUFFckMsNENBQThDO0FBQzlDLHdCQUF5QztBQUd6QywwQkFBc0M7QUFDdEMsa0RBQStDO0FBQy9DLGdEQUFtRTtBQUNuRSxzQ0FBZ0Q7QUFHaEQsU0FBZ0IsZUFBZSxDQUFDLElBQVk7SUFDeEMsTUFBTSxNQUFNLEdBQUcsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDaEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSTtZQUFFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3hEO0FBQ0wsQ0FBQztBQUxELDBDQUtDO0FBZ0JELFNBQWdCLGdCQUFnQixDQUFDLElBQWM7SUFDM0MsTUFBTSxDQUFDLEdBQUcscUJBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUztRQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTO1FBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtRQUNoQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLEtBQUs7WUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUs7WUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQztRQUNyRSx1QkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM3RztJQUVELElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7UUFDMUIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxRQUFRLGlDQUNqQixHQUFHLEtBQ04sR0FBRyxrQ0FDSSxHQUFHLENBQUMsR0FBRyxLQUNWLGFBQWEsRUFBRSxTQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDbEMscUJBQXFCLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDbEMseUJBQXlCLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FFN0IsQ0FBQztRQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUF4QkQsNENBd0JDO0FBR0QsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFBO0FBRS9CLFNBQWdCLFFBQVE7SUFDcEIsZ0JBQWEsQ0FBQyxJQUFJLEdBQUcsUUFBSyxDQUFDLElBQUksQ0FBQztJQUNoQyxnQkFBYSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDaEMsWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUNsQix3QkFBYSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFMRCw0QkFLQztBQUVNLEtBQUssVUFBVSxTQUFTLENBQUMsSUFBVyxFQUFFLE9BQWlCLEVBQUUsR0FBVyxFQUFFLFFBQWdCLGtCQUFrQjtJQUMzRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3BDLHdCQUFhLENBQUMsY0FBYyxDQUFDLGNBQWMsSUFBQSxXQUFPLEVBQUMsS0FBSyxJQUFJLHdCQUF3QixHQUFHLFdBQVcsQ0FBQyxFQUFFLFdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3JILHdCQUFhLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxQyxJQUFJO1FBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSxjQUFjLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFBLFdBQU8sRUFBQyx5REFBeUQsRUFBRSxXQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMvSCxPQUFPLElBQUksQ0FBQzthQUNmO1lBQ0QsZ0JBQWEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQzFCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQW5CRCw4QkFtQkM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFXLEVBQUUsS0FBYTtJQUM5QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUN2Qyx3QkFBYSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzFELHdCQUFhLENBQUMsY0FBYyxDQUFDLGtCQUFrQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFhLENBQUMsY0FBYyxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2SSxHQUFHLEVBQUUsQ0FBQztZQUNOLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUNYLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7WUFBQSxDQUFDO1FBQ04sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsR0FBVyxFQUFFLEdBQWE7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEVBQ1YsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFCLEdBQUcsSUFBSSxHQUFHLENBQUM7U0FDZDtRQUNELE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUN2QyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNiLHdCQUFhLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSx5Q0FBeUMsR0FBRyxHQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztvQkFDeEUsQ0FBQyxDQUFDLHdCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdkYsQ0FBQyxDQUFDLENBQUM7WUFDSCxHQUFHLEVBQUUsQ0FBQztZQUNOLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUNYLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7WUFBQSxDQUFDO1FBQ04sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBdEJELGdEQXNCQztBQUVELEtBQUssVUFBVSxRQUFRLENBQUMsRUFBVSxFQUFFLElBQVk7SUFDNUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtRQUNuQyxJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSxRQUFRLElBQUksR0FBRztRQUN0QixPQUFPLEVBQUUsT0FBTyxJQUFJLDRFQUE0RTtRQUNoRyxPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDLENBQUM7SUFDSCxJQUFJLFFBQVEsRUFBRTtRQUNWLGNBQWMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM3QixrRUFBa0U7S0FDckU7U0FBTTtRQUNILE1BQU0sZUFBZSxHQUFHLE1BQU0sV0FBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7WUFDMUMsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsaUJBQWlCLElBQUksR0FBRztZQUMvQixPQUFPLEVBQUUsZ0ZBQWdGO1lBQ3pGLE9BQU8sRUFBRSxxQkFBcUI7WUFDOUIsT0FBTyxFQUFFLFdBQVc7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsQixjQUFjLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDN0IsbUVBQW1FO1NBQ3RFO2FBQU07WUFDSCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFBLFdBQU8sRUFBQyx3RUFBd0UsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNqSjtLQUNKO0FBQ0wsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEVBQVU7SUFDOUIsZ0RBQWdEO0lBQ2hELElBQUksZ0JBQWEsQ0FBQyxTQUFTLEVBQUU7UUFDekIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMsa0NBQWtDLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5RyxPQUFPO0tBQ1Y7U0FBTSxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEMsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMseUZBQXlGLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNySyxPQUFPO0tBQ1Y7SUFDRCxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RCLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDdkIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxHQUFHLEtBQUssSUFBQSxXQUFPLEVBQUMsb0JBQW9CLEVBQUUscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0csQ0FBQyxDQUFDLENBQUM7SUFDSCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFBLFdBQU8sRUFBQyxzRUFBc0UsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN2SSxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxFQUFVO0lBQ2pDLElBQUksZ0JBQWEsQ0FBQyxTQUFTLEVBQUU7UUFDekIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMsb0RBQW9ELEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoSSxPQUFPO0tBQ1Y7SUFDRCxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDM0IsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3BEO0lBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN2Qix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxJQUFBLFdBQU8sRUFBQyxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRyxDQUFDLENBQUMsQ0FBQztJQUNILHdCQUFhLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUEsV0FBTyxFQUFDLG9DQUFvQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JHLENBQUM7QUFFRCxTQUFnQixTQUFTLENBQUMsTUFBcUIsRUFBRSxNQUFxQjtJQUNsRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDOUIsSUFBSSxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtRQUM5QixjQUFjLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDaEMsT0FBTztLQUNWO1NBQU07UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDNUMsT0FBTztLQUNWO0FBQ0wsQ0FBQztBQVRELDhCQVNDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLE1BQXFCLEVBQUUsTUFBcUI7SUFDbkUsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlCLElBQUksRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDOUIsaUJBQWlCLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDbkMsT0FBTztLQUNWO1NBQU07UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDNUMsT0FBTztLQUNWO0FBQ0wsQ0FBQztBQVRELGdDQVNDIn0=