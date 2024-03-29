"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hikabrainstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
async function hikabrainstart(param, origin, output) {
    var _a;
    // /hikabrainstart stop
    if (param.option === "stop") {
        return;
    }
    // /hikabrainstart start
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? origin.getEntity().runCommand("tellraw @s " + (0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error))
            : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await (0, utils_1.startGame)(_1.Games.hikabrain, launcher_1.bedrockServer.level.getPlayers(), 10);
        if (participants !== null)
            setup(participants);
    }
    catch (err) {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while starting hikabrain", __1.LogInfo.error)}`);
        console.log(err);
        return;
    }
}
exports.hikabrainstart = hikabrainstart;
// 0 = red; 1 = blue   string: playerName
const teams = new Map();
const points = [0, 0];
const teamNames = ["§cRed", "§1Blue"];
const teamPos = ["1 1 1", "1 1 1"];
function setup(pls) {
    console.log("setup() participants:\n" + pls + "\n");
    launcher_1.bedrockServer.executeCommand("tag @a remove hikabrain");
    let teamCounter = 0;
    pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add hikabrain`);
        teams.set(pl, teamCounter);
        teamCounter === 2 ? teamCounter = 0 : teamCounter++;
    });
    teams.forEach((value, key) => {
        launcher_1.bedrockServer.executeCommand(`tp "${key}" ${teamPos[value]}`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${key}" ${teamPos[value]}`);
    });
    launcher_1.bedrockServer.executeCommand("clear @a[tag=hikabrain]");
    launcher_1.bedrockServer.executeCommand("effect @a[tag=hikabrain] clear");
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
}
function addPoint(team) {
    if (team < 0 || team > 1)
        return;
    points[team]++;
    launcher_1.bedrockServer.executeCommand(`tellraw @a[tag=hikabrain] \n§a§l+1 POINT §7> ${teamNames[team]} team §ris at §e§l${points[team]}§r§e/5\n`);
    launcher_1.bedrockServer.executeCommand("playsound firework.blast @a[tag=hikabrain]");
    roundReset();
}
function roundReset() {
    launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement disabled"); // block player movement
    const plsName = [...teams.keys()];
    (0, utils_1.countdownActionbar)(3, plsName, false)
        .then(() => {
        const pls = getHikabrainPlayers();
        pls.forEach(pl => {
        });
    })
        .catch(err => {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)("Error while finishing to setup hikabrain", __1.LogInfo.error));
        console.log(err.message);
        return;
    });
}
function getHikabrainPlayers() {
    let out = [];
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("hikabrain"))
            out.push(pl);
    });
    return out;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlrYWJyYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGlrYWJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQXdEO0FBQ3hELHdCQUEwQjtBQUduQixLQUFLLFVBQVUsY0FBYyxDQUFDLEtBQXlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDeEcsdUJBQXVCO0lBQ3ZCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsT0FBTztLQUNWO0lBRUQsd0JBQXdCO0lBQ3hCLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDakQsQ0FBQSxNQUFBLE1BQU0sQ0FBQyxTQUFTLEVBQUUsMENBQUUsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxHQUFFLElBQUEsV0FBTyxFQUFDLDRCQUE0QixFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3hFLE9BQU87S0FDVjtJQUNELElBQUk7UUFDQSxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEsaUJBQVMsRUFBQyxRQUFLLENBQUMsU0FBUyxFQUFFLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLElBQUksWUFBWSxLQUFLLElBQUk7WUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDbEQ7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLHdCQUFhLENBQUMsY0FBYyxDQUFDLGNBQWMsSUFBQSxXQUFPLEVBQUMsZ0NBQWdDLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RyxPQUFPLENBQUMsR0FB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