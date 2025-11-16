import type { Socket } from "socket.io";
import type { serverVideoInfo } from "./utils/interface.js";
import { serverToClientEvent } from "./utils/enum.js";

const videoInfo : serverVideoInfo= {
    videoId:null,
    startedAt:null,
    isPlaying:false
}

export function handleNewConnectionJoined(socket: Socket){
    if(videoInfo.videoId){
        const info = getServerCurrentInfo();
        const infoToBeSent = {...info, serverTimeNow: new Date().getTime() }
        socket.emit(serverToClientEvent.INIT, infoToBeSent);
    }
}

export function handleInitFromClient(io:any,data:{videoId:string}){
    videoInfo.videoId = data.videoId;
    videoInfo.startedAt = new Date().getTime();
    videoInfo.isPlaying = false ;

    const info = getServerCurrentInfo();
    const infoToBeSent = {...info, serverTimeNow: new Date().getTime() }
    io.emit(serverToClientEvent.INIT, infoToBeSent);

}

export function handleResetFromClient(io:any){
    videoInfo.videoId = null;
    videoInfo.startedAt = null;
    videoInfo.isPlaying = false ;

    io.emit(serverToClientEvent.RESET);

}

export function handlePlayFromClient(io:any, socket: Socket){

    videoInfo.isPlaying = true ;
 
    io.emit(serverToClientEvent.PLAY);

}

export function handlePauseFromClient(io:any, socket: Socket){

    videoInfo.isPlaying = false ;

    io.emit(serverToClientEvent.PAUSE);
}

export function handleSeekFromClient(io:any, socket: Socket, seekTo:number){

    const infoToBeSent = { seekTo }
    io.emit(serverToClientEvent.SEEK, infoToBeSent);
}


export function getServerCurrentInfo(){
    return {
        videoId: videoInfo.videoId,
        startedAt: videoInfo.startedAt,
        isPlaying: videoInfo.isPlaying,
    }
}