"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const blockpos_1 = require("bdsx/bds/blockpos");
const abilities_1 = require("bdsx/bds/abilities");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
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
    option: command_2.command.enum("option.stop", "stop"),
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
        if (_1.isGameRunning.isRunning)
            (0, utils_1.spectate)(actor);
    }
}, {});
// test
command_2.command.register("testp", "testing", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    test(param, origin, output);
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
});
command_2.command.register("bedwarsclearmap", "cleazr map", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    const fills = [
        "-1048 30 -945 -1001 100 -999",
        "-1048 30 -1048 -1001 100 -1000",
        "-945 30 -1048 -1000 100 -1000",
        "-945 30 -945 -1000 100 -999"
    ];
    const result = launcher_1.bedrockServer.executeCommand(`fill ${fills[param.value]} air replace white_wool`);
    console.log(`fill ${fills[param.value]} air replace white_wool`);
    console.log(result);
    console.log("result: " + result.result);
    output.success("We didn't make it!");
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUEwRjtBQUUxRixnREFBMEM7QUFDMUMsZ0RBQXdEO0FBR3hELGtEQUFvRDtBQUNwRCw0Q0FBOEM7QUFDOUMsd0JBQWtDO0FBR2xDLFVBQVU7QUFDVixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLGdDQUFzQixDQUFDLFFBQVEsQ0FBQztLQUN4RSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsc0JBQVksRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQ2hELENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsc0JBQVksRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDO0NBQzlDLENBQ0osQ0FBQztBQUVOLGtCQUFrQjtBQUNsQixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMEJBQTBCLEVBQUUsZ0NBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUM3RixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxpQkFBUyxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDLEVBQ0QsRUFBRyxD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