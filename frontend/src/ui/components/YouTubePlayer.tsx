"use client"
import { socketServiceInstance } from "@/utils/socket"
import { eventBus } from "@/utils/socket/service"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Button } from "../shadcn/components/ui/button"
import { PauseIcon, PlayIcon, RewindIcon, FastForwardIcon, VolumeOff, Volume2Icon } from "lucide-react"
import logger from "@/utils/logger"

const YTPlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
}

export default function YouTubePlayer({ videoId }: { videoId: string }) {
  const playerRef = useRef<any>(null)
  const player = useSelector((state:any)=> state.player)
  const playerStateRef = useRef(player)
  const [currentTime, setCurrentTime] = useState(0)
  // Suppress native state change events when we're syncing from server
  const suppressNativeEventsRef = useRef(false)
  const suppressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Use a static ID to avoid hydration mismatch - this is a client component so it's safe
  const containerId = 'yt-player-container'

  const releaseNativeEventSuppression = () => {
    suppressNativeEventsRef.current = false
    if (suppressTimeoutRef.current) {
      clearTimeout(suppressTimeoutRef.current)
      suppressTimeoutRef.current = null
    }
  }

  const suppressNativeEvents = (duration = 1500) => {
    suppressNativeEventsRef.current = true
    if (suppressTimeoutRef.current) {
      clearTimeout(suppressTimeoutRef.current)
    }
    suppressTimeoutRef.current = setTimeout(() => {
      suppressNativeEventsRef.current = false
      suppressTimeoutRef.current = null
    }, duration)
  }

  const callPlayerMethod = (method: 'playVideo' | 'pauseVideo' | 'seekTo' | 'unMute', args: any[] = []) => {
    const currentPlayer = playerRef.current as any
    if (!currentPlayer || typeof currentPlayer[method] !== 'function') {
      logger.warn(`Player method ${method} is not available`)
      return false
    }
    try {
      currentPlayer[method](...args)
      return true
    } catch (error) {
      logger.warn(`Error calling player method ${method}:`, error)
      return false
    }
  }

  const schedulePlayRetry = (delay: number) => {
    setTimeout(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getPlayerState === 'function'
      ) {
        const state = playerRef.current.getPlayerState()
        const isActuallyPlaying =
          state === YTPlayerState.PLAYING || state === YTPlayerState.BUFFERING
        if (!isActuallyPlaying && playerStateRef.current.isPlaying) {
          syncPlay()
        }
      }
    }, delay)
  }

  const syncPlay = (options?: { retryDelay?: number }) => {
    if (!playerRef.current) {
      logger.warn('Cannot play - player not ready')
      return false
    }
    suppressNativeEvents()
    const success = callPlayerMethod('playVideo')
    if (!success) {
      releaseNativeEventSuppression()
      return false
    }
    if (options?.retryDelay) {
      schedulePlayRetry(options.retryDelay)
    }
    return true
  }

  const syncPause = () => {
    if (!playerRef.current) {
      logger.warn('Cannot pause - player not ready')
      return false
    }
    suppressNativeEvents()
    const success = callPlayerMethod('pauseVideo')
    if (!success) {
      releaseNativeEventSuppression()
    }
    return success
  }

  const syncSeek = (time: number, allowSeekAhead = true) => {
    if (time === undefined || time === null || !playerRef.current) {
      return false
    }
    suppressNativeEvents()
    const success = callPlayerMethod('seekTo', [time, allowSeekAhead])
    if (!success) {
      releaseNativeEventSuppression()
    }
    return success
  }

  const onPlayClick=()=>{
    callPlayerMethod('unMute')
    const currentTime = handleGetTime();
    socketServiceInstance.play(currentTime)
  }

  const onPauseClick=()=>{
    const currentTime = handleGetTime();
    socketServiceInstance.pause(currentTime)
  }

  useEffect(()=>{
    playerStateRef.current = player;
  },[player])

  const handleGetTime = () => {
    // Check if player exists and has getCurrentTime method before calling
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      try {
        return playerRef.current.getCurrentTime() ?? 0;
      } catch (error) {
        logger.warn('Error getting current time:', error);
        return 0;
      }
    }
    return 0;
  }

  const onSeekBackwardClick=()=>{
    const newTime = Math.max(0, handleGetTime() - 10)
    socketServiceInstance.seeked({seekTo: newTime })
  }

  const onSeekForwardClick=()=>{
    const newTime = handleGetTime() + 10 
    socketServiceInstance.seeked({seekTo: newTime })
  }
  
  const handlePlayerStateChange = (event:any) => {
    // Ignore state changes if we're currently syncing from server
    if (suppressNativeEventsRef.current) {
      logger.log('Suppressing native state change event (syncing from server)');
      return;
    }

    const ytState = event.data;
    const currentPlayerState = playerStateRef.current;
    const actualTime = handleGetTime();

    if (ytState === YTPlayerState.PLAYING) {
      if (!currentPlayerState.isPlaying) {
        logger.log('Native play detected, syncing to server');
        socketServiceInstance.play(actualTime);
      }
    } else if (ytState === YTPlayerState.PAUSED) {
      if (currentPlayerState.isPlaying) {
        socketServiceInstance.pause(actualTime);
      } else {
        const expected = currentPlayerState.currentTimeStamp ?? 0;
        if (Math.abs(actualTime - expected) > 1) {
          socketServiceInstance.seeked({ seekTo: actualTime });
        }
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
  
    // Destroy existing player if videoId changes
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Create a function to initialize player
    const createPlayer = () => {
      // Ensure container exists before creating player
      const container = document.getElementById(containerId);
      if (!container || playerRef.current) return;

      playerRef.current = new (window as any).YT.Player(containerId, {
          height: "360",
          width: "640",
          videoId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            disablekb: 0,
          },
          events: {
            onReady: (event: any) => {
              logger.log("Player ready");
              event.target.mute(); // allow autoplay sync
              
              // Seek to initial position if available (Bug #7 fix)
              if (player.currentTimeStamp !== null && player.currentTimeStamp !== undefined) {
                if (!syncSeek(player.currentTimeStamp, true)) {
                  logger.warn('Error seeking on ready');
                }
              }
              
              // Sync player state with Redux state after a short delay to ensure player is ready
              setTimeout(() => {
                if (player.isPlaying) {
                  syncPlay({ retryDelay: 300 });
                } else {
                  syncPause();
                }
              }, 100);
            },
            onStateChange: (event: any) => {
              logger.log("State changed:", event.data);
              handlePlayerStateChange(event)
            },
          },
        });
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

    // Cleanup on unmount
    return () => {
      if (suppressTimeoutRef.current) {
        clearTimeout(suppressTimeoutRef.current);
        suppressTimeoutRef.current = null;
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);
  

  useEffect(()=>{
    // Only call handleGetTime if player is ready to avoid errors
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      logger.log('Redux isPlaying:', player.isPlaying, 'Current time:', handleGetTime())
    }
    
    // Check if player is ready and has the required methods before calling them
    if (!playerRef.current) {
      logger.log('Player not ready, skipping sync');
      return;
    }
    
    // Check actual player state
    let actualState = null;
    if (typeof playerRef.current.getPlayerState === 'function') {
      try {
        actualState = playerRef.current.getPlayerState();
        logger.log('Actual player state:', actualState, 'Redux isPlaying:', player.isPlaying);
      } catch (error) {
        // Ignore errors
      }
    }
    
    // YouTube Player API states: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 5 = CUED
    const isActuallyPlaying = actualState === 1 || actualState === 3;
    
    if (player.isPlaying) {
      if (!isActuallyPlaying) {
        logger.log('Redux says playing but player is not - forcing play');
        syncPlay({ retryDelay: 500 });
      } else {
          logger.log('Already playing, no action needed');
        }
    } else {
      if (isActuallyPlaying) {
        logger.log('Redux says paused but player is playing - forcing pause');
        syncPause();
      } else {
        logger.log('Already paused, no action needed');
      }
    }
   
  },[player.isPlaying])

  // Force sync player state - used when tab becomes visible or window gains focus
  const forceSyncPlayerState = () => {
    if (!playerRef.current || !player.videoId) return;
    
    // Check actual player state
    let actualState = null;
    if (typeof playerRef.current.getPlayerState === 'function') {
      try {
        actualState = playerRef.current.getPlayerState();
      } catch (error) {
        // Ignore errors
      }
    }
    
    // YouTube Player API states: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 5 = CUED
    const isActuallyPlaying = actualState === 1 || actualState === 3; // Playing or buffering
    
    if (player.isPlaying && !isActuallyPlaying) {
      logger.log('Force syncing: playing video');
      syncPlay({ retryDelay: 300 });
    } else if (!player.isPlaying && isActuallyPlaying) {
      logger.log('Force syncing: pausing video');
      syncPause();
    }
  };

  const toggleMute = ()=>{
    if(playerRef.current.isMuted()){
      playerRef.current.unMute()
    } else{
      playerRef.current.mute()
    }
  }

  // Handle tab visibility changes and window focus - sync player when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      playerRef.current.mute()

      if (!document.hidden && playerRef.current && player.videoId) {

          playerRef.current.unMute()
        
        logger.log('Tab became visible, syncing player state');
        // Small delay to ensure player is ready
        setTimeout(() => {
          forceSyncPlayerState();
        }, 100);
      }
    };

    const handleFocus = () => {
      if (playerRef.current && player.videoId) {
        logger.log('Window gained focus, syncing player state');
        setTimeout(() => {
          forceSyncPlayerState();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [player.isPlaying, player.videoId]);

  // Periodic sync check - ensures player stays in sync even if events are missed
  useEffect(() => {
    if (!player.videoId) return;
    
    const syncInterval = setInterval(() => {
      if (!document.hidden && playerRef.current) {
        forceSyncPlayerState();
        
        // Compute expected playback time based on last server sync
        let expectedTime = player.currentTimeStamp;
        if (
          player.isPlaying &&
          player.currentTimeStamp !== null &&
          player.currentTimeStamp !== undefined &&
          player.serverTime !== null &&
          player.serverTime !== undefined
        ) {
          const elapsedSinceServerUpdate = (Date.now() - player.serverTime) / 1000;
          expectedTime = player.currentTimeStamp + elapsedSinceServerUpdate;
        }
        
        // Check time drift and correct if needed
        if (expectedTime !== null && expectedTime !== undefined) {
          const actualTime = handleGetTime();
          const drift = Math.abs(actualTime - expectedTime);
          
          // If drift is more than 1 second, seek to correct position
          if (drift > 1 && player.currentTimeStamp !== null && player.currentTimeStamp !== undefined) {
            logger.log(`Time drift detected: ${drift.toFixed(2)}s. Syncing to ${(expectedTime).toFixed(2)}s`);
            if (!syncSeek(expectedTime, true)) {
              logger.warn('Error correcting time drift');
            }
          }
        }
      }
    }, 2000); // Check every 2 seconds when tab is visible

    return () => clearInterval(syncInterval);
  }, [player.isPlaying, player.videoId, player.currentTimeStamp, player.serverTime]);

  useEffect(()=>{
    const handler = (data:any)=>{
        if( playerRef?.current && typeof playerRef.current.seekTo === 'function'){
            if (!syncSeek(data.seekTo, true)) {
              logger.warn('Error seeking video via internal event');
            }
        }
    }
    eventBus.on("INTERNAL_SEEK_TO", handler)

    return ()=>{ eventBus.off("INTERNAL_SEEK_TO", handler)}
  },[])

  // Update current time display (Bug #8 fix)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if player is ready and has getCurrentTime method
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = handleGetTime();
        setCurrentTime(Math.floor(time));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  console.log(playerRef.current);
  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* YouTube player container */}
      <div id={containerId} className="rounded-md overflow-hidden"></div>
      <div  className="relative flex w-[fit-content] items-center justify-center" >
        <div className="flex items-center justify-center gap-3">
          <Button onClick={()=>onSeekBackwardClick()}  variant="outline" size="icon" aria-label="Go Back 10s" className="w-15" ><RewindIcon/></Button>
        {
          player.isPlaying ?
              <Button onClick={onPauseClick} variant="outline" className="w-15" ><PauseIcon/> </Button>
          :
              <Button onClick={onPlayClick} variant="outline" className="w-15"><PlayIcon/></Button>

        }
          <Button onClick={()=>onSeekForwardClick()}  variant="outline" size="icon" ria-label="Go forward 10s" className="w-15" ><FastForwardIcon/> </Button>
        </div>

          {
            playerRef?.current && player.isPlaying &&
            <Button className="absolute left-[-60] bg-transparent hover:bg-transparent" onClick={toggleMute}>
              { 
                playerRef.current.isMuted() ? < VolumeOff style={{color:"black"}}/> : <Volume2Icon style={{color:"black"}}/>
              }
            </Button>

          }
      </div>
      <p className="text-black font-semibold">Current time: {currentTime} seconds</p>
    </div>
  )
}
