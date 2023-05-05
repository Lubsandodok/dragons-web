import Rapier from '@dimforge/rapier2d-compat';

export function sumVectors(a: Rapier.Vector2, b: Rapier.Vector2) : Rapier.Vector2 {
    return new Rapier.Vector2(a.x + b.x, a.y + b.y);
}

export function unitVector(a: Rapier.Vector2) : Rapier.Vector2 {
    const length = Math.sqrt(a.x ** 2 + a.y ** 2);
    return new Rapier.Vector2(a.x / length, a.y / length);
}

export function multiplyVector(a: Rapier.Vector2, multiplier: number) : Rapier.Vector2 {
    return new Rapier.Vector2(a.x * multiplier, a.y * multiplier);
}

export function rotateRightVector(a: Rapier.Vector2) : Rapier.Vector2 {
    return new Rapier.Vector2(a.y, -a.x);
}

export function computeRotationVector(rotation: number) : Rapier.Vector2 {
    return new Rapier.Vector2(Math.cos(rotation), Math.sin(rotation));
}

export function mirrorVector(vec: Rapier.Vector2) : Rapier.Vector2 {

}
