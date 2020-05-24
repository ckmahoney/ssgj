// copy paste imports 
import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene } from "@babylonjs/core/scene"
import { Vector3 } from "@babylonjs/core/Maths/math"
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { GridMaterial } from "@babylonjs/materials/grid"
import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/core/Meshes/Builders/sphereBuilder"
import "@babylonjs/core/Meshes/Builders/boxBuilder"


// my imports
import '@babylonjs/core/Helpers/sceneHelpers'
import * as TEXTURES from '@babylonjs/core/Materials/Textures'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { StandardMaterialDefines } from '@babylonjs/core/Materials/standardMaterial'
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder'
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/core/Loading/loadingScreen'
import { AssetsManager, MeshAssetTask } from '@babylonjs/core/Misc/assetsManager'

// @ts-ignore
const GROUND_SIZE = Number.parseFloat(600)
// @ts-ignore
const GROUND_DEPTH = Number.parseFloat(2)


init()


/** Create and run the game environment */
function init() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement
  const engine = new Engine(canvas)
  const environment = createGardenScene(engine);

  const meshes =
    [ 'bird'
    , 'coconut-tree'
    , 'grass'
    , 'island-palmtree'
    , 'plant' 
    , 'soil' ]

  const manager = new AssetsManager(environment.scene)
  manager.onProgress = function(remainingCount, totalCount, lastFinishedTask) {
      engine.loadingUIText = 'Loading next scene. ' + remainingCount + ' out of ' + totalCount + ' in the works.'
  }

  manager.onFinish = (tasks) => {
    console.log('Finished loading')
    console.log(tasks)
    const sphere = createSphere(environment.scene)
    const state = {...environment, sphere}
    engine.runRenderLoop( () => render(state) )
  }

  manager.onTaskSuccessObservable.add(function(task) {
      console.log('task successful', task)
  });

  manager.onTaskErrorObservable.add(function(task) {
      console.log('task error', task)
  });

  meshes.map( ( model ) =>  
    manager.addMeshTask( `${model} model`, '', 'models/', `${model}.babylon` ) )

  manager.load()
}


/** Create a new camera attached to `scene` */
function createCamera(name, position, scene): FreeCamera {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement
  const camera = new FreeCamera("camera1", new Vector3(-10, 5, 15), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(canvas, true)
  return camera
}


/** Creates a sphere within a `scene` */
function createSphere(scene: Scene): Mesh {
  const greenCloth = new StandardMaterial("greenCloth", scene)
  const sphere = MeshBuilder.CreateSphere("sphere1", {segments: 16, diameter: 4}, scene)

  sphere.position.y = 2

  greenCloth.diffuseColor = new Color3( 1, .51, 1 )
  greenCloth.specularColor = new Color3( 0, .51, 1 )
  greenCloth.emissiveColor = new Color3( .1, 1, 0 )
  greenCloth.ambientColor = new Color3( 1, .5, 0 )

  sphere.material = greenCloth
  return sphere
}


/** Initialize static environmental for a garden */
function createGardenScene(engine) {
  const scene = new Scene(engine)
  // const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
  // const camera = createCamera("camera1", new Vector3(0, 5, -10), scene)
  scene.createDefaultCameraOrLight(true, true, true)
  const skybox = createSkybox(scene, 'skybox')
  const ground = createGround(scene, 'ground')

  return {scene, skybox, ground}
}


/** Creates a grassy mesh on `scene` */
function createGround(scene: Scene, name: string = 'grass.jpg'): Mesh {
  const props = 
    { width: GROUND_SIZE
    , height: GROUND_SIZE
    , subdivisions: GROUND_DEPTH }

  const ground = MeshBuilder.CreateGround(name, props, scene)
  ground.position.y = -2
  const material = new StandardMaterial(name, scene)
  material.alpha = 0.5;
  const grass = new TEXTURES.Texture(`textures/${name}`, scene)
  material.diffuseTexture = grass
  material.reflectionTexture = grass

  // material.diffuseColor = new Color3(1, 0, 1)
  // material.specularColor = new Color3(0.5, 0.6, 0.87)
  // material.emissiveColor = new Color3(1, 1, 1)
  // material.ambientColor = new Color3(0.23, 0.98, 0.53)
  ground.material = material
  return ground
}


function createSkybox(scene, name = 'skybox'): Mesh {
  const skybox = MeshBuilder.CreateBox(name, {size:1000.0}, scene)
  const material = new StandardMaterial(name, scene)

  material.backFaceCulling = false
  material.reflectionTexture = new TEXTURES.CubeTexture(`textures/${name}`, scene)
  material.reflectionTexture.coordinatesMode = TEXTURES.Texture.SKYBOX_MODE

  material.diffuseColor = new Color3(0, 0, 0)
  material.specularColor = new Color3(0, 0, 0)
  skybox.material = material
  return skybox
}


/** Callback for Babylon to render a new frame */
function render(environment: any) {
    const { scene, light,  skybox, ground, sphere } = environment;

    // Setup event handlers for user interactions
    const listen = e => {
      moveMeshes( e.code, [sphere] )
    }

    window.removeEventListener( 'keydown', listen )
    window.addEventListener( 'keydown', listen )
    scene.render()
}


interface MoveMeshes {
  ( keyCode: String, meshes: Mesh[] ): void
  keyPresses: String[]
}

let moveMeshes: MoveMeshes = Object.assign(
  (code: String, meshes: Mesh[]) => {
  if ( !moveMeshes.keyPresses ) 
    moveMeshes.keyPresses = []


  const newRelativePosition = 
    { x: 0
    , y: 0
    , z: 0 }

  switch( code ) {
    case 'KeyA' :
      newRelativePosition.x += 0.01
      break

    case 'KeyD' :
      newRelativePosition.x -= 0.01
      break

    case 'KeyQ' :
      newRelativePosition.y += 0.0001
      break

    case 'KeyE' :
      newRelativePosition.y -= 0.0001
      break

    case 'KeyS' :
      newRelativePosition.z += 0.01
      break

    case 'KeyW' :
      newRelativePosition.z -= 0.01
      break
    default :
  }
  
  const update = mesh => {
    for ( let axis in newRelativePosition ) 
      mesh.position[axis] += newRelativePosition[axis]
  }

  meshes.forEach( update )
}, { keyPresses: [] } )

