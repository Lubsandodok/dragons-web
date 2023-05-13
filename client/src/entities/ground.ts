import { Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { Physical, WORLD_SIDE_X } from '../canvas';

export type GroundOptions = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export class Ground implements Physical {
    visual: Graphics;
    rigidBody: Rapier.RigidBody;
    collider: Rapier.Collider;

    constructor(
        public camera: Viewport,
        public physics: Rapier.World,
        options: GroundOptions,
    ) {
        const rigidBodyDesc = Rapier.RigidBodyDesc.fixed()
            .setTranslation(options.x + options.width / 2, options.y + options.height / 2);
        const rigidBody = physics.createRigidBody(rigidBodyDesc);
        const colliderDesc = Rapier.ColliderDesc.cuboid(options.width / 2, options.height / 2);
        colliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
        this.collider = physics.createCollider(colliderDesc, rigidBody);

        const visual = new Graphics();
        const translation = rigidBody.translation();
        // visual.x = translation.x;
        // visual.y = translation.y;
        visual.beginFill(0x808080);
        visual.drawRect(translation.x - options.width / 2, translation.y - options.height / 2, options.width, options.height);
        visual.endFill();
        camera.addChild(visual);
    }

    getHandle(): number {
        return this.collider.handle;
    }
}
