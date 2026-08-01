import { io, Socket } from "socket.io-client";
import { clientToServerEvent, serverToClientEvent } from "../enum";
import { initResponseFromSocket } from "../interface";
import {
  handleInitResponseFromServer,
  handlePauseFromServer,
  handlePlayFromServer,
  handleResetResponseFromServer,
  handleSeekFromServer,
} from "./service";
import logger from "@/utils/logger";
import { store } from "@/redux/store";
import {
  MAX_ATTEMPTS,
  setConnected,
  setConnecting,
  setFailed,
  setReconnecting,
} from "@/redux/slices/connection";

export class SocketService {
  private socket: Socket;

  constructor() {
    const socketUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:4000";

    this.socket = io(socketUrl, {
      withCredentials: false,
      upgrade: true,
      rememberUpgrade: false,
      reconnection: true,
      reconnectionAttempts: MAX_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    this.defineListeners();
  }

  private defineListeners() {
    this.socket.on("connect", () => {
      logger.log("connected");
      store.dispatch(setConnected());
    });

    this.socket.on("disconnect", () => {
      logger.log("disconnected");
      // Manager will start reconnecting; status updates via reconnect_attempt
      store.dispatch(setReconnecting(0));
    });

    this.socket.on("connect_error", () => {
      logger.log("connect_error");
      const { status, attempt } = store.getState().connection;
      // First fail happens before reconnect_attempt; keep banner in retry state
      if (status === "connected" || status === "failed") return;
      store.dispatch(setReconnecting(attempt || 1));
    });

    this.socket.io.on("reconnect_attempt", (attempt: number) => {
      logger.log("reconnect_attempt", attempt);
      store.dispatch(setReconnecting(attempt));
    });

    this.socket.io.on("reconnect", (attempt: number) => {
      logger.log("reconnect", attempt);
      store.dispatch(setConnected());
    });

    this.socket.io.on("reconnect_failed", () => {
      logger.log("reconnect_failed");
      store.dispatch(setFailed());
    });

    this.socket.on(serverToClientEvent.RESET, () => {
      logger.log("Event received", serverToClientEvent.RESET);
      handleResetResponseFromServer();
    });

    this.socket.on(serverToClientEvent.INIT, (data: initResponseFromSocket) => {
      logger.log("Event received", serverToClientEvent.INIT);
      logger.log("and data is ", data);
      handleInitResponseFromServer(data);
    });

    this.socket.on(serverToClientEvent.PLAY, (data) => {
      logger.log("Event received", serverToClientEvent.PLAY, data);
      handlePlayFromServer(data);
    });

    this.socket.on(serverToClientEvent.PAUSE, (data) => {
      logger.log("Event received", serverToClientEvent.PAUSE, data);
      handlePauseFromServer(data);
    });

    this.socket.on(serverToClientEvent.SEEK, (data) => {
      logger.log("Event received", serverToClientEvent.SEEK);
      handleSeekFromServer(data);
    });
  }

  /** After reconnect_failed, call this to start a fresh attempt cycle. */
  retryConnect() {
    store.dispatch(setConnecting());
    this.socket.connect();
  }

  get isConnected() {
    return this.socket.connected;
  }

  initVideo({ videoId }: { videoId: string }) {
    this.socket.emit(clientToServerEvent.INIT, { videoId });
  }

  resetVideo() {
    logger.log("resetVideo");
    this.socket.emit(clientToServerEvent.RESET);
  }

  play(currentTime?: number) {
    logger.log("play", currentTime);
    this.socket.emit(clientToServerEvent.PLAY, {
      currentTime: currentTime ?? 0,
    });
  }

  pause(currentTime?: number) {
    logger.log("pause", currentTime);
    this.socket.emit(clientToServerEvent.PAUSE, {
      currentTime: currentTime ?? 0,
    });
  }

  seeked(data: { seekTo: number }) {
    logger.log("seeked", data);
    this.socket.emit(clientToServerEvent.SEEK, data);
  }

  ended() {
    logger.log("ended");
    this.socket.emit(clientToServerEvent.ENDED);
  }
}

export const socketServiceInstance = new SocketService();
