import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { Player } from "bdsx/bds/player";
import { startGame, stopGame } from "./utils";
import { Games } from ".";

// /bedwarsstart command
export async function bedwarsstart(param: { option: string}, origin: CommandOrigin, output: CommandOutput) {
    // /bedwarsstart stop
    if (param.option === "stop") {
        stopGame();
        return;
    }

    // /bedwarsstart start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? bedrockServer.executeCommand(`tellraw "${origin.getName()}" ${rawtext("Minimum 2 players to start", LogInfo.error)}`)
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.bedwars, bedrockServer.level.getPlayers(), 15);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting bedwars", LogInfo.error)}`);
        return;
    }
}

type Teams = [
    string[], // red
    string[], // blue
    string[], // green
    string[]  //yellow
]

let teams: Teams;

function setup(pls: string[]) {
    bedrockServer.executeCommand("tag @a remove bedwars");
    pls.forEach(pl => bedrockServer.executeCommand(`tag "${pl}" add bedwars`));
}