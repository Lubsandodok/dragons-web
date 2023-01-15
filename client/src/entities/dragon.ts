import { AnimatedSprite, Spritesheet, parseDDS } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { Movable } from '../controls';
import {
    DRAGON_SIDE_X,
    DRAGON_SIDE_Y, 
    sumVectors,
    unitVector,
    multiplyVector,
    rotateRightVector,
    computeRotationVector,
} from '../canvas';
import { FireballOptions } from './fireball';

export type DragonOptions = {
    resource: Spritesheet,
    position: Rapier.Vector,
};

export class Dragon implements Movable {
    flyingSprite: AnimatedSprite;
    rigidBody: Rapier.RigidBody;

    constructor(public camera: Viewport, public physics: Rapier.World, options: DragonOptions) {
        console.log('Options', options);
        this.flyingSprite = new AnimatedSprite(options.resource.animations.flying);
        this.flyingSprite.scale.set(0.5);
        this.flyingSprite.animationSpeed = 0.3;
        this.flyingSprite.loop = false;
        this.flyingSprite.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);

        this.camera.addChild(this.flyingSprite);

        let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
            .setTranslation(options.position.x, options.position.y);
        this.rigidBody = physics.createRigidBody(rigidBodyDesc);

        let colliderDesc = Rapier.ColliderDesc.capsule(0.5, 0.5).setDensity(1.0);
        let collider = physics.createCollider(colliderDesc, this.rigidBody);
    }

    moveUp(): void {
        console.log('Move up');
        if (!this.flyingSprite.playing) {
            const rotationVector = computeRotationVector(this.rigidBody.rotation());
            const rotationVectorDirected = rotateRightVector(rotationVector);
            console.log('Rotation vector', rotationVector);
            this.rigidBody.applyImpulse(multiplyVector(rotationVectorDirected, 200), false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    moveLeft(): void {
        console.log('Move left');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            this.rigidBody.applyTorqueImpulse(-0.3, false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    moveRight(): void {
        console.log('Move right');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            this.rigidBody.applyTorqueImpulse(0.3, false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    getFireballOptions(): FireballOptions {
        const rotationVector = computeRotationVector(this.rigidBody.rotation());
        const positionShift = multiplyVector(rotationVector, 10);
        const positionShifted = sumVectors(this.rigidBody.translation(), positionShift);

        return {
            position: positionShifted,
            rotation: this.rigidBody.rotation(),
            velocity: this.rigidBody.linvel(),
            angular: this.rigidBody.angvel(),
        };
    }

    update() {
        const position: Rapier.Vector = this.rigidBody.translation();
        const rotation: number = this.rigidBody.rotation();
//        console.log('Position', position, 'Rotation', rotation, 'Sprite', this.flyingSprite.rotation);
        this.flyingSprite.position = {x: position.x, y: position.y};
        this.flyingSprite.rotation = rotation;
    }

    start() {
        this.flyingSprite.play();
    }

    stop() {
        this.flyingSprite.stop();
    }

    destroy() {
        this.flyingSprite.destroy();
    }

    get() {
        return this.flyingSprite;
    }
}
