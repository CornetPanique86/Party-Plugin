"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const _1 = require(".");
const launcher_1 = require("bdsx/launcher");
const actor_1 = require("bdsx/bds/actor");
const player_1 = require("bdsx/bds/player");
const effects_1 = require("bdsx/bds/effects");
// /spawn
command_2.command.register("spawn", "Teleport to spawn", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    const dim = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld);
    if (!dim) {
        output.error("Internal server error");
        return;
    }
    ;
    actor.teleport(_1.lobbyCoords);
    actor.playSound("random.pop");
    actor.removeEffect(effects_1.MobEffectIds.NightVision);
    launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", _1.lobbyCoords, dim);
}, {});
// /landmarks
command_2.command.register("landmarks", "Manage landmarks", command_1.CommandPermissionLevel.Normal)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    output.error("Not implemented");
}, {
    list: command_2.command.enum("option.list", "list")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR)
        output.error("Only operators can run the 'config' subcommand!");
    output.success((0, _1.landmarksReset)());
}, {
    config: command_2.command.enum("option.config", "config"),
    reset: command_2.command.enum("option.reset", "reset")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR)
        output.error("Only operators can run the 'config' subcommand!");
    output.success((0, _1.landmarksASReset)());
}, {
    config: command_2.command.enum("option.config", "config"),
    summon: command_2.command.enum("option.summon", "summon")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR)
        output.error("Only operators can run the 'config' subcommand!");
    output.success((0, _1.reloadLandmarksVar)());
}, {
    config: command_2.command.enum("option.config", "config"),
    reload: command_2.command.enum("option.reload", "reload")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsd0JBQXNGO0FBQ3RGLDRDQUE4QztBQUM5QywwQ0FBNkM7QUFDN0MsNENBQW1EO0FBQ25ELDhDQUFnRDtBQUdoRCxTQUFTO0FBQ1QsaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FDbEYsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLE1BQU0sR0FBRyxHQUFHLHdCQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxtQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDdEMsT0FBTztLQUNWO0lBQUEsQ0FBQztJQUNGLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBVyxDQUFDLENBQUM7SUFDNUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QixLQUFLLENBQUMsWUFBWSxDQUFDLHNCQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0Msd0JBQWEsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsY0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2xGLENBQUMsRUFDRCxFQUFHLENBQ04sQ0FBQztBQUVGLGFBQWE7QUFDYixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxX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