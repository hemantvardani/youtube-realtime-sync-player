import { Server } from "socket.io";
import { createServer } from "http";
import { clientToServerEvent, serverToClientEvent } from "./utils/enum.js";
import { getServerCurrentInfo, handleInitFromClient, handleNewConnectionJoined, handlePauseFromClient, handlePlayFromClient, handleResetFromClient, handleSeekFromClient } from "./player.js";
// import type { responseFromSocket } from "./utils/type.js";

// CORS configuration - TEMPORARILY ALLOWING ALL ORIGINS FOR DEBUGGING
// TODO: Restrict this to specific origins in production
const corsOptions = {
  origin: "*", // Allow all origins temporarily
  credentials: false, // Must be false when using "*"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: corsOptions
});

io.on("connection",(socket)=>{
    console.log("connection established");

    handleNewConnectionJoined(socket)

    socket.on(clientToServerEvent.INIT,(data)=>{
      handleInitFromClient(io,data);
    })

    socket.on(clientToServerEvent.RESET,()=>{
      console.log("Received", clientToServerEvent.RESET)
      handleResetFromClient(io);
    })

    socket.on(clientToServerEvent.PLAY,(data)=>{
      console.log("Received", clientToServerEvent.PLAY, data)
      handlePlayFromClient(io, socket, data?.currentTime);
    })

    socket.on(clientToServerEvent.PAUSE,(data)=>{
      console.log("Received", clientToServerEvent.PAUSE, data)
      handlePauseFromClient(io, socket, data?.currentTime);
    })

    socket.on(clientToServerEvent.SEEK,(data)=>{
      console.log("Received", clientToServerEvent.SEEK)
      handleSeekFromClient(io, socket, data.seekTo);
    })
    

})

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});