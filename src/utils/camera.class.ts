import { FreeCamera, Scene, UniversalCamera, Vector3 } from "@babylonjs/core";

export abstract class CameraStrategy {
  abstract createCamera(scene: Scene): UniversalCamera | FreeCamera;
}

export class UniversalCameraStrategy extends CameraStrategy {
  createCamera(scene: Scene): UniversalCamera {
    const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 10, -25), scene);
    camera.setTarget(Vector3.Zero());
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(1, 3, 1);
    camera.checkCollisions = true;

    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);

    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    return camera;
  }
}

export class FreeCameraStrategy extends CameraStrategy {
  createCamera(scene: Scene): FreeCamera {
    const camera = new FreeCamera("FreeCamera", new Vector3(0, 2, -25), scene);
    return camera;
  }
}
