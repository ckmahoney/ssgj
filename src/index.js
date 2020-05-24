// copy paste imports 
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/Builders/sphereBuilder";
import "@babylonjs/core/Meshes/Builders/boxBuilder";
// my imports
import * as TEXTURES from '@babylonjs/core/Materials/Textures';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
// @ts-ignore
var GROUND_SIZE = Number.parseFloat(600);
// @ts-ignore
var GROUND_DEPTH = Number.parseFloat(2);
init();
/** Create and run the game environment */
function init() {
    var canvas = document.querySelector("canvas");
    var engine = new Engine(canvas);
    var scene = createGardenScene(engine);
    var sphere = createSphere(scene);
    engine.runRenderLoop(function () { return render(scene, sphere); });
}
/** Create a new camera attached to `scene` */
function createCamera(name, position, scene) {
    var canvas = document.querySelector("canvas");
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    return camera;
}
/** Creates a sphere within a `scene` */
function createSphere(scene) {
    var greenCloth = new StandardMaterial("greenCloth", scene);
    var sphere = MeshBuilder.CreateSphere("sphere1", { segments: 16, diameter: 4 }, scene);
    sphere.position.y = 2;
    greenCloth.diffuseColor = new Color3(0, 0, 1);
    greenCloth.specularColor = new Color3(0, 0, 1);
    greenCloth.emissiveColor = new Color3(1, 0, 0);
    greenCloth.ambientColor = new Color3(1, 0, 0);
    sphere.material = greenCloth;
    return sphere;
}
/** Initialize static environmental for a garden */
function createGardenScene(engine) {
    var scene = new Scene(engine);
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    var camera = createCamera("camera1", new Vector3(0, 5, -10), scene);
    var skybox = createSkybox(scene, 'skybox');
    var ground = createGround(scene, 'ground');
    // @ts-ignore
    console.log('created ground', window.ground = ground);
    return scene;
}
/** Creates a grassy mesh on `scene` */
function createGround(scene, name) {
    if (name === void 0) { name = 'grass.jpg'; }
    // const material = new GridMaterial("grid", scene)
    var props = { width: GROUND_SIZE,
        height: GROUND_SIZE,
        subdivisions: GROUND_DEPTH };
    // const ground = MeshBuilder.CreateGround("ground1", props, scene)
    var ground = MeshBuilder.CreateGround(name, props, scene);
    var material = new StandardMaterial(name, scene);
    material.alpha = 1;
    material.reflectionTexture = new TEXTURES.Texture("textures/" + name, scene);
    // material.reflectionTexture.coordinatesMode = TEXTURES.Texture.SKYBOX_MODE
    material.diffuseColor = new TEXTURES.Texture("textures/" + name, scene);
    // material.specularColor = new Color3(0, 0, 0)
    // material.diffuseColor = new Color3(1, 0, 1)
    // material.specularColor = new Color3(0.5, 0.6, 0.87)
    // material.emissiveColor = new Color3(1, 1, 1)
    // material.ambientColor = new Color3(0.23, 0.98, 0.53)
    ground.material = material;
    return ground;
}
function createSkybox(scene, name) {
    if (name === void 0) { name = 'skybox'; }
    var skybox = MeshBuilder.CreateBox(name, { size: 1000.0 }, scene);
    var material = new StandardMaterial(name, scene);
    material.backFaceCulling = false;
    material.reflectionTexture = new TEXTURES.CubeTexture("textures/" + name, scene);
    material.reflectionTexture.coordinatesMode = TEXTURES.Texture.SKYBOX_MODE;
    material.diffuseColor = new Color3(0, 0, 0);
    material.specularColor = new Color3(0, 0, 0);
    skybox.material = material;
    return skybox;
}
function render(scene, sphere) {
    var listen = function (e) {
        // window.removeEventListener( 'keydown', listen )
        handleKeydown(e.code, sphere);
    };
    window.removeEventListener('keydown', listen);
    window.addEventListener('keydown', listen);
    scene.render();
}
function handleKeydown(code, sphere) {
    switch (code) {
        case 'KeyD':
            sphere.position.x = sphere.position.x + 0.1;
            break;
        case 'KeyA':
            sphere.position.x = sphere.position.x - 0.1;
            break;
        case 'KeyW':
            sphere.position.y = sphere.position.y + 0.1;
            break;
        case 'KeyS':
            sphere.position.y = sphere.position.y - 0.1;
            break;
        case 'KeyQ':
            sphere.position.z = sphere.position.z + 0.1;
            break;
        case 'KeyE':
            sphere.position.z = sphere.position.z - 0.1;
            break;
    }
}
