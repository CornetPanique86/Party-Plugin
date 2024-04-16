import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { landmarksASReset, landmarksReset, lobbyCoords, plLeavePk, reloadLandmarksVar } from ".";
import { bedrockServer } from "bdsx/launcher";
import { DimensionId } from "bdsx/bds/actor";
import { MobEffectIds } from "bdsx/bds/effects";
import { Vec3 } from "bdsx/bds/blockpos";
import { isTimelineRunning, startTimeline, stopTimeline } from "./timeline";


// /spawn
command.register("spawn", "Teleport to spawn", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;
        if (isTimelineRunning) {
            output.error("Not right now!");
            return;
        }
        const dim = bedrockServer.level.getDimension(DimensionId.Overworld);
        if (!dim) {
            output.error("Internal server error");
            return;
        };
        actor.teleport(lobbyCoords);
        actor.playSound("random.pop");
        actor.removeEffect(MobEffectIds.NightVision);
        bedrockServer.level.spawnParticleEffect("minecraft:endrod", lobbyCoords, dim);
    },
    { },
);

// /parkour
command.register("parkour", "Parkour commands", CommandPermissionLevel.Normal)
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            plLeavePk(actor);
        },
        {
            leave: command.enum("option.leave", "leave")
        },
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            actor.teleport(Vec3.create(15.5, 0, 8.5));
        },
        {
            restart: command.enum("option.restart", "restart")
        },
    );

// /landmarks
command.register("landmarks", "Manage landmarks", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            output.success(landmarksReset());
        },
        {
            config: command.enum("option.config", "config"),
            reset: command.enum("option.reset", "reset")
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            output.success(landmarksASReset());
        },
        {
            config: command.enum("option.config", "config"),
            summon: command.enum("option.summon", "summon")
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            output.success(reloadLandmarksVar());
        },
        {
            config: command.enum("option.config", "config"),
            reload: command.enum("option.reload", "reload")
        }
    );

// /timeline
command.register("timeline", "hehehehehehe", CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            startTimeline();
        },
        {
            start: command.enum("option.start", "start")
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            stopTimeline();
        },
        {
            stop: command.enum("option.stop", "stop")
        }
    )
    .overload(
        async (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            actor.runCommand("fill -1 48 -1 -1 51 1 air");

            for (let i=0; i<10; i++) {
                // -1 48 -1
                const x = -0.5,
                      y = 48,
                      zL = -0.5,
                      zR = 1.5;
                let Y = y,
                    ZL = zL,
                    ZR = zR;
                const dim = bedrockServer.level.getDimension(DimensionId.TheEnd);
                if (!dim) {
                    actor.sendMessage("§cDimension not registered");
                    return;
                }
                while (Y < 51.8) {
                    bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x, Y, ZL), dim);
                    bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x, Y, ZR), dim);
                    Y += 0.1;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                while (ZL < 0.5) {
                    bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x, Y, ZL), dim);
                    bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x, Y, ZR), dim);
                    ZL += 0.1;
                    ZR -= 0.1;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            actor.sendMessage("Success");
        },
        {
            free: command.enum("option.free", "free")
        }
    );
