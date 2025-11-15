import { Server } from "socket.io";
import { createServer } from "http";
import { clientToServerEvent, serverToClientEvent } from "./utils/enum.js";
import { getServerCurrentInfo } from "./player.js";
// import type { responseFromSocket } from "./utils/type.js";

 
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"]
  }
});

io.on("connection",(socket)=>{
    console.log("connection established");

    socket.on(clientToServerEvent.INFO,()=>{
        console.log("Event received", clientToServerEvent.INFO);
        
        const info = getServerCurrentInfo();
        const infoToBeSent = {...info, serverTimeNow: new Date().getTime() }
        socket.emit(serverToClientEvent.INFO, infoToBeSent);
    })
})

io.listen(4000)