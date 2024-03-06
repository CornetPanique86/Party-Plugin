// On server start
import { logPrefix } from "..";
import "./commands";

export enum Games {
    none = "None",
    bedwars = "Bedwars",
    hikabrain = "Hikabrain"
}
type IsGameRunning = {
    game: Games;
    isRunning: boolean;
}
export let isGameRunning: IsGameRunning = {
    game: Games.none,
    isRunning: false
};

console.log(logPrefix + "UG plugin loaded");