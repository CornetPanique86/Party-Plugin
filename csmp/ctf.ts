import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { createCItemStack } from "../utils";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { GameType, Player } from "bdsx/bds/player";
import { BlockPlaceEvent } from "bdsx/event_impl/blockevent";
import { CANCEL } from "bdsx/common";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { Block } from "bdsx/bds/block";
import { ActorDamageCause, ActorDamageSource, DimensionId } from "bdsx/bds/actor";
import { ItemUseEvent } from "bdsx/event_impl/entityevent";
import { Form } from "bdsx/bds/form";
import { ItemStack } from "bdsx/bds/inventory";
import { Constants } from "./commands";
import { GameRuleId } from "bdsx/bds/gamerules";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";

const fs = require('fs');
const path = require('path');

export let isGameRunning = false;
export let isPreGameRunning = false;

// ====
// DATA
// ====

// RED: 0        BLUE: 1
const teams = new Map<string, number>();
const playerStats = new Map<string, { kills: number, deaths: number, flags: number }>();
const flagsStatus = [true, true]; // True = SAFE, IN BASE, NOT PICKED UP
const flagHolder: string[] = ["", ""];
const flagCount = [0, 0];
const bannerPos = [Vec3.create(669, 85, 335), Vec3.create(596, 65, 252)]; // gotta change the default

// CONSTANTS
const canPlaceOnAllBlox = fs.readFileSync(path.join(__dirname, "canPlaceOnBlocks.txt"));
const teamColors = [-54000, 66000];
const teamRawtext = ["§cRed", "§bBlue"];
const teamSpawnPos = [Vec3.create(669, 91, 344), Vec3.create(584, 71, 239)];

export function startGame() {
    const leaders = ["", ""];
    isPreGameRunning = true;

    let teamCounter = 0;
    for (const pl of bedrockServer.level.getPlayers()) {
        teams.set(pl.getNameTag(), teamCounter);
        if (leaders[teamCounter].length === 0) leaders[teamCounter] = pl.getNameTag();
        pl.teleport(teamSpawnPos[teamCounter], DimensionId.Overworld);

        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }

    chooseFlagPos(leaders[0], leaders[1]);
}

