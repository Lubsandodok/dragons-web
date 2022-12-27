import { ISpritesheetData, ISpritesheetFrameData, Spritesheet, BaseTexture, Texture } from 'pixi.js';

import dragonGreenImage from 'url:../assets/dragon_green.png';
import dragonBlueImage from 'url:../assets/dragon_blue.png';
import skyImage from 'url:../assets/sky.png';
import mountainImage from 'url:../assets/mountain.png';

import { DRAGON_SIDE_X, DRAGON_SIDE_Y } from './constants';

type GenerateFrameResultType = {[id: string]: ISpritesheetFrameData};

function generateFrames(name: string, y_still: number, x_step: number, frame_count: number): GenerateFrameResultType {
    let result: GenerateFrameResultType = {};
    for (let frame: number = 0, x: number = 0; frame < frame_count; ++frame, x += x_step) {
        const full_name = name + '_' + frame.toString();
        result[full_name] = {
            frame: {x: x, y: y_still, w: DRAGON_SIDE_X, h: DRAGON_SIDE_Y},
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

export const resources:
{
    dragonGreen: Spritesheet,
    dragonBlue: Spritesheet,
    sky: Texture,
    mountain: Texture,
} = {
    dragonGreen: null,
    dragonBlue: null,
    sky: null,
    mountain: null,
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

    resources.sky = Texture.from(skyImage);
    resources.mountain = Texture.from(mountainImage);
}
