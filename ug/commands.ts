import { CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedwarsstart } from "./bedwars";
import { joinqueue } from "./utils";

// Bedwars
command.register("bedwarsstart", "Hehehehe", /* Command permission */ CommandPermissionLevel.Operator).overload(
    (param, origin, output) => {
        bedwarsstart(param, origin, output);
    },
    { },
);

// Join game queue
command.register("joinqueue", "Join the queue of a game", /* Command permission */ CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        joinqueue(origin, output);
    },
    { },
);