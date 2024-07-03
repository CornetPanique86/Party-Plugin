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
// /sendtominigames
command_2.command.register("sendtominigames", "Transfer to minigames server", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.addTag("portaled");
    actor.runCommand("transferserver event.xxlsteve.net 19142");
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