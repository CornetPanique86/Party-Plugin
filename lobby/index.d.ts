import { Vec3 } from "bdsx/bds/blockpos";
import "./commands";
import "./music";
import { Player } from "bdsx/bds/player";
export declare const lobbyCoords: Vec3;
export declare function reloadLandmarksVar(): string;
export declare function landmarksReset(): string;
export declare function landmarksASReset(): string;
export declare function plLeavePk(pl: Player): void;
