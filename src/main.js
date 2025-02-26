import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// import { cameraFar } from 'three/webgpu';
// 已施加 importmap
//     "three": "/vendor/three/build/three.module.js",
//     "three/addons/": "/vendor/three/examples/jsm/"

class Game {
  constructor(A, B) {
      this.A = A;
      this.B = B;
  }
}


let Height;
let Result;
let Label = "B"

async function fetchHeight() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('网络错误');
        }
        const data = await response.json();
        // Height = data.B; 
        let result;
        switch (Label){
          case "A":
            result = data
            .filter(person => person.A > 0) // 筛选出 A 的对象
            break;
          case "B":
            result = data
            .filter(person => person.B > 0) // 筛选出 A 的对象
            break;
          case "C":
            result = data
            .filter(person => person.C > 0.5) // 筛选出 A 的对象
            break;
        }
        

        // result = result.B
        
        Result = result;
    } catch (error) {
        console.error('读取 JSON 数据时出错:', error);
    }
}
await fetchHeight();//这里要避免异步读取数据，保证Height已经被赋值




console.log(Result[0])



let camera, scene, renderer, labelRenderer;
let width, height;
init();
function init() {
  // scene
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x555555);

  // camera
  camera = new THREE.PerspectiveCamera();
  camera.position.set(400, 400, 400); 
  camera.lookAt(0, 0, 0);

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  width = window.innerWidth; height = window.innerHeight;
  renderer.setSize( width, height );
  document.getElementById('webgl').appendChild(renderer.domElement);
  window.addEventListener( 'resize', onWindowResize );
  renderer.setAnimationLoop( animate );

  // lights

  // const dirLight1 = new THREE.DirectionalLight( 0xffffff, 3 );
  // dirLight1.position.set( 1, 1, 1 );
  // scene.add( dirLight1 );

  // const dirLight2 = new THREE.DirectionalLight( 0x002288, 3 );
  // dirLight2.position.set( - 1, - 1, - 1 );
  // scene.add( dirLight2 );

  const ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add( ambientLight );



  // controls

  // controls = new MapControls( camera, labelRenderer.domElement );

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  // controls.dampingFactor = 0.05;

  // controls.screenSpacePanning = false;

  // controls.minDistance = 1;
  // controls.maxDistance = 500;

  // controls.maxPolarAngle = Math.PI / 2;


  // 坐标轴
  const axesHelper = new THREE.AxesHelper( 1000 );
  axesHelper.layers.enableAll();
  scene.add( axesHelper );


  const EARTH_RADIUS = 1;
  const earthGeometry = new THREE.SphereGeometry( EARTH_RADIUS, 16, 16 );
  const earthMaterial = new THREE.MeshPhongMaterial( {
    specular: 0x333333,
    shininess: 5,
    normalScale: new THREE.Vector2( 0.85, 0.85 )
  } );
  const earth = new THREE.Mesh( earthGeometry, earthMaterial );
  scene.add( earth );

  const earthDiv = document.createElement( 'div' );
  earthDiv.className = 'label';
  earthDiv.textContent = 'Earth';
  earthDiv.style.backgroundColor = 'transparent';

  const earthLabel = new CSS2DObject( earthDiv );
  earthLabel.position.set( 150 , 0, 0 );
  earthLabel.center.set( 0, 1 );
  earth.add( earthLabel );
  earthLabel.layers.set( 0 );

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );

  const controls = new OrbitControls( camera, labelRenderer.domElement );
  controls.minDistance = 5;
  controls.maxDistance = 100;
}







render(); // remove when using animation loop
function render(){
  renderer.render(scene, camera); //执行渲染操作
}



function onWindowResize() {

  width = window.innerWidth; height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

}

function animate() {

  // controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();
  labelRenderer.render( scene, camera );

}


