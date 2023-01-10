import { AnimatedSprite } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';
import { Viewport } from 'pixi-viewport';

import { resources, FIREBALL_SIDE_X, FIREBALL_SIDE_Y } from '../canvas';

export type FireballOptions = {
    position: Rapier.Vector,
    rotation: number,
    velocity: Rapier.Vector,
    angular: number,
};

export class Fireball {
    sprite: AnimatedSprite;
    rigidBody: Rapier.RigidBody;

    constructor(
        public camera: Viewport,
        public physics: Rapier.World,
        positionStart: Rapier.Vector,
        rotationStart: number,
    ) {
        this.sprite = new AnimatedSprite(resources.fireball.animations.shot);
        this.sprite.pivot.set(FIREBALL_SIDE_X / 2, FIREBALL_SIDE_Y / 2);
        this.sprite.play();

        this.camera.addChild(this.sprite);

        let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
            .setTranslation(positionStart.x, positionStart.y);
        this.rigidBody = physics.createRigidBody(rigidBodyDesc);

        let colliderDesc = Rapier.ColliderDesc.cuboid(1, 1).setDensity(1.0);
        let collider = physics.createCollider(colliderDesc, this.rigidBody);
    }

    update() {
        const position: Rapier.Vector = this.rigidBody.translation();
        const rotation: number = this.rigidBody.rotation();

        this.sprite.position = {x: position.x, y: position.y};
        this.sprite.rotation = rotation;
    }
}
