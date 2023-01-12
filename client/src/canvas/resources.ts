import { ISpritesheetData, ISpritesheetFrameData, Spritesheet, BaseTexture, Texture } from 'pixi.js';

import dragonGreenImage from 'url:../assets/dragon_green.png';
import dragonBlueImage from 'url:../assets/dragon_blue.png';
import skyImage from 'url:../assets/sky.png';
import mountainImage from 'url:../assets/mountain.png';
import fireballsImage from 'url:../assets/origin.png';

import { DRAGON_SIDE_X, DRAGON_SIDE_Y, FIREBALL_SIDE_X, FIREBALL_SIDE_Y } from './constants';

type GenerateFrameResultType = {[id: string]: ISpritesheetFrameData};

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

export const resources:
{
    dragonGreen: Spritesheet,
    dragonBlue: Spritesheet,
    sky: Texture,
    mountain: Texture,
    fireball: Spritesheet,
} = {
    dragonGreen: null,
    dragonBlue: null,
    sky: null,
    mountain: null,
    fireball: null,
};

export async function loadResources() {
    const dragonGreenBaseTexture = BaseTexture.from(dragonGreenImage);
    const dragonGreenSheet = new Spritesheet(
        dragonGreenBaseTexture,
        dragonAtlasData,
    );
    await dragonGreenSheet.parse();
    resources.dragonGreen = dragonGreenSheet;

    const dragonBlueBaseTexture = BaseTexture.from(dragonBlueImage);
    const dragonBlueSheet = new Spritesheet(
        dragonBlueBaseTexture,
        dragonAtlasData,
    );
    await dragonBlueSheet.parse();
    resources.dragonBlue = dragonBlueSheet;

    const fireballBaseTexture = BaseTexture.from(fireballsImage);
    const fireballSheet = new Spritesheet(
        fireballBaseTexture,
        fireballAtlasData,
    );
    await fireballSheet.parse();
    resources.fireball = fireballSheet;

    resources.sky = Texture.from(skyImage);
    resources.mountain = Texture.from(mountainImage);
}
