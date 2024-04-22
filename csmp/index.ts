import { events } from "bdsx/event";
import { logPrefix } from "..";
import "./commands";
import { CANCEL } from "bdsx/common";

console.log(logPrefix + "Cornet SMP plugin loaded");

events.playerAttack.on(e => {
    if (e.victim.getIdentifier() !== "minecraft:player") return;
    if (e.player.getTags().length === 0) return CANCEL;
});
