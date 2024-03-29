import { Graphics, Spritesheet } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Layer } from "@pixi/layers";
import Rapier from "@dimforge/rapier2d-compat";

import {
  resources,
  WORLD_SIDE_X,
  WORLD_SIDE_Y,
  PlayerEvent,
  PanelState,
  Physical,
  PlayerStartingPosition,
} from "../canvas";
import { Controls, WorldUpdatable } from "../controls";
import { EntityManager } from "./entitymanager";
import { Dragon, DragonOptions } from "./dragon";
import { Fireball } from "./fireball";
import { Ground } from "./ground";

export type WorldContext = {
  camera: Viewport;
  lighting: Layer;
  controls: Controls;
};

export class World implements WorldUpdatable {
  isGamePlaying: boolean = false;
  isGameFinished: boolean = false;
  myPlayerId: string;
  winnerId?: string;

  entityManager: EntityManager;
  nicknames: { [playerId: string]: string } = {};

  physicsWorld: Rapier.World;
  eventQueue: Rapier.EventQueue;

  debugGraphics: Graphics;

  constructor(public context: WorldContext) {
    const gravity = { x: 0.0, y: 9.81 };
    this.physicsWorld = new Rapier.World(gravity);
    this.eventQueue = new Rapier.EventQueue(true);
    this.debugGraphics = new Graphics();
    this.entityManager = new EntityManager(context, this.physicsWorld);
    context.camera.addChild(this.debugGraphics);

    context.camera.moveCenter(WORLD_SIDE_X / 2, WORLD_SIDE_Y / 2);
    context.camera.clamp({
      left: 0,
      right: WORLD_SIDE_X,
      top: 0,
      bottom: WORLD_SIDE_Y,
      direction: "all",
      underflow: "center",
    });
  }

  createCharacter(
    playerId: string,
    startingPosition: PlayerStartingPosition,
    nickname: string
  ): void {
    const dragon = this.entityManager.createDragon(
      playerId,
      this.getDragonOptions(startingPosition, playerId)
    );
    if (dragon === null) {
      return;
    }
    dragon.update();

    this.nicknames[playerId] = nickname;
  }

  applyEvent(playerId: string, event: PlayerEvent): void {
    const dragon = this.entityManager.getDragon(playerId);
    if (event === PlayerEvent.CREATE_FIREBALL) {
      const fireFinishedFunction = () => {
        const fireball = this.entityManager.createFireball(playerId);
        fireball.update();
        fireball.fire();
      };
      dragon.setAction(event, fireFinishedFunction);
    } else {
      dragon.setAction(event, null);
    }
  }

  setIsGamePlaying(isGamePlaying: boolean) {
    this.isGamePlaying = isGamePlaying;
  }

  setMyPlayerId(myPlayerId: string) {
    this.myPlayerId = myPlayerId;
  }

  getPanelState(): PanelState {
    if (!this.isGamePlaying && !this.isGameFinished) {
      return;
    }

    const playerDragon = this.entityManager.getDragon(this.myPlayerId);
    const winnerName = this.winnerId ? this.nicknames[this.winnerId] : null;
    // console.log("Winner name: ", winnerName);
    return { playerLives: playerDragon.getLives(), winnerName: winnerName };
  }

  handleCollisionEvent(handleFirst: number, handleSecond: number) {
    const first = this.entityManager.getEntityByHandle(handleFirst);
    const second = this.entityManager.getEntityByHandle(handleSecond);
    console.log("Collision", first, second);
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
    }
    // } else if (first instanceof Dragon && second instanceof Ground) {
    //     this.entityManager.dragonIsHit(first, true);
    // } else if (first instanceof Ground && second instanceof Dragon) {
    //     this.entityManager.dragonIsHit(second, true);
    // }
  }

  update() {
    if (!this.isGamePlaying) {
      return;
    }

    // TODO
    this.physicsWorld.step(this.eventQueue);

    this.eventQueue.drainCollisionEvents(
      (handle1: number, handle2: number, started: boolean) => {
        this.handleCollisionEvent(handle1, handle2);
      }
    );

    this.eventQueue.drainContactForceEvents((event) => {
      console.log("Contact forces", event);
    });

    this.entityManager.update();

    this.handleGameOver();

    this.drawDebugGraphics();
  }

  private handleGameOver() {
    const alivePlayers = this.entityManager.getAlivePlayerIds();
    if (alivePlayers.length === 1) {
      // TODO: This should be handled by the server
      // this.isGamePlaying = false;
      // TODO: Event system would work pretty good here
      setTimeout(() => {
        this.isGamePlaying = false;
      }, 10000);
      this.isGameFinished = true;
      this.winnerId = alivePlayers[0];
      console.log("Game over", alivePlayers[0]);
      this.context.controls.finishGame(alivePlayers[0]);
    }
  }

  private drawDebugGraphics() {
    const renderBuffers: Rapier.DebugRenderBuffers =
      this.physicsWorld.debugRender();
    this.debugGraphics.clear();
    //        console.log('Buffers', renderBuffers);
    this.debugGraphics.lineStyle(10, 0xff0000, 1);
    this.debugGraphics.beginFill(0xff0000, 1);
    for (let i = 0; i < renderBuffers.vertices.length; i += 4) {
      const x1 = renderBuffers.vertices[i];
      const y1 = renderBuffers.vertices[i + 1];
      const x2 = renderBuffers.vertices[i + 2];
      const y2 = renderBuffers.vertices[i + 3];
      this.debugGraphics.moveTo(x1, y1);
      this.debugGraphics.lineTo(x2, y2);
    }
  }

  private getDragonOptions(
    startingPosition: PlayerStartingPosition,
    playerId: string
  ): DragonOptions {
    const isPlayer = this.myPlayerId === playerId;
    function generateOptions(
      resource: Spritesheet,
      x_shift: number,
      y_shift: number
    ): DragonOptions {
      return {
        resource: resource,
        position: new Rapier.Vector2(
          WORLD_SIDE_X / 2 + x_shift,
          WORLD_SIDE_Y / 2 + y_shift
        ),
        isPlayer: isPlayer,
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

  destroy() {}
}
