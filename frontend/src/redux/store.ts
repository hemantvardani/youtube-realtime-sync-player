import { configureStore } from "@reduxjs/toolkit";
import { playerReducer } from "./slices/player";
import { connectionReducer } from "./slices/connection";

export const store = configureStore({
    reducer:{
        player: playerReducer,
        connection: connectionReducer,
    }
})
