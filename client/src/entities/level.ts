import { Sprite, Container } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { resources, WORLD_SIDE_X, WORLD_SIDE_Y } from '../canvas';

export class Level {
    background: Container;
    borderLeft: Container;

    constructor(public camera: Viewport, public physics: Rapier.World) {      
        this.borderLeft = new Container();
        for (let y = 0; y < WORLD_SIDE_Y; y += resources.ground.height) {
            const ground = new Sprite(resources.ground);
            ground.x = 0;
            ground.y = y;
            this.borderLeft.addChild(ground);
        }

        const skySprite = new Sprite(resources.sky);
        skySprite.scale = {x: 10, y: 10};

        this.background = new Container();

        // this.background.scale = {x: 10, y: 10};
        this.background.addChild(skySprite);
        this.background.addChild(this.borderLeft);

        camera.addChild(this.background);

        console.log('Camera world width', this.background.width);
        console.log('Camera world height', this.background.height);
    }

    destroy() {
        this.background.destroy();
    }
}
