"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedwarsstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
// /bedwarsstart command
async function bedwarsstart(param, origin, output) {
    var _a;
    // /bedwarsstart stop
    if (param.option === "stop") {
        (0, utils_1.stopGame)();
        return;
    }
    // /bedwarsstart start
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? launcher_1.bedrockServer.executeCommand(`tellraw "${origin.getName()}" ${(0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error)}`)
            : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await (0, utils_1.startGame)(_1.Games.bedwars, launcher_1.bedrockServer.level.getPlayers(), 15);
        if (participants !== null)
            setup(participants);
    }
    catch (err) {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while starting bedwars", __1.LogInfo.error)}`);
        return;
    }
}
exports.bedwarsstart = bedwarsstart;
let teams;
function setup(pls) {
    launcher_1.bedrockServer.executeCommand("tag @a remove bedwars");
    pls.forEach(pl => launcher_1.bedrockServer.executeCommand(`tag "${pl}" add bedwars`));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNENBQThDO0FBQzlDLDBCQUFzQztBQUV0QyxtQ0FBOEM7QUFDOUMsd0JBQTBCO0FBRTFCLHdCQUF3QjtBQUNqQixLQUFLLFVBQVUsWUFBWSxDQUFDLEtBQXdCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDckcscUJBQXFCO0lBQ3JCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsSUFBQSxnQkFBUSxHQUFFLENBQUM7UUFDWCxPQUFPO0tBQ1Y7SUFFRCxzQkFBc0I7SUFDdEIsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkgsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4RSxPQUFPO0tBQ1Y7SUFDRCxJQUFJO1FBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGlCQUFTLEVBQUMsUUFBSyxDQUFDLE9BQU8sRUFBRSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ2xEO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxjQUFjLElBQUEsV0FBTyxFQUFDLDhCQUE4QixFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckcsT0FBTztLQUNWO0FBQ0wsQ0FBQztBQXBCRCxvQ0FvQkM7QUFTRCxJQUFJLEtBQVksQ0FBQztBQUVqQixTQUFTLEtBQUssQ0FBQyxHQUFhO0lBQ3hCLHdCQUFhLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDdEQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLHdCQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQy9FLENBQUMifQ==