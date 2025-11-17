export function extractVideoId(url:string):{videoId:string|null,skipBy:number} {
    console.log(url,"url")
    
    try {
        // Handle www.youtube.com/watch format
        if(url.includes("youtube.com/watch")){
            const urlObj = new URL(url)
            const urlParams = urlObj.searchParams

            return {
                videoId: urlParams.get("v") ?? null,
                skipBy: Number(urlParams.get("t")?.replace("s","")) || 0
            }
        }

        // Handle youtu.be format - video ID is in the pathname
        if(url.includes("youtu.be/")){
            const urlObj = new URL(url)
            // Extract video ID from pathname (e.g., /dQw4w9WgXcQ)
            const pathname = urlObj.pathname
            const videoId = pathname.split('/').filter(Boolean)[0] || null
            const urlParams = urlObj.searchParams
            // Extract skipBy from t parameter if present
            const skipBy = Number(urlParams.get("t")?.replace("s","")) || 0
            
            return {
                videoId, 
                skipBy
            }
        }

        // Handle youtube.com/embed format
        if(url.includes("youtube.com/embed/")){
            const urlObj = new URL(url)
            const pathname = urlObj.pathname
            const videoId = pathname.split('/').filter(Boolean)[1] || null
            const urlParams = urlObj.searchParams
            const skipBy = Number(urlParams.get("start")) || 0
            
            return {
                videoId,
                skipBy
            }
        }
    } catch (error) {
        console.error("Error parsing URL:", error)
    }

    return {
        videoId:null,
        skipBy:0
    }
}
