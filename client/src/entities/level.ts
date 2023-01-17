import { Sprite, Container, Graphics } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { Physical, resources, WORLD_SIDE_X, WORLD_SIDE_Y } from '../canvas';

enum BorderSide {
    LEFT,
    RIGHT,
}

export class Level implements Physical {
    background: Container;

    constructor(public camera: Viewport, public physics: Rapier.World) {      
        const skySpriteHigh = new Sprite(resources.sky);
        skySpriteHigh.scale = {x: 3, y: 6};
        const skySpriteLow = new Sprite(resources.sky);
        skySpriteLow.scale = {x: 3, y: 6};
        skySpriteLow.y = skySpriteLow.height;

        this.background = new Container();
        this.background.addChild(skySpriteHigh);
        // this.background.addChild(skySpriteLow);
        this.background.addChild(this.makeBorder(BorderSide.LEFT));
        this.background.addChild(this.makeBorder(BorderSide.RIGHT));

        camera.addChild(this.background);

        this.setUpLevelPhysics();

        console.log('Camera world width', this.background.width);
        console.log('Camera world height', this.background.height);
    }

    setUpLevelPhysics() {
        const groundColliderDesc = Rapier.ColliderDesc.cuboid(WORLD_SIDE_X, 100)
            .setTranslation(0, WORLD_SIDE_Y);
        groundColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.physics.createCollider(groundColliderDesc);

        const leftGroundColliderDesc = Rapier.ColliderDesc.cuboid(100, WORLD_SIDE_Y)
            .setTranslation(0, 0);
        groundColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.physics.createCollider(leftGroundColliderDesc);

        const rightGroundColliderDesc = Rapier.ColliderDesc.cuboid(100, WORLD_SIDE_Y)
            .setTranslation(WORLD_SIDE_X - 100, 0);
        groundColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.physics.createCollider(rightGroundColliderDesc);
    }

    makeBorder(side: BorderSide) : Container {
        const container = new Container();
        const groundWidth = resources.ground.width - 2;
        const groundHeight = resources.ground.height - 1;
        for (let y = 0; y < WORLD_SIDE_Y; y += groundHeight) {
            const ground = new Sprite(resources.ground);
            ground.x = side === BorderSide.LEFT ? 0 : WORLD_SIDE_X - groundWidth;
            ground.y = y;
            container.addChild(ground);
        }
        const borderResource = side === BorderSide.LEFT ? resources.groundBorderDark : resources.groundBorderLight;
        const borderWidth = borderResource.width - 2;
        const borderHeight = borderResource.height - 1;
        for (let y = 0; y < WORLD_SIDE_Y; y += borderHeight) {
            const border = new Sprite(borderResource);
            if (side === BorderSide.LEFT) {
                border.x = groundWidth;
            } else {
                border.x = WORLD_SIDE_X - groundWidth - borderWidth;
            }
            border.y = y;
            container.addChild(border);
        }
        const visual = new Graphics();
        visual.beginFill(0xffffff);
        visual.drawRect(0, 0, WORLD_SIDE_X, WORLD_SIDE_Y);
        visual.endFill();
        container.mask = visual;
        return container;
    }

    getHandle(): number {
        // TODO
        return 0;
    }

    destroy() {
        this.background.destroy();
    }
}
