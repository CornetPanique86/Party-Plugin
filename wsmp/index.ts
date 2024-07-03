import { events } from "bdsx/event";
import { logPrefix } from "..";
import "./commands";
import { CANCEL } from "bdsx/common";

console.log(logPrefix + "Weekend SMP plugin loaded");

/*
====== GAMES ======
Team PvP Arena --> plugin
Ice boat race --> plugin
Farthest death from da noob tower
Farthest llama spit
Sumo at build limit
*/

events.playerAttack.on(e => {
    if (e.victim.getIdentifier() !== "minecraft:player") return;
    if (e.player.getTags().length === 0) return CANCEL;
});

events.itemUse.on(e => {
    const item = e.itemStack;
    const pl = e.player;
    if (item.getCustomName() === "§r§iSpawn boat") {
        pl.runCommand("boat summon");
    } else if (item.getCustomName() === "§r§6Checkpoint") {
        pl.runCommand("boat checkpoint");
    }
});