"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const pvparena_1 = require("./pvparena");
const actor_1 = require("bdsx/bds/actor");
const blockpos_1 = require("bdsx/bds/blockpos");
const player_1 = require("bdsx/bds/player");
const utils_1 = require("../utils");
command_2.command.register("pvparena", "Start the pvp arena game", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (launcher_1.bedrockServer.level.getActivePlayerCount() < 2)
        return output.error("You need at least 2 people to start!");
    if (pvparena_1.isGameRunning)
        return output.error("A game is already running!");
    (0, pvparena_1.startGame)();
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (!pvparena_1.isGameRunning)
        return output.error("No game is even running");
    (0, pvparena_1.stopGame)();
}, {
    option: command_2.command.enum("option.stop", "stop")
});
command_2.command.register("boat", "Boat commands", command_1.CommandPermissionLevel.Normal)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.isRiding())
        return output.error("You're already riding something! (so prob a boat)");
    const level = actor.getLevel();
    const identifier = actor_1.ActorDefinitionIdentifier.constructWith("minecraft:boat");
    const entity = actor_1.Actor.summonAt(actor.getRegion(), actor.getFeetPos(), identifier, level.getNewUniqueID());
    identifier.destruct();
    if (entity === null)
        return output.error("Can't spawn the boat");
    output.success("§7§oBoat summoned");
}, {
    option: command_2.command.enum("option.summon", "summon"),
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.hasTag("ch5")) {
        actor.isRiding() ? launcher_1.bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 155 214 -16`)
            : actor.teleport(blockpos_1.Vec3.create(155, 214, -16));
    }
    else if (actor.hasTag("ch4")) {
        actor.isRiding() ? launcher_1.bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 148 78 -50`)
            : actor.teleport(blockpos_1.Vec3.create(148, 78, -50));
    }
    else if (actor.hasTag("ch3")) {
        actor.isRiding() ? launcher_1.bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 213 50 -121`)
            : actor.teleport(blockpos_1.Vec3.create(213, 50, -121));
    }
    else if (actor.hasTag("ch2")) {
        actor.isRiding() ? launcher_1.bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 249 63 -178`)
            : actor.teleport(blockpos_1.Vec3.create(249, 63, -178));
    }
    else if (actor.hasTag("ch1")) {
        actor.isRiding() ? launcher_1.bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 198 89 -46`)
            : actor.teleport(blockpos_1.Vec3.create(198, 89, -46));
    }
    else {
        actor.isRiding() ? launcher_1.bedrockServer.executeCommand(`execute as "${actor.getNameTag()}" run tp @e[type=boat, c=1] 165 137 -22`)
            : actor.teleport(blockpos_1.Vec3.create(165, 137, -22));
    }
}, {
    option: command_2.command.enum("option.checkpoint", "checkpoint")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR)
        return output.error("Only operators can run the 'config' subcommand!");
    launcher_1.bedrockServer.executeCommand("tag @a remove ch5");
    launcher_1.bedrockServer.executeCommand("tag @a remove ch4");
    launcher_1.bedrockServer.executeCommand("tag @a remove ch3");
    launcher_1.bedrockServer.executeCommand("tag @a remove ch2");
    launcher_1.bedrockServer.executeCommand("tag @a remove ch1");
    output.success("Removed tags");
}, {
    config: command_2.command.enum("option.config", "config"),
    clearTags: command_2.command.enum("option.clearTags", "clearTags")
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.getPermissionLevel() !== player_1.PlayerPermission.OPERATOR)
        return output.error("Only operators can run the 'config' subcommand!");
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        pl.runCommand("clear");
        const item = (0, utils_1.createCItemStack)({
            item: "green_dye",
            amount: 1,
            name: "§r§iSpawn boat"
        });
        pl.addItem(item);
        const item2 = (0, utils_1.createCItemStack)({
            item: "light_weighted_pressure_plate",
            amount: 1,
            name: "§r§6Checkpoint"
        });
        pl.addItem(item2);
        pl.sendInventory();
        item.destruct();
        item2.destruct();
    });
}, {
    config: command_2.command.enum("option.config", "config"),
    giveItems: command_2.command.enum("option.giveItems", "giveItems")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwRDtBQUMxRCwwQ0FBdUM7QUFDdkMsNENBQThDO0FBQzlDLHlDQUFnRTtBQUNoRSwwQ0FBa0U7QUFDbEUsZ0RBQXlDO0FBQ3pDLDRDQUFtRDtBQUNuRCxvQ0FBNEM7QUFFNUMsaUJBQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLDBCQUEwQixFQUFFLGdDQUFzQixDQUFDLFFBQVEsQ0FBQztLQUN4RixRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBRS9CLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDaEgsSUFBSSx3QkFBYTtRQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3JFLElBQUEsb0JBQVMsR0FBRSxDQUFDO0FBQ2hCLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQ2hELENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFB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