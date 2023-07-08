import { Application, Sprite, BLEND_MODES } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Stage, Layer } from "@pixi/layers";

import { World } from "../entities";
import { Controls } from "../controls";
import { WORLD_SIDE_X, WORLD_SIDE_Y } from "./constants";

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
    this.app.stage = new Stage();
    this.app.stage.addChild(this.camera);
    this.camera.drag().wheel();
    const lighting = new Layer();
    lighting.on("display", (element) => {
      element.blendMode = BLEND_MODES.ADD;
    });
    lighting.useRenderTexture = true;
    lighting.clearColor = [0.5, 0.5, 0.5, 1];
    this.app.stage.addChild(lighting);

    const lightingSprite = new Sprite(lighting.getRenderTexture());
    lightingSprite.blendMode = BLEND_MODES.MULTIPLY;
    this.app.stage.addChild(lightingSprite);

    this.world = new World({ camera: this.camera, lighting, controls });
  }
}
