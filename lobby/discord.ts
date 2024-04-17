import { events } from "bdsx/event";
import { logPrefix } from "..";

const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');


let code: string;
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.MessageContent
    ],
    presence: {
        status: "online",
        activities: [{type: Discord.ActivityType.Listening, name: "the server's awesome music"}]
    }
});

client.on("ready", () => {
    console.log(`[Party-Plugin Discord] Logged in as ${client.user.tag}!`);

    code = makeRandomString(6);
    logCode(code);
});

client.on("messageCreate", (msg: any) => {
    console.log(msg);
    console.log(msg.content);
	// Join the same voice channel of the author of the message
	if (msg.member.voice.channel && msg.content === code) {
        audioStreamObj.init(msg.member.voice.channel);
        msg.channel.send("Set streaming channel to: " + msg.member.voice.channel.name);
        code = makeRandomString(6);
        logCode(code);
	} else if (msg.content === code) {
        msg.channel.send("You're not in a voice channel!");
    }
});
client.on('debug', console.log)
      .on('warn', console.log);
client.on('shardError', (error: any) => {
	console.error('A websocket connection encountered an error:', error);
});
client.on('error', (error: any) => {
    console.log(error);
});

export const audioStreamObj = {
    channel: 0 as unknown as any,
    init: function(channel: any) {
        this.channel = channel;
        console.log(this.channel);
    },
    play: async function() {
        const connection = await this.channel.join();
	    const dispatcher = connection.play(fs.createReadStream(fs.join(process.cwd(), "..", "music", "700_OMEGA_RUSSIAN.ogg")), { type: 'ogg/opus' });

        dispatcher.on('start', () => {
            console.log('audio.ogg is now playing!');
        });

        dispatcher.on('finish', () => {
            console.log('audio.ogg has finished playing!');
        });

        dispatcher.on('error', console.error);
    },
    stop: function(){
        this.channel.leave();
    }
}

function makeRandomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function logCode(code: string) {
    console.log(logPrefix + "SECRET CODE: " + code);
}

events.serverStop.on(() => {
    client.destroy();
})

client.login(config.token);
