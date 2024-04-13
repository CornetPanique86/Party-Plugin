import { EnchantmentNames } from "bdsx/bds/enchants";
import { ItemStack } from "bdsx/bds/inventory";
type ItemDesc = {
    item: string;
    amount?: number;
    data?: number;
    name?: string;
    lore?: string[];
    enchantment?: {
        enchant: EnchantmentNames;
        level: number;
        isUnsafe: boolean;
    };
};
export declare function createCItemStack(item: ItemDesc): ItemStack;
export {};
