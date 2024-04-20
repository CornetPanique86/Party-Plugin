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
const player_1 = require("bdsx/bds/player");
const nativetype_1 = require("bdsx/nativetype");
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
const timelineTpCooldown = new Map();
command_2.command.register("timeline", "hehehehehehe", command_1.CommandPermissionLevel.Normal)
    .overload((param, origin, output) => {
    if (!timeline_1.isTimelineRunning)
        return output.error("This command is only available while the timeline is enabled");
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    const name = actor.getNameTag();
    if (!timelineTpCooldown.has(name))
        timelineTpCooldown.set(name, new Date());
    else if (Number(new Date()) - Number(timelineTpCooldown.get(name)) < 1000)
        return output.error("This command is on cooldown for 1 second");
    else {
        timelineTpCooldown.set(name, new Date());
    }
    const { year, month, day } = param;
    if (year < 2019 || year > 2024)
        return output.error("Year has to be between 2019 and 2024");
    if (month < 1 || month > 12)
        return output.error("Um there are only 12 months in a year... so put a number between 1 and 12");
    if (day < 0 || day > 31)
        return output.error("Day has to be between 1 and 31");
    if (year === 2019 && month < 7)
        return output.error("Date has to be after July 12th 2019");
    if (year === 2019 && month === 7 && day < 12)
        return output.error("Date has to be after July 12th 2019");
    if (year === 2024 && month > 3)
        return output.error("Date has to be before March 29th 2024");
    if (year === 2024 && month === 3 && day > 29)
        return output.error("Date has to be before March 29th 2024");
    const mills = new Date(Date.UTC(year, month - 1, day));
    const deltaMills = mills.getTime() - 1562889600000;
    const days = Math.floor(deltaMills / (24 * 60 * 60 * 1000));
    const x = days * 3;
    actor.teleport(blockpos_1.Vec3.create(x, 48, 0), actor_1.DimensionId.TheEnd);
}, {
    tp: command_2.command.enum("option.tp", "tp"),
    year: nativetype_1.int32_t,
    month: nativetype_1.int32_t,
    day: nativetype_1.int32_t
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR) {
        output.error("Only operators can run the 'config' subcommand!");
        return;
    }
    (0, timeline_1.startTimeline)();
}, {
    config: command_2.command.enum("option.config", "config"),
    start: command_2.command.enum("option.start", "start")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR) {
        output.error("Only operators can run the 'config' subcommand!");
        return;
    }
    (0, timeline_1.stopTimeline)();
}, {
    config: command_2.command.enum("option.config", "config"),
    stop: command_2.command.enum("option.stop", "stop")
})
    .overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR) {
        output.error("Only operators can run the 'config' subcommand!");
        return;
    }
    actor.runCommand("fill -1 48 -1 -1 51 1 air");
    actor.runCommand("fill -13 48 -1 -13 51 1 air");
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
    config: command_2.command.enum("option.config", "config"),
    free: command_2.command.enum("option.free", "free")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwRDtBQUMxRCwwQ0FBdUM7QUFDdkMsd0JBQWlHO0FBQ2pHLDRDQUE4QztBQUM5QywwQ0FBNkM7QUFDN0MsOENBQWdEO0FBQ2hELGdEQUF5QztBQUN6Qyx5Q0FBNEU7QUFDNUUsNENBQW1EO0FBQ25ELGdEQUEwQztBQUUxQyxTQUFTO0FBQ1QsaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FDbEYsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBQy9CLElBQUksNEJBQWlCLEVBQUU7UUFDbkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQy9CLE9BQU87S0FDVjtJQUNELE1BQU0sR0FBRyxHQUFHLHdCQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxtQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDdEMsT0FBTztLQUNWO0lBQUEsQ0FBQztJQUNGLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBVyxDQUFDLENBQUM7SUFDNUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QixLQUFLLENBQUMsWUFBWSxDQUFDLHNCQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0Msd0JBQWEsQ0FBQyxLQUFLLENB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