export function startGameLeaders(leader1: string, leader2: string) {
    let leaderRed: Player | undefined = undefined;
    let leaderBlue: Player | undefined = undefined;
    for (const pl of bedrockServer.level.getPlayers()) {
        const plName = pl.getNameTag();
        if (plName === leader1) {
            leaderRed = pl;
        } else if (plName === leader2) {
            leaderBlue = pl;
        }
    }
    if (leaderRed == undefined || leaderBlue == undefined) {
        bedrockServer.executeCommand("tellraw @a " + rawtext("Leader undefined", LogInfo.error));
        return;
    }
    isPreGameRunning = true;

    let remainingPls: Player[] = [];
    const teamPls: [string[], string[]] = [[], []];
    async function choosePlayerForm(leaderN: number) {
        const leader = leaderN === 0 ? leaderRed! : leaderBlue!;
        const teamPlsStr = ["§cRed: §r", "§bBlue: §r"];
        const plsDropdown: string[] = [];
        for (let i=0; i<teamPls.length; i++) {
            for (const pl of teamPls[i]) {
                teamPlsStr[i] += pl + ", ";
            }
            teamPlsStr[i] = teamPlsStr[i].substring(0, teamPlsStr[i].length - 2);
        }
        remainingPls.forEach(pl => {
            plsDropdown.push(pl.getNameTag());
        });
        if (plsDropdown.length === 0) {
            bedrockServer.executeCommand("tellraw @a " + rawtext("It appears there aren't anymore players to add to dropdown!", LogInfo.error));
            isPreGameRunning = false;
            return;
        }

        const ni = leader.getNetworkIdentifier();
        const form = await Form.sendTo(ni, {
            type: "custom_form",
            title: "Choose 1 member for your team",
            content: [
                {
                    "type": "label",
                    "text": `Choose a member to add to your team!\nYour team: ${teamRawtext[leaderN]}\n${teamPlsStr[0]}\n${teamPlsStr[1]}`
                },
                {
                   "type": "dropdown",
                   "text": "Choose a player",
                   "options": plsDropdown,
                   "default": 0
                }
            ]
        });
        if (form !== null) {
            bedrockServer.executeCommand("tellraw @a " + rawtext("leaderN: " + leaderN));
            const plName = plsDropdown[form[1]];
            teamPls[leaderN].push(plName);
            bedrockServer.executeCommand("tellraw @a " + rawtext(`§7§l> §r${plName} §7was added to ${teamRawtext[leaderN]}§7!`));
            bedrockServer.executeCommand("playsound random.pop @a");

            resetPlsList();
            if (remainingPls.length === 0) {
                playersChosen();
                return;
            }
            leader.sendActionbar("§7Waiting for other team leader's choice...");
            leaderN === 0 ? choosePlayerForm(1) : choosePlayerForm(0);
        } else {
            choosePlayerForm(leaderN);
        }
    }

    function resetPlsList() {
        remainingPls = [];
        bedrockServer.level.getPlayers().forEach(pl => {
            const plName = pl.getNameTag();
            if (teamPls[0].includes(plName) || teamPls[1].includes(plName)) return;
            if (plName === leader1 || plName === leader2) return;
            remainingPls.push(pl);
        });
    }

    resetPlsList();
    choosePlayerForm(0);

    function playersChosen() {
        bedrockServer.executeCommand("tellraw @a " + rawtext("§aAll players were selected into a team! Starting step 2"));

        for (const pl of bedrockServer.level.getPlayers()) {
            const plName = pl.getNameTag();
            if (leader1 === plName) {
                teams.set(plName, 0);
                pl.teleport(teamSpawnPos[0], DimensionId.Overworld);
            } else if (leader2 === plName) {
                teams.set(plName, 1);
                pl.teleport(teamSpawnPos[1], DimensionId.Overworld);
            } else if (teamPls[0].includes(plName)) {
                teams.set(plName, 0);
                pl.teleport(teamSpawnPos[0], DimensionId.Overworld);
            } else if (teamPls[1].includes(plName)) {
                teams.set(plName, 1);
                pl.teleport(teamSpawnPos[1], DimensionId.Overworld);
            } else {
                const randTeam = Math.floor(Math.random()*2);
                teams.set(plName, randTeam);
                pl.teleport(teamSpawnPos[randTeam], DimensionId.Overworld);
            }
        }

        chooseFlagPos(leader1, leader2);
    }
}

