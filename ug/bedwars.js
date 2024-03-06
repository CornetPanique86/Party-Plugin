"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedwarsstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const form_1 = require("bdsx/bds/form");
// /bedwarsstart command
function bedwarsstart(param, origin, output) {
    var _a;
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? launcher_1.bedrockServer.executeCommand(`tellraw "${origin.getName()}" ${(0, __1.rawtext)("Minimum 2 players to start", "error")}`)
            : output.error("Min 2 players to start");
        return false;
    }
    start();
    return true;
}
exports.bedwarsstart = bedwarsstart;
let participants = [];
async function joinForm(pl) {
    const ni = pl.getNetworkIdentifier();
    const playBwForm = await form_1.Form.sendTo(ni, {
        type: "modal",
        title: "Play Bedwars?",
        content: "A §aBedwars §rgame is starting in 15 seconds.\n§l§6> §r§eTo participate press §l'Yes'",
        button1: "YES",
        button2: "nah"
    });
    if (playBwForm) {
        participants.push(pl);
        console.log("First form " + participants);
    }
    else {
        const playBwConfirmForm = await form_1.Form.sendTo(ni, {
            type: "modal",
            title: "Confirm: Play Bedwars?",
            content: "Um like actually? Tbh I thought it's a misclick so pls confirm just to be sure",
            button1: "Confirm (no play)",
            button2: "Play :)"
        });
        if (playBwConfirmForm) {
            participants.push(pl);
            console.log("Second form " + participants);
        }
        else {
            launcher_1.bedrockServer.executeCommand(`tellraw "${pl.getName()}" ${(0, __1.rawtext)("§7§oOk fine...")}`);
        }
    }
}
function start() {
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        Promise.race([
            joinForm(pl),
            new Promise((_, reject) => setTimeout(() => reject(console.log("start timeout atteint !")), 15e3))
        ]).catch(err => console.log("erreur " + err));
    });
    let countdown = 10;
    let countdownInterval = setInterval(() => {
        launcher_1.bedrockServer.executeCommand(`execute as @a run playsound random.click @s ~~~ 1 ${countdown / 10}`);
        launcher_1.bedrockServer.executeCommand(`title @a title §aStarting in...`);
        countdown <= 3 ? launcher_1.bedrockServer.executeCommand(`title @a subtitle §l§4${countdown}`) : launcher_1.bedrockServer.executeCommand(`title @a subtitle §l§7${countdown}`);
        countdown--;
        if (countdown == 0)
            clearInterval(countdownInterval);
    }, 1000);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNENBQThDO0FBQzlDLDBCQUE2QjtBQUM3Qix3Q0FBcUM7QUFHckMsd0JBQXdCO0FBQ3hCLFNBQWdCLFlBQVksQ0FBQyxLQUFTLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDaEYsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqSCxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsS0FBSyxFQUFFLENBQUM7SUFDUixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBUkQsb0NBUUM7QUFFRCxJQUFJLFlBQVksR0FBYSxFQUFFLENBQUM7QUFDaEMsS0FBSyxVQUFVLFFBQVEsQ0FBQyxFQUFVO0lBQzlCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ3JDLE1BQU0sVUFBVSxHQUFHLE1BQU0sV0FBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDckMsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsZUFBZTtRQUN0QixPQUFPLEVBQUUsdUZBQXVGO1FBQ2hHLE9BQU8sRUFBRSxLQUFLO1FBQ2QsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxVQUFVLEVBQUU7UUFDWixZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQyxDQUFDO0tBQzdDO1NBQU07UUFDSCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sV0FBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsd0JBQXdCO1lBQy9CLE9BQU8sRUFBRSxnRkFBZ0Y7WUFDekYsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixPQUFPLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxJQUFJLGlCQUFpQixFQUFFO1lBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLENBQUM7U0FDOUM7YUFBTTtZQUNILHdCQUFhLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUEsV0FBTyxFQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ3pGO0tBQ0o7QUFDTCxDQUFDO0FBRUQsU0FBUyxLQUFLO0lBQ1Ysd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDVCxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ1osSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3JHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ25CLElBQUksaUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUNyQyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxxREFBcUQsU0FBUyxHQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEcsd0JBQWEsQ0FBQyxjQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUNoRSxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxjQUFjLENBQUMseUJBQXlCLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDekosU0FBUyxFQUFFLENBQUM7UUFDWixJQUFJLFNBQVMsSUFBSSxDQUFDO1lBQUUsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDekQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2IsQ0FBQyJ9