import { Sprite } from 'pixi.js';
import Rapier from '@dimforge/rapier2d-compat';

import { Physical, WORLD_SIDE_X, WORLD_SIDE_Y, resources } from '../canvas';
import { WorldContext } from './world';
import { Dragon, DragonOptions } from './dragon';
import { Fireball } from './fireball';
import { Level } from './level';
import { Ground, GroundOptions } from './ground';

export class EntityManager {
    level: Level;
    background: Sprite;
    handles: {[handle: number]: Physical} = {};
    grounds: {[handle: number]: Ground} = {};
    dragons: {[playerId: string]: Dragon} = {};
    fireballs: {[handle: number]: Fireball} = {};

    constructor(public context: WorldContext, public physics: Rapier.World) {
        // TODO: work on a level
        // this.level = new Level(camera, physics);
        this.createLevel();
        // console.log(this.level.getHandle());
        // this.handles[this.level.getHandle()] = this.level;
    }

    createDragon(playerId : string, options : DragonOptions) : Dragon | null {
        if (this.dragons.hasOwnProperty(playerId)) {
            console.log('Such player already exists', playerId);
            return null;
        }
        const dragon = new Dragon(this.context, this.physics, options);
        this.handles[dragon.getHandle()] = dragon;
        this.dragons[playerId] = dragon;
        return dragon;
    }

    private createGround(options: GroundOptions) {
        const ground = new Ground(this.context, this.physics, options);
        this.handles[ground.getHandle()] = ground;
        this.grounds[ground.getHandle()] = ground;
    }

    // TODO: create a separate class for level creation
    createLevel() {
        const backgroundSprite = new Sprite(resources.sky);
        // TODO: use constants from separated file
        backgroundSprite.scale = {x: 1, y: 1};
        this.background = backgroundSprite;
        this.context.camera.addChild(this.background);

        this.createGround({
            x: 0,
            y: 0,
            width: 100,
            height: WORLD_SIDE_Y,
        });
        this.createGround({
            x: WORLD_SIDE_X - 100,
            y: 0,
            width: 100,
            height: WORLD_SIDE_Y,
        });
        this.createGround({
            x: 0,
            y: 0,
            width: WORLD_SIDE_X,
            height: 100,
        });
        this.createGround({
            x: 0,
            y: WORLD_SIDE_Y - 100,
            width: WORLD_SIDE_X,
            height: 100,
        });
    }

    getEntityByHandle(handle: number) : Physical {
        return this.handles[handle];
    }

    getDragon(playerId : string) : Dragon {
        return this.dragons[playerId];
    }

    getAlivePlayerIds() : string[] {
        return Object.keys(this.dragons).filter(playerId => this.dragons[playerId].getLives() > 0);
    }

    removeDragon(playerId : string) {
        const dragon = this.dragons[playerId];
        delete this.handles[dragon.getHandle()];
        delete this.dragons[playerId];
    }

    createFireball(playerId : string) : Fireball {
        const dragon = this.dragons[playerId];
        const fireball = new Fireball(
            this.context, this.physics, dragon.getFireballOptions(),
        );
        this.handles[fireball.getHandle()] = fireball;
        this.fireballs[fireball.getHandle()] = fireball;
        return fireball;
    }

    dragonIsHit(dragon : Dragon, byGround : boolean = false) {
        if (dragon.getLives() === 1) {
            dragon.startDying();
        } else if (dragon.getLives() === 0 && byGround) {
            dragon.finishDying();
        } else {
            dragon.isHit();
        }
    }

    removeFireball(handleId: number) {
        const fireball = this.fireballs[handleId];
        fireball.destroy();
        delete this.fireballs[handleId];
        delete this.handles[handleId];
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
