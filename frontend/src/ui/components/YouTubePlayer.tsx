"use client"
import { socketServiceInstance } from "@/utils/socket"
import { eventBus } from "@/utils/socket/service"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"

export default function YouTubePlayer({ videoId }: { videoId: string }) {
  const playerRef = useRef<any>(null)
  const player = useSelector((state:any)=> state.player)

  const onPlayClick=()=>{
    playerRef.current?.unMute();
    socketServiceInstance.play()
  }

  const onPauseClick=()=>{
    socketServiceInstance.pause()
  }

  const handleGetTime = () => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }

  const onSeekBackwardClick=()=>{
    const newTime = handleGetTime() - 10
    socketServiceInstance.seeked({seekTo: newTime })
  }

  const onSeekForwardClick=()=>{
    const newTime = handleGetTime() + 10 
    socketServiceInstance.seeked({seekTo: newTime })
  }
  

  useEffect(() => {
    if (typeof window === "undefined") return;
  
    // Create a function to initialize player
    const createPlayer = () => {
      if (!playerRef.current) {
        playerRef.current = new (window as any).YT.Player("yt-player", {
          height: "360",
          width: "640",
          videoId,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            disablekb: 0,
          },
          events: {
            onReady: (event: any) => {
              console.log("Player ready");
              event.target.mute(); // allow autoplay sync
            },
            onStateChange: (event: any) => console.log("State changed:", event.data),
          },
        });
      }
    };
  
    // Load script only once
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  
    // If API already loaded, create player immediately
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      // Otherwise assign callback
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }
  }, [videoId]);
  

  useEffect(()=>{
    console.log(player.isPlaying,"player.isPlaying")
    console.log(handleGetTime())
    if(player.isPlaying){
        playerRef.current?.playVideo()
    }else{
        playerRef.current?.pauseVideo()
    }
   
  },[player.isPlaying])

  useEffect(()=>{
    const handler = (data:any)=>{
        if( playerRef?.current){
            playerRef.current.seekTo(data.seekTo, true)
        }
    }
    eventBus.on("INTERNAL_SEEK_TO", handler)

    return ()=>{ eventBus.off("INTERNAL_SEEK_TO", handler)}
},[])

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* YouTube player container */}
      <div id="yt-player" className="rounded-md overflow-hidden"></div>

      <div className="flex gap-3">
        <button onClick={()=>onSeekBackwardClick()} className="px-3 py-1 bg-blue-500 text-white rounded">Seek → 10s</button>
       {
        player.isPlaying ?
            <button onClick={onPauseClick} className="px-3 py-1 bg-yellow-500 text-white rounded">Pause</button>
        :
             <button onClick={onPlayClick} className="px-3 py-1 bg-green-500 text-white rounded">Play</button>

       }
        <button onClick={()=>onSeekForwardClick()} className="px-3 py-1 bg-blue-500 text-white rounded">Seek → 10s</button>
        {/* <button onClick={handleGetTime} className="px-3 py-1 bg-gray-700 text-white rounded">Get Time</button> */}
      </div>

      <p className="text-black font-semibold">Current time: {} seconds</p>
    </div>
  )
}
