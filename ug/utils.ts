import { Form } from "bdsx/bds/form";
import { Player } from "bdsx/bds/player";
import { bedrockServer } from "bdsx/launcher";
import { Games, isGameRunning } from ".";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { CommandOutput } from "bdsx/bds/command";
import { LogInfo, rawtext } from "..";

export function startGame(game: Games, players: Player[], sec: number, title: string = "§aStarting in...", callback: (participants: string[]) => void) {
    players.forEach(pl => joinForm(pl, game));
    const countdownInterval = setInterval(() => {
        bedrockServer.executeCommand(`execute as @a run playsound random.click @s ~~~ 1 ${sec/10}`);
        bedrockServer.executeCommand(`title @a title ${title}`);
        sec <= 3 ? bedrockServer.executeCommand(`title @a subtitle §l§4${sec}`) : bedrockServer.executeCommand(`title @a subtitle §l§7${sec}`);
        sec--;
        if (sec <= 0) {
            clearInterval(countdownInterval);
            isGameRunning.game = game;
            callback(participants);
        };
    }, 1000);
}

async function joinForm(pl: Player, game: string) {
    const ni = pl.getNetworkIdentifier();
    const playForm = await Form.sendTo(ni, {
        type: "modal",
        title: `Play ${game}?`,
        content: `A §a${game} §rgame is starting in 15 seconds.\n§l§6> §r§eTo participate press §l'Yes'`,
        button1: "YES",
        button2: "nah"
    });
    if (playForm) {
        addParticipant(pl.getName());
        console.log("First form " + participants[0] + participants[1]);
    } else {
        const playConfirmForm = await Form.sendTo(ni, {
            type: "modal",
            title: `Confirm: Play ${game}?`,
            content: "Um like actually? Tbh I thought it's a misclick so pls confirm just to be sure",
            button1: "Confirm (no play)",
            button2: "Play :)"
        });

        if (!playConfirmForm) {
            addParticipant(pl.getName());
            console.log("Second form " + participants[0] + participants[1]);
        } else {
            bedrockServer.executeCommand(`tellraw "${pl.getName()}" ${rawtext("§7§oOk fine... But you can always reconsider and enter §f/joinqueue§7!")}`)
        }
    }
}

function addParticipant(pl: string) {
    if (isGameRunning) {
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
    if (isGameRunning) {
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