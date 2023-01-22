import { Graphics, Spritesheet } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { resources, WORLD_SIDE_X, WORLD_SIDE_Y, PlayerEvent, Physical } from '../canvas';
import { Dragon, DragonOptions } from './dragon';
import { Level } from './level';
import { Controls, WorldUpdatable } from '../controls';
import { Fireball } from './fireball';

export class World implements WorldUpdatable {
    isGamePlaying: boolean = false;
    myPlayerId: string;

    dragons: {[playerId: string]: Dragon} = {};
    fireballs: Fireball[] = [];
    level: Level;

    physicsWorld: Rapier.World;
    physicsHandles: {[handle: number]: Physical} = {};
    eventQueue: Rapier.EventQueue;

    debugGraphics: Graphics;

    constructor(public camera: Viewport, public controls: Controls) {
        const gravity = {x: 0.0, y: 20};
        this.physicsWorld = new Rapier.World(gravity);
        this.eventQueue = new Rapier.EventQueue(true);
        this.level = new Level(camera, this.physicsWorld);
        this.debugGraphics = new Graphics();        
        camera.addChild(this.debugGraphics);

        this.camera.moveCenter(WORLD_SIDE_X / 2, WORLD_SIDE_Y / 2);
        this.camera.clamp({
            left: 0,
            right: WORLD_SIDE_X,
            top: 0,
            bottom: WORLD_SIDE_Y,
            direction: 'all',
            underflow: 'center',
        });
    }

    createCharacter(playerId: string): void {
        console.log('Create', Object.keys(this.dragons), playerId);
        if (this.dragons.hasOwnProperty(playerId)) {
            console.log('Such player already exists', playerId);
            return;
        }

        const dragon = new Dragon(this.camera, this.physicsWorld, this.getDragonOptions());
        dragon.update();
        this.dragons[playerId] = dragon;

        // if (this.myPlayerId === playerId) {
        //     this.camera.follow(dragon.get(), {
        //         speed: 0,
        //         acceleration: null,
        //         radius: null,
        //     })
        // }
    }

    moveCharacter(playerId: string, event: string): void {
        const dragon = this.dragons[playerId];
        if (event === PlayerEvent.DRAGON_MOVE) {
            dragon.moveUp();
        } else if (event === PlayerEvent.DRAGON_LEFT) {
            dragon.moveLeft();
        } else if (event === PlayerEvent.DRAGON_RIGHT) {
            dragon.moveRight();
        }
    }

    createFireball(playerId: string) {
        console.log('Create fireball for', playerId);
        const dragon = this.dragons[playerId];

        const fireball = new Fireball(
            this.camera, this.physicsWorld, dragon.getFireballOptions(),
        );
        fireball.update();
        this.fireballs.push(fireball);

        fireball.fire();
    }

    setIsGamePlaying(isGamePlaying: boolean) {
        this.isGamePlaying = isGamePlaying;
    }

    setMyPlayerId(myPlayerId: string) {
        this.myPlayerId = myPlayerId;
    }

    update() {
        if (!this.isGamePlaying) {
            return;
        }

        // TODO
        this.physicsWorld.step(this.eventQueue);

        this.eventQueue.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
            console.log('Collision', handle1, handle2);
        });

        this.eventQueue.drainContactForceEvents(event => {
            console.log('Contact forces', event);
        });

        for (const playerId in this.dragons) {
            this.dragons[playerId].update();
        }
        for (const fireball of this.fireballs) {
            fireball.update();
        }

        this.drawDebugGraphics();
    }

    private drawDebugGraphics() {
        const renderBuffers: Rapier.DebugRenderBuffers = this.physicsWorld.debugRender();
        this.debugGraphics.clear();
//        console.log('Buffers', renderBuffers);
        this.debugGraphics.lineStyle(10, 0xFF0000, 1);
        this.debugGraphics.beginFill(0xFF0000, 1);
        for (let i = 0; i < renderBuffers.vertices.length; i += 4) {
            const x1 = renderBuffers.vertices[i];
            const y1 = renderBuffers.vertices[i + 1];
            const x2 = renderBuffers.vertices[i + 2];
            const y2 = renderBuffers.vertices[i + 3];
            this.debugGraphics.moveTo(x1, y1);
            this.debugGraphics.lineTo(x2, y2);
        }
    }

    private getDragonOptions() : DragonOptions {
        function generateOptions(resource: Spritesheet, x_shift: number) : DragonOptions {
            return {
                resource: resource,
                position: new Rapier.Vector2(WORLD_SIDE_X / 2 + x_shift, WORLD_SIDE_Y / 2),
            };
        }

        const length = Object.keys(this.dragons).length;
        if (length === 0) {
            return generateOptions(resources.dragonGreen, -200);
        } else if (length === 1) {
            return generateOptions(resources.dragonBlue, -100);
        } else if (length === 2) {
            return generateOptions(resources.dragonRed, 100);
        } else if (length === 3) {
            return generateOptions(resources.dragonBlack, 200);
        }
    }

    destroy() {
        this.level.destroy();
    }
}
