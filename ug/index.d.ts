import "./commands";
import { Vec3 } from "bdsx/bds/blockpos";
export declare enum Games {
    none = "None",
    bedwars = "Bedwars",
    hikabrain = "Hikabrain",
    hidenseek = "Hide 'n' Seek"
}
type IsGameRunning = {
    game: Games;
    isRunning: boolean;
    isSpectateInitialized: boolean;
};
export declare const isGameRunning: IsGameRunning;
export declare const lobbyCoords: Vec3;
export {};
