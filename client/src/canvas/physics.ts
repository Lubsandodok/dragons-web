import Rapier from "@dimforge/rapier2d-compat";

export interface Physical {
  getHandle(): number;
}

export async function loadPhysicsEngine() {
  await Rapier.init();
}
