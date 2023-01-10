import { AnimatedSprite, Spritesheet } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { Movable } from '../controls';
import { DRAGON_SIDE_X, DRAGON_SIDE_Y } from '../canvas';
import { FireballOptions } from './fireball';

export enum DragonType {
    GREEN = 'green',
    BLUE = 'blue',
}

export class Dragon implements Movable {
    flyingSprite: AnimatedSprite;
    rigidBody: Rapier.RigidBody;

    constructor(public camera: Viewport, public physics: Rapier.World, resource: Spritesheet, positionStart: Rapier.Vector) {
        this.flyingSprite = new AnimatedSprite(resource.animations.flying);
        this.flyingSprite.scale.set(0.5);
        this.flyingSprite.animationSpeed = 0.3;
        this.flyingSprite.loop = false;
        this.flyingSprite.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);

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

    getFireballOptions(): FireballOptions {
        
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
