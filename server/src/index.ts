import { Server } from "socket.io";
import { createServer } from "http";
import { clientToServerEvent, serverToClientEvent } from "./utils/enum.js";
import { getServerCurrentInfo, handleInitFromClient, handleNewConnectionJoined, handlePauseFromClient, handlePlayFromClient, handleResetFromClient, handleSeekFromClient } from "./player.js";
// import type { responseFromSocket } from "./utils/type.js";

 
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"]
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

    socket.on(clientToServerEvent.PLAY,()=>{
      console.log("Received", clientToServerEvent.PLAY)
      handlePlayFromClient(io, socket);
    })

    socket.on(clientToServerEvent.PAUSE,()=>{
      console.log("Received", clientToServerEvent.PAUSE)
      handlePauseFromClient(io, socket);
    })

    socket.on(clientToServerEvent.SEEK,(data)=>{
      console.log("Received", clientToServerEvent.SEEK)
      handleSeekFromClient(io, socket, data.seekTo);
    })
    

})

io.listen(4000)