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
import '@babylonjs/core/Loading/Plugins/babylonFileLoader'
import '@babylonjs/core/Loading/loadingScreen'
import * as GUI from 'babylonjs-gui'
import * as TEXTURES from '@babylonjs/core/Materials/Textures'
import { Matrix } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { StandardMaterialDefines } from '@babylonjs/core/Materials/standardMaterial'
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { AssetsManager, MeshAssetTask } from '@babylonjs/core/Misc/assetsManager'

const rand = () => Math.random()

let engine;
// @ts-ignore
const GROUND_SIZE = Number.parseFloat(600)
// @ts-ignore
const GROUND_DEPTH = Number.parseFloat(2)
const models =
  [ 'bird'
  , 'coconut-tree'
  , 'grass'
  , 'island-palmtree'
  , 'plant' 
  , 'soil' ]

init()
    // @ts-ignore
  window.meshes = [];

/** Create and run the game environment */
function init() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement
  engine = new Engine(canvas)
  const environment = createGardenScene(engine);

  const manager = new AssetsManager(environment.scene)
  manager.onProgress = function(remainingCount, totalCount, lastFinishedTask) {
      engine.loadingUIText = 'Loading next scene. ' + remainingCount + ' out of ' + totalCount + ' in the works.'
  }

  manager.onFinish = (tasks) => {
    // const sphere = createSphere(environment.scene)
    const state = {...environment}
    const skybox = createSkybox(environment.scene, 'skybox')
    const ground = createGround(environment.scene, 'ground')
    setupInitialPositions(tasks, {scene: environment.scene})


    applyListners(environment.scene) 


    engine.runRenderLoop( () => render(state) )
  }

  manager.onTaskSuccessObservable.add(function(task) {
      console.log('task successful', task)
      // @ts-ignore
      task.loadedMeshes.forEach( mesh => mesh.metadata = task.name )
  });

  manager.onTaskErrorObservable.add(function(task) {
      console.log('task error', task)
  });

  models.map( ( model ) =>  
    manager.addMeshTask( model, '', 'models/', `${model}.babylon` ) )

  manager.load()
}


function applyListners(scene: Scene) {
  scene.onPointerDown = function castRay() {
    const camera = scene.cameras[0]
    var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);  
    var hit = scene.pickWithRay(ray);

    if (hit.pickedMesh && hit.pickedMesh.metadata == "cannon") {
        createGUIButton();
    }
  }
}

function createGUIButton() {
    //Creates a gui label to display the cannon
    let guiCanvas = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiButton = GUI.Button.CreateSimpleButton("guiButton", "Cannon Selected");
    guiButton.width = "150px"
    guiButton.height = "40px";
    guiButton.color = "white";
    guiButton.cornerRadius = 5;
    guiButton.background = "green";
    guiButton.onPointerUpObservable.add(function() {
        guiCanvas.dispose();
    });
    guiButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guiCanvas.addControl(guiButton);
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
  scene.gravity = new Vector3(0, -9.81, 0);
  scene.createDefaultCameraOrLight(true, true, true)
  scene.collisionsEnabled = true;
  scene.cameras.forEach( cam => {
    // @ts-ignore
    // cam.applyGravity = true 
    // // @ts-ignore
    // cam.checkCollisions = true
    // // @ts-ignore
    // cam.collisionRadius = new Vector3(0.5, 0.5, 0.5)
  } )
  return {scene}
}


