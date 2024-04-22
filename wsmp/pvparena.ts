import { bedrockServer } from "bdsx/launcher";
import { createCItemStack } from "../utils";
import { EnchantmentNames } from "bdsx/bds/enchants";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { Vec3 } from "bdsx/bds/blockpos";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { PlayerAttackEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { LogInfo, rawtext } from "..";
import { ItemStack } from "bdsx/bds/inventory";
import { Player } from "bdsx/bds/player";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";

export let isGameRunning = false;

// 0 = red; 1 = blue   string: playerName
const teams = new Map<string, number>();
// Red: 186 137 -37      Blue: 204 137 -37
const tpLocations = [Vec3.create(186, 137, -37), Vec3.create(204, 137, -37)];
const teamColors = [-54000, 66000];

export function startGame() {
    isGameRunning = true;
    bedrockServer.executeCommand("clear @a");
    bedrockServer.executeCommand("effect @a clear");


    const armorNames = ["minecraft:iron_chestplate", "minecraft:iron_leggings", "minecraft:iron_boots"];
    const armor: ItemStack[] = [];
    for (let i = 0; i < armorNames.length; i++) {
        armor.push(createCItemStack({
            item: armorNames[i],
            amount: 1,
            enchantment: {
                enchant: EnchantmentNames.Unbreaking,
                level: 5,
                isUnsafe: true
            }
        }));
    }

    let teamCounter = 0;
    const pls = [...bedrockServer.level.getPlayers()];
    while (pls.length > 0) {
        const randomIndex = Math.floor(Math.random() * pls.length);
        const pl = pls[randomIndex];
        pl.addTag("pvparena");
        teams.set(pl.getNameTag(), teamCounter);

        const helmet = createCItemStack({
            item: "minecraft:leather_helmet",
            amount: 1,
            data: 0,
            name: teamCounter === 1 ? "§r§bBlue team" : "§r§cRed team",
            enchantment: {
                enchant: EnchantmentNames.Unbreaking,
                level: 5,
                isUnsafe: true
            }
        });
        const tag = helmet.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                "customColor": NBT.int(teamColors[teamCounter]),
                "minecraft:item_lock": NBT.byte(1)
            }
        }) as CompoundTag;
        helmet.load(nbt);
        pl.setArmor(0, helmet);
        helmet.destruct();

        for (let i = 0; i < armor.length; i++) {
            pl.setArmor(i+1, armor[i]);
        }

        pl.teleport(tpLocations[teamCounter]);
        pl.addEffect(MobEffectInstance.create(MobEffectIds.InstantHealth, 1, 15, false, false, false));

        pls.splice(randomIndex, 1);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }

    for (let i = 0; i < armor.length; i++) {
        armor[i].destruct();
    }

    bedrockServer.executeCommand("give @a iron_sword");
    bedrockServer.executeCommand("give @a bow");
    bedrockServer.executeCommand("give @a golden_apple 8");
    bedrockServer.executeCommand("give @a cooked_beef 16");
    bedrockServer.executeCommand("give @a arrow 32");

    startListeners();
    gameIntervalObj.init();

    console.log(teams);
}

export function stopGame() {
    gameIntervalObj.stop();
    stopListeners();
    bedrockServer.executeCommand("tp @a 180 141 -37");
    bedrockServer.executeCommand("clear @a");
    bedrockServer.executeCommand("effect @a clear");
    bedrockServer.executeCommand("kill @e[type=item]");
    bedrockServer.executeCommand("tag @a remove pvparena");
    isGameRunning = false;
}

function end() {
    let winner = "No one";
    for (const player of bedrockServer.level.getPlayers()) {
        if (player.hasTag("pvparena")) {
            winner = player.getNameTag();
            break;
        }
    }
    bedrockServer.executeCommand("tellraw @a " + rawtext(`§a§l${winner} §r§awon!`, LogInfo.info));

    stopGame();
}

const gameIntervalObj = {
    init: function() {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function() {
        if (bedrockServer.isClosed()) {
            this.stop;
            return;
        }
        for (const player of bedrockServer.level.getPlayers()) {
            if (!player.hasTag("pvparena")) return;
            player.sendActionbar(`You are ${(teams.get(player.getNameTag()) === 1) ? "§bBLUE" : "§cRED"}`);
        }
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval);
    }
}

const playerAttackLis = (e: PlayerAttackEvent) => {
    if (!e.player.hasTag("pvparena")) return;
    if (e.victim.getIdentifier() !== "minecraft:player") return;
    const pl = e.player;
    const victim = e.victim;
    const plTeam = teams.get(pl.getNameTag());
    const victimTeam = teams.get(victim.getNameTag());
    if (plTeam === undefined || victimTeam === undefined) return;

    if (plTeam === victimTeam) return CANCEL;
};

const playerRespawnLis = (e: PlayerRespawnEvent) => {
    if (!e.player.hasTag("pvparena")) return;
    e.player.removeTag("pvparena");
    (async () => {
        while (!e.player.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        e.player.teleport(Vec3.create(180, 141, -37));
    })();

    let playersLeft = 0;
    for (const player of bedrockServer.level.getPlayers()) {
        if (player.hasTag("pvparena")) playersLeft++;
    }
    if (playersLeft === 1) {
        end();
        return;
    }


    teams.clear();

    let teamCounter = 0;

    let pls: Player[] = [];
    bedrockServer.level.getPlayers().forEach(pl => { if (pl.hasTag("pvparena")) pls.push(pl) });
    while (pls.length > 0) {
        const randomIndex = Math.floor(Math.random() * pls.length);
        const player = pls[randomIndex];
        if (!player.hasTag("pvparena")) {
            pls.splice(randomIndex, 1);
            return;
        };
        teams.set(player.getNameTag(), teamCounter);

        const helmet = createCItemStack({
            item: "minecraft:leather_helmet",
            amount: 1,
            data: 0,
            name: teamCounter === 1 ? "§r§bBlue team" : "§r§cRed team",
            enchantment: {
                enchant: EnchantmentNames.Unbreaking,
                level: 5,
                isUnsafe: true
            }
        });
        const tag = helmet.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                "customColor": NBT.int(teamColors[teamCounter]),
                "minecraft:item_lock": NBT.byte(1)
            }
        }) as CompoundTag;
        helmet.load(nbt);
        player.setArmor(0, helmet);

        helmet.destruct();

        pls.splice(randomIndex, 1);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }

    bedrockServer.executeCommand("playsound note.harp @a");
    bedrockServer.executeCommand("tellraw @a " + rawtext("§7§l> §r§fSwitched teams!"));
    console.log(teams);
}

function startListeners() {
    events.playerAttack.on(playerAttackLis);
    events.playerRespawn.on(playerRespawnLis);
}
function stopListeners() {
    events.playerAttack.remove(playerAttackLis);
    events.playerRespawn.remove(playerRespawnLis);
}
