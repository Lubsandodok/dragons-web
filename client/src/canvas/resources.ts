import { ISpritesheetData, ISpritesheetFrameData, Spritesheet, BaseTexture, Texture, Sprite } from 'pixi.js';

import dragonGreenImage from 'url:../assets/dragon_green.png';
import dragonBlueImage from 'url:../assets/dragon_blue.png';
import skyImage from 'url:../assets/sky.png';
import mountainImage from 'url:../assets/mountain.png';

const DragonXStep = 240;
const DragonYStep = 224;

type GenerateFrameResultType = {[id: string]: ISpritesheetFrameData};

function generateFrames(name: string, y_still: number, x_step: number, frame_count: number): GenerateFrameResultType {
    let result: GenerateFrameResultType = {};
    for (let frame: number = 0, x: number = 0; frame < frame_count; ++frame, x += x_step) {
        const full_name = name + '_' + frame.toString();
        result[full_name] = {
            frame: {x: x, y: y_still, w: DragonXStep, h: DragonYStep},
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
        ...generateFrames('standing', 0, DragonXStep, 8),
        ...generateFrames('walking', DragonYStep * 1, DragonXStep, 8),
        ...generateFrames('flying', DragonYStep * 8, DragonXStep, 8),
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
