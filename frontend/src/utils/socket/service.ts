import { initResponseFromSocket } from "../interface";
import { initVideo, pauseVideo, playVideo, unsetVideo } from "@/redux/slices/player";
import { store } from "@/redux/store";

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
