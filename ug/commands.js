"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
const inventory_1 = require("bdsx/bds/inventory");
const nbt_1 = require("bdsx/bds/nbt");
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
    let armorSlot = inventory_1.ArmorSlot.Head;
    let armor = "minecraft:diamond_helmet";
    switch (param.value) {
        case 1:
            armorSlot = inventory_1.ArmorSlot.Chest;
            armor = "minecraft:diamond_chestplate";
            break;
        case 2:
            armorSlot = inventory_1.ArmorSlot.Legs;
            armor = "minecraft:diamond_leggings";
            break;
        case 3:
            armorSlot = inventory_1.ArmorSlot.Feet;
            armor = "minecraft:diamond_boots";
            break;
        default:
            break;
    }
    // console.log(actor.getArmor(armorSlot));
    // let userData = actor.getArmor(ArmorSlot.Chest).getUserData();
    // console.log("\n\n" + NBT.stringify(userData, 4));
    const item = (0, utils_1.createCItemStack)({
        item: armor,
        amount: 1
    });
    const tag = item.save();
    const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "Trim": {
                "Material": "redstone",
                "Pattern": "wayfinder"
            }, "minecraft:item_lock": nbt_1.NBT.byte(2), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
    item.load(nbt);
    actor.setArmor(param.value, item);
    item.destruct();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUFrRTtBQUVsRSxnREFBMEM7QUFHMUMsa0RBQStDO0FBQy9DLHNDQUFnRDtBQUVoRCxVQUFVO0FBQ1YsaUJBQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUM7S0FDakcsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztDQUNoRCxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztDQUM5QyxDQUNKLENBQUM7QUFFTixrQkFBa0I7QUFDbEIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDBCQUEwQixFQUFFLHdCQUF3QixDQUFDLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FDdEgsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUIsQ0FBQyxFQUNELEVBQUcsQ0FD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