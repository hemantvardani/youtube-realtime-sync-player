import mitt from "mitt";
import { initResponseFromSocket } from "../interface";
import { initVideo, pauseVideo, playVideo, unsetVideo } from "@/redux/slices/player";
import { store } from "@/redux/store";

export const eventBus= mitt()

export function handleInitResponseFromServer(data:initResponseFromSocket){
      
    if(!data.videoId){
        store.dispatch(unsetVideo())
        return;
    }

    // assuming here startedAt and serverTimeNow will be never null (in future to improve)
    const currentTimeStamp = (data.serverTimeNow! - data.startedAt!)/1000;

    const videoDetails = {
        videoId:data.videoId,
        currentTimeStamp,
        isPlaying: data.isPlaying
    }

    store.dispatch(initVideo(videoDetails))
}

export function handleResetResponseFromServer(){

    store.dispatch(unsetVideo())
}


export function handlePlayFromServer(){

    store.dispatch(playVideo())
}

export function handlePauseFromServer(){

    store.dispatch(pauseVideo())
}

export function handleSeekFromServer(data:any){
    console.log("emitted: INTERNAL_SEEK_TO")
    eventBus.emit("INTERNAL_SEEK_TO",data)
    
}

