"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const _1 = require(".");
const launcher_1 = require("bdsx/launcher");
const actor_1 = require("bdsx/bds/actor");
const player_1 = require("bdsx/bds/player");
const effects_1 = require("bdsx/bds/effects");
const blockpos_1 = require("bdsx/bds/blockpos");
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
// /parkour
command_2.command.register("parkour", "Parkour commands", command_1.CommandPermissionLevel.Normal)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    (0, _1.plLeavePk)(actor);
}, {
    leave: command_2.command.enum("option.leave", "leave")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.teleport(blockpos_1.Vec3.create(15.5, 0, 8.5));
}, {
    restart: command_2.command.enum("option.restart", "restart")
});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsd0JBQWlHO0FBQ2pHLDRDQUE4QztBQUM5QywwQ0FBNkM7QUFDN0MsNENBQW1EO0FBQ25ELDhDQUFnRDtBQUNoRCxnREFBeUM7QUFHekMsU0FBUztBQUNULGlCQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQ2xGLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFFBQVEsRUFBRSxDQUFBO1FBQUUsT0FBTztJQUMvQixNQUFNLEdBQUcsR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsbUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3RDLE9BQU87S0FDVjtJQUFBLENBQUM7SUFDRixLQUFLLENBQUMsUUFBUSxDQUFDLGNBQVcsQ0FBQyxDQUFDO0lBQzVCLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxzQkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzdDLHdCQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLGNBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNsRixDQUFDLEVBQ0QsRUFBRyxDQUNOLENBQUM7QUFFRixXQUFXO0FBQ1gsaUJBQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGdDQUFzQixDQUFDLE1BQU0sQ0FBQztLQUN6RSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLElBQUEsWUFBUyxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JCLENBQUMsRUFDRDtJQUNJLEtBQUssRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQy9DLENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQyxFQUNEO0lBQ0ksT0FBTyxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQztDQUNyRCxDQUNKLENBQUM7QUFFTixhQUFhO0FBQ2IsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLGtCQUFrQixFQUFFLGdDQUFzQixDQUFDLE1BQU0sQ0FBQztLQUMzRSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNwQyxDQUFDLEVBQ0Q7SUFDSSxJQUFJLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztDQUM1QyxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFFBQVEsRUFBRSxDQUFBO1FBQUUsT0FBTztJQUMvQixJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLHlCQUFnQixDQUFDLFFBQVE7UUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDOUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFBLGlCQUFjLEdBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0lBQy9DLEtBQUssRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQy9DLENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUsseUJBQWdCLENBQUMsUUFBUTtRQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUM5SCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUEsbUJBQWdCLEdBQUUsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0lBQy9DLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0NBQ2xELENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUsseUJBQWdCLENBQUMsUUFBUTtRQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUM5SCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUEscUJBQWtCLEdBQUUsQ0FBQyxDQUFDO0FBQ3pDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0lBQy9DLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0NBQ2xELENBQ0osQ0FBQyJ9