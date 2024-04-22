import { CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { isGameRunning, startGame, stopGame } from "./pvparena";

command.register("pvparena", "Start the pvp arena game", CommandPermissionLevel.Operator)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (bedrockServer.level.getActivePlayerCount() < 2) return output.error("You need at least 2 people to start!");
        if (isGameRunning) return output.error("A game is already running!");
        startGame();
    },
    {
        option: command.enum("option.start", "start"),
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (!isGameRunning) return output.error("No game is even running");
        stopGame();
    },
    {
        option: command.enum("option.stop", "stop")
    },
);