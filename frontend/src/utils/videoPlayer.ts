function extractVideoId(url:string):{videoId:string|null,skipBy:number} {

    if(url.startsWith("https://www.youtube.com/watch/")){
        const urlParams = new URLSearchParams(url)

        return {
            videoId: urlParams.get("v") ?? null,
            skipBy: Number(urlParams.get("t")?.replace("s","")) ?? 0
        }
    }

    if(url.startsWith("https://youtu.be/")){
        const videoId = url.replace("https://youtu.be/","")
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
