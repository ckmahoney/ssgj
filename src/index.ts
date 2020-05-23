// copy paste imports 
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid";
import * as TEXTURES from '@babylonjs/core/Materials/Textures';

import { Color3 } from '@babylonjs/core/Maths/math.color';

// my imports
// import * as TEXTURES from "@babylonjs/core/Materials/Textures"; 
// import from "@babylonjs/core/Materials/Textures"; 
import { StandardMaterialDefines } from "@babylonjs/core/Materials/standardMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
// Side-effects only imports allowing the standard material to be used as default.
import "@babylonjs/core/Materials/standardMaterial";
// Side-effects only imports allowing Mesh to create default shapes (to enhance tree shaking, the construction methods on mesh are not available if the meshbuilder has not been imported).
import "@babylonjs/core/Meshes/Builders/sphereBuilder";
import "@babylonjs/core/Meshes/Builders/boxBuilder";

const GROUND_SIZE = 600;
const GROUND_DEPTH = 2;

init();


function init() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const engine = new Engine(canvas);
  const scene = setupEnvironment( new Scene(engine) );


  const sphere = createSphere(scene);
  engine.runRenderLoop( () => render(scene, sphere) );
}


function createCamera(name, position, scene): FreeCamera {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  return camera;
}


function setupEnvironment(scene: Scene): Scene {
  const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  const camera = createCamera("camera1", new Vector3(0, 5, -10), scene);
  const skybox = createSkybox(scene, 'skybox');
  return scene;
}


function createSphere(scene: Scene): Mesh {
  const greenCloth = new StandardMaterial("greenCloth", scene);
  const sphere = MeshBuilder.CreateSphere("sphere1", {segments: 16, diameter: 4}, scene);

  sphere.position.y = 2;

  greenCloth.diffuseColor = new Color3( 0, 0, 1 );
  greenCloth.specularColor = new Color3( 0, 0, 1 );
  greenCloth.emissiveColor = new Color3( 1, 0, 1 );
  greenCloth.ambientColor = new Color3( 1, 0, 1 );

  sphere.material = greenCloth;
  return sphere;
}


function createGround( scene ) {
  // const material = new GridMaterial("grid", scene);
  const ground = MeshBuilder.CreateGround("ground1", {width: GROUND_SIZE, height: GROUND_SIZE, subdivisions: GROUND_DEPTH}, scene);
  const material = new StandardMaterial('ground', scene);
  material.diffuseColor = new Color3(1, 0, 1);
  material.specularColor = new Color3(0.5, 0.6, 0.87);
  material.emissiveColor = new Color3(1, 1, 1);
  material.ambientColor = new Color3(0.23, 0.98, 0.53);
}


function createSkybox( scene, name = 'skybox' ): Mesh {
  const skybox = MeshBuilder.CreateBox(name, {size:1000.0}, scene);
  const material = new StandardMaterial(name, scene);

  material.backFaceCulling = false;
  material.reflectionTexture = new TEXTURES.CubeTexture(`textures/${name}`, scene);
  material.reflectionTexture.coordinatesMode = TEXTURES.Texture.SKYBOX_MODE;

  material.diffuseColor = new Color3(0, 0, 0);
  material.specularColor = new Color3(0, 0, 0);
  skybox.material = material;
  return skybox;
}


function render( scene: Scene, sphere: Mesh ) {
    const listen = e => {
      window.removeEventListener( 'keydown', listen );
      handleKeydown( e.code, sphere );
    }

    // window.removeEventListener( 'keydown', listen );
    window.addEventListener( 'keydown', listen );
    scene.render();
}


function handleKeydown( code: string, sphere: Mesh ) {
  switch( code ) {
    case 'KeyD' :
      sphere.position.x = sphere.position.x + 0.1;
      break;

    case 'KeyA' :
      sphere.position.x = sphere.position.x - 0.1;
      break;

    case 'KeyW' :
      sphere.position.y = sphere.position.y + 0.1;
      break;

    case 'KeyS' :
      sphere.position.y = sphere.position.y - 0.1;
      break;

    case 'KeyQ' :
      sphere.position.z = sphere.position.z + 0.1;
      break;

    case 'KeyE' :
      sphere.position.z = sphere.position.z - 0.1;
      break;
    } 
}