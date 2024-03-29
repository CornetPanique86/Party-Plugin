import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { countdownActionbar, startGame } from "./utils";
import { Games } from ".";
import { Player } from "bdsx/bds/player";

export async function hikabrainstart(param: { option: string }, origin: CommandOrigin, output: CommandOutput) {
    // /hikabrainstart stop
    if (param.option === "stop") {
        return;
    }

    // /hikabrainstart start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? origin.getEntity()!.runCommand("tellraw @s " +rawtext("Minimum 2 players to start", LogInfo.error))
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.hikabrain, bedrockServer.level.getPlayers(), 10);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting hikabrain", LogInfo.error)}`);
        console.log(err);
        return;
    }
}

// 0 = red; 1 = blue   string: playerName
const teams = new Map<string, number>();
const points = [0, 0];
const teamNames = ["§cRed", "§1Blue"];
const teamPos = ["1 1 1", "1 1 1"];

function setup(pls: string[]) {
    console.log("setup() participants:\n" + pls + "\n");
    bedrockServer.executeCommand("tag @a remove hikabrain");

    let teamCounter = 0;
    pls.forEach(pl => {
        bedrockServer.executeCommand(`tag "${pl}" add hikabrain`);
        teams.set(pl, teamCounter);
        teamCounter === 2 ? teamCounter = 0 : teamCounter++;
    });



    teams.forEach((value, key) => {
        bedrockServer.executeCommand(`tp "${key}" ${teamPos[value]}`);
        bedrockServer.executeCommand(`spawnpoint "${key}" ${teamPos[value]}`);
    });

    bedrockServer.executeCommand("clear @a[tag=hikabrain]");
    bedrockServer.executeCommand("effect @a[tag=hikabrain] clear");
    bedrockServer.executeCommand("kill @e[type=item]");

}

function addPoint(team: number) {
    if (team < 0 || team > 1) return;
    points[team]++;
    bedrockServer.executeCommand(`tellraw @a[tag=hikabrain] §a§l+1 POINT §7> ${teamNames[team]} team §ris at §e§l${points[team]}§r§e/5`);
    bedrockServer.executeCommand("playsound firework.blast @a[tag=hikabrain]");
    roundReset();
}

function roundReset() {
    bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement disabled"); // block player movement
    const plsName = [...teams.keys()];
    countdownActionbar(3, plsName, false)
        .then(() => {
            const pls = getHikabrainPlayers();
            pls.forEach(pl => {

            })
        })
        .catch(err => {
            bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext("Error while finishing to setup hikabrain", LogInfo.error));
            console.log(err.message);
            return;
        });
}

function getHikabrainPlayers() {
    let out: Player[] = [];
    bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("hikabrain")) out.push(pl);
    });
    return out;
}