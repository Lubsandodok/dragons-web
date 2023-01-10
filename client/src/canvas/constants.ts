export const DRAGON_SIDE_X = 240;
export const DRAGON_SIDE_Y = 224;
export const FIREBALL_SIDE_X = 120;
export const FIREBALL_SIDE_Y = 120;
export const SKY_SIDE_X = 716;
export const SKY_SIDE_Y = 394;
export const WORLD_SIDE_X = SKY_SIDE_X * 10;
export const WORLD_SIDE_Y = SKY_SIDE_Y * 10;

export enum PlayerEvent {
    NONE = 'NONE',
    DRAGON_MOVE = 'DRAGON_MOVE',
    DRAGON_LEFT = 'DRAGON_LEFT',
    DRAGON_RIGHT = 'DRAGON_RIGHT',
    CREATE_FIREBALL = 'CREATE_FIREBALL',
}

export enum GameMethod {
    PLAYER_EVENT_WAS_SENT = 'PLAYER_EVENT_WAS_SENT',
    JOIN_ROOM = 'JOIN_ROOM',
    PLAYER_WAS_JOINED = 'PLAYER_WAS_JOINED',
    SEND_PLAYER_EVENT = 'SEND_PLAYER_EVENT',
    FINISH_ROOM = 'FINISH_ROOM',
}
