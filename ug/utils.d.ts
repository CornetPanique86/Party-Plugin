import { Player } from "bdsx/bds/player";
import { Games } from ".";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { CommandOutput } from "bdsx/bds/command";
import { ItemStack } from "bdsx/bds/inventory";
import { EnchantmentNames } from "bdsx/bds/enchants";
export declare function getPlayerByName(name: string): Player | null;
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
export declare function stopGame(): void;
export declare function startGame(game: Games, players: Player[], sec: number, title?: string): Promise<string[] | null>;
export declare function countdownActionbar(sec: number, pls: string[], actionbar: boolean, title?: string): Promise<boolean>;
export declare function joinqueue(origin: CommandOrigin, output: CommandOutput): void;
export declare function leavequeue(origin: CommandOrigin, output: CommandOutput): void;
export {};
