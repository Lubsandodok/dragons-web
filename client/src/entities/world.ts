import { Graphics, Spritesheet } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { resources } from '../canvas';
import { Dragon } from './dragon';
import { Level } from './level';
import { Controls, WorldUpdatable } from '../controls';

export class World implements WorldUpdatable {
    dragons: {[playerId: string]: Dragon} = {};
    level: Level;
    physicsWorld: Rapier.World;
    debugGraphics: Graphics;

    constructor(public camera: Viewport, public controls: Controls) {
        const gravity = {x: 0.0, y: 9.81};
        this.physicsWorld = new Rapier.World(gravity);
        let groundColliderDesc = Rapier.ColliderDesc.cuboid(
            716 * 5, 10
        ).setTranslation(716 * 10 / 2, 394 * 10);
        this.physicsWorld.createCollider(groundColliderDesc);

        this.level = new Level(camera);
        this.debugGraphics = new Graphics();
        camera.addChild(this.debugGraphics);
    }

    createCharacter(playerId: string, isPlayer: boolean): void {
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
        this.dragons[playerId] = dragon;

        if (isPlayer) {
            this.camera.follow(dragon.get(), {
                speed: 0,
                acceleration: null,
                radius: null,
            })
//            this.controls.subscribePlayer(dragon);
        }
    }

    moveCharacter(playerId: string, event: string): void {
        console.log('Current dragons', this.dragons);
        const dragon = this.dragons[playerId];
        if (event === 'KeyW') {
            dragon.moveUp();
        } else if (event === 'KeyA') {
            dragon.moveLeft();
        } else if (event === 'KeyD') {
            dragon.moveRight();
        }
    }

    update() {
        // Dirty hack
        if (Object.keys(this.dragons).length !== 2) {
            return;
        }

        this.physicsWorld.step();

        for (const playerId in this.dragons) {
            this.dragons[playerId].update();
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
        if (length === 0) {
            return resources.dragonGreen;
        } else if (length === 1) {
            return resources.dragonBlue;
        }
    }

    private getCurrentDragonStartPosition(): Rapier.Vector2 {
        const length = Object.keys(this.dragons).length;
        if (length === 0) {
            return new Rapier.Vector2(0, 0);
        } else if (length === 1) {
            return new Rapier.Vector2(100, 0);
        }
    }

    destroy() {
        this.level.destroy();
    }
}
