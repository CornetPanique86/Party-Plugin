"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const launcher_1 = require("bdsx/launcher");
const _1 = require(".");
// Bedwars
command_2.command.register("bedwarsstart", "Hehehehe", /* Command permission */ command_1.CommandPermissionLevel.Operator)
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
command_2.command.register("joinqueue", "Join the queue of a game", /* Command permission */ command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.joinqueue)(origin, output);
}, {});
// Leave game queue
command_2.command.register("leavequeue", "Leave the queue you're currently in", /* Command permission */ command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.leavequeue)(origin, output);
}, {});
// Spectate currently running game
command_2.command.register("spectate", "Spectate the current game", /* Command permission */ command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
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
command_2.command.register("testp", "testing", /* Command permission */ command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    test(param, origin, output);
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
});
command_2.command.register("bedwarsclearmap", "cleazr map", /* Command permission */ command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    (0, bedwars_1.clearMap)();
}, {});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQW1EO0FBQ25ELG1DQUEwRjtBQUUxRixnREFBMEM7QUFNMUMsNENBQThDO0FBQzlDLHdCQUFrQztBQUVsQyxVQUFVO0FBQ1YsaUJBQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUM7S0FDakcsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztDQUNoRCxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztDQUM5QyxDQUNKLENBQUM7QUFFTixrQkFBa0I7QUFDbEIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDBCQUEwQixFQUFFLHdCQUF3QixDQUFDLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FDdEgsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUIsQ0FBQyxFQUNELEVBQUcsQ0FD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