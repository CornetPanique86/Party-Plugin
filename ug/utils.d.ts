import { Player } from "bdsx/bds/player";
import { Games } from ".";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { CommandOutput } from "bdsx/bds/command";
export declare function startGame(game: Games, players: Player[], sec: number, title?: string): Promise<string[] | null>;
export declare function joinqueue(origin: CommandOrigin, output: CommandOutput): void;
export declare function leavequeue(origin: CommandOrigin, output: CommandOutput): void;
