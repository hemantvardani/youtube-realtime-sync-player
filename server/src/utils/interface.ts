
export interface serverVideoInfo {
    videoId:string|null,
    startedAt:number|null,
    isPlaying:Boolean,
}

export interface clientVideoInfo {
    videoId:string|null,
    isPlaying:Boolean,
    startedAt:number
}