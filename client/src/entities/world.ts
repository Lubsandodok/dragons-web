import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { Dragon } from './dragon';
import { Level } from './level';

export class World {
    dragon: Dragon;
    level: Level;
    physicsWorld: Rapier.World;

    isSlow: boolean = true;

    constructor(public camera: Viewport) {
        const gravity = {x: 0.0, y: 9.81};
        this.physicsWorld = new Rapier.World(gravity);
        let groundColliderDesc = Rapier.ColliderDesc.cuboid(10.0, 0.1).setTranslation(0, 100);
        this.physicsWorld.createCollider(groundColliderDesc);

        this.level = new Level(camera);
        this.dragon = new Dragon(camera, this.physicsWorld);

        camera.clamp({
            left: false,
            right: false,
            top: false,
            bottom: false,
            direction: 'all',
            underflow: 'center',
        });

        camera.follow(this.dragon.get(), {
            speed: 0,
            acceleration: null,
            radius: null,
        });
        this.dragon.start();
    }

    setSlow() {
        this.isSlow = true;
    }

    setFast() {
        this.isSlow = false;
    }

    update() {
        this.physicsWorld.step();
        if (this.isSlow) {
            this.dragon.move_slow();
        } else {
            this.dragon.move_fast();
        }
    }

    destroy() {
        this.level.destroy();
        this.dragon.destroy();
    }
}
