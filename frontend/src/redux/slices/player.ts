import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    videoId:null,
    startAt:null,
    isPlaying:false,
    currentTimeStamp:null,
    serverTime:null
}
const playerSlice = createSlice({
    name:'player',
    initialState,
    reducers:{
        initVideo(state, action){ 
            state.videoId=action.payload.videoId;
            state.currentTimeStamp =  action.payload.currentTimeStamp;
            state.isPlaying= action.payload.isPlaying;
            state.serverTime = action.payload.serverTime ?? null;
         },
        unsetVideo(state){ 
            state.videoId=null;
            state.startAt=null
            state.isPlaying=false
            state.currentTimeStamp=null
            state.serverTime=null
         },
        playVideo(state){
            state.isPlaying=true
        },
        pauseVideo(state){
            state.isPlaying=false
        },
        updateCurrentTime(state, action){
            state.currentTimeStamp = action.payload.currentTimeStamp ?? state.currentTimeStamp;
            if (action.payload.serverTime !== undefined) {
                state.serverTime = action.payload.serverTime;
            }
        }
    }
})

export const { initVideo , unsetVideo , playVideo, pauseVideo, updateCurrentTime} = playerSlice.actions;

export const playerReducer = playerSlice.reducer;


