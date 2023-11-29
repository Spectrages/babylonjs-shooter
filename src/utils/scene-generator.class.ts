import {
  Scene,
  Engine,
  UniversalCamera,
  Vector3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  CubeTexture,
  Texture,
  Color3,
  HemisphericLight,
  PointLight,
  Animation,
  Camera,
  SceneLoader,
  Vector2,
  VertexBuffer,
  FloatArray,
  VertexData,
  ProceduralTexture,
  GroundMesh,
} from "@babylonjs/core";
import { CameraStrategy } from "./camera.class";
import { WoodProceduralTexture } from "@babylonjs/procedural-textures";
import "babylonjs-loaders";

interface IKeys {
  frame: number;
  value: number;
}

export class SceneGenerator {
  private scene: Scene;
  private engine: Engine;
  private canvas: HTMLCanvasElement;
  private camera: UniversalCamera;

  constructor(canvas: HTMLCanvasElement, engine: Engine, cameraStrategy: CameraStrategy) {
    this.canvas = canvas;
    this.engine = engine;
    this.scene = new Scene(this.engine);
    this.camera = cameraStrategy.createCamera(this.scene) as UniversalCamera;
  }

  public generate(): Scene {
    this.scene.gravity = new Vector3(0, -0.75, 0);
    this.scene.collisionsEnabled = true;
    this.scene.enablePhysics();
    if (this.camera instanceof UniversalCamera) this.camera.setTarget(Vector3.Zero());

    this.createSkybox();
    this.configurePointerLock();
    // this.createFog();
    // this.createGeometry();
    this.createLighting();
    this.createAnimations();
    // this.createBox();
    this.createGround((ground: Mesh) => {
      this.populateWithTrees(ground);
    });
    return this.scene;
  }

  private createGround(callback: (ground: GroundMesh) => void): Mesh {
    return MeshBuilder.CreateGroundFromHeightMap(
      "ground",
      "./textures/heightMap.png",
      {
        width: 1000,
        height: 1000,
        subdivisions: 100,
        minHeight: -50,
        maxHeight: 5,
        updatable: false,
        onReady: (ground) => {
          const groundMaterial = new StandardMaterial("ground", this.scene);
          groundMaterial.diffuseTexture = new Texture("./textures/grass.png", this.scene);
          groundMaterial.specularColor = new Color3(0, 0, 0);
          ground.material = groundMaterial;
          ground.checkCollisions = true;
          callback(ground);
        },
      },
      this.scene
    );
  }

  // private createWater() {
  // const waterMesh = MeshBuilder.CreateGround("waterMesh", 2048, 2048, 16, this.scene, false);
  // const water = new WaterMaterial("water", this.scene, new Vector2(512, 512));
  // water.backFaceCulling = true;
  // water.bumpTexture = new Texture("textures/waterbump.png", this.scene);
  // water.windForce = -10;
  // water.waveHeight = 1.7;
  // water.bumpHeight = 0.1;
  // water.windDirection = new Vector2(1, 1);
  // water.waterColor = new Color3(0, 0, 221 / 255);
  // water.colorBlendFactor = 0.0;
  // water.addToRenderList(skybox);
  // waterMesh.material = water;
  // }

