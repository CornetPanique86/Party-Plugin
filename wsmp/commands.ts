import { CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { isGameRunning, startGame, stopGame } from "./pvparena";
import { Actor, ActorDefinitionIdentifier } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { PlayerPermission } from "bdsx/bds/player";
import { createCItemStack } from "../utils";

command.register("pvparena", "Start the pvp arena game", CommandPermissionLevel.Operator)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (bedrockServer.level.getActivePlayerCount() < 2) return output.error("You need at least 2 people to start!");
        if (isGameRunning) return output.error("A game is already running!");
        startGame();
    },
    {
        option: command.enum("option.start", "start"),
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (!isGameRunning) return output.error("No game is even running");
        stopGame();
    },
    {
        option: command.enum("option.stop", "stop")
    },
);

command.register("boat", "Boat commands", CommandPermissionLevel.Normal)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (actor.isRiding()) return output.error("You're already riding something! (so prob a boat)");
        const level = actor.getLevel();
        const identifier = ActorDefinitionIdentifier.constructWith("minecraft:boat");
        const entity = Actor.summonAt(actor.getRegion(), actor.getFeetPos(), identifier, level.getNewUniqueID());
        identifier.destruct();
        if (entity === null) return output.error("Can't spawn the boat");
        output.success("§7§oBoat summoned");
    },
    {
        option: command.enum("option.summon", "summon"),
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (actor.hasTag("ch5")) {
            actor.isRiding() ? bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 155 214 -16`)
                             : actor.teleport(Vec3.create(155, 214, -16));
        } else if (actor.hasTag("ch4")) {
            actor.isRiding() ? bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 148 78 -50`)
                             : actor.teleport(Vec3.create(148, 78, -50));
        } else if (actor.hasTag("ch3")) {
            actor.isRiding() ? bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 213 50 -121`)
                             : actor.teleport(Vec3.create(213, 50, -121));
        } else if (actor.hasTag("ch2")) {
            actor.isRiding() ? bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 249 63 -178`)
                             : actor.teleport(Vec3.create(249, 63, -178));
        } else if (actor.hasTag("ch1")) {
            actor.isRiding() ? bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 198 89 -46`)
                             : actor.teleport(Vec3.create(198, 89, -46));
        } else {
            actor.isRiding() ? bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 165 137 -22`)
                             : actor.teleport(Vec3.create(165, 137, -22));
        }
    },
    {
        option: command.enum("option.checkpoint", "checkpoint")
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;
        if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) return output.error("Only operators can run the 'config' subcommand!");

        bedrockServer.executeCommand("tag @a remove ch5");
        bedrockServer.executeCommand("tag @a remove ch4");
        bedrockServer.executeCommand("tag @a remove ch3");
        bedrockServer.executeCommand("tag @a remove ch2");
        bedrockServer.executeCommand("tag @a remove ch1");
        output.success("Removed tags");
    },
    {
        config: command.enum("option.config", "config"),
        clearTags: command.enum("option.clearTags", "clearTags")
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;
        if (actor.getPermissionLevel() !== PlayerPermission.OPERATOR) return output.error("Only operators can run the 'config' subcommand!");

        bedrockServer.level.getPlayers().forEach(pl => {
            pl.runCommand("clear");
            const item = createCItemStack({
                item: "green_dye",
                amount: 1,
                name: "§r§iSpawn boat"
            });
            pl.addItem(item);
            const item2 = createCItemStack({
                item: "light_weighted_pressure_plate",
                amount: 1,
                name: "§r§6Checkpoint"
            });
            pl.addItem(item2);
            pl.sendInventory();
            item.destruct();
            item2.destruct();
        });
    },
    {
        config: command.enum("option.config", "config"),
        giveItems: command.enum("option.giveItems", "giveItems")
    },
);
