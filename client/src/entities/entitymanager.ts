import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { Physical } from '../canvas';
import { Dragon, DragonOptions } from './dragon';
import { Fireball } from './fireball';
import { Level } from './level';

export class EntityManager {
    level: Level;
    handles: {[handle: number]: Physical} = {};
    dragons: {[playerId: string]: Dragon} = {};
    fireballs: {[handle: number]: Fireball} = {};

    constructor(public camera: Viewport, public physics: Rapier.World) {
        this.level = new Level(camera, physics);
        console.log(this.level.getHandle());
        this.handles[this.level.getHandle()] = this.level;
    }

    createDragon(playerId : string, options : DragonOptions) : Dragon {
        if (this.dragons.hasOwnProperty(playerId)) {
            console.log('Such player already exists', playerId);
            return null;
        }
        const dragon = new Dragon(this.camera, this.physics, options);
        this.handles[dragon.getHandle()] = dragon;
        this.dragons[playerId] = dragon;
        return dragon;
    }

    getDragon(playerId : string) : Dragon {
        return this.dragons[playerId];
    }

    getDragonsLength() : number {
        return Object.keys(this.dragons).length;
    }

    removeDragon(playerId : string) {
        const dragon = this.dragons[playerId];
        delete this.handles[dragon.getHandle()];
        delete this.dragons[playerId];
    }

    createFireball(playerId : string) : Fireball {
        const dragon = this.dragons[playerId];
        const fireball = new Fireball(
            this.camera, this.physics, dragon.getFireballOptions(),
        );
        this.handles[fireball.getHandle()] = fireball;
        this.fireballs[fireball.getHandle()] = fireball;
        return fireball;
    }

    removeFireball(handleId: number) {
        const fireball = this.fireballs[handleId];
        fireball.destroy();
        delete this.fireballs[handleId];
        delete this.handles[handleId];
    }

    handleCollisionEvent(handleFirst: number, handleSecond: number) {
        const first = this.handles[handleFirst];
        const second = this.handles[handleSecond];
        if (first instanceof Fireball && second instanceof Level) {
            this.removeFireball(handleFirst);
        } else if (first instanceof Level && second instanceof Fireball) {
            this.removeFireball(handleSecond);
        }
    }

    update() {
        for (const playerId in this.dragons) {
            this.dragons[playerId].update();
        }
        for (const handle in this.fireballs) {
            this.fireballs[handle].update();
        }
    }
};
