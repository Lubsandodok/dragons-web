import { AnimatedSprite, Spritesheet } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { Movable } from '../controls';
import { Gravitable } from './common';

export enum DragonType {
    GREEN = 'green',
    BLUE = 'blue',
}

export class Dragon implements Movable, Gravitable {
    flyingSprite: AnimatedSprite;
    rigidBody: Rapier.RigidBody;

    constructor(public camera: Viewport, public physics: Rapier.World, resource: Spritesheet, positionStart: Rapier.Vector) {
        this.flyingSprite = new AnimatedSprite(resource.animations.flying);
        this.flyingSprite.animationSpeed = 0.3;
        this.flyingSprite.loop = false;
        // TODO
        this.flyingSprite.pivot.set(120, 112);

        this.camera.addChild(this.flyingSprite);

        let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
            .setTranslation(positionStart.x, positionStart.y);
        this.rigidBody = physics.createRigidBody(rigidBodyDesc);

        let colliderDesc = Rapier.ColliderDesc.cuboid(1, 1).setDensity(1.0);
        let collider = physics.createCollider(colliderDesc, this.rigidBody);
    }

    moveUp(): void {
        console.log('Move up');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            // TODO
            const rotationVector = new Rapier.Vector2(Math.sin(rotation), Math.cos(rotation));
            console.log('Rotation vector', rotationVector);
            this.rigidBody.applyImpulse(new Rapier.Vector2(rotationVector.x * 100, rotationVector.y * (-100)), false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    moveLeft(): void {
        console.log('Move left');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            this.rigidBody.setRotation(rotation - 0.05, false);
        }
    }

    moveRight(): void {
        console.log('Move right');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            this.rigidBody.setRotation(rotation + 0.05, false);
        }
    }

    applyGravity(): void {
        this.rigidBody.addForce(new Rapier.Vector2(0, 9.81), false);
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
