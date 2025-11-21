import { io , Socket} from "socket.io-client";
import { clientToServerEvent, serverToClientEvent } from "../enum";
import { initResponseFromSocket } from "../interface";
import { handleInitResponseFromServer, handlePauseFromServer, handlePlayFromServer, handleResetResponseFromServer, handleSeekFromServer } from "./service";
import logger from "@/utils/logger";

export class SocketService {
    private socket: Socket;

    constructor(){
         // Fallback to localhost if environment variable is not set
         const socketUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:4000";
         this.socket = io(socketUrl, {
            withCredentials: false, // Set to false when server uses origin: "*"
            // transports: ['polling', 'websocket'], // Try polling first, then websocket
            upgrade: true,
            rememberUpgrade: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
         });

         this.defineListeners()
    }

    private defineListeners(){
        this.socket.on("connect",()=>{logger.log("connected")});
        this.socket.on("disconnect",()=>{logger.log("disconnected")});

        this.socket.on(serverToClientEvent.RESET,()=>{
            logger.log("Event received",serverToClientEvent.RESET);

            handleResetResponseFromServer()
        })

        this.socket.on(serverToClientEvent.INIT,(data: initResponseFromSocket)=>{
            logger.log("Event received",serverToClientEvent.INIT);
            logger.log("and data is ", data);

            handleInitResponseFromServer(data)
        })

        this.socket.on(serverToClientEvent.PLAY,(data)=>{
            logger.log("Event received",serverToClientEvent.PLAY, data);

            handlePlayFromServer(data)
        })

        this.socket.on(serverToClientEvent.PAUSE,(data)=>{
            logger.log("Event received",serverToClientEvent.PAUSE, data);

            handlePauseFromServer(data)
        })

        this.socket.on(serverToClientEvent.SEEK,(data)=>{
            logger.log("Event received",serverToClientEvent.SEEK);

            handleSeekFromServer(data)
        })




    }

    // User -> server -> expect that user
    // pushUpdates(data:{action:"init", data:any}){
    //     this.socket.emit("update",data)
    // }

    initVideo({videoId}:{videoId:string}){
        this.socket.emit(clientToServerEvent.INIT,{videoId})
    }

    resetVideo(){
        logger.log("resetVideo")
        this.socket.emit(clientToServerEvent.RESET)
    }

    play(currentTime?: number){
        logger.log("play", currentTime)
        this.socket.emit(clientToServerEvent.PLAY, { currentTime: currentTime ?? 0 })
    }

    pause(currentTime?: number){
        logger.log("pause", currentTime)
        this.socket.emit(clientToServerEvent.PAUSE, { currentTime: currentTime ?? 0 })
    }

    seeked(data:{seekTo:number}){
        logger.log("seeked", data)
        this.socket.emit(clientToServerEvent.SEEK, data)
    }

    ended(){
        logger.log("ended");
        this.socket.emit(clientToServerEvent.ENDED)
    }

}

export const socketServiceInstance = new SocketService();