function chooseFlagPos(leader1Name: string, leader2Name: string) {
    if (leader1Name === "" || leader2Name === "") return bedrockServer.executeCommand("tellraw @a " +rawtext("Leaders undefined", LogInfo.error));
    if (getPlayerByName(leader1Name) === null || getPlayerByName(leader2Name) === null) return bedrockServer.executeCommand("tellraw @a " +rawtext("Leaders players offline", LogInfo.error));
    bedrockServer.executeCommand("tellraw @a " + rawtext("Each team leader now has to choose a position for their flag! §7§oThe flag's current position is indicated by a square of particles", LogInfo.info));
    const bannerPlaceCooldown = [false, false];
    const areTeamsReady = [false, false];
    const dim = bedrockServer.level.getDimension(DimensionId.Overworld);
    if (!dim) return bedrockServer.executeCommand("tellraw @a " +rawtext("Dimension undefined", LogInfo.error));

    bedrockServer.executeCommand(`give "${leader1Name}" un:red_banner_block 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    bedrockServer.executeCommand(`give "${leader2Name}" un:blue_banner_block 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);

    const blockPlaceLis = (e: BlockPlaceEvent) => {
        if (e.block.getName() === "un:red_banner_block" || e.block.getName() === "un:blue_banner_block") {
            const pl = e.player;
            const pos = e.blockPos;
            let team = 0;
            if (pl.getNameTag() === leader1Name) team = 0
                else if (pl.getNameTag() === leader2Name) team = 1
                else return;
            if (bannerPlaceCooldown[team]) {
                pl.runCommand("tellraw @s " +rawtext("You're on cooldown!", LogInfo.error));
                return CANCEL;
            }
            bannerPlaceCooldown[team] = true;
            setTimeout(() => bannerPlaceCooldown[team] = false, 5e3);
            pl.runCommand("clear @s slime");
            const item = createCItemStack({ item: "slime", name: "§r§2Ready §7[§fRight click§7]" });
            pl.addItem(item);
            pl.sendInventory();
            item.destruct();
            if (!checkAirSpace(BlockPos.create(pos.x+1, pos.y, pos.z+1), BlockPos.create(pos.x-1, 200, pos.z-1))) {
                pl.sendMessage("§cThe airspace isn't empty!");
                pl.playSound("note.bass");
                return CANCEL;
            }
            bannerPos[team] = Vec3.create(pos.x, pos.y, pos.z);
            pl.sendMessage("§aSuccesfully registered flag position. Right click the slime block when you are sure of the current positioning.");
            pl.playSound("note.harp");
            return CANCEL;
        }
    }
    const itemUseLis = async (e: ItemUseEvent) => {
        if (e.itemStack.getName() === "minecraft:slime") {
            const pl = e.player;
            let team = 0;
            if (pl.getNameTag() === leader1Name) team = 0
                else if (pl.getNameTag() === leader2Name) team = 1
                else return;

            const ni = pl.getNetworkIdentifier();
            const confirmForm = await Form.sendTo(ni, {
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
                } else {
                    pl.runCommand("clear");
                    bedrockServer.executeCommand("tellraw @a " + rawtext(teamRawtext[team] + " §ais ready!", LogInfo.info));
                    bedrockServer.executeCommand("playsound random.pop @a");
                }
            }
        }
    }

    const bannerParticlesInterval = setInterval(() => {
        if (bedrockServer.isClosed()) clearInterval(bannerParticlesInterval);

        for (let i=0; i<bannerPos.length; i++) {
            let {x, y, z} = bannerPos[i];
            x += 0.5; y += 0.5; z += 0.5;
            bedrockServer.level.spawnParticleEffect("minecraft:blue_flame_particle", Vec3.create(x, y, z), dim);

            let X = x-1.5,
                Z = z-1.5;
            while (X < x+1.5) {
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(X, y, z+1.5), dim);
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(X, y, z-1.5), dim);
                X += 0.5;
            }
            while (Z < z+1.5) {
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x+1.5, y, Z), dim);
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x-1.5, y, Z), dim);
                Z += 0.5;
            }
        }
    }, 2_000);

    events.blockPlace.on(blockPlaceLis);
    events.itemUse.on(itemUseLis);
    console.log("events fired");

    function stopChooseFlagPos() {
        events.blockPlace.remove(blockPlaceLis);
        events.itemUse.remove(itemUseLis);
        clearInterval(bannerParticlesInterval);
    }
}

function checkAirSpace(from: BlockPos, to: BlockPos) {
    const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
    if (!region) {
        bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't check airspace: region undefined", LogInfo.error));
        return false;
    }
    const sourceX = Math.min(from.x, to.x),
          destX = Math.max(from.x, to.x),
          sourceY = Math.min(from.y, to.y),
          destY = Math.max(from.y, to.y),
          sourceZ = Math.min(from.z, to.z),
          destZ = Math.max(from.z, to.z);

    let isAirSpaceClear = true;
    for (let x = sourceX; x <= destX; x++) {
        if (!isAirSpaceClear) break;
        for (let y = sourceY; y <= destY; y++) {
            if (!isAirSpaceClear) break;
            for (let z = sourceZ; z <= destZ; z++) {
                if (!isAirSpaceClear) break;
                const blockPos = BlockPos.create(x, y, z);
                if (region.getBlock(blockPos).getName() !== "minecraft:air")  {
                    isAirSpaceClear = false;
                }
            }
        }
    }
    return isAirSpaceClear;
}

