"use client"
import React from 'react'
import { videoInfoT } from "@/utils/interface"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
// import YouTube from "react-youtube"
import ReactPlayer from 'react-player'


export default function Player(){
    const [videoInfo, setVideoInfo] = useState<videoInfoT|null>(null)

    useEffect(()=>{
        //check if url set on socket.io or not
        // if(!no-video-set){
        //     redirect("/")
        // } else{
        //     //get which video's all details
        //     setVideoInfo()
        // }
    },[])
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