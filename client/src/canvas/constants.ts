export const DRAGON_SIDE_X = 240;
export const DRAGON_SIDE_Y = 224;
export const FIREBALL_SIDE_X = 120;
export const FIREBALL_SIDE_Y = 100;
export const SKY_SIDE_X = 1920;
export const SKY_SIDE_Y = 1080;
export const WORLD_SIDE_X = SKY_SIDE_X * 1;
export const WORLD_SIDE_Y = SKY_SIDE_Y * 1;
export const GROUND_WIDTH = 50;
export const LIVES_AT_START = 3;

export enum PlayerEvent {
    NONE = 'NONE',
    DRAGON_MOVE = 'DRAGON_MOVE',
    DRAGON_LEFT = 'DRAGON_LEFT',
    DRAGON_RIGHT = 'DRAGON_RIGHT',
    DRAGON_TURN_BACK = 'DRAGON_TURN_BACK',
    CREATE_FIREBALL = 'CREATE_FIREBALL',
};

export enum PlayerStartingPosition {
    LEFT_HIGH = 0,
    RIGHT_HIGH = 1,
    LEFT_LOW = 2,
    RIGHT_LOW = 3,
};

export enum GameMethod {
    PLAYER_EVENT_WAS_SENT = 'PLAYER_EVENT_WAS_SENT',
    JOIN_ROOM = 'JOIN_ROOM',
    PLAYER_WAS_JOINED = 'PLAYER_WAS_JOINED',
    SEND_PLAYER_EVENT = 'SEND_PLAYER_EVENT',
    FINISH_ROOM = 'FINISH_ROOM',
};

export type PanelState = {
    playerLives: number,
};