function setup() {
    bedrockServer.executeCommand("clear @a");
    bedrockServer.executeCommand("effect clear @a");
    bedrockServer.gameRules.setRule(GameRuleId.DoImmediateRespawn, true);
    bedrockServer.gameRules.setRule(GameRuleId.DoMobSpawning, false);

    //
    // FLAGS SETUP
    //
    for (let i=0; i < bannerPos.length; i++) {
        const bannerBlocks = [Block.create("un:red_banner_block"), Block.create("un:blue_banner_block")];

        const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
        if (!region) {
            bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't place banners: region undefined", LogInfo.error));
            return;
        }
        if (!bannerBlocks[0] || !bannerBlocks[1]) {
            bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't place banners: banner block undefined", LogInfo.error));
            return;
        }
        const {x, y, z} = bannerPos[i];
        bedrockServer.executeCommand(`tickingarea add ${x+1} ${y-1} ${z+1} ${x-1} ${y+2} ${z-1} banner${i}`);
        bedrockServer.executeCommand(`fill ${x+1} ${y-1} ${z+1} ${x-1} ${y-1} ${z-1} bedrock`);
        region.setBlock(BlockPos.create(bannerPos[i]), bannerBlocks[i]!);
    }


    //
    // ITEMS SETUP
    //
    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
    const armorRed = [];
    const armorBlue = [];
    for (let i = 0; i < armorNames.length; i++) {
        const item1 = createCItemStack({ item: armorNames[i] });
        const item2 = createCItemStack({ item: armorNames[i] });

        const tag1 = item1.save(), tag2 = item2.save();
        const nbt1 = NBT.allocate({
            ...tag1,
            tag: {
                ...tag1.tag,
                "customColor": NBT.int(teamColors[0])
            }
        }) as CompoundTag,
        nbt2 = NBT.allocate({
            ...tag2,
            tag: {
                ...tag2.tag,
                "customColor": NBT.int(teamColors[1])
            }
        }) as CompoundTag;
        item1.load(nbt1);  item2.load(nbt2);

        armorRed.push(item1); armorBlue.push(item2);
    }

    const coloredBlocks = ["red_terracotta", "blue_terracotta"];

    for (const pl of bedrockServer.level.getPlayers()) {
        if (!teams.has(pl.getNameTag())) teams.set(pl.getNameTag(), Math.floor(Math.random()*2));
        const team = teams.get(pl.getNameTag())!;

        const items = [];
        for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "bread", "oak_log", "arrow"]) {
            if (itemName === "oak_log") items.push(createCItemStack({ item: itemName, amount: 64 }))
                else if (itemName === "bread") items.push(createCItemStack({ item: itemName, amount: 16 }))
                else if (itemName === "arrow") items.push(createCItemStack({ item: itemName, amount: 32 }))
                else items.push(createCItemStack({ item: itemName }));
        }
        for (const item of items) {
            pl.addItem(item);
        }
        const coloredBlock = createCItemStack({ item: coloredBlocks[team], amount: 64 });
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
        } else {
            for (let i = 0; i < armorBlue.length; i++) {
                pl.setArmor(i, armorBlue[i]);
            }
        }

        playerStats.set(pl.getNameTag(), { kills: 0, deaths: 0, flags: 0 });
        pl.teleport(teamSpawnPos[team]);
        pl.sendTitle("§9Capture the Flag", `${teamRawtext[team]} §7team`);
        pl.playSound("mob.enderdragon.growl", pl.getPosition(), 0.2);
        pl.setGameType(GameType.Survival);
    }

    for (let i = 0; i < armorNames.length; i++) {
        armorRed[i].destruct();
        armorBlue[i].destruct();
    }

    scoreboardUpd();

    isGameRunning = true;
}

function giveItems(pl: Player, team: number) {
    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];

    for (let i = 0; i < armorNames.length; i++) {
        const item = createCItemStack({ item: armorNames[i] });

        const tag = item.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                "customColor": NBT.int(teamColors[team])
            }
        }) as CompoundTag;
        item.load(nbt);

        pl.setArmor(i, item);
        item.destruct();
    }

    for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "bread", "oak_log", "arrow"]) {
        let item: ItemStack;
        if (itemName === "oak_log") item = (createCItemStack({ item: itemName, amount: 64 }))
            else if (itemName === "bread") item = (createCItemStack({ item: itemName, amount: 16 }))
            else if (itemName === "arrow") item = (createCItemStack({ item: itemName, amount: 32 }))
            else item = (createCItemStack({ item: itemName }));
        pl.addItem(item);
        item.destruct();
    }
    const item = team === 0 ? createCItemStack({ item: "red_terracotta", amount: 64 }) : createCItemStack({ item: "blue_terracotta", amount: 64 });
    pl.addItem(item);
    item.destruct();

    pl.sendInventory();
}

