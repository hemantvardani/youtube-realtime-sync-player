import { Server } from "socket.io";
import { createServer } from "http";
import { clientToServerEvent, serverToClientEvent } from "./utils/enum.js";
import { getServerCurrentInfo, handleInitFromClient, handleNewConnectionJoined, handlePauseFromClient, handlePlayFromClient, handleResetFromClient, handleSeekFromClient } from "./player.js";
// import type { responseFromSocket } from "./utils/type.js";

// Allow multiple origins for development and production
const allowedOrigins: (string | RegExp)[] = process.env.CLIENT_ORIGIN 
  ? process.env.CLIENT_ORIGIN.split(',').map(origin => origin.trim())
  : ["http://localhost:3000"];

// Add common Vercel patterns if in production
if (process.env.NODE_ENV === 'production') {
  // Allow any Vercel preview/deployment URL
  allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
  // Allow custom domain if set
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin matches any allowed origin
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
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

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});