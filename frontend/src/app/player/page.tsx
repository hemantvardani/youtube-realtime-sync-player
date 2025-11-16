"use client"
import { Button } from "@/ui/shadcn/components/ui/button"
import { ButtonGroup } from "@/ui/shadcn/components/ui/button-group"
import { socketServiceInstance } from "@/utils/socket"
import { ArrowLeftIcon } from "lucide-react"
// import { vie } from "@/utils/interface"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import ReactPlayer from 'react-player'
import { useSelector } from "react-redux"
// import { socket } from '../page'

export default function Player(){
    const player = useSelector((state:any)=> state.player)

    const handleBack =()=>{
        console.log("go back clicked")
        socketServiceInstance.resetVideo()
    }

    const handlePlay=()=>{
        console.log("handlePlay")
        socketServiceInstance.play()
    }

    const handlePause=()=>{
        console.log("handlePause")
        socketServiceInstance.pause()
    }

    // const handleSeeked=()=>{
    //     console.log("handleSeeked")
    //     socketServiceInstance.seeked()
    // }
    

    useEffect(()=>{
        if(!player.videoId){
            redirect("/")
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
                    <ReactPlayer src={`https://www.youtube.com/watch?v=${player.videoId}`} 
                    controls={true} 
                    height={360}
                    width={640}
                    playing={player.isPlaying}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    // onSeeked={handleSeeked}
                     />
                </div>
                <div>

                </div>
        </div>  
    </>
}