import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedwarsstart } from "./bedwars";
import { joinqueue, leavequeue, spectate, spectateStop } from "./utils";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { int32_t } from "bdsx/nativetype";
import { RelativeFloat, Vec3 } from "bdsx/bds/blockpos";
import { ArmorSlot } from "bdsx/bds/inventory";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { bedrockServer } from "bdsx/launcher";
import { isGameRunning } from ".";
import { CommandResultType } from "bdsx/commandresult";
import { hikabrainstart } from "./hikabrain";
import { startKillsCountdown } from "./killscountdown";
import { hidenseekstart } from "./hidenseek";

// tntrun: 14 5 516
// koth: -121 4 21
// block party: 104 4 -141
// sumo: 233 8 482
// pvp arena: 70 49 235

// Bedwars
command.register("bedwarsstart", "Hehehehe", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            bedwarsstart(param, origin, output);
        },
        {
            option: command.enum("option.start", "start"),
        },
    )
    .overload(
        (param, origin, output) => {
            bedwarsstart(param, origin, output);
        },
        {
            option: command.enum("option.stop", "stop")
        },
);

// Hikabrain
command.register("hikabrainstart", "Hehehehebrain", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            hikabrainstart(param, origin, output);
        },
        {
            option: command.enum("option.start", "start"),
        },
    )
    .overload(
        (param, origin, output) => {
            hikabrainstart(param, origin, output);
        },
        {
            option: command.enum("option.stop", "stop")
        },
);

// Hide 'n' seek
command.register("hidenseek", "Heheheheseek", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            hidenseekstart(param, origin, output);
        },
        {
            option: command.enum("option.start", "start"),
        },
    )
    .overload(
        (param, origin, output) => {
            hidenseekstart(param, origin, output);
        },
        {
            option: command.enum("option.stop", "stop")
        },
);

command.register("killscountdown", "start da countdown!", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            startKillsCountdown("start", actor, param.timeInSeconds);
        },
        {
            option: command.enum("option.start", "start"),
            timeInSeconds: int32_t
        },
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            startKillsCountdown("stop", actor);
        },
        {
            option: command.enum("option.stop", "stop")
        },
    );

enum GameLobbies {
    Tntrun,
    Koth,
    Blockparty,
    Sumo,
    Pvparena,
    Lobby
}
const gameLobbiesPos = [[14, 5, 516], [-121, 4, 21], [104, 4, -141], [233, 8, 482], [70, 49, 235], [0, 105, 0]];

// Tp to game lobby
command.register("tpgame", "Teleport to a minigame lobby", CommandPermissionLevel.Operator).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;
        actor.teleport(Vec3.create(gameLobbiesPos[param.game][0], gameLobbiesPos[param.game][1], gameLobbiesPos[param.game][2]));
        output.success("Teleported to " + param.game);
    },
    {
        game: command.enum("game.action", GameLobbies)
    },
);

// Join game queue
command.register("joinqueue", "Join the queue of a game", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        joinqueue(origin, output);
    },
    { },
);

// Leave game queue
command.register("leavequeue", "Leave the queue you're currently in", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        leavequeue(origin, output);
    },
    { },
);

// Spectate currently running game
command.register("spectate", "Spectate the current game", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (actor.hasTag("spectator")) {
            spectateStop(actor);
        } else {
            if (isGameRunning.isRunning && isGameRunning.isSpectateInitialized) spectate(actor)
            else output.error("Unable to spectate right now");
        }
    },
    { },
);
