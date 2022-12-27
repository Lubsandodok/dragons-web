import { Application } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { World } from '../entities';
import { Controls } from '../controls';

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
        this.app.stage.addChild(this.camera);
        this.camera
            .drag()
            .wheel();

        this.world = new World(this.camera, controls);
    }
}
