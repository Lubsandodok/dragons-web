import { ISpritesheetData, ISpritesheetFrameData, Spritesheet, BaseTexture, Texture, Sprite } from 'pixi.js';

import dragonImage from 'url:../assets/dragon_green.png';
import skyImage from 'url:../assets/sky.png';
import mountainImage from 'url:../assets/mountain.png';

const DS = 240;

type GenerateFrameResultType = {[id: string]: ISpritesheetFrameData};

function generateFrames(name: string, y_still: number, x_step: number, frame_count: number): GenerateFrameResultType {
    let result: GenerateFrameResultType = {};
    for (let frame: number = 0, x: number = 0; frame < frame_count; ++frame, x += x_step) {
        const full_name = name + '_' + frame.toString();
        result[full_name] = {
            frame: {x: x, y: y_still, w: DS, h: DS},
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
        ...generateFrames('standing', 0, DS, 8),
        ...generateFrames('walking', DS, DS, 8),
    },
    meta: {scale: '1'},
    animations: {
        standing: generateAnimationNames('standing', 8),
        walking: generateAnimationNames('walking', 8),
    },
};

export const resources:
{
    dragon: Spritesheet,
    sky: Texture,
    mountain: Texture,
} = {
    dragon: null,
    sky: null,
    mountain: null,
};

export async function loadResources() {
    const dragonBaseTexture = BaseTexture.from(dragonImage);
    const sheet = new Spritesheet(
        dragonBaseTexture,
        dragonAtlasData,
    );
    await sheet.parse();
    resources.dragon = sheet;

    resources.sky = Texture.from(skyImage);
    resources.mountain = Texture.from(mountainImage);
}
