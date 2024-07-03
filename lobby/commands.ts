import { CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { landmarksASReset, landmarksReset, lobbyCoords, plLeavePk, reloadLandmarksVar } from ".";
import { bedrockServer } from "bdsx/launcher";
import { DimensionId } from "bdsx/bds/actor";
import { MobEffectIds } from "bdsx/bds/effects";
import { Vec3 } from "bdsx/bds/blockpos";
import { isTimelineRunning, startTimeline, stopTimeline } from "./timeline";
import { PlayerPermission } from "bdsx/bds/player";
import { int32_t } from "bdsx/nativetype";

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

// /sendtominigames
command.register("sendtominigames", "Transfer to minigames server", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;
        actor.addTag("portaled");
        actor.runCommand("transferserver event.xxlsteve.net 19142");
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
const timelineTpCooldown = new Map<string, Date>();
command.register("timeline", "hehehehehehe", CommandPermissionLevel.Normal)
    .overload(
        (param, origin, output) => {
            if (!isTimelineRunning) return output.error("This command is only available while the timeline is enabled");
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            const name = actor.getNameTag();
            if (!timelineTpCooldown.has(name))
                timelineTpCooldown.set(name, new Date());
            else if (Number(new Date()) - Number(timelineTpCooldown.get(name)) < 1000)
                return output.error("This command is on cooldown for 1 second");
            else {
                timelineTpCooldown.set(name, new Date());
            }

            const { year, month, day } = param;
            if (year < 2019 || year > 2024) return output.error("Year has to be between 2019 and 2024");
            if (month < 1 || month > 12) return output.error("Um there are only 12 months in a year... so put a number between 1 and 12");
            if (day < 0 || day > 31) return output.error("Day has to be between 1 and 31");
            if (year === 2019 && month < 7) return output.error("Date has to be after July 12th 2019");
            if (year === 2019 && month === 7 && day < 12) return output.error("Date has to be after July 12th 2019");
            if (year === 2024 && month > 3) return output.error("Date has to be before March 29th 2024");
            if (year === 2024 && month === 3 && day > 29) return output.error("Date has to be before March 29th 2024");

            const mills = new Date(Date.UTC(year, month - 1, day));
            const deltaMills = mills.getTime() - 1562889600000;
            const days = Math.floor(deltaMills / (24 * 60 * 60 * 1000));
            const x = days*3;
            actor.teleport(Vec3.create(x, 48, 0), DimensionId.TheEnd);
        },
        {
            tp: command.enum("option.tp", "tp"),
            year: int32_t,
            month: int32_t,
            day: int32_t
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) {
                output.error("Only operators can run the 'config' subcommand!");
                return;
            }
            startTimeline();
        },
        {
            config: command.enum("option.config", "config"),
            start: command.enum("option.start", "start")
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) {
                output.error("Only operators can run the 'config' subcommand!");
                return;
            }
            stopTimeline();
        },
        {
            config: command.enum("option.config", "config"),
            stop: command.enum("option.stop", "stop")
        }
    )
    .overload(
        async (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) {
                output.error("Only operators can run the 'config' subcommand!");
                return;
            }
            actor.runCommand("fill -1 48 -1 -1 51 1 air");
            actor.runCommand("fill -13 48 -1 -13 51 1 air");

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
            config: command.enum("option.config", "config"),
            free: command.enum("option.free", "free")
        }
    );
