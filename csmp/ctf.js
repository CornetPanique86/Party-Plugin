"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGameLeaders = exports.startGame = exports.isGameRunning = void 0;
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("../utils");
const nbt_1 = require("bdsx/bds/nbt");
const common_1 = require("bdsx/common");
const blockpos_1 = require("bdsx/bds/blockpos");
const block_1 = require("bdsx/bds/block");
const actor_1 = require("bdsx/bds/actor");
const form_1 = require("bdsx/bds/form");
const fs = require('fs');
const path = require('path');
exports.isGameRunning = false;
// ====
// DATA
// ====
// RED: 0        BLUE: 1
const teams = new Map();
const flagsStatus = [true, true]; // True = SAFE, IN BASE, NOT PICKED UP
const bannerPos = [blockpos_1.Vec3.create(669, 85, 335), blockpos_1.Vec3.create(596, 65, 252)]; // gotta change the default
// CONSTANTS
const canPlaceOnAllBlox = fs.readFileSync(path.join(__dirname, "canPlaceOnBlocks.txt"));
const teamColors = [-54000, 66000];
const teamRawtext = ["§cRed", "§bBlue"];
const teamSpawnPos = [blockpos_1.Vec3.create(669, 91, 344), blockpos_1.Vec3.create(584, 71, 239)];
function startGame() {
    const leaders = ["", ""];
    let teamCounter = 0;
    for (const pl of launcher_1.bedrockServer.level.getPlayers()) {
        teams.set(pl.getNameTag(), teamCounter);
        leaders[teamCounter] = pl.getNameTag();
        pl.teleport(teamSpawnPos[teamCounter], actor_1.DimensionId.Overworld);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }
    chooseFlagPos(leaders[0], leaders[1]);
}
exports.startGame = startGame;
function startGameLeaders(leader1, leader2) {
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Not implemented", __1.LogInfo.error));
}
exports.startGameLeaders = startGameLeaders;
function chooseFlagPos(leader1Name, leader2Name) {
    if (leader1Name === "" || leader2Name === "")
        return launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Leaders undefined", __1.LogInfo.error));
    if (getPlayerByName(leader1Name) === null || getPlayerByName(leader2Name) === null)
        return launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Leaders players offline", __1.LogInfo.error));
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Each team leader now has to choose a position for their flag! §7§oThe flag's current position is indicated by a square of particles", __1.LogInfo.info));
    const bannerPlaceCooldown = [false, false];
    const areTeamsReady = [false, false];
    const dim = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld);
    if (!dim)
        return launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Dimension undefined", __1.LogInfo.error));
    launcher_1.bedrockServer.executeCommand(`tellraw "${leader1Name}" ${(0, __1.rawtext)("Pls just pretend the red concrete is a BANNER. So place it somewhere.", __1.LogInfo.warn)}`);
    launcher_1.bedrockServer.executeCommand(`tellraw "${leader2Name}" ${(0, __1.rawtext)("Pls just pretend the blue concrete is a BANNER. So place it somewhere.", __1.LogInfo.warn)}`);
    launcher_1.bedrockServer.executeCommand(`give "${leader1Name}" red_concrete 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    launcher_1.bedrockServer.executeCommand(`give "${leader2Name}" blue_concrete 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    const blockPlaceLis = (e) => {
        if (e.block.getName() === "minecraft:red_concrete" || e.block.getName() === "minecraft:blue_concrete") {
            const pl = e.player;
            const pos = e.blockPos;
            let team = 0;
            if (pl.getNameTag() === leader1Name)
                team = 0;
            else if (pl.getNameTag() === leader2Name)
                team = 1;
            else
                return;
            if (bannerPlaceCooldown[team]) {
                pl.runCommand("tellraw @s " + (0, __1.rawtext)("You're on cooldown!", __1.LogInfo.error));
                return common_1.CANCEL;
            }
            bannerPlaceCooldown[team] = true;
            setTimeout(() => bannerPlaceCooldown[team] = false, 5e3);
            pl.runCommand("clear @s slime");
            const item = (0, utils_1.createCItemStack)({ item: "slime", name: "§r§2Ready §7[§fRight click§7]" });
            pl.addItem(item);
            pl.sendInventory();
            item.destruct();
            if (!checkAirSpace(blockpos_1.BlockPos.create(pos.x + 1, pos.y, pos.z + 1), blockpos_1.BlockPos.create(pos.x - 1, 200, pos.z - 1))) {
                pl.sendMessage("§cThe airspace isn't empty!");
                pl.playSound("note.bass");
                return common_1.CANCEL;
            }
            bannerPos[team] = blockpos_1.Vec3.create(pos.x, pos.y, pos.z);
            pl.sendMessage("§aSuccesfully registered flag position. Right click the slime block when you are sure of the current positioning.");
            pl.playSound("note.harp");
            return common_1.CANCEL;
        }
    };
    const itemUseLis = async (e) => {
        console.log(e.itemStack.getName());
        if (e.itemStack.getName() === "minecraft:slime") {
            const pl = e.player;
            let team = 0;
            if (pl.getNameTag() === leader1Name)
                team = 0;
            else if (pl.getNameTag() === leader2Name)
                team = 1;
            else
                return;
            const ni = pl.getNetworkIdentifier();
            const confirmForm = await form_1.Form.sendTo(ni, {
                type: "modal",
                title: "Confirm team is ready?",
                content: "Confirm team is ready? Please make sure your team agrees with the flag position.",
                button1: "§2YES",
                button2: "§cnah"
            });
            if (confirmForm) {
                areTeamsReady[team] = true;
                if (areTeamsReady[0] && areTeamsReady[1]) {
                    stopChooseFlagPos();
                    setup();
                }
                else {
                    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(teamRawtext[team] + " §ais ready!", __1.LogInfo.info));
                    launcher_1.bedrockServer.executeCommand("playsound random.pop @a");
                }
            }
        }
    };
    const bannerParticlesInterval = setInterval(() => {
        if (launcher_1.bedrockServer.isClosed())
            clearInterval(bannerParticlesInterval);
        for (let i = 0; i < bannerPos.length; i++) {
            let { x, y, z } = bannerPos[i];
            x += 0.5;
            y += 0.5;
            z += 0.5;
            launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:blue_flame_particle", blockpos_1.Vec3.create(x, y, z), dim);
            let X = x - 1.5, Z = z - 1.5;
            while (X < x + 1.5) {
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(X, y, z + 1.5), dim);
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(X, y, z - 1.5), dim);
                X += 0.5;
            }
            while (Z < z + 1.5) {
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x + 1.5, y, Z), dim);
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x - 1.5, y, Z), dim);
                Z += 0.5;
            }
        }
    }, 2000);
    event_1.events.blockPlace.on(blockPlaceLis);
    event_1.events.itemUse.on(itemUseLis);
    console.log("events fired");
    function stopChooseFlagPos() {
        event_1.events.blockPlace.remove(blockPlaceLis);
        event_1.events.itemUse.remove(itemUseLis);
        clearInterval(bannerParticlesInterval);
    }
}
function checkAirSpace(from, to) {
    var _a;
    const air = block_1.Block.create("minecraft:air");
    const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
    if (!region) {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't check airspace: region undefined", __1.LogInfo.error));
        return false;
    }
    const sourceX = Math.min(from.x, to.x), destX = Math.max(from.x, to.x), sourceY = Math.min(from.y, to.y), destY = Math.max(from.y, to.y), sourceZ = Math.min(from.z, to.z), destZ = Math.max(from.z, to.z);
    let isAirSpaceClear = true;
    for (let x = sourceX; x <= destX; x++) {
        if (!isAirSpaceClear)
            break;
        for (let y = sourceY; y <= destY; y++) {
            if (!isAirSpaceClear)
                break;
            for (let z = sourceZ; z <= destZ; z++) {
                if (!isAirSpaceClear)
                    break;
                const blockPos = blockpos_1.BlockPos.create(x, y, z);
                if (!region.getBlock(blockPos).equals(air)) {
                    isAirSpaceClear = false;
                }
            }
        }
    }
    return isAirSpaceClear;
}
function setup() {
    var _a;
    launcher_1.bedrockServer.executeCommand("clear @a");
    //
    // FLAGS SETUP
    //
    for (let i = 0; i < bannerPos.length; i++) {
        const bannerBlocks = [block_1.Block.create("minecraft:standing_banner", 1), block_1.Block.create("minecraft:standing_banner", 4)];
        const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
        if (!region) {
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't place banners: region undefined", __1.LogInfo.error));
            return;
        }
        if (!bannerBlocks[0] || !bannerBlocks[1]) {
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't place banners: banner block undefined", __1.LogInfo.error));
            return;
        }
        const { x, y, z } = bannerPos[i];
        launcher_1.bedrockServer.executeCommand(`tickingarea add ${x + 1} ${y - 1} ${z + 1} ${x - 1} ${y + 2} ${z - 1} banner${i}`);
        launcher_1.bedrockServer.executeCommand(`fill ${x + 1} ${y - 1} ${z + 1} ${x - 1} ${y - 1} ${z - 1} bedrock`);
        region.setBlock(blockpos_1.BlockPos.create(bannerPos[i]), bannerBlocks[i]);
    }
    //
    // ITEMS SETUP
    //
    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
    const armorRed = [];
    const armorBlue = [];
    for (let i = 0; i < armorNames.length; i++) {
        const item1 = (0, utils_1.createCItemStack)({ item: armorNames[i] });
        const item2 = (0, utils_1.createCItemStack)({ item: armorNames[i] });
        const tag1 = item1.save(), tag2 = item2.save();
        const nbt1 = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag1), { tag: Object.assign(Object.assign({}, tag1.tag), { "customColor": nbt_1.NBT.int(teamColors[0]) }) })), nbt2 = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag2), { tag: Object.assign(Object.assign({}, tag2.tag), { "customColor": nbt_1.NBT.int(teamColors[1]) }) }));
        item1.load(nbt1);
        item2.load(nbt2);
        armorRed.push(item1);
        armorBlue.push(item2);
    }
    const coloredBlocks = ["red_terracotta", "blue_terracotta"];
    for (const pl of launcher_1.bedrockServer.level.getPlayers()) {
        if (!teams.has(pl.getNameTag()))
            teams.set(pl.getNameTag(), Math.floor(Math.random() * 2));
        const team = teams.get(pl.getNameTag());
        const items = [];
        for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "oak_log", "arrow"]) {
            if (itemName === "oak_log")
                items.push((0, utils_1.createCItemStack)({ item: itemName, amount: 64 }));
            else if (itemName === "arrow")
                items.push((0, utils_1.createCItemStack)({ item: itemName, amount: 32 }));
            else
                items.push((0, utils_1.createCItemStack)({ item: itemName }));
        }
        for (const item of items) {
            pl.addItem(item);
        }
        const coloredBlock = (0, utils_1.createCItemStack)({ item: coloredBlocks[team], amount: 64 });
        pl.addItem(coloredBlock);
        pl.sendInventory();
        for (const item of items) {
            item.destruct();
        }
        coloredBlock.destruct();
        if (team === 0) {
            for (let i = 0; i < armorRed.length; i++) {
                pl.setArmor(i, armorRed[i]);
            }
        }
        else {
            for (let i = 0; i < armorBlue.length; i++) {
                pl.setArmor(i, armorBlue[i]);
            }
        }
        pl.teleport(teamSpawnPos[team]);
        pl.sendTitle("§9Capture the Flag", `${teamRawtext[team]} §7team`);
    }
    for (let i = 0; i < armorNames.length; i++) {
        armorRed[i].destruct();
        armorBlue[i].destruct();
    }
}
event_1.events.playerJoin.on(async (e) => {
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    if (!exports.isGameRunning) {
        pl.teleport(blockpos_1.Vec3.create(731, 89, 288), actor_1.DimensionId.Overworld);
        pl.runCommand("clear");
    }
});
event_1.events.playerDimensionChange.on(() => {
    return common_1.CANCEL;
});
function getPlayerByName(name) {
    const plList = launcher_1.bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name)
            return plList[i];
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3RmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3RmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsMEJBQXNDO0FBQ3RDLG9DQUE0QztBQUM1QyxzQ0FBZ0Q7QUFHaEQsd0NBQXFDO0FBQ3JDLGdEQUFtRDtBQUNuRCwwQ0FBdUM7QUFDdkMsMENBQTZDO0FBRTdDLHdDQUFxQztBQUVyQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRWxCLFFBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUVqQyxPQUFPO0FBQ1AsT0FBTztBQUNQLE9BQU87QUFFUCx3QkFBd0I7QUFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7QUFDeEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUEsQ0FBQyxzQ0FBc0M7QUFDdkUsTUFBTSxTQUFTLEdBQUcsQ0FBQyxlQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsZUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQywyQkFBMkI7QUFFckcsWUFBWTtBQUNaLE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFDeEYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuQyxNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4QyxNQUFNLFlBQVksR0FBRyxDQUFDLGVBQUksQ0FBQyxNQUFNLENB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