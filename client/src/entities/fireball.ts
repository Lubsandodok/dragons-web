import { AnimatedSprite } from "pixi.js";
import Rapier from "@dimforge/rapier2d-compat";
import { Viewport } from "pixi-viewport";

import {
  resources,
  FIREBALL_SIDE_X,
  FIREBALL_SIDE_Y,
  unitVector,
  rotateRightVector,
  multiplyVector,
  computeRotationVector,
  Physical,
} from "../canvas";
import { WorldContext } from "./world";

export type FireballOptions = {
  position: Rapier.Vector;
  rotation: number;
  velocity: Rapier.Vector;
  angular: number;
};

export class Fireball implements Physical {
  sprite: AnimatedSprite;
  rigidBody: Rapier.RigidBody;
  collider: Rapier.Collider;
  options: FireballOptions; // TODO: remove it

  constructor(
    public context: WorldContext,
    public physics: Rapier.World,
    options: FireballOptions
  ) {
    console.log("Fireball", options);
    this.sprite = new AnimatedSprite(resources.fireball.animations.shot);
    this.sprite.pivot.set(FIREBALL_SIDE_X / 2, FIREBALL_SIDE_Y / 2);
    this.sprite.animationSpeed = 0.3;
    this.sprite.play();

    this.context.camera.addChild(this.sprite);

    let rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
      .setTranslation(options.position.x, options.position.y)
      .setRotation(options.rotation)
      .setLinvel(options.velocity.x, options.velocity.y)
      .setAngvel(options.angular);
    this.rigidBody = physics.createRigidBody(rigidBodyDesc);

    let colliderDesc = Rapier.ColliderDesc.ball(0.2).setDensity(1.0);
    this.collider = physics.createCollider(colliderDesc, this.rigidBody);

    this.options = options;
  }

  fire() {
    const rotationVector = computeRotationVector(this.options.rotation);
    this.rigidBody.applyImpulse(multiplyVector(rotationVector, 70), false);
  }

  getHandle(): number {
    return this.collider.handle;
  }

  update() {
    const position: Rapier.Vector = this.rigidBody.translation();
    const rotation: number = this.rigidBody.rotation();

    this.sprite.position = { x: position.x, y: position.y };
    this.sprite.rotation = rotation;
  }

  destroy() {
    this.physics.removeCollider(this.collider, false);
    this.physics.removeRigidBody(this.rigidBody);
    this.sprite.destroy();
  }
}
