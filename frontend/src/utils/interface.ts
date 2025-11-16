
export interface serverVideoInfo {
    videoId:string|null,
    startedAt:number|null,
    isPlaying:Boolean,
}

export interface clientVideoInfo {
    videoId:string|null,
    isPlaying:Boolean,
    currentTimeStamp:number|null
}

export interface initResponseFromSocket {
    videoId:string|null,
    startedAt:number|null,
    isPlaying:Boolean,
    serverTimeNow: number|null
}
