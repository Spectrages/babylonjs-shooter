import {
  Scene,
  Vector3,
  Mesh,
  Ray,
  RayHelper,
  Color3,
  MeshBuilder,
  StandardMaterial,
  UniversalCamera,
  Sound,
  SceneLoader,
  Texture,
} from "@babylonjs/core";
import { User } from "./user.class";

import "@babylonjs/loaders/OBJ/objFileLoader";

export abstract class Weapon {
  protected scene: Scene;
  protected user: User;
  protected camera: UniversalCamera;
  protected weaponModel: Mesh;

  constructor(scene: Scene, user: User, camera: UniversalCamera) {
    this.scene = scene;
    this.user = user;
    this.camera = camera;
    this.weaponModel = this.createWeaponModelAsCylinder();
  }

  protected calculateShotDirection(spread: number): Vector3 {
    const baseDirection = this.camera.getForwardRay().direction;
    const randomSpread = new Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
    return Vector3.Normalize(baseDirection.add(randomSpread));
  }

  protected async shootRay(directionRay: Vector3, length: number) {
    let tempWeaponModel = (await this.weaponModel).clone("tempWeaponModel");
    tempWeaponModel.isVisible = false;
    const origin = tempWeaponModel.getAbsolutePosition();
    const ray = new Ray(origin, directionRay, length);
    const rayHelper = new RayHelper(ray);
    rayHelper.show(this.scene);
    const hit = this.scene.pickWithRay(ray);
    tempWeaponModel.dispose();
    if (hit?.pickedMesh) {
    }
  }

  // protected abstract createWeaponModel(): Promise<Mesh>;
  protected abstract createWeaponModelAsCylinder(): Mesh;

  abstract fire(): void;
}

export class LaserGun extends Weapon {
  private lasgunSound: Sound;

  constructor(scene: Scene, user: User, camera: UniversalCamera) {
    super(scene, user, camera);
    this.lasgunSound = new Sound("lasgunSound", "./sounds/lasgun.wav", this.scene, null, {
      loop: false,
      autoplay: false,
    });
  }

  // protected createWeaponModel(): Mesh {
  //   return this.createCylinderModel(0, 2, 0);
  // }

  // protected async createWeaponModel(): Promise<Mesh> {
  // const material = new StandardMaterial("laserGunMat", this.scene);
  // material.diffuseColor = new Color3(1, 2, 1);
  // const progressCallback = (event: any) => {
  //   console.log("Uploaded:", event.loaded, "All:", event.total);
  // };
  // const result = await SceneLoader.ImportMeshAsync(
  //   null,
  //   "../assets/obj/",
  //   "Revolver.obj",
  //   this.scene,
  //   progressCallback
  // );
  // const mesh = result.meshes[0] as Mesh;
  // // console.log(mesh);
  // mesh.scaling = new Vector3(0.1, 0.1, 0.1);
  // // mesh.position = new Vector3(20, 3, 20);
  // mesh.rotation = new Vector3(0, 0, 0);
  // mesh.material = material;
  // mesh.position = new Vector3(1, -2, 5);
  // return mesh;
  // }

  protected createWeaponModelAsCylinder(): Mesh {
    return this.createCylinderModel(1, 2, 1);
  }

  fire() {
    const spread = 0.01;
    const randomSpread = new Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
    const direction = this.camera.getForwardRay().direction.add(randomSpread);
    this.shootRay(direction, 2000);
    this.playSound();
  }

  private createCylinderModel(r: number, g: number, b: number): Mesh {
    const mesh = MeshBuilder.CreateCylinder(
      "laserGun",
      { diameterTop: 0.8, diameterBottom: 0.9, height: 3, tessellation: 64 },
      this.scene
    );
    this.configureMesh(mesh, r, g, b);
    return mesh;
  }

  private configureMesh(mesh: Mesh, r: number, g: number, b: number) {
    mesh.renderingGroupId = 1;
    const material = new StandardMaterial("laserGunMat", this.scene);
    material.diffuseColor = new Color3(r, g, b);
    mesh.material = material;
    mesh.rotation.x = Math.PI / 2;
    mesh.parent = this.camera;
    mesh.position = new Vector3(1, -2, 5);
  }

  private playSound() {
    this.lasgunSound.play();
  }
}

export class Shotgun extends Weapon {
  private gunshotSound: Sound;

  constructor(scene: Scene, user: User, camera: UniversalCamera) {
    super(scene, user, camera);
    this.gunshotSound = new Sound("shotgunSound", "./sounds/shotgun.wav", this.scene, null, {
      loop: false,
      autoplay: false,
    });
  }

  protected createWeaponModelAsCylinder(): Mesh {
    return this.createCylinderModel(1, 0, 0);
  }

  fire() {
    const numRays = 8;
    const spread = 0.15;

    for (let i = 0; i < numRays; i++) {
      const randomSpread = new Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );
      this.playSound();
      const direction = this.camera.getForwardRay().direction.add(randomSpread);
      this.shootRay(direction, 50);
    }
  }

  private createCylinderModel(r: number, g: number, b: number): Mesh {
    const mesh = MeshBuilder.CreateCylinder(
      "laserGun",
      { diameterTop: 0.8, diameterBottom: 0.9, height: 3, tessellation: 64 },
      this.scene
    );
    this.configureMesh(mesh, r, g, b);
    return mesh;
  }

  private configureMesh(mesh: Mesh, r: number, g: number, b: number) {
    mesh.renderingGroupId = 1;
    const material = new StandardMaterial("laserGunMat", this.scene);
    material.diffuseColor = new Color3(r, g, b);
    mesh.material = material;
    mesh.rotation.x = Math.PI / 2;
    mesh.parent = this.camera;
    mesh.position = new Vector3(1, -2, 5);
  }

  private playSound() {
    this.gunshotSound.play();
  }
}
