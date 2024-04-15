import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { landmarksASReset, landmarksList, landmarksReset, lobbyCoords, plLeavePk, reloadLandmarksVar } from ".";
import { bedrockServer } from "bdsx/launcher";
import { DimensionId } from "bdsx/bds/actor";
import { PlayerPermission } from "bdsx/bds/player";
import { MobEffectIds } from "bdsx/bds/effects";
import { Vec3 } from "bdsx/bds/blockpos";
import { isTimelineRunning } from "./timeline";


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
command.register("landmarks", "Manage landmarks", CommandPermissionLevel.Normal)
    .overload(
        async (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            if (actor.hasTag("landmarksListCooldown")) {
                output.error("This command is on cooldown for 15 seconds!");
                return;
            }
            actor.addTag("landmarksListCooldown");
            output.success(await landmarksList(actor));
            setTimeout(() => {
                if (actor.isNotNull()) actor.removeTag("landmarksListCooldown");
            }, 15*1000);
        },
        {
            list: command.enum("option.list", "list")
        }
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;
            if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) output.error("Only operators can run the 'config' subcommand!");
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
            if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) output.error("Only operators can run the 'config' subcommand!");
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
            if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) output.error("Only operators can run the 'config' subcommand!");
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

        },
        {
            start: command.enum("option.start", "start")
        },
    )
    .overload(
        (param, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) return;

        },
        {
            stop: command.enum("option.stop", "stop")
        },
    );
