import { Application } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { World } from '../entities';
import { Controls } from '../controls';
import { WORLD_SIDE_X, WORLD_SIDE_Y } from './constants';

export class Canvas {
    app: Application;
    camera: Viewport;
    world: World;

    constructor(view: HTMLCanvasElement, controls: Controls) {
        this.app = new Application({
            view,
            resizeTo: window,
            backgroundColor: 0x777777,
        });
        this.camera = new Viewport({
            screenHeight: window.innerHeight,
            screenWidth: window.innerWidth,

            interaction: this.app.renderer.plugins.interaction,
        });
        this.camera.moveCenter(WORLD_SIDE_X / 2, WORLD_SIDE_Y / 2);
        this.camera.clamp({
            left: 0,
            right: WORLD_SIDE_X,
            top: 0,
            bottom: WORLD_SIDE_Y,
            direction: 'all',
            underflow: 'center',
        });
        this.app.stage.addChild(this.camera);
        this.camera
            .drag()
            .wheel();

        this.world = new World(this.camera, controls);
    }
}
