"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedwarsstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
const enchants_1 = require("bdsx/bds/enchants");
const nbt_1 = require("bdsx/bds/nbt");
const event_1 = require("bdsx/event");
const common_1 = require("bdsx/common");
const blockpos_1 = require("bdsx/bds/blockpos");
const actor_1 = require("bdsx/bds/actor");
// /bedwarsstart command
async function bedwarsstart(param, origin, output) {
    var _a;
    // /bedwarsstart stop
    if (param.option === "stop") {
        genObj.stop();
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
        const participants = await (0, utils_1.startGame)(_1.Games.bedwars, launcher_1.bedrockServer.level.getPlayers(), 10);
        if (participants !== null)
            setup(participants);
    }
    catch (err) {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while starting bedwars", __1.LogInfo.error)}`);
        console.log(err);
        return;
    }
}
exports.bedwarsstart = bedwarsstart;
const teams = [{ bed: true, pls: [] },
    { bed: true, pls: [] },
    { bed: true, pls: [] },
    { bed: true, pls: [] }];
const teamNames = ["§cRed", "§9Blue", "§2Green", "§6Yellow"];
function setup(pls) {
    const teamColors = [-54000, 66000, 64000, -67000];
    console.log("setup() participants:\n" + pls + "\n");
    launcher_1.bedrockServer.executeCommand("tag @a remove bedwars");
    let teamCounter = 0;
    pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add bedwars`);
        // Put in team
        teams[teamCounter].pls.push(pl);
        teamCounter === 5 ? teamCounter = 0 : teamCounter++;
    });
    // TP Teams
    teams[0].pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tp "${pl}" -1001 68 -1035`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}" -1001 68 -1035`);
    });
    teams[1].pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tp "${pl}" -1000 68 -965`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}" -1000 68 -965`);
    });
    teams[2].pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tp "${pl}" -966 68 -1000`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}" -966 68 -1000`);
    });
    teams[3].pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tp "${pl}" -1034 68 -1000`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}" -1034 68 -1000`);
    });
    launcher_1.bedrockServer.executeCommand("clear @a[tag=bedwars]");
    launcher_1.bedrockServer.executeCommand("effect @a[tag=bedwars] clear");
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
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
    (0, utils_1.countdownActionbar)(5, "", pls, false)
        .then(() => {
        // Clear/reset map
        launcher_1.bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
        launcher_1.bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
        launcher_1.bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
        launcher_1.bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
        launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
        genObj.gen();
        startListeners();
        return;
    })
        .catch(error => {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while finishing to setup bedwars"), __1.LogInfo.error}`);
        console.log(error.message);
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
// 1 iron/s ; 1 diamond/10s
const genObj = {
    iron_ingot: (0, utils_1.createCItemStack)({ item: "minecraft:iron_ingot", amount: 1 }),
    emerald: (0, utils_1.createCItemStack)({ item: "minecraft:emerald", amount: 1 }),
    blockSource: 0,
    ironSpawns: [[-1001, 68, -1038], [-1000, 68, -962], [-963, 68, -1000], [-1037, 68, -1000]],
    emeraldSpawns: [[-1001, 70, -1008], [-1007, 70, -1000], [-993, 70, -1001], [-1000, 70, -993]],
    sec: 1,
    gen: function () {
        var _a;
        console.log("gen() called");
        this.blockSource = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
        if (!this.blockSource) {
            launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Couldn't get blockSource", __1.LogInfo.error)}`);
            console.log(this.blockSource);
            return;
        }
        ;
        this.interval = setInterval(() => this.intervalFunc(), 1000);
    },
    intervalFunc: function () {
        for (let i = 0; i < this.ironSpawns.length; i++) {
            launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.iron_ingot, blockpos_1.Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]), 0.25);
        }
        if (this.sec === 10) {
            for (let i = 0; i < this.emeraldSpawns.length; i++) {
                launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.emerald, blockpos_1.Vec3.create(this.emeraldSpawns[i][0], this.emeraldSpawns[i][1], this.emeraldSpawns[i][2]), 0.25);
            }
            this.sec = 0;
        }
        this.sec++;
    },
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
    },
    serverClose: function () {
        clearInterval(this.interval);
        this.iron_ingot.destruct();
        this.emerald.destruct();
    }
};
function eliminate(pl) {
    return;
}
function respawn(pl) {
    return;
}
function bedBreak(pl, team) {
    return;
}
function end() {
    return;
}
// -------------
//   LISTENERS
// -------------
const playerRespawnLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const pl = e.player.getNameTag();
    let isPlEliminated = false;
    teams.forEach(team => {
        if (team.pls.includes(pl) && !team.bed) {
            isPlEliminated = true;
            eliminate(pl);
        }
    });
    if (!isPlEliminated)
        respawn(pl);
};
const blockDestroyLis = (e) => {
    // BEDS data: red=14 ; blue=11 ; green=5 ; yellow=4
    if (!(e.player.hasTag("bedwars") && e.itemStack.getName() === "minecraft:bed"))
        return;
    let bed;
    // Check if bed color is of a team and give the correct team index
    switch (e.itemStack.getId()) {
        case 14:
            bed = 0;
            break;
        case 11:
            bed = 1;
            break;
        case 5:
            bed = 2;
            break;
        case 4:
            bed = 3;
            break;
        default:
            return;
    }
    const pl = e.player.getNameTag();
    // Get player's team otherwise eliminate (just in case)
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl))
        plTeam = index; });
    if (plTeam === -1) {
        eliminate(pl);
        return;
    }
    ;
    // If player breaks his own bed
    if (bed === plTeam) {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)("You can't break your own bed! (u stoopid or what?)", __1.LogInfo.error)}`);
        return common_1.CANCEL;
    }
    // Team's bed was broken
    bedBreak(pl, bed);
    return;
};
const playerInventoryChangeLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const item = e.newItemStack;
    const pl = e.player;
    console.log(item.getName());
    // Clear beds
    if (item.getName() === "minecraft:bed") {
        item.destruct();
        pl.sendInventory();
        return;
    }
    // Replace armor
    const armorNames = ["_chestplate", "_leggings", "_boots"];
    const armorTrimColors = ["redstone", "lapis_lazuli", "emerald", "gold_ingot"];
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag()))
        plTeam = index; });
    if (plTeam === -1)
        return;
    if (item.getName() === "minecraft:diamond_chestplate") {
        const inv = pl.getInventory();
        const diamond_chestplate = (0, utils_1.createCItemStack)({ item: "minecraft:diamond_chestplate" });
        inv.removeResource(diamond_chestplate);
        diamond_chestplate.destruct();
        pl.sendInventory();
        const armor = [];
        for (let i = 0; i < armorNames.length; i++) {
            const item = (0, utils_1.createCItemStack)({
                item: "minecraft:diamond" + armorNames[i],
                amount: 1
            });
            const tag = item.save();
            const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "Trim": {
                        "Material": armorTrimColors[plTeam],
                        "Pattern": "wayfinder"
                    }, "minecraft:item_lock": nbt_1.NBT.byte(2), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
            item.load(nbt);
            armor.push(item);
        }
        armor.forEach((armorItem, index) => pl.setArmor(index + 1, armorItem));
        return;
    }
    if (item.getName() === "minecraft:iron_chestplate") {
        const inv = pl.getInventory();
        const iron_chestplate = (0, utils_1.createCItemStack)({ item: "minecraft:iron_chestplate" });
        inv.removeResource(iron_chestplate);
        iron_chestplate.destruct();
        pl.sendInventory();
        const armor = [];
        for (let i = 0; i < 4; i++) {
            const item = (0, utils_1.createCItemStack)({
                item: "minecraft:iron" + armorNames[i],
                amount: 1
            });
            const tag = item.save();
            const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "Trim": {
                        "Material": armorTrimColors[plTeam],
                        "Pattern": "wayfinder"
                    }, "minecraft:item_lock": nbt_1.NBT.byte(2), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
            item.load(nbt);
            armor.push(item);
        }
        armor.forEach((armorItem, index) => pl.setArmor(index + 1, armorItem));
        return;
    }
};
function startListeners() {
    event_1.events.playerRespawn.on(playerRespawnLis);
    event_1.events.blockDestroy.on(blockDestroyLis);
    event_1.events.playerInventoryChange.on(playerInventoryChangeLis);
}
event_1.events.serverClose.on(() => {
    genObj.serverClose();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNENBQThDO0FBQzlDLDBCQUFzQztBQUN0QyxtQ0FBcUc7QUFDckcsd0JBQTBCO0FBQzFCLGdEQUFxRDtBQUNyRCxzQ0FBZ0Q7QUFFaEQsc0NBQW9DO0FBQ3BDLHdDQUFxQztBQUVyQyxnREFBeUM7QUFDekMsMENBQTZDO0FBSzdDLHdCQUF3QjtBQUNqQixLQUFLLFVBQVUsWUFBWSxDQUFDLEtBQXlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDdEcscUJBQXFCO0lBQ3JCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsSUFBQSxnQkFBUSxHQUFFLENBQUM7UUFDWCxPQUFPO0tBQ1Y7SUFFRCxzQkFBc0I7SUFDdEIsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkgsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4RSxPQUFPO0tBQ1Y7SUFDRCxJQUFJO1FBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGlCQUFTLEVBQUMsUUFBSyxDQUFDLE9BQU8sRUFBRSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQUUsS0FBSyxDQUFD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