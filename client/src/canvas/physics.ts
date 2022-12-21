import Rapier from '@dimforge/rapier2d-compat';

export async function loadPhysicsEngine() {
    await Rapier.init();
}
