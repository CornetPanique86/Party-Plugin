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
    // clearMap();
    (0, bedwars_1.clearMap2)();
    // if (param.value === 1) {
    //     bedrockServer.executeCommand("fill -975 100 -1025 -1025 65 -975 blue_wool replace air");
    // } else {
    //     bedrockServer.executeCommand("fill -975 100 -1025 -1025 65 -975 air replace blue_wool");
    // }
    output.success("We made it!");
}, {
// action: command.enum("action.data", "data"),
// value: int32_t
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQThEO0FBQzlELG1DQUEwRjtBQUUxRixnREFBMEM7QUFFMUMsZ0RBQWtFO0FBSWxFLDRDQUE4QztBQUM5Qyx3QkFBa0M7QUFFbEMsVUFBVTtBQUNWLGlCQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQ3hFLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxzQkFBWSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUM7Q0FDaEQsQ0FDSjtLQUNBLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxzQkFBWSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7Q0FDOUMsQ0FDSixDQUFDO0FBRU4sa0JBQWtCO0FBQ2xCLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSwwQkFBMEIsRUFBRSxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQzdGLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLGlCQUFTLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLENBQUMsRUFDRCxFQUFHLENBQ04sQ0FBQztBQUVG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