function flagCaptured(pl: Player, teamStolen: number) {
    const stats = playerStats.get(pl.getNameTag()) || { kills: 0, deaths: 0, flags: 0 };
    stats.flags++;
    playerStats.set(pl.getNameTag(), stats);
    pl.runCommand("clear @s " + (teamStolen === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));
    pl.sendTitle("§r", "§aFlag Captured");

    bedrockServer.executeCommand("tellraw @a " + rawtext(`§f${pl.getNameTag()} §7has §acaptured ${teamRawtext[teamStolen]}§7's flag!`));
    bedrockServer.executeCommand("playsound @a random.levelup");

    const bannerBlock = [Block.create("un:red_banner_block"), Block.create("un:blue_banner_block")][teamStolen];
    const region = pl.getRegion();
    region.setBlock(BlockPos.create(bannerPos[teamStolen]), bannerBlock!);
    flagsStatus[teamStolen] = true;
    teamStolen===0 ? flagCount[1]++ : flagCount[0]++;
    flagHolder[0] = ""; flagHolder[1] = "";
    scoreboardUpd();
    end();
}

function flagDropped(pl: Player) {
    if (!teams.has(pl.getNameTag())) return;
    const team = teams.get(pl.getNameTag());
    const teamDropped = team === 0 ? 1 : 0;

    if (pl.isPlayerInitialized()) pl.runCommand("clear @s " + (teamDropped === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));

    bedrockServer.executeCommand("tellraw @a " + rawtext(`${teamRawtext[teamDropped]}§7's flag §7was §cdropped §7by §f${pl.getNameTag()}§7!`));
    bedrockServer.executeCommand("playsound @a random.pop");

    const bannerBlock = [Block.create("un:red_banner_block"), Block.create("un:blue_banner_block")][teamDropped];
    const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
    if (!region) {
        bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't replace banner: region undefined", LogInfo.error));
        return false;
    }
    region.setBlock(BlockPos.create(bannerPos[teamDropped]), bannerBlock!);
    flagsStatus[teamDropped] = true;
    flagHolder[flagHolder.indexOf(pl.getNameTag())] = "";
}

function scoreboardUpd() {
    const str = [
        "§7Flags:",
        `§c[R] ${flagCount[0]}§7/3`,
        `§b[B] ${flagCount[1]}§7/3`
    ];
    bedrockServer.level.getPlayers().forEach(pl => {
        pl.setFakeScoreboard("CTF", str);
    });
}

function end() {
    // TESTS
    if (flagCount[0] < 3 && flagCount[1] < 3) return;


    const teamW = flagCount[0]===3 ? 0 : 1;
    bedrockServer.level.getPlayers().forEach(pl => {
        const plName = pl.getNameTag();
        pl.sendMessage(`
§7------------------
§l${teamRawtext[teamW]} §r§awon the game!

§fKills §7- §a${playerStats.get(plName)?.kills}
§fDeaths §7- §a${playerStats.get(plName)?.deaths}
§fFlags Captured §7- §a${playerStats.get(plName)?.flags}
§7------------------`);

        pl.playSound("firework.large_blast");

        const team = teams.get(plName) || 0;
        team === teamW ? pl.sendTitle("§aVICTORY!") : pl.sendTitle("§cYou lost");
        team === teamW ? pl.playSound("horn.call.1") : pl.playSound("horn.call.5");

        pl.setGameType(GameType.Spectator);
    });
}



