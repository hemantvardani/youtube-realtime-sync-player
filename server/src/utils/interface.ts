
export interface serverVideoInfo {
    videoId:string|null,
    startedAt:number|null,
    isPlaying:Boolean,
    currentPosition:number
}

export interface clientVideoInfo {
    videoId:string|null,
    isPlaying:Boolean,
    startedAt:number
}