import express, {Express} from "express";
import * as path from "node:path";

const __dirname = import.meta.dirname;

const app: Express = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.get("/api/skin/:name", (req, res) => {
    getSkinByName(req.params.name).then(skin => {
        res.contentType("image/png");
        res.end(Buffer.from(skin));
    });
});

async function getSkinByName(name: string) {
    const response = await (await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`)).json();
    return await getSkinByUuid(response['id']);
}

async function getSkinByUuid(uuid: string) {
    const response = await (await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)).json();
    let textures = JSON.parse(atob(response['properties'][0]['value']));
    const response_1 = await fetch(textures['textures']['SKIN']['url']);
    return await response_1.arrayBuffer();
}

app.listen(8080, () => {
    console.log("Listening on port 8080");
});