let ticks = 0;
events.levelTick.on(e => {
    if (!isGameRunning) return;
    const level = e.level;

    if (level.getActivePlayerCount() < 2) {
        end();
        return;
    }

    if (ticks === 20) {
        bedrockServer.executeCommand("execute at @a run fill ~+10 68 ~-5 ~-10 71 ~+5 air replace border_block");
    }

    level.getPlayers().forEach(pl => {
        const pos = pl.getPosition();
        const plName = pl.getNameTag();
        if (!teams.has(plName)) return;
        const team = teams.get(plName)!;

        if (ticks === 20) { // BUILD LIMIT
            if (pos.y > 130 || pos.y < 50) {
                pl.hurt(ActorDamageCause.Override, 4, false, false);
                pl.sendActionbar("§cYou are outside map bounds!");
            }
        } else if (flagHolder[0] === plName) { // Red player
            if ((pos.x >= (bannerPos[0].x-1) && pos.x <= (bannerPos[0].x+1.5))
             && (pos.y >= (bannerPos[0].y) && pos.y <= (bannerPos[0].y+2))
             && (pos.z >= (bannerPos[0].z-1) && pos.z <= (bannerPos[0].z+1.5))) {
                if (!flagsStatus[team]) return; // Player's team's flag is taken
                flagCaptured(pl, 1);
            }
        } else if (flagHolder[1] === plName) { // Blue player
            if ((pos.x >= (bannerPos[1].x-1) && pos.x <= (bannerPos[1].x+1.5))
             && (pos.y >= (bannerPos[1].y) && pos.y <= (bannerPos[1].y+2))
             && (pos.z >= (bannerPos[1].z-1) && pos.z <= (bannerPos[1].z+1.5))) {
                if (!flagsStatus[team]) return; // Player's team's flag is taken
                flagCaptured(pl, 0);
            }
        }
    });

    ticks === 20 ? ticks = 0 : ticks++;
});

events.blockDestroy.on(e => {
    if (!isGameRunning) return;
    const bl = e.blockSource.getBlock(e.blockPos).getName();
    const pl = e.player;
    // console.log(pl.getNameTag());
    if (e.blockPos.y <= 50 || e.blockPos.y >= 130) {
        e.player.sendMessage("§cBlock is outside of map's limits!");
        return CANCEL;
    }
    if (bl === "un:red_banner_block" || bl === "un:blue_banner_block") {
        const teamStolen = bl === "un:red_banner_block" ? 0 : 1;
        // console.log(`${e.blockPos.x} ${e.blockPos.y} ${e.blockPos.z}`);
        // console.log(`${bannerPos[teamStolen].x} ${bannerPos[teamStolen].y} ${bannerPos[teamStolen].z}`);
        // Just to check if flag is where it's supposed to be
        if ((e.blockPos.x === bannerPos[teamStolen].x) && (e.blockPos.y === bannerPos[teamStolen].y) && (e.blockPos.z === bannerPos[teamStolen].z)) {
            // BANNER TAKEN
            const team = teams.get(pl.getNameTag());
            if (team === undefined) {
                pl.sendMessage("Warning there was a problem you don't have a team pls contact admins");
                return CANCEL};
            if (team === teamStolen) {
                pl.sendMessage("§cYou can't break your own flag!");
                return CANCEL;
            }

            bedrockServer.executeCommand("tellraw @a " + rawtext(`§f${pl.getNameTag()} §7has stolen ${teamRawtext[teamStolen]}§7's flag!`));
            bedrockServer.executeCommand("playsound @a note.banjo");

            flagsStatus[teamStolen] = false;
            flagHolder[team] = pl.getNameTag();
            const helmet = teamStolen === 0 ? createCItemStack({ item: "un:red_banner_helmet" }) : createCItemStack({ item: "un:blue_banner_helmet" });
            const tag = helmet.save();
            const nbt = NBT.allocate({
                ...tag,
                tag: {
                    ...tag.tag,
                    "minecraft:item_lock": NBT.byte(1),
                    "minecraft:keep_on_death": NBT.byte(1)
                }
            }) as CompoundTag;
            helmet.load(nbt);
            pl.setArmor(0, helmet);
            helmet.destruct();

            pl.runCommand("§7>> §fReturn the flag to your base! §7<<");


            // Block breaks but doesn't drop
            const reg = pl.getRegion();
            const airBlock = Block.create("minecraft:air")!;
            reg.setBlock(e.blockPos, airBlock);
        }
        return CANCEL;
    }
    return;
});

