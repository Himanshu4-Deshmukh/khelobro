import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIo } from "socket.io";
import { PORT } from "./config.js";
import { socketHandlers } from "./socket/handlers.js";
import connectDB from "../backend/utils/db.js";
import { rooms } from "./game/datastore.js";

// Server Initialization
const app = express();
const server = http.createServer(app);
const io = new SocketIo(server, {
  cors: {
    origin: "https://khelobro.online", // Adjust for production (e.g., "https://ludokingo.in")
    // origin: "*",
    credentials: true,
    methods: ["POST", "GET", "OPTIONS"],
  },
});

// Middleware
app.use(cors());

// API Endpoint
app.get("/rooms", (req, res) => res.json(rooms));

// Socket Handlers
io.on("connection", (socket) => socketHandlers(io, socket));

// Start Server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  connectDB();
});
