import { Scene, UniversalCamera } from "@babylonjs/core";
import { Weapon } from "./weapon.class";

type WeaponInstance = Weapon;
type WeaponConstructor = { new (scene: Scene, user: User, camera: UniversalCamera): Weapon };

export class User {
  public camera: UniversalCamera;
  private weapon: Weapon | null = null;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    camera: UniversalCamera,
    weapon: WeaponInstance | WeaponConstructor
  ) {
    this.camera = camera;
    this.camera.attachControl(canvas, true);

    if (weapon instanceof Weapon) {
      this.weapon = weapon;
    } else {
      this.weapon = new weapon(scene, this, camera);
    }
  }

  jump() {
    if (this.camera instanceof UniversalCamera) {
      let jumpSpeed = 3;
      let jumpDuration = 500;
      let startTime = Date.now();
      let interval = setInterval(() => {
        let timeElapsed = Date.now() - startTime;
        let progress = timeElapsed / jumpDuration;

        if (progress < 1) {
          this.camera.cameraDirection.y = jumpSpeed * (1 - progress);
        } else {
          clearInterval(interval);
        }
      }, 1000 / 60);
    }
  }

  fireWeapon() {
    if (this.weapon) {
      return this.weapon.fire();
    }
  }

  setWeapon(weapon: Weapon) {
    this.weapon = weapon;
  }
}
