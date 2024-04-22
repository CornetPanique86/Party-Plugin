"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("bdsx/event");
const __1 = require("..");
require("./commands");
const common_1 = require("bdsx/common");
console.log(__1.logPrefix + "Weekend SMP plugin loaded");
/*
====== GAMES ======
Team PvP Arena --> plugin
Ice boat race --> plugin
Farthest death from da noob tower
Farthest llama spit
Sumo at build limit
*/
event_1.events.playerAttack.on(e => {
    if (e.victim.getIdentifier() !== "minecraft:player")
        return;
    if (e.player.getTags().length === 0)
        return common_1.CANCEL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUFvQztBQUNwQywwQkFBK0I7QUFDL0Isc0JBQW9CO0FBQ3BCLHdDQUFxQztBQUVyQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQVMsR0FBRywyQkFBMkIsQ0FBQyxDQUFDO0FBRXJEOzs7Ozs7O0VBT0U7QUFFRixjQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUN2QixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEtBQUssa0JBQWtCO1FBQUUsT0FBTztJQUM1RCxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLGVBQU0sQ0FBQztBQUN2RCxDQUFDLENBQUMsQ0FBQyJ9