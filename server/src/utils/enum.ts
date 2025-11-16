export enum clientToServerEvent {
    INIT= "INIT", // some one has provided yt link , and ask server to initailize it
    UPDATE= "UPDATE",
    RESET= "RESET",
    PLAY="PLAY",
    PAUSE="PAUSE",
    SEEK="SEEK"

}

export enum serverToClientEvent {
    INIT= "INIT", // yt is already stated, so asking client to start
    UPDATE= "UPDATE",
    RESET= "RESET",
    PLAY="PLAY",
    PAUSE="PAUSE",
    SEEK="SEEK"


}