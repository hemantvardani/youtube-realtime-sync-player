import mitt from "mitt";
import { initResponseFromSocket } from "../interface";
import { initVideo, pauseVideo, playVideo, unsetVideo, updateCurrentTime } from "@/redux/slices/player";
import { store } from "@/redux/store";

export const eventBus= mitt()

export function handleInitResponseFromServer(data:initResponseFromSocket){
      
    if(!data.videoId){
        store.dispatch(unsetVideo())
        return;
    }

    // Calculate current timestamp based on server time
    // If video is playing: currentTime = (serverTimeNow - startedAt) / 1000
    // If video is paused: currentTime = (serverTimeNow - startedAt) / 1000 (same calculation)
    const currentTimeStamp = data.currentTimeStamp !== null && data.currentTimeStamp !== undefined
        ? data.currentTimeStamp
        : (data.startedAt && data.serverTimeNow 
            ? (data.serverTimeNow - data.startedAt) / 1000
            : 0);

    const videoDetails = {
        videoId:data.videoId,
        currentTimeStamp,
        isPlaying: data.isPlaying,
        serverTime: data.serverTimeNow ?? null
    }

    store.dispatch(initVideo(videoDetails))
}

export function handleResetResponseFromServer(){

    store.dispatch(unsetVideo())
}


export function handlePlayFromServer(data?: any){

    store.dispatch(playVideo())
    
    // Update currentTimeStamp if provided by server
    if (data && data.currentTimeStamp !== undefined && data.currentTimeStamp !== null) {
        store.dispatch(updateCurrentTime({
            currentTimeStamp: data.currentTimeStamp,
            serverTime: data.serverTimeNow ?? null
        }))
    }
}

export function handlePauseFromServer(data?: any){

    store.dispatch(pauseVideo())
    
    // Update currentTimeStamp if provided by server
    if (data && data.currentTimeStamp !== undefined && data.currentTimeStamp !== null) {
        store.dispatch(updateCurrentTime({
            currentTimeStamp: data.currentTimeStamp,
            serverTime: data.serverTimeNow ?? null
        }))
    }
}

export function handleSeekFromServer(data:any){
    console.log("emitted: INTERNAL_SEEK_TO")

    const newTime =
        data && data.currentTimeStamp !== undefined && data.currentTimeStamp !== null
            ? data.currentTimeStamp
            : data?.seekTo;

    if (newTime !== undefined && newTime !== null) {
        store.dispatch(updateCurrentTime({
            currentTimeStamp: newTime,
            serverTime: data?.serverTimeNow ?? null
        }))
    }

    eventBus.emit("INTERNAL_SEEK_TO",data)
    
}

