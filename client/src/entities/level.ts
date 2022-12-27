import { Sprite, Container } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { resources, SKY_SIDE_X, SKY_SIDE_Y } from '../canvas';

export class Level {
    background: Container;

    constructor(public camera: Viewport) {
        const mountainSprite = new Sprite(resources.mountain);
        const skySprite = new Sprite(resources.sky);
        this.background = new Container();
        camera.addChild(this.background);

        this.background.scale = {x: 10, y: 10};
//        this.background.addChild(mountainSprite);
        this.background.addChild(skySprite);
        console.log('Camera world width', this.background.width);
        console.log('Camera world height', this.background.height);
    }

    destroy() {
        this.background.destroy();
    }
}
