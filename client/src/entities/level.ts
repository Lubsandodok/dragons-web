import { Sprite, Container, Graphics, Texture } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import {
    Physical,
    resources,
    WORLD_SIDE_X,
    WORLD_SIDE_Y,
    GROUND_WIDTH,
} from '../canvas';

enum BorderSide {
    LEFT,
    RIGHT,
    UP,
    DOWN,
}

export class Level implements Physical {
    background: Container;
    collider: Rapier.Collider;

    constructor(public camera: Viewport, public physics: Rapier.World) {      
        const skySpriteHigh = new Sprite(resources.sky);
        skySpriteHigh.scale = {x: 3, y: 6};

        this.background = new Container();
        this.background.addChild(skySpriteHigh);
        const leftBorder = this.makeBorder(BorderSide.LEFT);
        const rightBorder = this.makeBorder(BorderSide.RIGHT);
        const downBorder = this.makeBorder(BorderSide.DOWN);
        // this.adjustBorder(leftBorder, downBorder.height);
        // this.adjustBorder(rightBorder, downBorder.height);
        // this.adjustBorder(downBorder, 0, leftBorder.width);

        this.background.addChild(leftBorder);
        this.background.addChild(rightBorder);
        this.background.addChild(downBorder);

        // console.log('Children: ', camera.children);
        camera.addChild(this.background);

        this.setUpPhysicsForBorder(leftBorder);
        this.setUpPhysicsForBorder(rightBorder);
        this.collider = this.setUpPhysicsForBorder(downBorder);

        // console.log('Back: ', this.collider);

        // console.log('Camera world width', this.background.width);
        // console.log('Camera world height', this.background.height);
    }

    private setUpPhysicsForBorder(border: Container) : Rapier.Collider {
        // console.log('Object', border);
        const rigidBodyDesc = Rapier.RigidBodyDesc.fixed()
            .setRotation(border.rotation)
            .setTranslation(border.x, border.y);
        const rigidBody = this.physics.createRigidBody(rigidBodyDesc);
        const borderColliderDesc = Rapier.ColliderDesc.cuboid(border.width, border.height);
        borderColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        const collider = this.physics.createCollider(borderColliderDesc, rigidBody);
        // console.log(collider.handle);
        return collider;
    }

    setUpLevelPhysicsForContainers() {
        const halfGroundWidth = GROUND_WIDTH / 2;

        const groundColliderDesc = Rapier.ColliderDesc.cuboid(WORLD_SIDE_X, GROUND_WIDTH)
            .setTranslation(0, WORLD_SIDE_Y + halfGroundWidth);
        groundColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.physics.createCollider(groundColliderDesc);

        const leftGroundColliderDesc = Rapier.ColliderDesc.cuboid(GROUND_WIDTH, WORLD_SIDE_Y)
            .setTranslation(-halfGroundWidth, 0);
        groundColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.physics.createCollider(leftGroundColliderDesc);

        const rightGroundColliderDesc = Rapier.ColliderDesc.cuboid(GROUND_WIDTH, WORLD_SIDE_Y)
            .setTranslation(WORLD_SIDE_X - halfGroundWidth, 0);
        groundColliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.physics.createCollider(rightGroundColliderDesc);
    }

    private makeBorder(side: BorderSide) : Container {
        const all = new Container();
        let line: Graphics;
        let border: Container;
        if (side === BorderSide.LEFT || side === BorderSide.RIGHT) {
            line = this.makeVerticalLine(GROUND_WIDTH);
            border = this.makeVerticalBorder(side);
        } else {
            line = this.makeHorizontalLine(GROUND_WIDTH);
            border = this.makeHorizontalBorder(side);
        }
        all.addChild(line);
        all.addChild(border);

        if (side === BorderSide.RIGHT) {
            all.x = WORLD_SIDE_X;
        } else if (side === BorderSide.DOWN) {
            all.y = WORLD_SIDE_Y;
        }
        return all;
    }

    private makeHorizontalLine(height: number) : Graphics {
        const graphics = new Graphics();
        graphics.beginFill(0x2d2e33);
        graphics.drawRect(0, 0, WORLD_SIDE_X, height);
        graphics.endFill();
        return graphics;
    }

    private makeHorizontalBorder(side: BorderSide) : Container {
        const container = new Container();
        const borderResource = resources.groundBorderLight;
        // TODO
        for (let x = 2 * borderResource.height; x < WORLD_SIDE_X; x += borderResource.height - 1) {
            const border = new Sprite(borderResource);
            border.angle = 90;
            if (side === BorderSide.UP) {
                border.y = -1;
            } else {
                border.y = -borderResource.width + 1;
            }
            border.x = x;
            container.addChild(border);
        }
        return container;
    }

    private makeVerticalLine(width: number) : Graphics {
        const graphics = new Graphics();
        graphics.beginFill(0x2d2e33);
        graphics.drawRect(0, 0, width, WORLD_SIDE_Y);
        graphics.endFill();
        return graphics;
    }

    private makeVerticalBorder(side: BorderSide) : Container {
        const container = new Container();
        const borderResource = side === BorderSide.LEFT ? resources.groundBorderDark : resources.groundBorderLight;
        for (let y = 0; y < WORLD_SIDE_Y; y += borderResource.height - 1) {
            const border = new Sprite(borderResource);
            if (side === BorderSide.LEFT) {
                border.x = -1;
            } else {
                border.x = -borderResource.width + 1;
            }
            border.y = y;
            container.addChild(border);
        }
        return container;
    }

    // private adjustBorder(border: Container, offsetVertical: number = 0, offsetHorizontal: number = 0) {
    //     const visual = new Graphics();
    //     visual.beginFill(0xffffff);
    //     console.log('Border', offsetHorizontal);
    //     visual.drawRect(
    //         0 + offsetHorizontal,
    //         0,
    //         WORLD_SIDE_X / 2 - offsetHorizontal,
    //         WORLD_SIDE_Y - offsetVertical,
    //     );
    //     visual.endFill();
    //     border.mask = visual;
    // }

    getHandle(): number {
        return this.collider.handle;
    }

    destroy() {
        this.background.destroy();
    }
}
