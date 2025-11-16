export function extractVideoId(url:string):{videoId:string|null,skipBy:number} {
    console.log(url,"url")
    
    if(url.startsWith("https://www.youtube.com/watch")){
        const urlParams = new URL(url).searchParams

        return {
            videoId: urlParams.get("v") ?? null,
            skipBy: Number(urlParams.get("t")?.replace("s","")) ?? 0
        }
    }

    if(url.startsWith("https://youtu.be/")){
        const urlParams = new URL(url).searchParams
        const videoId = urlParams.get("v")
        return {
            videoId, 
            skipBy:  0
        }
    }

    return {
        videoId:null,
        skipBy:0
    }
}
