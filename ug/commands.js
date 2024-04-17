"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const blockpos_1 = require("bdsx/bds/blockpos");
const abilities_1 = require("bdsx/bds/abilities");
const _1 = require(".");
const hikabrain_1 = require("./hikabrain");
const killscountdown_1 = require("./killscountdown");
// tntrun: 14 5 516
// koth: -121 4 21
// block party: 104 4 -141
// sumo: 233 8 482
// pvp arena: 70 49 235
// Bedwars
command_2.command.register("bedwarsstart", "Hehehehe", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    (0, bedwars_1.bedwarsstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    (0, bedwars_1.bedwarsstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.stop", "stop")
});
// Hikabrain
command_2.command.register("hikabrainstart", "Hehehehebrain", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    (0, hikabrain_1.hikabrainstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    (0, hikabrain_1.hikabrainstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.stop", "stop")
});
command_2.command.register("killscountdown", "start da countdown!", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    (0, killscountdown_1.startKillsCountdown)("start", actor, param.timeInSeconds);
}, {
    option: command_2.command.enum("option.start", "start"),
    timeInSeconds: nativetype_1.int32_t
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    (0, killscountdown_1.startKillsCountdown)("stop", actor);
}, {
    option: command_2.command.enum("option.stop", "stop")
});
var GameLobbies;
(function (GameLobbies) {
    GameLobbies[GameLobbies["Tntrun"] = 0] = "Tntrun";
    GameLobbies[GameLobbies["Koth"] = 1] = "Koth";
    GameLobbies[GameLobbies["Blockparty"] = 2] = "Blockparty";
    GameLobbies[GameLobbies["Sumo"] = 3] = "Sumo";
    GameLobbies[GameLobbies["Pvparena"] = 4] = "Pvparena";
    GameLobbies[GameLobbies["Lobby"] = 5] = "Lobby";
})(GameLobbies || (GameLobbies = {}));
const gameLobbiesPos = [[14, 5, 516], [-121, 4, 21], [104, 4, -141], [233, 8, 482], [70, 49, 235], [0, 105, 0]];
// Tp to game lobby
command_2.command.register("tpgame", "Teleport to a minigame lobby", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.teleport(blockpos_1.Vec3.create(gameLobbiesPos[param.game][0], gameLobbiesPos[param.game][1], gameLobbiesPos[param.game][2]));
    output.success("Teleported to " + param.game);
}, {
    game: command_2.command.enum("game.action", GameLobbies)
});
// Join game queue
command_2.command.register("joinqueue", "Join the queue of a game", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.joinqueue)(origin, output);
}, {});
// Leave game queue
command_2.command.register("leavequeue", "Leave the queue you're currently in", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.leavequeue)(origin, output);
}, {});
// Spectate currently running game
command_2.command.register("spectate", "Spectate the current game", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.hasTag("spectator")) {
        (0, utils_1.spectateStop)(actor);
    }
    else {
        if (_1.isGameRunning.isRunning && _1.isGameRunning.isSpectateInitialized)
            (0, utils_1.spectate)(actor);
        else
            output.error("Unable to spectate right now");
    }
}, {});
// test
command_2.command.register("testp", "testing", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.setSize(param.width, param.height);
}, {
    option: command_2.command.enum("option.size", "size"),
    width: nativetype_1.int32_t,
    height: nativetype_1.int32_t
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.setScale(param.scale);
}, {
    option: command_2.command.enum("option.scale", "scale"),
    scale: nativetype_1.int32_t
});
command_2.command.register("tpvec", "tp w vec3", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.teleport(blockpos_1.Vec3.create(param.x.value, param.y.value, param.z.value));
    output.success(`relative float example> origin=${origin.getName()}\n` +
        `${param.x.value} ${param.x.is_relative}\n` +
        `${param.y.value} ${param.y.is_relative}\n` +
        `${param.z.value} ${param.z.is_relative}\n`);
}, {
    x: blockpos_1.RelativeFloat,
    y: blockpos_1.RelativeFloat,
    z: blockpos_1.RelativeFloat,
});
function test(param, origin, output) {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
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
        abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.Flying, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, false);
        actor.syncAbilities();
    }
    else {
        actor.removeTag("abilityTrue");
        const abilities = actor.getAbilities();
        abilities.setAbility(abilities_1.AbilitiesIndex.Flying, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, true);
        actor.syncAbilities();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUF3RTtBQUV4RSxnREFBMEM7QUFDMUMsZ0RBQXdEO0FBR3hELGtEQUFvRDtBQUVwRCx3QkFBa0M7QUFFbEMsMkNBQTZDO0FBQzdDLHFEQUF1RDtBQUV2RCxtQkFBbUI7QUFDbkIsa0JBQWtCO0FBQ2xCLDBCQUEwQjtBQUMxQixrQkFBa0I7QUFDbEIsdUJBQXVCO0FBRXZCLFVBQVU7QUFDVixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLGdDQUFzQixDQUFDLFFBQVEsQ0FBQztLQUN4RSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsc0JBQVksRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQ2hELENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsc0JBQVksRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDO0NBQzlDLENBQ1IsQ0FBQztBQUVGLFlBQVk7QUFDWixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQy9FLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFF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