import { io , Socket} from "socket.io-client";
import { clientToServerEvent, serverToClientEvent } from "../enum";
import { initResponseFromSocket } from "../interface";
import { handleInitResponseFromServer, handlePauseFromServer, handlePlayFromServer, handleResetResponseFromServer } from "./service";

export class SocketService {
    private socket: Socket;

    constructor(){
         this.socket = io(process.env.NEXT_PUBLIC_BASE_API_URL);

         this.defineListeners()
    }

    private defineListeners(){
        this.socket.on("connect",()=>{console.log("connected")});
        this.socket.on("disconnect",()=>{console.log("disconnected")});

        this.socket.on(serverToClientEvent.RESET,()=>{
            console.log("Event received",serverToClientEvent.RESET);

            handleResetResponseFromServer()
        })

        this.socket.on(serverToClientEvent.INIT,(data: initResponseFromSocket)=>{
            console.log("Event received",serverToClientEvent.INIT);
            console.log("and data is ", data);

            handleInitResponseFromServer(data)
        })

        this.socket.on(serverToClientEvent.PLAY,()=>{
            console.log("Event received",serverToClientEvent.PLAY);

            handlePlayFromServer()
        })

        this.socket.on(serverToClientEvent.PAUSE,()=>{
            console.log("Event received",serverToClientEvent.PAUSE);

            handlePauseFromServer()
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
        console.log("resetVideo")
        this.socket.emit(clientToServerEvent.RESET)
    }

    play(){
        console.log("play")
        this.socket.emit(clientToServerEvent.PLAY)
    }

    pause(){
        console.log("pause")
        this.socket.emit(clientToServerEvent.PAUSE)
    }

}

export const socketServiceInstance = new SocketService();
