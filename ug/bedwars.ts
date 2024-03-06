import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { Form } from "bdsx/bds/form";
import { Player } from "bdsx/bds/player";

// /bedwarsstart command
export function bedwarsstart(param: {}, origin: CommandOrigin, output: CommandOutput) {
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? bedrockServer.executeCommand(`tellraw "${origin.getName()}" ${rawtext("Minimum 2 players to start", LogInfo.error)}`)
                                       : output.error("Min 2 players to start");
        return false;
    }

    return true;
}



function start() {



}