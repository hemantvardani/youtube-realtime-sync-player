import { configureStore } from "@reduxjs/toolkit";
import { playerReducer } from "./slices/player";

export const store = configureStore({
    reducer:{
        player: playerReducer
    }
})