import { Graphics, Spritesheet } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import Rapier from '@dimforge/rapier2d-compat';

import { resources, WORLD_SIDE_X, WORLD_SIDE_Y, PlayerEvent, PanelState, Physical, PlayerStartingPosition } from '../canvas';
import { Controls, WorldUpdatable } from '../controls';
import { EntityManager } from './entitymanager';
import { Dragon, DragonOptions } from './dragon';
import { Fireball } from './fireball';
import { Ground } from './ground';

export class World implements WorldUpdatable {
    isGamePlaying: boolean = false;
    myPlayerId: string;
    winnerId?: string;

    entityManager: EntityManager;
    nicknames: {[playerId: string]: string} = {};

    physicsWorld: Rapier.World;
    eventQueue: Rapier.EventQueue;

    debugGraphics: Graphics;

    constructor(public camera: Viewport, public controls: Controls) {
        const gravity = {x: 0.0, y: 20};
        this.physicsWorld = new Rapier.World(gravity);
        this.eventQueue = new Rapier.EventQueue(true);
        this.debugGraphics = new Graphics();        
        this.entityManager = new EntityManager(camera, this.physicsWorld);
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

    createCharacter(
        playerId: string,
        startingPosition: PlayerStartingPosition,
        nickname: string,
    ): void {
        const dragon = this.entityManager.createDragon(
            playerId,
            this.getDragonOptions(startingPosition),
        );
        if (dragon === null) {
            return;
        }
        dragon.update();

        this.nicknames[playerId] = nickname;

        if (this.myPlayerId === playerId) {
            this.camera.follow(dragon.get(), {
                speed: 0,
                acceleration: null,
                radius: null,
            })
        }
    }

    moveCharacter(playerId: string, event: string): void {
        const dragon = this.entityManager.getDragon(playerId);
        if (event === PlayerEvent.DRAGON_MOVE) {
            dragon.moveUp();
        } else if (event === PlayerEvent.DRAGON_LEFT) {
            dragon.moveLeft();
        } else if (event === PlayerEvent.DRAGON_RIGHT) {
            dragon.moveRight();
        } else if (event === PlayerEvent.DRAGON_TURN_BACK) {
            dragon.turnBack();
        }
    }

    createFireball(playerId: string) {
        // console.log('Create fireball for', playerId);
        const fireFinishedFunction = () => {
            const fireball = this.entityManager.createFireball(playerId);
            fireball.update();
            fireball.fire();
        };
        this.entityManager.getDragon(playerId).fire(fireFinishedFunction);
    }

    setIsGamePlaying(isGamePlaying: boolean) {
        this.isGamePlaying = isGamePlaying;
    }

    setMyPlayerId(myPlayerId: string) {
        this.myPlayerId = myPlayerId;
    }

    getPanelState() : PanelState {
        if (!this.isGamePlaying) {
            return;
        }

        const playerDragon = this.entityManager.getDragon(this.myPlayerId);
        const winnerName = this.winnerId ? this.nicknames[this.winnerId] : null;
        console.log('Winner name: ', winnerName);
        return {playerLives: playerDragon.getLives(), winnerName: winnerName};
    }

    handleCollisionEvent(handleFirst: number, handleSecond: number) {
        const first = this.entityManager.getEntityByHandle(handleFirst);
        const second = this.entityManager.getEntityByHandle(handleSecond);
        console.log('Collision', first, second);
        if (first instanceof Fireball && second instanceof Ground) {
            this.entityManager.removeFireball(handleFirst);
        } else if (first instanceof Ground && second instanceof Fireball) {
            this.entityManager.removeFireball(handleSecond);
        } else if (first instanceof Fireball && second instanceof Dragon) {
            this.entityManager.dragonIsHit(second);
            this.entityManager.removeFireball(handleFirst);
        } else if (first instanceof Dragon && second instanceof Fireball) {
            this.entityManager.dragonIsHit(first);
            this.entityManager.removeFireball(handleSecond);
        } else if (first instanceof Dragon && second instanceof Ground) {
            this.entityManager.dragonIsHit(first, true);
        } else if (first instanceof Ground && second instanceof Dragon) {
            this.entityManager.dragonIsHit(second, true);
        }
    }

    update() {
        if (!this.isGamePlaying) {
            return;
        }

        // TODO
        this.physicsWorld.step(this.eventQueue);

        this.eventQueue.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
            this.handleCollisionEvent(handle1, handle2);
        });

        this.eventQueue.drainContactForceEvents(event => {
            console.log('Contact forces', event);
        });

        this.entityManager.update();

        this.handleGameOver();

        this.drawDebugGraphics();
    }

    private handleGameOver() {
        const alivePlayers = this.entityManager.getAlivePlayerIds();
        if (alivePlayers.length === 1) {
            // TODO: This should be handled by the server
            this.isGamePlaying = false;
            this.winnerId = alivePlayers[0];
            console.log('Game over', alivePlayers[0]);
            this.controls.finishGame(alivePlayers[0]);
        }
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

    private getDragonOptions(startingPosition: PlayerStartingPosition) : DragonOptions {
        function generateOptions(resource: Spritesheet, x_shift: number, y_shift: number) : DragonOptions {
            return {
                resource: resource,
                position: new Rapier.Vector2(WORLD_SIDE_X / 2 + x_shift, WORLD_SIDE_Y / 2 + y_shift),
            };
        }

        if (startingPosition === PlayerStartingPosition.LEFT_HIGH) {
            return generateOptions(resources.dragonGreen, -200, -200);
        } else if (startingPosition === PlayerStartingPosition.LEFT_LOW) {
            return generateOptions(resources.dragonBlue, -200, 200);
        } else if (startingPosition === PlayerStartingPosition.RIGHT_HIGH) {
            return generateOptions(resources.dragonRed, 200, -200);
        } else if (startingPosition === PlayerStartingPosition.RIGHT_LOW) {
            return generateOptions(resources.dragonBlack, 200, 200);
        }
    }

    destroy() {
    }
}
