import { Graphics, Spritesheet } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { resources, WORLD_SIDE_X, WORLD_SIDE_Y, PlayerEvent } from '../canvas';
import { Dragon } from './dragon';
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
    debugGraphics: Graphics;

    constructor(public camera: Viewport, public controls: Controls) {
        const gravity = {x: 0.0, y: 20};
        this.physicsWorld = new Rapier.World(gravity);
        let groundColliderDesc = Rapier.ColliderDesc.cuboid(
            WORLD_SIDE_X, 10
        ).setTranslation(0, WORLD_SIDE_Y);
        this.physicsWorld.createCollider(groundColliderDesc);

        this.level = new Level(camera, this.physicsWorld);
        this.debugGraphics = new Graphics();
        camera.addChild(this.debugGraphics);
    }

    createCharacter(playerId: string): void {
        console.log('Create', Object.keys(this.dragons), playerId);
        if (this.dragons.hasOwnProperty(playerId)) {
            console.log('Such player already exists', playerId);
            return;
        }

        const dragon = new Dragon(
            this.camera,
            this.physicsWorld,
            this.getCurrentDragonResource(),
            this.getCurrentDragonStartPosition(),
        );
//        dragon.applyGravity();
        dragon.update();
        this.dragons[playerId] = dragon;

        if (this.myPlayerId === playerId) {
            this.camera.follow(dragon.get(), {
                speed: 0,
                acceleration: null,
                radius: null,
            })
//            this.controls.subscribePlayer(dragon);
        }
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

        this.physicsWorld.step();

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

    private getCurrentDragonResource(): Spritesheet {
        // dragons should have different colors
        const length = Object.keys(this.dragons).length;
        console.log(length);
        if (length === 0) {
            return resources.dragonGreen;
        } else if (length === 1) {
            return resources.dragonBlue;
        }
    }

    private getCurrentDragonStartPosition(): Rapier.Vector2 {
        const length = Object.keys(this.dragons).length;
        if (length === 0) {
            return new Rapier.Vector2(WORLD_SIDE_X / 2 - 100, WORLD_SIDE_Y / 2);
        } else if (length === 1) {
            return new Rapier.Vector2(WORLD_SIDE_X / 2 + 100, WORLD_SIDE_Y / 2);
        }
    }

    destroy() {
        this.level.destroy();
    }
}
