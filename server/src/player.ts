import type { Socket } from "socket.io";
import type { serverVideoInfo } from "./utils/interface.js";
import { serverToClientEvent } from "./utils/enum.js";

const videoInfo : serverVideoInfo= {
    videoId:null,
    startedAt:null,
    isPlaying:false,
    currentPosition:0
}

function getCurrentPlaybackPosition(now:number){
    if(videoInfo.isPlaying && videoInfo.startedAt !== null){
        return (now - videoInfo.startedAt)/1000;
    }
    return videoInfo.currentPosition ?? 0;
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
    videoInfo.startedAt = null;
    videoInfo.isPlaying = false ;
    videoInfo.currentPosition = 0;

    const info = getServerCurrentInfo();
    const infoToBeSent = {...info, serverTimeNow: new Date().getTime() }
    io.emit(serverToClientEvent.INIT, infoToBeSent);

}

export function handleResetFromClient(io:any){
    videoInfo.videoId = null;
    videoInfo.startedAt = null;
    videoInfo.isPlaying = false ;
    videoInfo.currentPosition = 0;

    io.emit(serverToClientEvent.RESET);

}

export function handlePlayFromClient(io:any, socket: Socket, currentTime?: number){
    const now = new Date().getTime();
    
    const baseTime = currentTime !== undefined && currentTime !== null
    ? currentTime
    : getCurrentPlaybackPosition(now);

    videoInfo.currentPosition = baseTime;
    videoInfo.startedAt = now - (baseTime * 1000);

    videoInfo.isPlaying = true ;
 
    // Broadcast updated timestamp along with play event so all clients can sync
    const currentTimeStamp = getCurrentPlaybackPosition(now);
    io.emit(serverToClientEvent.PLAY, { 
        currentTimeStamp,
        serverTimeNow: now,
        startedAt: videoInfo.startedAt
    });

}

export function handlePauseFromClient(io:any, socket: Socket, currentTime?: number){
    const now = new Date().getTime();
    
    const baseTime = getCurrentPlaybackPosition(now);

    videoInfo.currentPosition = baseTime;
    videoInfo.startedAt = null;
    videoInfo.isPlaying = false ;
    
    // Broadcast updated timestamp along with pause event so all clients can sync
    const currentTimeStamp = baseTime;
    io.emit(serverToClientEvent.PAUSE, { 
        currentTimeStamp,
        serverTimeNow: now,
        startedAt: videoInfo.startedAt
    });
}

export function handleSeekFromClient(io:any, socket: Socket, seekTo:number){
    // Update startedAt to maintain correct timestamp calculation after seek
    // If video is playing, we need to account for the current playback position
    // If paused, we just update the reference point
    const now = new Date().getTime();
    // Calculate new startedAt: current time minus the seek position (in milliseconds)
    // This ensures that when we calculate currentTimeStamp = (serverTimeNow - startedAt) / 1000,
    // it will equal seekTo
    videoInfo.currentPosition = seekTo;
    if(videoInfo.isPlaying){
        videoInfo.startedAt = now - (seekTo * 1000);
    }else{
        videoInfo.startedAt = null;
    }

    const infoToBeSent = { 
        seekTo,
        currentTimeStamp: seekTo,
        serverTimeNow: now,
        startedAt: videoInfo.startedAt,
        isPlaying: videoInfo.isPlaying
    }
    io.emit(serverToClientEvent.SEEK, infoToBeSent);
}


export function getServerCurrentInfo(){
    const now = new Date().getTime();
    return {
        videoId: videoInfo.videoId,
        startedAt: videoInfo.startedAt,
        isPlaying: videoInfo.isPlaying,
        currentTimeStamp: getCurrentPlaybackPosition(now)
    }
}