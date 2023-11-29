import { Engine } from "@babylonjs/core";
import { SceneGenerator } from "./scene-generator.class";
import { User } from "./user.class";
import { LaserGun } from "./weapon.class";
import { UniversalCameraStrategy } from "./camera.class";
import { setupUserControls } from "../hooks/setupUserControl";

export function createGame(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true);
  const sceneGenerator = new SceneGenerator(canvas, engine, new UniversalCameraStrategy());
  const scene = sceneGenerator.generate();
  const camera = sceneGenerator.getCamera();

  const user = new User(scene, canvas, camera, LaserGun);
  setupUserControls(canvas, user);

  engine.runRenderLoop(() => {
    scene.render();
  });

  return () => {
    engine.stopRenderLoop();
    scene.dispose();
    engine.dispose();
  };
}
