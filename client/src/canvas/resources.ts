import { ISpritesheetData, ISpritesheetFrameData, Spritesheet, BaseTexture, Texture, Rectangle } from 'pixi.js';

import dragonGreenImage from 'url:../assets/dragon_green.png';
import dragonBlueImage from 'url:../assets/dragon_blue.png';
import dragonRedImage from 'url:../assets/dragon_red.png';
import dragonBlackImage from 'url:../assets/dragon_night.png';
import skyImage from 'url:../assets/sky.png';
import fireballsImage from 'url:../assets/origin.png';
import groundImage from 'url:../assets/ground_tileset.png';

import { DRAGON_SIDE_X, DRAGON_SIDE_Y, FIREBALL_SIDE_X, FIREBALL_SIDE_Y } from './constants';

type GenerateFrameResultType = {[id: string]: ISpritesheetFrameData};

type ResourcesSpritesheet = {
    dragonGreen: Spritesheet,
    dragonBlue: Spritesheet,
    dragonRed: Spritesheet,
    dragonBlack: Spritesheet,
    fireball: Spritesheet,
};

type ResourcesTexture = {
    sky: Texture,
    groundBorderLight: Texture,
    groundBorderDark: Texture,
    ground: Texture,
};

type Resources = ResourcesSpritesheet & ResourcesTexture;

function generateFrames(
    name: string,
    y_still: number,
    x_step: number,
    frame_count: number,
    width: number = DRAGON_SIDE_X,
    height: number = DRAGON_SIDE_Y,
): GenerateFrameResultType {
    let result: GenerateFrameResultType = {};
    for (let frame: number = 0, x: number = 0; frame < frame_count; ++frame, x += x_step) {
        const full_name = name + '_' + frame.toString();
        result[full_name] = {
            frame: {x: x, y: y_still, w: width, h: height},
        };
    }
    return result;
}

function generateAnimationNames(name: string, frame_count: number): string[] {
    let result: string[] = [];
    for (let frame = 0; frame < frame_count; ++frame) {
        result.push(name + '_' + frame.toString());
    }
    return result;
}

async function addDragonToResources(resourceName: keyof ResourcesSpritesheet, image: HTMLImageElement) {
    const dragonBaseTexture = BaseTexture.from(image);
    const dragonSheet = new Spritesheet(
        dragonBaseTexture,
        dragonAtlasData,
    );
    await dragonSheet.parse();
    resources[resourceName] = dragonSheet;
}

const dragonAtlasData: ISpritesheetData = {
    frames: {
        ...generateFrames('standing', 0, DRAGON_SIDE_X, 8),
        ...generateFrames('walking', DRAGON_SIDE_Y * 1, DRAGON_SIDE_X, 8),
        ...generateFrames('flying', DRAGON_SIDE_Y * 8, DRAGON_SIDE_X, 8),
    },
    meta: {scale: '1'},
    animations: {
        standing: generateAnimationNames('standing', 8),
        walking: generateAnimationNames('walking', 8),
        flying: generateAnimationNames('flying', 8),
    },
};

const fireballAtlasData: ISpritesheetData = {
    frames: {
        ...generateFrames('shot', 775, FIREBALL_SIDE_X, 6, FIREBALL_SIDE_X, FIREBALL_SIDE_Y),
    },
    meta: {scale: '1'},
    animations: {
        shot: generateAnimationNames('shot', 6),
    },
};

export const resources: Resources = {
    dragonGreen: null,
    dragonBlue: null,
    dragonRed: null,
    dragonBlack: null,
    sky: null,
    fireball: null,
    groundBorderLight: null,
    groundBorderDark: null,
    ground: null,
};

export async function loadResources() {
    await addDragonToResources('dragonGreen', dragonGreenImage);
    await addDragonToResources('dragonBlue', dragonBlueImage);
    await addDragonToResources('dragonRed', dragonRedImage);
    await addDragonToResources('dragonBlack', dragonBlackImage);

    const fireballBaseTexture = BaseTexture.from(fireballsImage);
    const fireballSheet = new Spritesheet(
        fireballBaseTexture,
        fireballAtlasData,
    );
    await fireballSheet.parse();
    resources.fireball = fireballSheet;

    resources.sky = Texture.from(skyImage);

    const groundBaseTexture = BaseTexture.from(groundImage);
    resources.groundBorderLight = new Texture(groundBaseTexture, new Rectangle(145, 0, 15, 64));
    resources.groundBorderDark = new Texture(groundBaseTexture, new Rectangle(175, 0, 15, 64));
    resources.ground = new Texture(groundBaseTexture, new Rectangle(0, 160, 15, 15));
}
