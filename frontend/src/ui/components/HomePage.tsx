"use client"

import { Button } from "../shadcn/components/ui/button";
import { ButtonGroup } from "../shadcn/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "../shadcn/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../shadcn/components/ui/tooltip";
import { redirect } from "next/navigation";
import { AlertCircleIcon, ArrowRightIcon, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../shadcn/components/ui/alert";
import { socketServiceInstance } from "@/utils/socket";
import { useSelector } from "react-redux";
 
export default function () {

  const [url, setUrl] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false);
  const player = useSelector((state:any) => state.player)

  const onSubmit =()=>{
    setShowError(false)
    const {videoId, skipBy} = extractVideoId(url)

    if(!videoId) {
      setShowError(true);
      return;
    }

    initializeVideoPlayer(videoId)
  }

  const initializeVideoPlayer =(videoId:string)=>{
    socketServiceInstance.pushUpdates({action:"init", data: {videoId }})
  }

  useEffect(()=>{
    if(player.videoId) redirect('\player')
  },[player.videoId])
  
  useEffect(()=>{
    socketServiceInstance.requestInfo();
  },[])

  return (
    <>
    <div>
      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput placeholder="example.com" className="!pl-1" onSubmit={()=>onSubmit}/>
          <InputGroupAddon onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setUrl("https://" + e.target.value)}}>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton className="rounded-full" size="icon-xs">
                  <Info/>
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Enter the youtube url</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <ButtonGroup>
          <Button aria-label="Send" size="icon" variant="outline"   onClick={()=>onSubmit()}>
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </div>
    </div>
    <div>
        {
            showError &&
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Unable to process your video.</AlertTitle>
                    <AlertDescription>
                    <p>Please re-verify your video url and try again.</p>
                    </AlertDescription>
                </Alert>

        }
    </div>
    </>
  );
}
