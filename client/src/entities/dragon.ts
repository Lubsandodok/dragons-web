import {
  AnimatedSprite,
  Spritesheet,
  Container,
  PI_2,
  Graphics,
} from "pixi.js";
import Rapier from "@dimforge/rapier2d-compat";

import { Movable } from "../controls";
import {
  DRAGON_SIDE_X,
  DRAGON_SIDE_Y,
  LIVES_AT_START,
  sumVectors,
  multiplyVector,
  rotateRightVector,
  computeRotationVector,
  Physical,
  PlayerEvent,
} from "../canvas";
import { FireballOptions } from "./fireball";
import { WorldContext } from "./world";

export type DragonOptions = {
  resource: Spritesheet;
  position: Rapier.Vector;
  isPlayer: boolean;
};

enum DragonDirection {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

enum DragonSprite {
  FLYING = "FLYING",
  BEING_HIT = "BEING_HIT",
  FIRING = "FIRING",
  DYING = "DYING",
}

export class Dragon implements Physical, Movable {
  lives: number = LIVES_AT_START;
  isPlayer: boolean;
  direction: DragonDirection = DragonDirection.RIGHT;
  nextAction: PlayerEvent = PlayerEvent.NONE;
  postActionHandler: Function | null = null;

  sprites: { [key in DragonSprite]: AnimatedSprite };
  currentSpriteName: DragonSprite;
  visual: Container;
  rigidBody: Rapier.RigidBody;
  collider: Rapier.Collider;

  constructor(
    public context: WorldContext,
    public physics: Rapier.World,
    options: DragonOptions
  ) {
    // console.log('Options', options);
    let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
      .setTranslation(options.position.x, options.position.y)
      .setAngularDamping(0.5)
      .setLinearDamping(0.4);
    this.rigidBody = physics.createRigidBody(rigidBodyDesc);

    let colliderDesc = Rapier.ColliderDesc.ball(20).setDensity(0.01);
    colliderDesc.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
    this.collider = physics.createCollider(colliderDesc, this.rigidBody);

    this.isPlayer = options.isPlayer;
    this.initSprites(options);
    this.initCamera(options);
  }

  private initSprites(options: DragonOptions): void {
    const visual = new Container();
    const animations = options.resource.animations;
    this.sprites = {
      [DragonSprite.FLYING]: new AnimatedSprite(animations.flying),
      [DragonSprite.BEING_HIT]: new AnimatedSprite(animations.beingHit),
      [DragonSprite.FIRING]: new AnimatedSprite(animations.firing),
      [DragonSprite.DYING]: new AnimatedSprite(animations.dying),
    };
    for (const [_, sprite] of Object.entries(this.sprites)) {
      // sprite.scale.set(0.5);
      sprite.animationSpeed = 0.3;
      sprite.loop = false;
      // sprite.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);
      sprite.visible = false;
      visual.addChild(sprite);
    }

    visual.scale.set(0.5);
    visual.pivot.set(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2);
    visual.visible = true;
    this.visual = visual;
    this.context.camera.addChild(visual);
    this.currentSpriteName = DragonSprite.FLYING;
    this.changeSprite(DragonSprite.FLYING);

    const light = new Graphics();
    light.beginFill(0xffffff, 0.5);
    light.drawCircle(DRAGON_SIDE_X / 2, DRAGON_SIDE_Y / 2, 300);
    light.endFill();
    light.parentLayer = this.context.lighting;
    visual.addChild(light);
  }

  private initCamera(options: DragonOptions): void {
    if (options.isPlayer) {
      this.context.camera.follow(this.visual, {
        speed: 0,
        acceleration: null,
        radius: null,
      });
    }
  }

  private changeSprite(spriteName: DragonSprite): void {
    const sprite = this.sprites[spriteName];
    const currentSprite = this.sprites[this.currentSpriteName];

    currentSprite.visible = false;
    sprite.visible = true;
    this.currentSpriteName = spriteName;
  }

  private getCurrentSprite(): AnimatedSprite {
    return this.sprites[this.currentSpriteName];
  }

  private runAction(): void {
    if (this.getCurrentSprite().playing) {
      return;
    }
    if (this.nextAction === PlayerEvent.DRAGON_MOVE) {
      this.moveUp();
    } else if (this.nextAction === PlayerEvent.DRAGON_LEFT) {
      this.moveLeft();
    } else if (this.nextAction === PlayerEvent.DRAGON_RIGHT) {
      this.moveRight();
    } else if (this.nextAction === PlayerEvent.DRAGON_TURN_BACK) {
      this.turnBack();
    } else if (this.nextAction === PlayerEvent.CREATE_FIREBALL) {
      this.fire(this.postActionHandler);
    }
    if (this.isPlayer) {
      // console.log("Run action", this.nextAction);
    }
    this.nextAction = PlayerEvent.NONE;
    this.postActionHandler = null;
  }

