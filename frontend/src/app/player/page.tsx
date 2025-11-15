"use client"
// import { vie } from "@/utils/interface"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import ReactPlayer from 'react-player'
// import { socket } from '../page'

export default function Player(){
    // const [videoInfo,  setVideoInfo] = useState<videoInfoT|null>(null)

    // useEffect(()=>{
    //     socket.emit("info");

    //     socket.on("info",(data:any)=>{
    //         if(!data.videoId){
    //             redirect('/')
    //             return;
    //         }
    //         setVideoInfo(data)
    //     })

    //     socket.on("update",(data:any)=>{
    //         if(!data.videoId){
    //             redirect('/')
    //             return;
    //         }
    //         setVideoInfo(prev =>({...prev, ...data}))
    //     })

    //     return ()=>{ socket.off('info')}

    // },[])
    return <>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
            { 
            // videoInfo && 

            // <div className="player">
            //     <YouTube  
            //             videoId={"JJr-8pY7mjc"}                  // defaults -> ''
            //             // videoId={videoInfo.videoId }                  // defaults -> ''
            //             id={"youtube-embed"}                       // defaults -> ''
            //             className={""}                // defaults -> ''
            //             iframeClassName={""}          // defaults -> ''
            //             style={{}}                    // defaults -> {}
            //             title={"Watch Party Player"}                    // defaults -> ''
            //             // loading={}                  // defaults -> undefined
            //             // opts={obj}                        // defaults -> {}
            //             // onReady={func}                    // defaults -> noop
            //             // onPlay={func}                     // defaults -> noop
            //             // onPause={func}                    // defaults -> noop
            //             // onEnd={func}                      // defaults -> noop
            //             // onError={func}                    // defaults -> noop
            //             // onStateChange={func}              // defaults -> noop
            //             // onPlaybackRateChange={func}       // defaults -> noop
            //             // onPlaybackQualityChange={func}    // defaults -> noop
            //             />
            // </div>

            <ReactPlayer src='https://www.youtube.com/watch?v=JJr-8pY7mjc' controls={true} />


            }
        </div>  
    </>
}