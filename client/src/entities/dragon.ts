import { AnimatedSprite } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { resources } from '../canvas';

export class Dragon {
    static HighSpeedAnimation = 0.6;
    static LowSpeedAnimation = 0.3;
    static HighSpeedStep = 2;
    static LowSpeedStep = 1;

    walkingSprite: AnimatedSprite;
    rigidBody: Rapier.RigidBody;

    constructor(public camera: Viewport, public physics: Rapier.World) {
        this.walkingSprite = new AnimatedSprite(resources.dragon.animations.walking);
        this.walkingSprite.animationSpeed = Dragon.LowSpeedAnimation;

        this.camera.addChild(this.walkingSprite);

        let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
            .setTranslation(0.0, 10.0)
        this.rigidBody = physics.createRigidBody(rigidBodyDesc);

        let colliderDesc = Rapier.ColliderDesc.cuboid(0.5, 0.5).setDensity(2.0);
        let collider = physics.createCollider(colliderDesc, this.rigidBody);
    }

    move_slow() {
//        this.walkingSprite.x += Dragon.LowSpeedStep;
        const position: Rapier.Vector = this.rigidBody.translation();
        this.walkingSprite.position = {x: position.x, y: position.y};
        console.log('Position: ', position);
    }

    move_fast() {
//        this.walkingSprite.x += Dragon.HighSpeedStep;
        const position: Rapier.Vector = this.rigidBody.translation();
        this.walkingSprite.position = {x: position.x, y: position.y};
        console.log('Position: ', position);
    }

    start() {
        this.walkingSprite.play();
    }

    stop() {
        this.walkingSprite.stop();
    }

    destroy() {
        this.walkingSprite.destroy();
    }

    get() {
        return this.walkingSprite;
    }
}
