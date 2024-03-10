import { Form } from "bdsx/bds/form";
import { Player } from "bdsx/bds/player";
import { bedrockServer } from "bdsx/launcher";
import { Games, isGameRunning } from ".";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { CommandOutput } from "bdsx/bds/command";
import { LogInfo, rawtext } from "..";
import { ItemStack } from "bdsx/bds/inventory";
import { EnchantUtils, EnchantmentNames } from "bdsx/bds/enchants";
import { CompoundTag, NBT } from "bdsx/bds/nbt";


export function getPlayerByName(name: string): Player | null {
    const plList = bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name) return plList[i]
    }
    return null;
}

type ItemDesc = {
    item: string,
    amount: number,
    data: number,
    name?: string,
    lore?: string[],
    enchantment?: {
        enchant: EnchantmentNames,
        level: number,
        isUnsafe: boolean
    },
    color?: number
}

export function createCItemStack(item: ItemDesc) {
    const i = ItemStack.constructWith(item.item, item.amount, item.data);
    if (item.name !== undefined) i.setCustomName(item.name);
    if (item.lore !== undefined) i.setCustomLore(item.lore);
    if (item.enchantment !== undefined) {
        if (item.enchantment.level > 32767) item.enchantment.level = 32767;
        if (item.enchantment.level < -32767) item.enchantment.level = -32767;
        EnchantUtils.applyEnchant(i, item.enchantment.enchant, item.enchantment.level, item.enchantment.isUnsafe);
    }

    if (item.color !== undefined) {
        const tag = i.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                "customColor": NBT.int(item.color),
                "minecraft:item_lock": NBT.byte(2),
                "minecraft:keep_on_death": NBT.byte(1)
            }
        }) as CompoundTag;
        i.load(nbt);
    }
    return i;
}


let participants: string[] = []

export function stopGame() {
    isGameRunning.game = Games.none;
    isGameRunning.isRunning = false;
    participants = [];
    bedrockServer.executeCommand("tag @a remove bedwars");
}

export async function startGame(game: Games, players: Player[], sec: number, title: string = "§aStarting in..."): Promise<string[] | null> {
    if (players.length < 2) return null;
    bedrockServer.executeCommand(`tellraw @a ${rawtext(`A ${game} game is starting in ${sec} seconds!`), LogInfo.info}`);
    bedrockServer.executeCommand("playsound note.harp @a");
    players.forEach(pl => joinForm(pl, game));
    try {
        const result = await countdownQueue(15, title);
        if (result) {
            if (participants.length < 2) {
                bedrockServer.executeCommand(`tellraw @a ${rawtext("The bedwars game was §ccancelled§r. Not enough players!", LogInfo.info)}`);
                return null;
            }
            isGameRunning.game = game;
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

export function countdownActionbar(sec: number, pls: string[]): Promise<boolean> {
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
                bedrockServer.executeCommand(`execute as "${pl}" run playsound random.click @s ~~~ 1 ${sec/10 + 0.2}`);
                console.log(`execute as "${pl}" run playsound note.banjo @s ~~~ 1 ${sec/10 + 0.2}`);
                sec <= 3 ? bedrockServer.executeCommand(`title "${pl}" actionbar §l${red + str}`)
                         : bedrockServer.executeCommand(`title "${pl}" actionbar §l${gray + str}`);
            });
            sec--;
            if (sec <= -1) {
                clearInterval(countdownInterval);
                resolve(true);
            };
        }, 1000);
    });
}

async function joinForm(pl: Player, game: string) {
    const ni = pl.getNetworkIdentifier();
    const playForm = await Form.sendTo(ni, {
        type: "modal",
        title: `Play ${game}?`,
        content: `A §a${game} §rgame is starting in 15 seconds.\n§l§6> §r§eTo participate press §l'Yes'`,
        button1: "§2YES",
        button2: "§cnah"
    });
    if (playForm) {
        addParticipant(pl.getName());
        // console.log("First form " + participants[0] + participants[1]);
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
            // console.log("Second form " + participants[0] + participants[1]);
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