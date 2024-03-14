"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const abilities_1 = require("bdsx/bds/abilities");
const launcher_1 = require("bdsx/launcher");
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
// test
command_2.command.register("testp", "testing", /* Command permission */ command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    test(param, origin, output);
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
});
function test(param, origin, output) {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    console.log(launcher_1.bedrockServer.executeCommand(`clear "${actor.getNameTag()}" iron_chestplate`));
    console.log(`clear "${actor.getNameTag()}" iron_chestplate`);
    if (!actor.hasTag("abilityTrue")) {
        actor.addTag("abilityTrue");
        const abilities = actor.getAbilities();
        abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.Flying, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, true);
        abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, false);
        actor.syncAbilities();
    }
    else {
        actor.removeTag("abilityTrue");
        const abilities = actor.getAbilities();
        abilities.setAbility(abilities_1.AbilitiesIndex.Flying, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, true);
        actor.syncAbilities();
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUFrRTtBQUVsRSxnREFBMEM7QUFLMUMsa0RBQW9EO0FBQ3BELDRDQUE4QztBQUU5QyxVQUFVO0FBQ1YsaUJBQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUM7S0FDakcsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztDQUNoRCxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztDQUM5QyxDQUNKLENBQUM7QUFFTixrQkFBa0I7QUFDbEIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDBCQUEwQixFQUFFLHdCQUF3QixDQUFDLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FDdEgsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUIsQ0FBQyxFQUNELEVBQUcsQ0FD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