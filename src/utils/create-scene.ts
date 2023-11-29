import {
  Animation,
  Color3,
  Color4,
  CubeTexture,
  Engine,
  HemisphericLight,
  IPointerEvent,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PointLight,
  Ray,
  RayHelper,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";

interface IKeys {
  frame: number;
  value: number;
}

export const createScene = (canvas: HTMLCanvasElement, engine: Engine) => {
  var scene = new Scene(engine);
  scene.gravity = new Vector3(0, -0.75, 0);
  scene.collisionsEnabled = true;
  scene.enablePhysics();

  var camera = new UniversalCamera("UniversalCamera", new Vector3(0, 2, -25), scene);

  camera.setTarget(Vector3.Zero());

  // Attach the camera to the canvas
  camera.applyGravity = true;
  camera.ellipsoid = new Vector3(1, 1.5, 1);
  camera.checkCollisions = true;
  camera.attachControl(canvas, true);

  // Skybox
  var skybox = Mesh.CreateBox("skyBox", 300.0, scene);
  var skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture("../../public/textures/clouds.png", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;

  //Controls  WASD
  camera.keysUp.push(87);
  camera.keysDown.push(83);
  camera.keysRight.push(68);
  camera.keysLeft.push(65);

  //Controls...Mouse
  //We start without being locked.
  let isLocked = false;

  // On click event, request pointer lock
  scene.onPointerDown = (evt: IPointerEvent) => {
    //true/false check if we're locked, faster than checking pointerlock on each single click.
    if (!isLocked) {
      canvas.requestPointerLock =
        canvas.requestPointerLock ||
        canvas.msRequestPointerLock ||
        canvas.mozRequestPointerLock ||
        canvas.webkitRequestPointerLock;
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }
    //continue with shooting requests or whatever :P
    if (evt.inputIndex === 2) {
      castRay();
    } //(left mouse click)
    //evt.inputIndex === 4 (right mouse click)
  };

  // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
  const pointerlockchange = () => {
    const controlEnabled =
      // document.mozPointerLockElement ||
      // document.webkitPointerLockElement ||
      // document.msPointerLockElement ||
      document.pointerLockElement || null;

    // If the user is already locked
    if (!controlEnabled) {
      //camera.detachControl(canvas);
      isLocked = false;
    } else {
      //camera.attachControl(canvas);
      isLocked = true;
    }
  };

  // Attach events to the document
  document.addEventListener("pointerlockchange", pointerlockchange, false);
  document.addEventListener("mspointerlockchange", pointerlockchange, false);
  document.addEventListener("mozpointerlockchange", pointerlockchange, false);
  document.addEventListener("webkitpointerlockchange", pointerlockchange, false);

  //Fog
  scene.fogMode = Scene.FOGMODE_EXP;
  scene.fogDensity = 0.005;
  scene.fogColor = new Color3(0.9, 0.9, 0.85);

  //Geometry
  const sphere = MeshBuilder.CreateSphere("sphere", {}, scene);

  const box1 = MeshBuilder.CreateBox("Box1", { height: 3, width: 3, depth: 3 }, scene);

  const myGround = MeshBuilder.CreateGround(
    "myGround",
    { width: 200, height: 200, subdivisions: 4 },
    scene
  );
  const ground = Mesh.CreateGroundFromHeightMap(
    "ground",
    "../../public/textures/heightMap.png",
    100,
    100,
    100,
    0,
    10,
    scene,
    false
  );
  const groundMaterial = new StandardMaterial("ground", scene);
  groundMaterial.diffuseTexture = new Texture("../public/textures/ground.jpg", scene);
  groundMaterial.specularColor = new Color3(0, 0, 0);
  ground.position.y = -1.5;
  ground.position.x = -50;
  ground.material = groundMaterial;

  //Bounding box Geometry

  const border0 = MeshBuilder.CreateBox("border0", { size: 1 }, scene);
  border0.scaling = new Vector3(1, 100, 200);
  border0.position.x = -100.0;
  border0.checkCollisions = true;
  border0.isVisible = false;

  const border1 = MeshBuilder.CreateBox("border1", { size: 1 }, scene);
  border1.scaling = new Vector3(1, 100, 200);
  border1.position.x = 100.0;
  border1.checkCollisions = true;
  border1.isVisible = false;

  const border2 = MeshBuilder.CreateBox("border2", { size: 1 }, scene);
  border2.scaling = new Vector3(200, 100, 1);
  border2.position.z = 100.0;
  border2.checkCollisions = true;
  border2.isVisible = false;

  const border3 = MeshBuilder.CreateBox("border3", { size: 1 }, scene);
  border3.scaling = new Vector3(200, 100, 1);
  border3.position.z = -100.0;
  border3.checkCollisions = true;
  border3.isVisible = false;

  //Weapon Geometry

  let rlMesh = MeshBuilder.CreateCylinder(
    "rl",
    { diameterTop: 0.8, diameterBottom: 0.9, height: 3, tessellation: 64 },
    scene
  );
  rlMesh.renderingGroupId = 1;
  const rlMeshMaterial = new StandardMaterial("rlMat", scene);
  rlMeshMaterial.diffuseColor = new Color3(0, 0, 0);
  rlMesh.material = rlMeshMaterial;
  rlMesh.rotation.x = Math.PI / 2;
  rlMesh.parent = camera;
  rlMesh.position = new Vector3(1, -2, 5);

  //Weapon Ray
  const castRay = () => {
    let tempRlMesh = rlMesh.clone("tempRlMesh");
    tempRlMesh.isVisible = false;

    const origin = tempRlMesh.getAbsolutePosition();
    const baseDirection = camera.getForwardRay().direction;

    const spread = 0.02;
    const randomX = (Math.random() - 0.5) * spread;
    const randomY = (Math.random() - 0.5) * spread;
    const randomZ = (Math.random() - 0.5) * spread;

    const spreadVector = new Vector3(randomX, randomY, randomZ);

    let direction = baseDirection.add(spreadVector);
    direction = Vector3.Normalize(direction);

    const length = 200;
    const ray = new Ray(origin, direction, length);
    console.log(`ray: ${JSON.stringify(ray)}`);
    let rayHelper = new RayHelper(ray);
    rayHelper.show(scene);
    var hit = scene.pickWithRay(ray);
    if (hit?.pickedMesh) {
      // hit.pickedMesh.scaling.y += 0.1;
    }
    tempRlMesh.dispose();
  };
  castRay();

  //Light
  scene.ambientColor = new Color3(1, 1, 1);
  const light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
  const light2 = new PointLight("light2", new Vector3(60, 60, 0), scene);
  // const gl = new GlowLayer("sphere", scene);
  light1.intensity = 0.5;
  light2.intensity = 0.5;

  const shadowGenerator = new ShadowGenerator(1024, light2);
  shadowGenerator?.getShadowMap()?.renderList?.push(box1);
  shadowGenerator?.getShadowMap()?.renderList?.push(sphere);

  myGround.receiveShadows = true;

  //Color
  const myMaterial = new StandardMaterial("myMaterial", scene);

  myMaterial.diffuseColor = new Color3(0, 0, 1);
  myMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
  myMaterial.emissiveColor = new Color3(1, 0, 0);
  myMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);
  sphere.material = myMaterial;

  //Position
  sphere.position = new Vector3(0, 2.5, 0);
  box1.position.y = 0.5;
  box1.rotation.y = 1;
  myGround.position.y = -1;

  // Create a particle system
  const particleSystem = new ParticleSystem("particles", 2000, scene);

  //Texture of each particle
  particleSystem.particleTexture = new Texture("../../textures/flare.png", scene);

  // Where the particles come from
  particleSystem.emitter = box1; // the starting object, the emitter
  particleSystem.minEmitBox = new Vector3(0, 2, 0); // Starting all from
  particleSystem.maxEmitBox = new Vector3(1, 2.5, 70); // To...

  // Colors of all particles
  particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
  particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
  particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

  // Size of each particle (random between...
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;

  // Life time of each particle (random between...
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.5;

  // Emission rate
  particleSystem.emitRate = 30000;

  // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
  particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

  // Set the gravity of all particles
  particleSystem.gravity = new Vector3(0, -9.81, 0);

  // Direction of each particle after it has been emitted
  particleSystem.direction1 = new Vector3(0, 0, 0);
  particleSystem.direction2 = new Vector3(-100, 10, 100);

  // Angular speed, in radians
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;

  // Speed
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;
  particleSystem.updateSpeed = 0.005;

  // Start the particle system
  particleSystem.start();

  //Animation
  const animationBox = new Animation(
    "myAnimation",
    "rotation.y",
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // An array with all animation keys
  const keys: IKeys[] = [];

  //At the animation key 0, the value of scaling is "1"
  keys.push({
    frame: 0,
    value: 1,
  });

  //At the animation key 20, the value of scaling is "0.2"
  keys.push({
    frame: 20,
    value: 6,
  });

  //At the animation key 100, the value of scaling is "1"
  keys.push({
    frame: 100,
    value: 1,
  });

  animationBox.setKeys(keys);
  box1.animations = [];
  box1.animations.push(animationBox);

  scene.beginAnimation(box1, 0, 100, true);

  myGround.checkCollisions = true;
  box1.checkCollisions = true;
  ground.checkCollisions = true;

  //Jump
  document.body.onkeyup = (e: KeyboardEvent) => {
    if (e.code == "Space") {
      jump();
    }
  };

  function jump() {
    camera.cameraDirection.y = 3;
  }
  return scene;
};