  private createSkybox() {
    const skybox = MeshBuilder.CreateBox("skybox", { size: 1000 }, this.scene);
    const skyboxMaterial = new StandardMaterial("skybox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "./textures/skybox",
      this.scene,
      null,
      false,
      null,
      function () {
        console.log("Skybox textures loaded successfully.");
      },
      function (message, exception) {
        console.error("Error loading skybox textures: ", message, exception);
      }
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
  }

  private configurePointerLock() {
    this.canvas.addEventListener("click", () => {
      if (!document.pointerLockElement) {
        this.canvas.requestPointerLock();
      }
    });
  }

  private createFog() {
    this.scene.fogMode = Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.005;
    this.scene.fogColor = new Color3(0.9, 0.9, 0.85);
  }

  private createGeometry() {}

  createHouse(positionX: number, positionY: number, positionZ: number) {
    SceneLoader.ImportMeshAsync(
      ["semi_house"],
      "https://assets.babylonjs.com/meshes/",
      "both_houses_scene.babylon"
    ).then((result) => {
      const house = result.meshes[0];
      if (house) {
        house.position = new Vector3(positionX, positionY, positionZ);
        house.scaling = new Vector3(17, 17, 17);
        house.checkCollisions = true;
      }
    });
  }

  private createLighting() {
    var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
    var light2 = new PointLight("light2", new Vector3(60, 60, 0), this.scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;
  }

  private createAnimations() {
    const animationBox = new Animation(
      "myAnimation",
      "rotation.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const keys: IKeys[] = [
      { frame: 0, value: 0 },
      { frame: 50, value: Math.PI },
      { frame: 100, value: 0 },
    ];
    animationBox.setKeys(keys);

    const box = this.scene.getMeshByName("box");
    if (box) {
      box.animations = [animationBox];
      this.scene.beginAnimation(box, 0, 100, true);
    }
  }

  private createBox() {
    const border0 = MeshBuilder.CreateBox("border0", { size: 1 }, this.scene);
    border0.scaling = new Vector3(1, 100, 200);
    border0.position.x = -100.0;
    border0.checkCollisions = true;
    border0.isVisible = false;

    const border1 = MeshBuilder.CreateBox("border1", { size: 1 }, this.scene);
    border1.scaling = new Vector3(1, 100, 200);
    border1.position.x = 100.0;
    border1.checkCollisions = true;
    border1.isVisible = false;

    const border2 = MeshBuilder.CreateBox("border2", { size: 1 }, this.scene);
    border2.scaling = new Vector3(200, 100, 1);
    border2.position.z = 100.0;
    border2.checkCollisions = true;
    border2.isVisible = false;

    const border3 = MeshBuilder.CreateBox("border3", { size: 1 }, this.scene);
    border3.scaling = new Vector3(200, 100, 1);
    border3.position.z = -100.0;
    border3.checkCollisions = true;
    border3.isVisible = false;
  }

  private QuickTreeGenerator(
    sizeBranch: number,
    sizeTrunk: number,
    radius: number,
    posX: number,
    posZ: number
  ) {
    const tree = new Mesh("tree", this.scene);
    tree.checkCollisions = true;

    const leafMaterial = new StandardMaterial("leafMaterial", this.scene);
    leafMaterial.diffuseColor = new Color3(0.5, 1, 0.5);

    const woodMaterial = new StandardMaterial("woodMaterial", this.scene);
    const woodTexture = new WoodProceduralTexture("woodTexture", 512, this.scene);

    woodTexture.ampScale = 50;
    woodMaterial.diffuseTexture = woodTexture;

    const leaves = MeshBuilder.CreateSphere("sphere", { segments: 2, diameter: sizeBranch });
    const positions = leaves.getVerticesData(VertexBuffer.PositionKind);

    if (positions) {
      const indices = leaves.getIndices();
      const numberOfPoints = positions.length / 3;

      const map = [];
      const v3 = Vector3;
      const max = [];
      for (let i = 0; i < numberOfPoints; i++) {
        const p = new v3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

        if (p.y >= sizeBranch / 2) {
          max.push(p);
        }

        let found = false;
        for (let index = 0; index < map.length && !found; index++) {
          const array = map[index];
          const p0 = array[0];
          if (p0 instanceof Vector3 && p instanceof Vector3) {
            if (p0.equals(p) || p0.subtract(p).lengthSquared() < 0.01) {
              array.push(i * 3);
              found = true;
            }
          }
        }
        if (!found) {
          let array = [];
          array.push(p, i * 3);
          map.push(array);
        }
      }

      const randomNumber = function (min: number, max: number) {
        if (min == max) {
          return min;
        }
        const random = Math.random();
        return random * (max - min) + min;
      };

      map.forEach(function (array) {
        const min = -sizeBranch / 10;
        const max = sizeBranch / 10;
        const rx = randomNumber(min, max);
        const ry = randomNumber(min, max);
        const rz = randomNumber(min, max);

        for (let index = 1; index < array.length; index++) {
          const vertexIndex = array[index];
          if (typeof vertexIndex === "number") {
            positions[vertexIndex] += rx;
            positions[vertexIndex + 1] += ry;
            positions[vertexIndex + 2] += rz;
          }
        }
      });

      leaves.setVerticesData(VertexBuffer.PositionKind, positions);
      const normals: FloatArray = [];
      VertexData.ComputeNormals(positions, indices, normals);
      leaves.setVerticesData(VertexBuffer.NormalKind, normals);
      leaves.convertToFlatShadedMesh();

      leaves.material = leafMaterial;

      const trunk = MeshBuilder.CreateCylinder("trunk", {
        height: sizeTrunk,
        diameterTop: radius - 2 < 1 ? 1 : radius - 2,
        diameterBottom: radius,
        tessellation: 10,
        subdivisions: 2,
      });

      trunk.material = woodMaterial;
      trunk.convertToFlatShadedMesh();

      leaves.parent = tree;
      trunk.parent = tree;
      leaves.checkCollisions = true;
      trunk.checkCollisions = true;

      leaves.position.y = (sizeTrunk + sizeBranch) / 2 - 2;

      tree.position.x = posX;
      tree.position.z = posZ;
      tree.position.y = sizeTrunk;

      return tree;
    }
  }

  public populateWithTrees(ground: Mesh) {
    const groundSize = 1000;
    const treeCount = 50;

    for (let i = 0; i < treeCount; i++) {
      const x = Math.random() * groundSize - groundSize / 2;
      const z = Math.random() * groundSize - groundSize / 2;
      const tree = this.QuickTreeGenerator(25, 35, 10, x, z);
      if (tree) {
        tree.position = new Vector3(x, 0, z);
        this.scene.addMesh(tree);
      }
    }
  }

  public getCamera() {
    return this.camera;
  }
}
