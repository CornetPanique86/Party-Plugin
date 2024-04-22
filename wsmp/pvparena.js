"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopGame = exports.startGame = exports.isGameRunning = void 0;
const launcher_1 = require("bdsx/launcher");
const utils_1 = require("../utils");
const enchants_1 = require("bdsx/bds/enchants");
const nbt_1 = require("bdsx/bds/nbt");
const blockpos_1 = require("bdsx/bds/blockpos");
const event_1 = require("bdsx/event");
const common_1 = require("bdsx/common");
const __1 = require("..");
const effects_1 = require("bdsx/bds/effects");
exports.isGameRunning = false;
// 0 = red; 1 = blue   string: playerName
const teams = new Map();
// Red: 186 137 -37      Blue: 204 137 -37
const tpLocations = [blockpos_1.Vec3.create(186, 137, -37), blockpos_1.Vec3.create(204, 137, -37)];
const teamColors = [-54000, 66000];
function startGame() {
    exports.isGameRunning = true;
    launcher_1.bedrockServer.executeCommand("clear @a");
    launcher_1.bedrockServer.executeCommand("effect @a clear");
    const armorNames = ["minecraft:iron_chestplate", "minecraft:iron_leggings", "minecraft:iron_boots"];
    const armor = [];
    for (let i = 0; i < armorNames.length; i++) {
        armor.push((0, utils_1.createCItemStack)({
            item: armorNames[i],
            amount: 1,
            enchantment: {
                enchant: enchants_1.EnchantmentNames.Unbreaking,
                level: 5,
                isUnsafe: true
            }
        }));
    }
    let teamCounter = 0;
    const pls = [...launcher_1.bedrockServer.level.getPlayers()];
    while (pls.length > 0) {
        const randomIndex = Math.floor(Math.random() * pls.length);
        const pl = pls[randomIndex];
        pl.addTag("pvparena");
        teams.set(pl.getNameTag(), teamCounter);
        const helmet = (0, utils_1.createCItemStack)({
            item: "minecraft:leather_helmet",
            amount: 1,
            data: 0,
            name: teamCounter === 1 ? "§r§bBlue team" : "§r§cRed team",
            enchantment: {
                enchant: enchants_1.EnchantmentNames.Unbreaking,
                level: 5,
                isUnsafe: true
            }
        });
        const tag = helmet.save();
        const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "customColor": nbt_1.NBT.int(teamColors[teamCounter]), "minecraft:item_lock": nbt_1.NBT.byte(1) }) }));
        helmet.load(nbt);
        pl.setArmor(0, helmet);
        helmet.destruct();
        for (let i = 0; i < armor.length; i++) {
            pl.setArmor(i + 1, armor[i]);
        }
        pl.teleport(tpLocations[teamCounter]);
        pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.InstantHealth, 1, 15, false, false, false));
        pls.splice(randomIndex, 1);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }
    for (let i = 0; i < armor.length; i++) {
        armor[i].destruct();
    }
    launcher_1.bedrockServer.executeCommand("give @a iron_sword");
    launcher_1.bedrockServer.executeCommand("give @a bow");
    launcher_1.bedrockServer.executeCommand("give @a golden_apple 8");
    launcher_1.bedrockServer.executeCommand("give @a cooked_beef 16");
    launcher_1.bedrockServer.executeCommand("give @a arrow 32");
    startListeners();
    gameIntervalObj.init();
    console.log(teams);
}
exports.startGame = startGame;
function stopGame() {
    gameIntervalObj.stop();
    stopListeners();
    launcher_1.bedrockServer.executeCommand("tp @a 180 141 -37");
    launcher_1.bedrockServer.executeCommand("clear @a");
    launcher_1.bedrockServer.executeCommand("effect @a clear");
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
    launcher_1.bedrockServer.executeCommand("tag @a remove pvparena");
    exports.isGameRunning = false;
}
exports.stopGame = stopGame;
function end() {
    let winner = "No one";
    for (const player of launcher_1.bedrockServer.level.getPlayers()) {
        if (player.hasTag("pvparena")) {
            winner = player.getNameTag();
            break;
        }
    }
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§a§l${winner} §r§awon!`, __1.LogInfo.info));
    stopGame();
}
const gameIntervalObj = {
    init: function () {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function () {
        if (launcher_1.bedrockServer.isClosed()) {
            this.stop;
            return;
        }
        for (const player of launcher_1.bedrockServer.level.getPlayers()) {
            if (!player.hasTag("pvparena"))
                return;
            player.sendActionbar(`You are ${(teams.get(player.getNameTag()) === 1) ? "§bBLUE" : "§cRED"}`);
        }
    },
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
    }
};
const playerAttackLis = (e) => {
    if (!e.player.hasTag("pvparena"))
        return;
    if (e.victim.getIdentifier() !== "minecraft:player")
        return;
    const pl = e.player;
    const victim = e.victim;
    const plTeam = teams.get(pl.getNameTag());
    const victimTeam = teams.get(victim.getNameTag());
    if (plTeam === undefined || victimTeam === undefined)
        return;
    if (plTeam === victimTeam)
        return common_1.CANCEL;
};
const playerRespawnLis = (e) => {
    if (!e.player.hasTag("pvparena"))
        return;
    e.player.removeTag("pvparena");
    (async () => {
        while (!e.player.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        e.player.teleport(blockpos_1.Vec3.create(180, 141, -37));
    })();
    let playersLeft = 0;
    for (const player of launcher_1.bedrockServer.level.getPlayers()) {
        if (player.hasTag("pvparena"))
            playersLeft++;
    }
    if (playersLeft === 1) {
        end();
        return;
    }
    teams.clear();
    let teamCounter = 0;
    let pls = [];
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => { if (pl.hasTag("pvparena"))
        pls.push(pl); });
    while (pls.length > 0) {
        const randomIndex = Math.floor(Math.random() * pls.length);
        const player = pls[randomIndex];
        if (!player.hasTag("pvparena")) {
            pls.splice(randomIndex, 1);
            return;
        }
        ;
        teams.set(player.getNameTag(), teamCounter);
        const helmet = (0, utils_1.createCItemStack)({
            item: "minecraft:leather_helmet",
            amount: 1,
            data: 0,
            name: teamCounter === 1 ? "§r§bBlue team" : "§r§cRed team",
            enchantment: {
                enchant: enchants_1.EnchantmentNames.Unbreaking,
                level: 5,
                isUnsafe: true
            }
        });
        const tag = helmet.save();
        const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "customColor": nbt_1.NBT.int(teamColors[teamCounter]), "minecraft:item_lock": nbt_1.NBT.byte(1) }) }));
        helmet.load(nbt);
        player.setArmor(0, helmet);
        helmet.destruct();
        pls.splice(randomIndex, 1);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }
    launcher_1.bedrockServer.executeCommand("playsound note.harp @a");
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("§7§l> §r§fSwitched teams!"));
    console.log(teams);
};
function startListeners() {
    event_1.events.playerAttack.on(playerAttackLis);
    event_1.events.playerRespawn.on(playerRespawnLis);
}
function stopListeners() {
    event_1.events.playerAttack.remove(playerAttackLis);
    event_1.events.playerRespawn.remove(playerRespawnLis);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHZwYXJlbmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwdnBhcmVuYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBOEM7QUFDOUMsb0NBQTRDO0FBQzVDLGdEQUFxRDtBQUNyRCxzQ0FBZ0Q7QUFDaEQsZ0RBQXlDO0FBQ3pDLHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFFckMsMEJBQXNDO0FBR3RDLDhDQUFtRTtBQUV4RCxRQUFBLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFakMseUNBQXlDO0FBQ3pDLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBQ3hDLDBDQUEwQztBQUMxQyxNQUFNLFdBQVcsR0FBRyxDQUFDLGVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0UsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVuQyxTQUFnQixTQUFTO0lBQ3JCLHFCQUFhLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLHdCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pDLHdCQUFhLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFHaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSx5QkFBeUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3BHLE1BQU0sS0FBSyxHQUFnQixFQUFFLENBQUM7SUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLHdCQUFnQixFQUFDO1lBQ3hCLElBQUksRUFBRSxVQUFVLENB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