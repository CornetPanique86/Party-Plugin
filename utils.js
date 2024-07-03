"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCItemStack = void 0;
const enchants_1 = require("bdsx/bds/enchants");
const inventory_1 = require("bdsx/bds/inventory");
const command_1 = require("bdsx/command");
const nativetype_1 = require("bdsx/nativetype");
function createCItemStack(item) {
    const i = inventory_1.ItemStack.constructWith(item.item, item.amount, item.data);
    if (item.name !== undefined)
        i.setCustomName(item.name);
    if (item.lore !== undefined)
        i.setCustomLore(item.lore);
    if (item.enchantment !== undefined) {
        if (item.enchantment.level > 32767)
            item.enchantment.level = 32767;
        if (item.enchantment.level < -32767)
            item.enchantment.level = -32767;
        enchants_1.EnchantUtils.applyEnchant(i, item.enchantment.enchant, item.enchantment.level, item.enchantment.isUnsafe);
    }
    return i;
}
exports.createCItemStack = createCItemStack;
command_1.command.register("transferserver", "Transfer servers").overload((params, origin, output) => {
    const actor = origin.getEntity();
    if (actor === null || actor === void 0 ? void 0 : actor.isPlayer())
        actor.transferServer(params.address, params.port);
}, {
    address: nativetype_1.CxxString,
    port: nativetype_1.int32_t,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnREFBbUU7QUFDbkUsa0RBQStDO0FBQy9DLDBDQUF1QztBQUN2QyxnREFBcUQ7QUFlckQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBYztJQUMzQyxNQUFNLENBQUMsR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JFLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTO1FBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVM7UUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO1FBQ2hDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsS0FBSztZQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSztZQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3JFLHVCQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzdHO0lBRUQsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBWEQsNENBV0M7QUFFRCxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsQ0FDM0QsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxRQUFRLEVBQUU7UUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdFLENBQUMsRUFDRDtJQUNJLE9BQU8sRUFBRSxzQkFBUztJQUNsQixJQUFJLEVBQUUsb0JBQU87Q0FDaEIsQ0FDSixDQUFDIn0=