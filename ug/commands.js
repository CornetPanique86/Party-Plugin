"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const abilities_1 = require("bdsx/bds/abilities");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUFrRTtBQUVsRSxnREFBMEM7QUFLMUMsa0RBQW9EO0FBRXBELFVBQVU7QUFDVixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixDQUFDLGdDQUFzQixDQUFDLFFBQVEsQ0FBQztLQUNqRyxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsc0JBQVksRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQ2hELENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsc0JBQVksRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDO0NBQzlDLENBQ0osQ0FBQztBQUVOLGtCQUFrQjtBQUNsQixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMEJBQTBCLEVBQUUsd0JBQXdCLENBQUMsZ0NBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUN0SCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxpQkFBUyxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDLEVBQ0QsRUFBRyxDQUNOLENBQUM7QUFFRixt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