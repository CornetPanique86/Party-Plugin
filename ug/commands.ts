import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedwarsstart } from "./bedwars";
import { createCItemStack, joinqueue, leavequeue, spectate, spectateStop } from "./utils";
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

// test
command.register("testp", "testing", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            actor.setSize(param.width, param.height);
        },
        {
            option: command.enum("option.size", "size"),
            width: int32_t,
            height: int32_t
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            actor.setScale(param.scale);
        },
        {
            option: command.enum("option.scale", "scale"),
            scale: int32_t
        }
    );

command.register("tpvec", "tp w vec3", CommandPermissionLevel.Operator).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;
        actor.teleport(Vec3.create(param.x.value, param.y.value, param.z.value));
        output.success(
            `relative float example> origin=${origin.getName()}\n` +
                `${param.x.value} ${param.x.is_relative}\n` +
                `${param.y.value} ${param.y.is_relative}\n` +
                `${param.z.value} ${param.z.is_relative}\n`,
        );
    },
    {
        x: RelativeFloat,
        y: RelativeFloat,
        z: RelativeFloat,
    }
);

function test(param: { action: string, value: number }, origin: CommandOrigin, output: CommandOutput) {
    const actor = origin.getEntity();
    if (!actor?.isPlayer()) return;

    // const result = actor.runCommand("clear");
    // console.log(result);
    // console.log(result.result);
    // bedrockServer.executeCommand("give " + actor.getNameTag() + " apple");
    // const result1 = actor.runCommand("clear", CommandResultType.Mute, CommandPermissionLevel.Operator);
    // console.log(result1);
    // console.log(result1.result);

    if (!actor.hasTag("abilityTrue")) {
        actor.addTag("abilityTrue");
        const abilities = actor.getAbilities();
        abilities.setAbility(AbilitiesIndex.MayFly, true);
        abilities.setAbility(AbilitiesIndex.Flying, true);
        abilities.setAbility(AbilitiesIndex.NoClip, true);
        abilities.setAbility(AbilitiesIndex.Invulnerable, true);
        abilities.setAbility(AbilitiesIndex.AttackPlayers, false);
        actor.syncAbilities();
    } else {
        actor.removeTag("abilityTrue");
        const abilities = actor.getAbilities();
        abilities.setAbility(AbilitiesIndex.Flying, false);
        abilities.setAbility(AbilitiesIndex.MayFly, false);
        abilities.setAbility(AbilitiesIndex.NoClip, false);
        abilities.setAbility(AbilitiesIndex.Invulnerable, false);
        abilities.setAbility(AbilitiesIndex.AttackPlayers, true);
        actor.syncAbilities();
    }
}