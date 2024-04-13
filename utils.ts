import { EnchantUtils, EnchantmentNames } from "bdsx/bds/enchants";
import { ItemStack } from "bdsx/bds/inventory";

type ItemDesc = {
    item: string,
    amount?: number,
    data?: number,
    name?: string,
    lore?: string[],
    enchantment?: {
        enchant: EnchantmentNames,
        level: number,
        isUnsafe: boolean
    }
}

export function createCItemStack(item: ItemDesc) {
    const i = ItemStack.constructWith(item.item, item.amount, item.data);
    if (item.name !== undefined) i.setCustomName(item.name);
    if (item.lore !== undefined) i.setCustomLore(item.lore);
    if (item.enchantment !== undefined) {
        if (item.enchantment.level > 32767) item.enchantment.level = 32767;
        if (item.enchantment.level < -32767) item.enchantment.level = -32767;
        EnchantUtils.applyEnchant(i, item.enchantment.enchant, item.enchantment.level, item.enchantment.isUnsafe);
    }

    return i;
}