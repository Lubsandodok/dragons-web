import { Sprite, Container } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { resources } from '../canvas';

export class Level {
    background: Container;

    constructor(public camera: Viewport) {
        const mountainSprite = new Sprite(resources.mountain);
        const skySprite = new Sprite(resources.sky);
        this.background = new Container();
        camera.addChild(this.background);

        this.background.scale = {x: 5, y: 5};
        this.background
        this.background.addChild(mountainSprite);
        this.background.addChild(skySprite);
        this.background.width = camera.worldWidth;
        this.background.height = camera.worldHeight;
    }

    destroy() {
        this.background.destroy();
    }
}
