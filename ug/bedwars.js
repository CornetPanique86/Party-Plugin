"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedwarsstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
const enchants_1 = require("bdsx/bds/enchants");
const nbt_1 = require("bdsx/bds/nbt");
const blockpos_1 = require("bdsx/bds/blockpos");
const actor_1 = require("bdsx/bds/actor");
let genInterval;
// /bedwarsstart command
async function bedwarsstart(param, origin, output) {
    var _a;
    // /bedwarsstart stop
    if (param.option === "stop") {
        clearInterval(genInterval);
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
const teams = [{ bed: true, pls: [] },
    { bed: true, pls: [] },
    { bed: true, pls: [] },
    { bed: true, pls: [] }];
const teamNames = ["§cRed", "§9Blue", "§2Green", "§6Yellow"];
const teamColors = [-54000, 66000, 64000, -67000];
function setup(pls) {
    console.log(pls + "\n");
    launcher_1.bedrockServer.executeCommand("tag @a remove bedwars");
    let teamCounter = 0;
    pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add bedwars`);
        // Put in team
        teams[teamCounter].pls.push(pl);
        teamCounter === 5 ? teamCounter = 0 : teamCounter++;
    });
    // TP Teams
    teams[0].pls.forEach(pl => launcher_1.bedrockServer.executeCommand(`tp "${pl}" -1001 68 -1035`));
    teams[1].pls.forEach(pl => launcher_1.bedrockServer.executeCommand(`tp "${pl}" -1000 68 -965`));
    teams[2].pls.forEach(pl => launcher_1.bedrockServer.executeCommand(`tp "${pl}" -966 68 -1000`));
    teams[3].pls.forEach(pl => launcher_1.bedrockServer.executeCommand(`tp "${pl}" -1034 68 -1000`));
    launcher_1.bedrockServer.executeCommand("clear @a[tag=bedwars]");
    launcher_1.bedrockServer.executeCommand("effect @a[tag=bedwars] clear");
    launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement disabled");
    teams.forEach((team, index) => {
        const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
        const armor = [];
        for (let i = 0; i < 4; i++) {
            const item = (0, utils_1.createCItemStack)({
                item: armorNames[i],
                amount: 1,
                data: 0,
                name: `§r${teamNames[index]} team`,
                enchantment: {
                    enchant: enchants_1.EnchantmentNames.Unbreaking,
                    level: 5,
                    isUnsafe: true
                }
            });
            const tag = item.save();
            const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "customColor": nbt_1.NBT.int(teamColors[index]), "minecraft:item_lock": nbt_1.NBT.byte(2), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
            item.load(nbt);
            armor.push(item);
        }
        team.pls.forEach(plName => {
            const player = (0, utils_1.getPlayerByName)(plName);
            if (!player)
                return;
            player.setArmor(0, armor[0]);
            player.setArmor(1, armor[1]);
            player.setArmor(2, armor[2]);
            player.setArmor(3, armor[3]);
        });
    });
    (0, utils_1.countdownActionbar)(5, pls)
        .then(() => {
        launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
        gen();
        return;
    })
        .catch(error => {
        console.error(error.message);
        return;
    });
}
// IRON INGOTS
// RED: -1001 68 -1038
// BLUE: -1000 68 -962
// GREEN: -963 68 -1000
// YELLOW: -1037 68 -1000
// EMERALDS
// -1001 70 -1008
// -1007 70 -1000
// -993 70 -1001
// -1000 70 -993
function gen() {
    var _a;
    const blockSource = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource(), iron_ingot = (0, utils_1.createCItemStack)({ item: "minecraft:iron_ingot", amount: 1, data: 0 });
    if (!blockSource)
        return;
    genInterval = setInterval(() => {
        launcher_1.bedrockServer.level.getSpawner().spawnItem(blockSource, iron_ingot, blockpos_1.Vec3.create(-1001, 68, -1038), 1);
    }, 5000);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNENBQThDO0FBQzlDLDBCQUFzQztBQUV0QyxtQ0FBcUc7QUFDckcsd0JBQTBCO0FBQzFCLGdEQUFxRDtBQUNyRCxzQ0FBZ0Q7QUFLaEQsZ0RBQXlDO0FBQ3pDLDBDQUE2QztBQUU3QyxJQUFJLFdBQTJCLENBQUM7QUFFaEMsd0JBQXdCO0FBQ2pCLEtBQUssVUFBVSxZQUFZLENBQUMsS0FBd0IsRUFBRSxNQUFxQixFQUFFLE1BQXFCOztJQUNyRyxxQkFBcUI7SUFDckIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUN6QixhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0IsSUFBQSxnQkFBUSxHQUFFLENBQUM7UUFDWCxPQUFPO0tBQ1Y7SUFFRCxzQkFBc0I7SUFDdEIsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkgsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4RSxPQUFPO0tBQ1Y7SUFDRCxJQUFJO1FBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGlCQUFTLEVBQUMsUUFBSyxDQUFDLE9BQU8sRUFBRSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQUUsS0FBSyxDQUFDLFlB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