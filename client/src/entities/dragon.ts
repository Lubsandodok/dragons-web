import { AnimatedSprite, Spritesheet, PI_2 } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { Movable } from '../controls';
import {
    DRAGON_SIDE_X,
    DRAGON_SIDE_Y,
    LIVES_AT_START,
    sumVectors,
    multiplyVector,
    rotateRightVector,
    computeRotationVector,
    Physical,
} from '../canvas';
import { FireballOptions } from './fireball';

export type DragonOptions = {
    resource: Spritesheet,
    position: Rapier.Vector,
};

enum DragonDirection {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
};

export class Dragon implements Physical, Movable {
    lives: number = LIVES_AT_START;
    direction: DragonDirection = DragonDirection.RIGHT;
    flyingSprite: AnimatedSprite;
    rigidBody: Rapier.RigidBody;
    collider: Rapier.Collider;

    constructor(public camera: Viewport, public physics: Rapier.World, options: DragonOptions) {
        console.log('Options', options);
        this.flyingSprite = new AnimatedSprite(options.resource.animations.flying);
        this.flyingSprite.scale.set(0.5);
        this.flyingSprite.animationSpeed = 0.3;
        this.flyingSprite.loop = false;
        this.flyingSprite.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);

        this.camera.addChild(this.flyingSprite);

        let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
            .setTranslation(options.position.x, options.position.y)
            .setAngularDamping(0.5)
            .setLinearDamping(0.4);
        this.rigidBody = physics.createRigidBody(rigidBodyDesc);

        let colliderDesc = Rapier.ColliderDesc.capsule(20, 20).setDensity(1);
        colliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.collider = physics.createCollider(colliderDesc, this.rigidBody);
    }

    moveUp(): void {
        console.log('Move up');
        if (!this.flyingSprite.playing) {
            const rotationVector = computeRotationVector(this.rigidBody.rotation());
            const rotationVectorDirected = rotateRightVector(rotationVector);
            console.log('Rotation vector', rotationVector);
            this.rigidBody.applyImpulse(multiplyVector(rotationVectorDirected, 120 * 1000), false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    moveLeft(): void {
        console.log('Move left');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            // const directionNumber = -1 * this.getDirectionNumber();
            this.rigidBody.applyTorqueImpulse(20 * 20 * 2000 * -1, false);
            // this.rigidBody.setRotation(rotation - 3.14 / 4, false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    moveRight(): void {
        console.log('Move right');
        if (!this.flyingSprite.playing) {
            const rotation = this.rigidBody.rotation();
            // const directionNumber = 1 * this.getDirectionNumber();
            this.rigidBody.applyTorqueImpulse(20 * 20 * 2000, false);
            // this.rigidBody.setRotation(rotation + 3.14 / 4, false);
            this.flyingSprite.gotoAndPlay(0);
        }
    }

    turnBack(): void {
        if (!this.flyingSprite.playing) {
            this.flyingSprite.scale.x *= -1;
            const newDirection = (
                this.direction === DragonDirection.LEFT ?
                DragonDirection.RIGHT :
                DragonDirection.LEFT
            );
            this.direction = newDirection;
            console.log('Turn back', this.direction);
        }
    }

    getLives() : number {
        return this.lives;
    }

    lowerLives() {
        this.lives -= 1;
    }

    getFireballOptions(): FireballOptions {
        const rotationVector = computeRotationVector(this.rigidBody.rotation());
        const directionNumber = this.getDirectionNumber();
        const positionShift = multiplyVector(rotationVector, 50 * directionNumber);
        const positionShifted = sumVectors(this.rigidBody.translation(), positionShift);
        let rotation = this.rigidBody.rotation();
        if (directionNumber === -1) {
            rotation += PI_2 / 2;
        }

        return {
            position: positionShifted,
            rotation: rotation,
            velocity: this.rigidBody.linvel(),
            angular: this.rigidBody.angvel(),
        };
    }

    getHandle(): number {
        return this.collider.handle;
    }

    getDirectionNumber(): number {
        return this.direction === DragonDirection.LEFT ? -1 : 1;
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
