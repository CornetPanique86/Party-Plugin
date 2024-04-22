"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("bdsx/event");
const __1 = require("..");
require("./commands");
const common_1 = require("bdsx/common");
console.log(__1.logPrefix + "Cornet SMP plugin loaded");
event_1.events.playerAttack.on(e => {
    if (e.victim.getIdentifier() !== "minecraft:player")
        return;
    if (e.player.getTags().length === 0)
        return common_1.CANCEL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUFvQztBQUNwQywwQkFBK0I7QUFDL0Isc0JBQW9CO0FBQ3BCLHdDQUFxQztBQUVyQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQVMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO0FBRXBELGNBQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ3ZCLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsS0FBSyxrQkFBa0I7UUFBRSxPQUFPO0lBQzVELElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU8sZUFBTSxDQUFDO0FBQ3ZELENBQUMsQ0FBQyxDQUFDIn0=