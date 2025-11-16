"use client"
import YouTubePlayer from "@/ui/components/YouTubePlayer"
import { Button } from "@/ui/shadcn/components/ui/button"
import { ButtonGroup } from "@/ui/shadcn/components/ui/button-group"
import { socketServiceInstance } from "@/utils/socket"
import { eventBus } from "@/utils/socket/service"
import { ArrowLeftIcon } from "lucide-react"
// import { vie } from "@/utils/interface"
import { redirect } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import ReactPlayer from 'react-player'
import { useSelector } from "react-redux"
// import { socket } from '../page'

export default function Player(){
    const player = useSelector((state:any)=> state.player)
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const playerRef = useRef<any>(null)

    const handleBack =()=>{
        console.log("go back clicked")
        socketServiceInstance.resetVideo()
    }
    
    useEffect(()=>{
        const handler = (data:any)=>{
            if( playerRef?.current){
                playerRef.current.seekTo(data.seekTo)
            }
        }
        eventBus.on("INTERNAL_SEEK_TO", handler)

        return ()=>{ eventBus.off("INTERNAL_SEEK_TO", handler)}
    },[])

    useEffect(()=>{
        if(!player.videoId){
            redirect("/")
        }else{
            setTimeout(()=>{
                setShowVideoPlayer(true)
            },2000)
        }
    },[player.videoId])
    
    return <>
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans">
                <div className="flex justify-center w-[60%] m-10">
                    <ButtonGroup className="w-[100%]" >
                        <Button variant="outline" size="icon" aria-label="Go Back" className="w-30" onClick={handleBack}>
                            <ArrowLeftIcon /> Go Back
                        </Button>
                    </ButtonGroup>
                </div>
                <div className="">
                                       
                    {player.videoId && showVideoPlayer && <YouTubePlayer videoId={player.videoId}/>}
                   
                </div>
                <div>

                </div>
        </div>  
    </>
}