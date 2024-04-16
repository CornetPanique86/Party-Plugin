"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const _1 = require(".");
const launcher_1 = require("bdsx/launcher");
const actor_1 = require("bdsx/bds/actor");
const effects_1 = require("bdsx/bds/effects");
const blockpos_1 = require("bdsx/bds/blockpos");
const timeline_1 = require("./timeline");
// /spawn
command_2.command.register("spawn", "Teleport to spawn", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (timeline_1.isTimelineRunning) {
        output.error("Not right now!");
        return;
    }
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
command_2.command.register("landmarks", "Manage landmarks", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    output.success((0, _1.landmarksReset)());
}, {
    config: command_2.command.enum("option.config", "config"),
    reset: command_2.command.enum("option.reset", "reset")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    output.success((0, _1.landmarksASReset)());
}, {
    config: command_2.command.enum("option.config", "config"),
    summon: command_2.command.enum("option.summon", "summon")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    output.success((0, _1.reloadLandmarksVar)());
}, {
    config: command_2.command.enum("option.config", "config"),
    reload: command_2.command.enum("option.reload", "reload")
});
// /timeline
command_2.command.register("timeline", "hehehehehehe", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    (0, timeline_1.startTimeline)();
}, {
    start: command_2.command.enum("option.start", "start")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    (0, timeline_1.stopTimeline)();
}, {
    stop: command_2.command.enum("option.stop", "stop")
})
    .overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.runCommand("fill -1 48 -1 -1 51 1 air");
    for (let i = 0; i < 10; i++) {
        // -1 48 -1
        const x = -0.5, y = 48, zL = -0.5, zR = 1.5;
        let Y = y, ZL = zL, ZR = zR;
        const dim = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.TheEnd);
        if (!dim) {
            actor.sendMessage("§cDimension not registered");
            return;
        }
        while (Y < 51.8) {
            launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x, Y, ZL), dim);
            launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x, Y, ZR), dim);
            Y += 0.1;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        while (ZL < 0.5) {
            launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x, Y, ZL), dim);
            launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x, Y, ZR), dim);
            ZL += 0.1;
            ZR -= 0.1;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    actor.sendMessage("Success");
}, {
    free: command_2.command.enum("option.free", "free")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsd0JBQWlHO0FBQ2pHLDRDQUE4QztBQUM5QywwQ0FBNkM7QUFDN0MsOENBQWdEO0FBQ2hELGdEQUF5QztBQUN6Qyx5Q0FBNEU7QUFHNUUsU0FBUztBQUNULGlCQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQ2xGLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFFBQVEsRUFBRSxDQUFBO1FBQUUsT0FBTztJQUMvQixJQUFJLDRCQUFpQixFQUFFO1FBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMvQixPQUFPO0tBQ1Y7SUFDRCxNQUFNLEdBQUcsR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsbUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3RDLE9BQU87S0FDVjtJQUFBLENBQUM7SUFDRixLQUFLLENBQUMsUUFBUSxDQUFDLGNBQVcsQ0FBQyxDQUFDO0lBQzVCLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxzQkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzdDLHdCQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFF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