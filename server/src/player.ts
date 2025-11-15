import type { serverVideoInfo } from "./utils/interface.js";

const videoInfo : serverVideoInfo= {
    videoId:null,
    startedAt:null,
    isPlaying:false
}


export function getServerCurrentInfo(){
    return {
        videoId: videoInfo.videoId,
        startedAt: videoInfo.startedAt,
        isPlaying: videoInfo.isPlaying,
    }
}