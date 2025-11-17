import { Server } from "socket.io";
import { createServer } from "http";
import { clientToServerEvent, serverToClientEvent } from "./utils/enum.js";
import { getServerCurrentInfo, handleInitFromClient, handleNewConnectionJoined, handlePauseFromClient, handlePlayFromClient, handleResetFromClient, handleSeekFromClient } from "./player.js";
// import type { responseFromSocket } from "./utils/type.js";

const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: [ALLOWED_ORIGIN],
    credentials: true
  }
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

io.listen(4000)