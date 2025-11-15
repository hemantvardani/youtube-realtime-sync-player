import { io , Socket} from "socket.io-client";
import { clientToServerEvent, serverToClientEvent } from "./enum";
import { infoResponseFromSocket } from "./interface";

export class SocketService {
    private socket: Socket;

    constructor(){
         this.socket = io(process.env.NEXT_PUBLIC_BASE_API_URL);

         this.defineListeners()
    }

    private defineListeners(){
        this.socket.on("connect",()=>{console.log("connected")});
        this.socket.on("disconnect",()=>{console.log("disconnected")});

        this.socket.on("update",(data)=>{
            // updateDataOnRedux(data)
        })

        this.socket.on(serverToClientEvent.INFO,(data: infoResponseFromSocket)=>{
            console.log("Event received",serverToClientEvent.INFO);
            console.log("and data is ", data);
            // updateDataOnRedux(data)
        })

    }

    // User -> server -> same user
    requestInfo(){
        console.log("Event sent", clientToServerEvent.INFO)
        this.socket.emit(clientToServerEvent.INFO);
    }

    // User -> server -> expect that user
    pushUpdates(data:{action:"init", data:any}){
        this.socket.emit("update",data)
    }

}

export const socketServiceInstance = new SocketService();
