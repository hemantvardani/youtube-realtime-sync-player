import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

type ConnectionState = {
  status: ConnectionStatus;
  attempt: number;
  maxAttempts: number;
};

const MAX_ATTEMPTS = 25;

const initialState: ConnectionState = {
  status: "connecting",
  attempt: 0,
  maxAttempts: MAX_ATTEMPTS,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConnecting(state) {
      state.status = "connecting";
      state.attempt = 0;
    },
    setConnected(state) {
      state.status = "connected";
      state.attempt = 0;
    },
    setReconnecting(state, action: PayloadAction<number>) {
      state.status = "reconnecting";
      state.attempt = action.payload;
    },
    setFailed(state) {
      state.status = "failed";
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setReconnecting,
  setFailed,
} = connectionSlice.actions;

export const connectionReducer = connectionSlice.reducer;
export { MAX_ATTEMPTS };
