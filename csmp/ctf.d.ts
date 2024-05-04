import { Constants } from "./commands";
export declare let isGameRunning: boolean;
export declare function startGame(): void;
export declare function startGameLeaders(leader1: string, leader2: string): void;
export declare function getConstant(constant: Constants): boolean | string[] | number[] | Map<string, number> | boolean[] | "No constant provided" | number[][];