  setAction(action: PlayerEvent, postActionHandler: Function | null): void {
    if (this.isPlayer) {
      // console.log("Set action", action);
    }
    // It is an important if. It should be reworked in future
    if (action !== PlayerEvent.NONE) {
      this.nextAction = action;
      this.postActionHandler = postActionHandler;
    }
  }

  private moveUp(): void {
    const rotationVector = computeRotationVector(this.rigidBody.rotation());
    const rotationVectorDirected = rotateRightVector(rotationVector);
    // console.log('Rotation vector', rotationVector);
    this.rigidBody.applyImpulse(
      multiplyVector(rotationVectorDirected, 120 * 5),
      false
    );
    this.getCurrentSprite().gotoAndPlay(0);
  }

  private moveLeft(): void {
    const rotation = this.rigidBody.rotation();
    // const directionNumber = -1 * this.getDirectionNumber();
    this.rigidBody.applyTorqueImpulse(20 * 20 * 10 * -1, false);
    // this.rigidBody.setRotation(rotation - 3.14 / 4, false);
    this.getCurrentSprite().gotoAndPlay(0);
  }

  private moveRight(): void {
    const rotation = this.rigidBody.rotation();
    // const directionNumber = 1 * this.getDirectionNumber();
    this.rigidBody.applyTorqueImpulse(20 * 20 * 10, false);
    // this.rigidBody.setRotation(rotation + 3.14 / 4, false);
    this.getCurrentSprite().gotoAndPlay(0);
  }

  private turnBack(): void {
    this.visual.scale.x *= -1;
    const newDirection =
      this.direction === DragonDirection.LEFT
        ? DragonDirection.RIGHT
        : DragonDirection.LEFT;
    this.direction = newDirection;
    // console.log('Turn back', this.direction);
  }

  // #TODO: do it well. Do not use callbacks
  private fire(fireFinishedFunction: Function): void {
    // console.log('Fire');
    this.changeSprite(DragonSprite.FIRING);
    this.getCurrentSprite().onComplete = () => {
      this.getCurrentSprite().onComplete = null;
      // console.log('Firing complete', this.currentSpriteName);
      fireFinishedFunction();
      this.changeSprite(DragonSprite.FLYING);
    };
    this.getCurrentSprite().gotoAndPlay(0);
  }

  getLives(): number {
    return this.lives;
  }

  isHit() {
    if (this.getCurrentSprite().playing) {
      this.getCurrentSprite().stop();
    }
    this.changeSprite(DragonSprite.BEING_HIT);
    this.getCurrentSprite().onComplete = () => {
      this.getCurrentSprite().onComplete = null;
      this.changeSprite(DragonSprite.FLYING);
    };
    this.getCurrentSprite().gotoAndPlay(0);
    this.lives -= 1;
  }

  startDying() {
    this.changeSprite(DragonSprite.DYING);
    this.getCurrentSprite().gotoAndStop(7);
    // this.rigidBody.applyImpulse(new Rapier.Vector2(0, 200 * 1000), false);
    this.rigidBody.addForce(new Rapier.Vector2(0, 200 * 1000), false);
    this.lives = 0;
  }

  finishDying() {
    this.getCurrentSprite().gotoAndPlay(7);
  }

  getFireballOptions(): FireballOptions {
    const rotationVector = computeRotationVector(this.rigidBody.rotation());
    const directionNumber = this.getDirectionNumber();
    const positionShift = multiplyVector(rotationVector, 50 * directionNumber);
    const positionShifted = sumVectors(
      this.rigidBody.translation(),
      positionShift
    );
    let rotation = this.rigidBody.rotation();
    if (directionNumber === -1) {
      rotation += PI_2 / 2;
    }

    return {
      position: positionShifted,
      rotation: rotation,
      velocity: this.rigidBody.linvel(),
      angular: this.rigidBody.angvel(),
    };
  }

  getHandle(): number {
    return this.collider.handle;
  }

  getDirectionNumber(): number {
    return this.direction === DragonDirection.LEFT ? -1 : 1;
  }

  update() {
    const position: Rapier.Vector = this.rigidBody.translation();
    const rotation: number = this.rigidBody.rotation();
    //        console.log('Position', position, 'Rotation', rotation, 'Sprite', this.flyingSprite.rotation);
    this.visual.position = { x: position.x, y: position.y };
    this.visual.rotation = rotation;

    this.runAction();
  }

  start() {
    this.getCurrentSprite().play();
  }

  stop() {
    this.getCurrentSprite().stop();
  }

  destroy() {
    // TODO: destroy all sprites
    this.getCurrentSprite().destroy();
  }
}