events.blockPlace.on(e => {
    if (!isGameRunning) return;
    const {x, y, z} = e.blockPos;
    if (y <= 50 || y >= 130) {
        e.player.sendMessage("§cYou cannot place blocks outside of the map's limits!");
        return CANCEL;
    }
    for (const banner of bannerPos) {
        if ((x >= (banner.x-1) && x <= (banner.x+1))
         && (y >= (banner.y) && y <= (banner.y+2))
         && (z >= (banner.z-1) && z <= (banner.z+1))) {
            return CANCEL;
        }
    }
    return;
});

events.playerRespawn.on(async e => {
    console.log("events.playerRespawn");
    if (!isGameRunning) return;
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }

    pl.runCommand("clear @s");
    const plName = pl.getNameTag();
    if (!teams.has(plName)) return;
    const team = teams.get(plName)!;
    pl.teleport(teamSpawnPos[team]);

    giveItems(pl, team);

    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});

events.playerLeft.on(e => {
    console.log("events.playerLeft");
    if (!isGameRunning) return;
    const pl = e.player;
    const plName = pl.getNameTag();
    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});

events.playerJoin.on(async e => {
    console.log("events.playerJoin");
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    if (!isGameRunning) {
        pl.teleport(Vec3.create(731, 89, 288), DimensionId.Overworld);
        pl.runCommand("clear");
        pl.setGameType(GameType.Adventure);
        pl.addEffect(MobEffectInstance.create(MobEffectIds.InstantHealth, 1, 15, false, false, false));
        pl.addEffect(MobEffectInstance.create(MobEffectIds.Saturation, 5*60*20, 255, false, false, false));
    } else {
        pl.runCommand("clear @s");

        const plName = pl.getNameTag();
        if (!teams.has(plName)) {
            teams.set(plName, Math.floor(Math.random()*2));
            pl.sendTitle(`${teamRawtext[teams.get(plName)!]} team`, "§7You were assigned to a team");
            pl.playSound("note.harp");
        }
        const team = teams.get(plName)!;

        giveItems(pl, team);

        pl.teleport(teamSpawnPos[team]);
    }
});

events.entityDie.on(e => {
    if (!isGameRunning) return;
    if (e.entity.getIdentifier() !== "minecraft:player") return;
    if (!e.damageSource.getDamagingEntity()?.isPlayer()) return;
    const attacker = e.damageSource.getDamagingEntity() as Player;
    const victim = e.entity as Player;
    const attackerStats = playerStats.get(attacker.getNameTag()) || { kills: 0, deaths: 0, flags: 0 };
    const victimStats = playerStats.get(victim.getNameTag()) || { kills: 0, deaths: 0, flags: 0 };
    attackerStats.kills++; victimStats.deaths++;
    playerStats.set(attacker.getNameTag(), attackerStats);
    playerStats.set(victim.getNameTag(), victimStats);
});

events.playerAttack.on(e => {
    if (!isGameRunning) return CANCEL;
    if (e.victim.getIdentifier() !== "minecraft:player") return;
    const pl = e.player;
    const victim = e.victim;
    const plName = pl.getNameTag();
    const plTeam = teams.get(plName);
    const victimTeam = teams.get(victim.getNameTag());
    if (plTeam === undefined || victimTeam === undefined) return;

    if (plTeam === victimTeam) return CANCEL;
});
/*
events.entityHurt.on(e => {
    if (!isGameRunning) return CANCEL;
});
*/
events.playerDimensionChange.on(() => {
    return CANCEL;
});


// DEBUG
export function getConstant(constant: Constants) {
    switch (constant) {
        case Constants.isGameRunning:
            return (isGameRunning);
        case Constants.bannerPos:
            return [[bannerPos[0].x, bannerPos[0].y, bannerPos[0].z],
                    [bannerPos[1].x, bannerPos[1].y, bannerPos[1].z]];
        case Constants.flagHolder:
            return (flagHolder);
        case Constants.flagsStatus:
            return (flagsStatus);
        case Constants.flagCount:
            return (flagCount);
        case Constants.teams:
            return (teams);
        default:
            return ("No constant provided");
    }
}

function getPlayerByName(name: string): Player | null {
    const plList = bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name) return plList[i]
    }
    return null;
}
