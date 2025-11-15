import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    videoId:null,
    startAt:null,
    isPlaying:false,
    currentVideoTimeStamp:null,
    serverTime:null
}
const playerSlice = createSlice({
    name:'player',
    initialState,
    reducers:{
        initVideo(state, data){  }
    }
})

export const { } = playerSlice.actions;

export const playerReducer = playerSlice.reducer;