import http from "http";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";

const ELEVEN_WS = "wss://api.elevenlabs.io/v1/agents/ws";
const { PORT = 10000, ELEVENLABS_API_KEY, AGENT_ID } = process.env;

const app = express();
app.get("/health", (_, res) => res.send("ok"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (client) => {
  const upstream = new WebSocket(`${ELEVEN_WS}?agent_id=${AGENT_ID}`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY }
  });

  client.on("message", (msg) => {
    if (upstream.readyState === WebSocket.OPEN) upstream.send(msg);
  });

  upstream.on("message", (msg) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });

  upstream.on("close", () => client.close());
  client.on("close", () => upstream.close());
});

server.listen(PORT, () => console.log("Proxy listening on :" + PORT));
