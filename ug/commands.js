"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const blockpos_1 = require("bdsx/bds/blockpos");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
// Bedwars
command_2.command.register("bedwarsstart", "Hehehehe", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    (0, bedwars_1.bedwarsstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    (0, bedwars_1.bedwarsstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.stop", "stop"),
});
// Join game queue
command_2.command.register("joinqueue", "Join the queue of a game", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.joinqueue)(origin, output);
}, {});
// Leave game queue
command_2.command.register("leavequeue", "Leave the queue you're currently in", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.leavequeue)(origin, output);
}, {});
// Spectate currently running game
command_2.command.register("spectate", "Spectate the current game", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (actor.hasTag("spectator")) {
        (0, utils_1.spectateStop)(actor);
    }
    else {
        if (_1.isGameRunning.isRunning)
            (0, utils_1.spectate)(actor);
    }
}, {});
// test
command_2.command.register("testp", "testing", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    test(param, origin, output);
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
});
command_2.command.register("bedwarsclearmap", "cleazr map", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    if (param.value === 0) {
        (0, bedwars_1.clearMap2)();
    }
    else if (param.value === 1) {
        (0, bedwars_1.clearMapFill)();
    }
    else if (param.value === 2) {
        (0, bedwars_1.clearMapFills)();
    }
    output.success("We made it!");
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
});
command_2.command.register("tpvec", "tp w vec3", command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.teleport(blockpos_1.Vec3.create(param.x.value, param.y.value, param.z.value));
    output.success(`relative float example> origin=${origin.getName()}\n` +
        `${param.x.value} ${param.x.is_relative}\n` +
        `${param.y.value} ${param.y.is_relative}\n` +
        `${param.z.value} ${param.z.is_relative}\n`);
}, {
    x: blockpos_1.RelativeFloat,
    y: blockpos_1.RelativeFloat,
    z: blockpos_1.RelativeFloat,
});
function test(param, origin, output) {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    const actorName = actor.getNameTag();
    console.log(actorName);
    const result1 = launcher_1.bedrockServer.executeCommand(`clear "${actorName}"`).result;
    const result2 = launcher_1.bedrockServer.executeCommand(`clear ${actorName}`).result;
    console.log("result1: " + result1 + " ; result2: " + result2);
    // if (!actor.hasTag("abilityTrue")) {
    //     actor.addTag("abilityTrue");
    //     const abilities = actor.getAbilities();
    //     abilities.setAbility(AbilitiesIndex.MayFly, true);
    //     abilities.setAbility(AbilitiesIndex.Flying, true);
    //     abilities.setAbility(AbilitiesIndex.NoClip, true);
    //     abilities.setAbility(AbilitiesIndex.Invulnerable, true);
    //     abilities.setAbility(AbilitiesIndex.AttackPlayers, false);
    //     actor.syncAbilities();
    // } else {
    //     actor.removeTag("abilityTrue");
    //     const abilities = actor.getAbilities();
    //     abilities.setAbility(AbilitiesIndex.Flying, false);
    //     abilities.setAbility(AbilitiesIndex.MayFly, false);
    //     abilities.setAbility(AbilitiesIndex.NoClip, false);
    //     abilities.setAbility(AbilitiesIndex.Invulnerable, false);
    //     abilities.setAbility(AbilitiesIndex.AttackPlayers, true);
    //     actor.syncAbilities();
    // }
    // let armorSlot = ArmorSlot.Head;
    // let armor = "minecraft:diamond_helmet";
    // switch (param.value) {
    //     case 1:
    //         armorSlot = ArmorSlot.Chest;
    //         armor = "minecraft:diamond_chestplate";
    //         break;
    //     case 2:
    //         armorSlot = ArmorSlot.Legs;
    //         armor = "minecraft:diamond_leggings";
    //         break;
    //     case 3:
    //         armorSlot = ArmorSlot.Feet;
    //         armor = "minecraft:diamond_boots";
    //         break;
    //     default:
    //         break;
    // }
    // console.log(actor.getArmor(armorSlot));
    // let userData = actor.getArmor(ArmorSlot.Chest).getUserData();
    // console.log("\n\n" + NBT.stringify(userData, 4));
    // const item = createCItemStack({
    //     item: armor,
    //     amount: 1
    // });
    // const tag = item.save();
    // const nbt = NBT.allocate({
    //     ...tag,
    //     tag: {
    //         ...tag.tag,
    //         "Trim": {
    //             "Material": "redstone",
    //             "Pattern": "wayfinder"
    //         },
    //         "minecraft:item_lock": NBT.byte(2),
    //         "minecraft:keep_on_death": NBT.byte(1)
    //     }
    // }) as CompoundTag;
    // item.load(nbt);
    // actor.setArmor(param.value, item);
    // item.destruct();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQTJGO0FBQzNGLG1DQUEwRjtBQUUxRixnREFBMEM7QUFFMUMsZ0RBQWtFO0FBSWxFLDRDQUE4QztBQUM5Qyx3QkFBa0M7QUFFbEMsVUFBVTtBQUNWLGlCQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQ3hFLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxzQkFBWSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUM7Q0FDaEQsQ0FDSjtLQUNBLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxzQkFBWSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7Q0FDOUMsQ0FDSixDQUFDO0FBRU4sa0JBQWtCO0FBQ2xCLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSwwQkFBMEIsRUFBRSxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQzdGLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLGlCQUFTLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLENBQUMsRUFDRCxFQUFHLENBQ04sQ0FBQztBQUVG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