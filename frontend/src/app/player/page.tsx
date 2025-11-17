"use client"
import YouTubePlayer from "@/ui/components/YouTubePlayer"
import { Button } from "@/ui/shadcn/components/ui/button"
import { ButtonGroup } from "@/ui/shadcn/components/ui/button-group"
import { socketServiceInstance } from "@/utils/socket"
import { ArrowLeftIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { useSelector } from "react-redux"

export default function Player(){
    const player = useSelector((state:any)=> state.player)

    const handleBack =()=>{
        console.log("go back clicked")
        socketServiceInstance.resetVideo()
    }

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
                    {player.videoId && <YouTubePlayer videoId={player.videoId}/>}
                </div>
        </div>  
    </>
}