/** Creates a grassy mesh on `scene` */
function createGround(scene: Scene, name: string = 'grass.babylon'): Mesh {
  const props = 
    { width: GROUND_SIZE
    , height: GROUND_SIZE
    , subdivisions: GROUND_DEPTH }

  const ground = MeshBuilder.CreateGround(name, props, scene)
  ground.checkCollisions = true;

  const material = new StandardMaterial(name, scene)
  const grass = new TEXTURES.Texture(`textures/grass.jpg`, scene)

  material.alpha = 1;
  material.ambientTexture = grass
  material.backFaceCulling = false;

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

function setup(mesh: Mesh) {
  mesh.checkCollisions = true
  mesh.visibility = 0

  const name = mesh.name
  const unit = Vector3.One()
  const scaleUp = new Vector3(2, 2, 2)
  const scaleDown = new Vector3(0.125, 0.125, 0.125)

  const createInstances = ( mesh, qty, x, y, z ) => {
    for ( let i = 0; i < qty; i++ ) {
      let clone = mesh.createInstance(name + i)
      clone.position = new Vector3(x(i), y(i), z(i))
      let scale = rand() * 2;
      if ( scale > 1 ) scale /= 2;
      // mesh.scaling = mesh.scaling.scale( scale )
    }
  }

  switch ( mesh.metadata ) {
    case 'bird' : 
      mesh.position = new Vector3(3, 10, 2)
      mesh.scaling = scaleUp
      mesh.visibility = 1
      break

    case 'plant' :
      mesh.position = new Vector3(0, 0.01,0)
      mesh.scaling = unit.scale( 1 / 120 )
      mesh.visibility = 1
      for ( let j = 0; j < 10; j++ ) {
        createInstances( mesh, 100, i => j * i * rand(), () => 0, i => rand() * j * i)
      }
      break


    // the wird pixelated 3d tree
    case 'coconut-tree' : 
      let scale = 1/4
      let yOffset = 50 * scale
      mesh.position = new Vector3(60, yOffset, 12)
      mesh.scaling = scaleDown.scale(scale)
      mesh.visibility = 1


      createInstances( mesh, 20, i=>rand() * 40 + 12, i=>yOffset, i=>rand()*50 )
      createInstances( mesh, 35, i=>rand() *-90, i=> yOffset, i=> rand()*i * 2 )
      break

    // the big red and black checker thing
    case 'island-palmtree' : 
      mesh.position = new Vector3(-30, 0, 2)
      mesh.scaling = new Vector3(0.01, 0.01, 0.01)
      mesh.visibility = 1
      createInstances( mesh, 23, i=>rand()*-40, i=>yOffset, i=>rand()*30)
      createInstances( mesh, 23, i=>rand()*i*2+10, i=>yOffset, i=>rand()*i*3)
     
      break
  }
}


interface SetupIntialPositions {
  (tasks, environment): boolean
}

let setupInitialPositions: SetupIntialPositions = (tasks, environment): boolean => {
  const setInitialPosition = ( scene: Scene,  task, indexAsset ) => {
    const { loadedMeshes } = task
    const internalMesh = loadedMeshes[0];    
    loadedMeshes.forEach( setup )
           
    setup(internalMesh);            
   

  }

  tasks.filter( task  => {
    console.log
    const name = task.sceneFilename.concat().replace('.babylon', '')
    return models.includes( name ) 
  } ).forEach( (task, i) => setInitialPosition(environment.scene, task, i) )
  return true
}

 



interface Render {
  (environment: any): void
  isInitialized: boolean
}

/** Callback for Babylon to render a new frame */
let render: Render = Object.assign(
  (environment: any) => {
    const { scene, light,  skybox, ground } = environment;

    // Setup event handlers for user interactions
    const listen = e => {
      moveMeshes( e.code, scene.cameras )
    }

    window.removeEventListener( 'keydown', listen )
    window.addEventListener( 'keydown', listen )
    scene.render()
}, { isInitialized: false } )


interface MoveMeshes {
  ( keyCode: String, meshes: Mesh[] ): void
  keyPresses: String[]
}

let moveMeshes: MoveMeshes = Object.assign(
  (code: String, meshes: any[]) => {
  if ( !moveMeshes.keyPresses ) 
    moveMeshes.keyPresses = []


  const newRelativePosition = 
    { x: 0
    , y: 0
    , z: 0 }

  const faster = 0.0025
  const slower = 0.001

  switch( code ) {
    // left
    case 'KeyA' :
      newRelativePosition.x -= faster
      break

      // right
    case 'KeyD' :
      newRelativePosition.x += slower
      
      break

    case 'KeyQ' :
      // newRelativePosition.y += slower
      break

    case 'KeyE' :
      // newRelativePosition.y -= slower
      break

      // forwards
    case 'KeyW' :
      newRelativePosition.z += faster
      break

      // backwards
    case 'KeyS' :
      newRelativePosition.z -= slower
      break
    default :
  }
  
  const update = mesh => {
    const pos = {...mesh.position}
    for ( let axis in newRelativePosition ) 
      pos[axis] += newRelativePosition[axis]

    mesh.setPosition( new Vector3( pos.x, pos.y, pos.z ) )
  }

  meshes.forEach( update )
}, { keyPresses: [] } )

