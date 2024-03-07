import "./commands";
export declare enum Games {
    none = "None",
    bedwars = "Bedwars",
    hikabrain = "Hikabrain"
}
type IsGameRunning = {
    game: Games;
    isRunning: boolean;
};
export declare let isGameRunning: IsGameRunning;
export {};
