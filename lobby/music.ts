import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { logPrefix } from "..";

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 19134;

const colorCodes = ["2", "3", "5", "6", "9", "a", "b", "c", "d", "e", "g", "m", "n", "p", "q", "s", "u"];

app.use(bodyParser.json());

// Endpoint to receive HTTP requests from Discord bot
app.post('/message', (req: {body: { title: string, artist: string }}, res: any) => {
    const message = req.body;

    const titleColor = Math.floor(Math.random() * colorCodes.length),
          artistColor = Math.floor(Math.random() * colorCodes.length);
    bedrockServer.level.getPlayers().forEach(pl => {
        pl.sendJukeboxPopup(`§${colorCodes[titleColor]}${message.title} §7- §${colorCodes[artistColor]}${message.artist}`);
    });

    res.sendStatus(200);
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

events.serverClose.on(() => {
    console.log(logPrefix + "Closing Express.js server...");
    server.close(() => {
        console.log(logPrefix + 'Express.js server closed');
    });
});
