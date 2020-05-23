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

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;


const engine = new Engine(canvas);
var scene = new Scene(engine);

const camera = createCamera("camera1", new Vector3(0, 5, -10), scene);

function createCamera(name, position, scene): FreeCamera {
  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true); // This attaches the camera to the canvas
  return camera;
}

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Create a grid material
var material = new GridMaterial("grid", scene);

const greenCloth = new StandardMaterial("greenCloth", scene);

greenCloth.diffuseColor = new Color3( 1, 0, 1 );
greenCloth.specularColor = new Color3( 1, 0, 1 );
greenCloth.emissiveColor = new Color3( 1, 0, 1 );
greenCloth.ambientColor = new Color3( 1, 0, 1 );

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
var sphere = Mesh.CreateSphere("sphere1", 16, 4, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 2;

// Affect a material
sphere.material = greenCloth;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
var ground = Mesh.CreateGround("ground1", GROUND_SIZE, GROUND_SIZE, GROUND_DEPTH, scene);


const skybox = createSkybox(scene, 'skybox');



// Affect a material
ground.material = material;


const framerate = 1000 / 60;




function createSkybox( scene, name = 'skybox' ) {
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

engine.runRenderLoop( renderSphere );



function renderSphere() {
    window.removeEventListener( 'keydown', handleKeydown );
    window.addEventListener( 'keydown', handleKeydown );
    scene.render();
}

function handleKeydown( event ) {
  console.log('handleKeydown');
  switch( event.code ) {
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