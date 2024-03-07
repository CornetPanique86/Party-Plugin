export declare const logPrefix: string;
export declare enum LogInfo {
    default = 0,
    info = 1,
    warn = 2,
    error = 3
}
export declare function rawtext(msg: string, type?: LogInfo): string;
