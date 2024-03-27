import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { startGame } from "./utils";
import { Games } from ".";

export async function hikabrainstart(param: { option: string }, origin: CommandOrigin, output: CommandOutput) {
    // /hikabrainstart stop
    if (param.option === "stop") {
        return;
    }

    // /hikabrainstart start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? origin.getEntity()!.runCommand("tellraw @s " +rawtext("Minimum 2 players to start", LogInfo.error))
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.hikabrain, bedrockServer.level.getPlayers(), 10);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting hikabrain", LogInfo.error)}`);
        console.log(err);
        return;
    }
}

// 0 = red; 1 = blue   string: playerName
let teams = new Map<string, number>();

function setup(pls: string[]) {
    return;
}