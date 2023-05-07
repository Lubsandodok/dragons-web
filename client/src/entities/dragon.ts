import { AnimatedSprite, Spritesheet, Container, PI_2 } from 'pixi.js';
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

enum DragonSprite {
    FLYING = 'FLYING',
    BEING_HIT = 'BEING_HIT',
    FIRING = 'FIRING',
    DYING = 'DYING',
}

export class Dragon implements Physical, Movable {
    lives: number = LIVES_AT_START;
    direction: DragonDirection = DragonDirection.RIGHT;
    sprites: {[key in DragonSprite]: AnimatedSprite};
    currentSpriteName: DragonSprite;
    visual: Container;
    rigidBody: Rapier.RigidBody;
    collider: Rapier.Collider;

    constructor(
        public camera: Viewport,
        public physics: Rapier.World,
        options: DragonOptions,
    ) {
        console.log('Options', options);
        let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
            .setTranslation(options.position.x, options.position.y)
            .setAngularDamping(0.5)
            .setLinearDamping(0.4);
        this.rigidBody = physics.createRigidBody(rigidBodyDesc);

        let colliderDesc = Rapier.ColliderDesc.capsule(20, 20).setDensity(1);
        colliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.collider = physics.createCollider(colliderDesc, this.rigidBody);

        this.initSprites(options);
    }

    private initSprites(options: DragonOptions): void {
        const visual = new Container();
        const animations = options.resource.animations;
        this.sprites = {
            [DragonSprite.FLYING]: new AnimatedSprite(animations.flying),
            [DragonSprite.BEING_HIT]: new AnimatedSprite(animations.beingHit),
            [DragonSprite.FIRING]: new AnimatedSprite(animations.firing),
            [DragonSprite.DYING]: new AnimatedSprite(animations.dying),
        };
        for (const [_, sprite] of Object.entries(this.sprites)) {
            // sprite.scale.set(0.5);
            sprite.animationSpeed = 0.3;
            sprite.loop = false;
            // sprite.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);
            sprite.visible = false;
            visual.addChild(sprite);
        }

        visual.scale.set(0.5);
        visual.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);
        visual.visible = true;
        this.visual = visual;
        this.camera.addChild(visual);
        this.currentSpriteName = DragonSprite.FLYING;
        this.changeSprite(DragonSprite.FLYING);
    }

    private changeSprite(spriteName: DragonSprite): void {
        const sprite = this.sprites[spriteName];
        const currentSprite = this.sprites[this.currentSpriteName];

        currentSprite.visible = false;
        sprite.visible = true;
        this.currentSpriteName = spriteName;
    }

    private getCurrentSprite(): AnimatedSprite {
        return this.sprites[this.currentSpriteName];
    }

    moveUp(): void {
        console.log('Move up');
        if (!this.getCurrentSprite().playing) {
            const rotationVector = computeRotationVector(this.rigidBody.rotation());
            const rotationVectorDirected = rotateRightVector(rotationVector);
            console.log('Rotation vector', rotationVector);
            this.rigidBody.applyImpulse(multiplyVector(rotationVectorDirected, 120 * 1000), false);
            this.getCurrentSprite().gotoAndPlay(0);
        }
    }

    moveLeft(): void {
        console.log('Move left');
        if (!this.getCurrentSprite().playing) {
            const rotation = this.rigidBody.rotation();
            // const directionNumber = -1 * this.getDirectionNumber();
            this.rigidBody.applyTorqueImpulse(20 * 20 * 2000 * -1, false);
            // this.rigidBody.setRotation(rotation - 3.14 / 4, false);
            this.getCurrentSprite().gotoAndPlay(0);
        }
    }

    moveRight(): void {
        console.log('Move right');
        if (!this.getCurrentSprite().playing) {
            const rotation = this.rigidBody.rotation();
            // const directionNumber = 1 * this.getDirectionNumber();
            this.rigidBody.applyTorqueImpulse(20 * 20 * 2000, false);
            // this.rigidBody.setRotation(rotation + 3.14 / 4, false);
            this.getCurrentSprite().gotoAndPlay(0);
        }
    }

    turnBack(): void {
        if (!this.getCurrentSprite().playing) {
            this.visual.scale.x *= -1;
            const newDirection = (
                this.direction === DragonDirection.LEFT ?
                DragonDirection.RIGHT :
                DragonDirection.LEFT
            );
            this.direction = newDirection;
            console.log('Turn back', this.direction);
        }
    }

    // #TODO: do it well. Do not use callbacks
    fire(fireFinishedFunction: Function): void {
        console.log('Fire');
        if (!this.getCurrentSprite().playing) {
            this.changeSprite(DragonSprite.FIRING);
            this.getCurrentSprite().onComplete = () => {
                this.getCurrentSprite().onComplete = null;
                console.log('Firing complete', this.currentSpriteName);
                fireFinishedFunction();
                this.changeSprite(DragonSprite.FLYING);
            };
            this.getCurrentSprite().gotoAndPlay(0);
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
        this.visual.position = {x: position.x, y: position.y};
        this.visual.rotation = rotation;
    }

    start() {
        this.getCurrentSprite().play();
    }

    stop() {
        this.getCurrentSprite().stop();
    }

    destroy() {
        // TODO: destroy all sprites
        this.getCurrentSprite().destroy();
    }

    get() : Container {
        return this.visual;
    }
}