function changeTag(Result) {
    
  for (let i in Result)
    {
      // console.log(Result[i].A)
      let randomAngle = Math.random()
      // console.log(randomAngle)
      const geometry = new THREE.BoxGeometry(Result[i].好评率*Result[i].好评率/1000, Result[i].评论人数*Result[i].评论人数*10, Result[i].好评率*Result[i].好评率/1000);
      
      // geometry.translate( Math.sin(2*Math.PI*randomAngle)*Result[i].天数/10, Result[i].评论人数*Result[i].评论人数*10/2, Math.cos(2*Math.PI*randomAngle)*Result[i].天数/10);
      geometry.translate( Math.sin(2*Math.PI*Result[i].B)*Result[i].天数/10, Result[i].评论人数*Result[i].评论人数*10/2, Math.cos(2*Math.PI*Result[i].B)*Result[i].天数/10);
  
      const material = new THREE.MeshPhongMaterial( { 
        color: new THREE.Color(Result[i].B,1-Result[i].B,1-Result[i].B), 
        flatShading: true 
      } );
  
      const mesh = new THREE.Mesh(geometry, material);

      let gameData = {
        "A" : 1,
        "B" : 2
      };
      mesh.userData = gameData;
      console.log(mesh.userData.A);

      const texLoader= new THREE.TextureLoader();
      const texture = texLoader.load(Result[i].图标网址);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.6, 0.9, 1);
      sprite.position.y =2; //标签底部箭头和空对象标注点重合  
    
      mesh.add(sprite)
    



      scene.add(mesh);
    }
  
}

// 实例化一个gui对象
const gui = new GUI();

const obj = {
  scale: 0,
};
// 参数3数据类型：对象(下拉菜单)
gui.add(obj, 'scale', {
  A: "A",
  B: "B",
  C: "C"
}).name('类型选择').onChange(function (value) {
  Label = value;
  changeTag(Result)
  console.log(Result[0]);
  // init();
  
  render();
});







const div = document.getElementById('tag');
// HTML元素转化为threejs的CSS2模型对象
const tag = new CSS2DObject(div);
tag.position.set(100,100,100);
scene.add(tag);

// 创建一个CSS2渲染器CSS2DRenderer
// const css2Renderer = new CSS2DRenderer();
// css2Renderer.render(scene, camera);
// css2Renderer.setSize(width, height);
// document.body.appendChild(css2Renderer.domElement);











const geometry1 = new THREE.SphereGeometry(25, 50, 50);
const material1 = new THREE.MeshLambertMaterial({
    color: 0x009999,
});
const mesh1 = new THREE.Mesh(geometry1, material1);



const geometry2 = new THREE.SphereGeometry(25, 50, 50);
const material2 = new THREE.MeshLambertMaterial({
    color: 0x009999,
});
const mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.position.y = 100;


const geometry3 = new THREE.SphereGeometry(25, 50, 50);
const material3 = new THREE.MeshLambertMaterial({
    color: 0x009999,
});
const mesh3 = new THREE.Mesh(geometry3, material3);
mesh3.position.x = 100;
const model = new THREE.Group();
// 三个网格模型mesh1,mesh2,mesh3用于射线拾取测试
mesh1.userData = "1";
mesh2.userData = "2";
mesh3.userData = "3";
model.add(mesh1, mesh2, mesh3);
model.updateMatrixWorld(true);

scene.add(mesh1,mesh2,mesh3)





// 坐标转化公式
// addEventListener('click',function(event){
//   const px = event.offsetX;
//   const py = event.offsetY;
//   //屏幕坐标px、py转标准设备坐标x、y
//   //width、height表示canvas画布宽高度
//   const x = (px / width) * 2 - 1;
//   const y = -(py / height) * 2 + 1;
//   console.log(x)
// })

renderer.domElement.addEventListener('click', function (event) {
  // .offsetY、.offsetX以canvas画布左上角为坐标原点,单位px
  const px = event.offsetX;
  const py = event.offsetY;
  //屏幕坐标px、py转WebGL标准设备坐标x、y
  //width、height表示canvas画布宽高度
  const x = (px / width) * 2 - 1;
  const y = -(py / height) * 2 + 1;
  //创建一个射线投射器`Raycaster`
  const raycaster = new THREE.Raycaster();
  //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
  // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
  // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
  const intersects = raycaster.intersectObjects([mesh1, mesh2, mesh3]);
  // console.log("射线器返回的对象", intersects[0].object.userData);
  // intersects.length大于0说明，说明选中了模型
  if (intersects.length > 0) {
    console.log("射线器返回的对象", intersects[0].object.userData);
    intersects[0].object.material.color.set(0xff00ff);
    // switch ( intersects[0].object.material.color.getHexString())
    // {
    //   case "009999":
    //     intersects[0].object.material.color.set(0xff00ff);
    //     break;
    //   case "ff00ff":
    //     intersects[0].object.material.color.set(0x009999);
    //     break;
    //   default:
    //     intersects[0].object.material.color.set(0xffffff);
    //     console.log(intersects[0].object.material.color.getHexString())
    // // 选中模型的第一个模型，设置为红色
    
    
    // }
  }
})

