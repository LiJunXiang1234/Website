
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';




let Games2show;     //这是要显示的游戏类型
let Label = "A";    //这是游戏类型
let R = 0.1;          //这是游戏类型相关度
// 读取数据，要保证数据先读取完 // 返回值会记录在 Games2show
async function getData(Label,R) {
  try {
    const response = await fetch('data.json');
    if (!response.ok){
      throw new Error('未读取成功');
    }
    const data = await response.json();

    let result;
    switch(Label){
      case "A":
        result = data
        .filter(label => label.A > R) // 筛选出 类型A 的对象
        break;
      case "B":
        result = data
        .filter(label => label.B > R) // 筛选出 类型B 的对象
        break;
      case "C":
        result = data
        .filter(label => label.C > R) // 筛选出 类型C 的对象
        break;
      case "D":
        result = data
        .filter(label => label.D > R) // 筛选出 类型C 的对象
        break;
      case "E":
        result = data
        .filter(label => label.E > R) // 筛选出 类型C 的对象
        break;
    }

    Games2show = result
    console.log('数据读取完毕')
  } catch (error) {
    console.error('读取 JSON 数据时出错:', error);
  }
}
await getData(Label,R);//这里是要避免异步读取数据，保证游戏数据已经读取

// console.log(Games2show[1])
// R = 0.5
// await getData(Label,R);//这里是要避免异步读取数据，保证游戏数据已经读取
// console.log(Games2show[1])

let camera, scene, renderer, labelRenderer;//场景初始化
let gameGroup = new THREE.Group();;
let minRate = 90; let maxRate = 100;
let gui;
let width = window.innerWidth; let height = window.innerHeight;
init(); // 初始化
animate()

let Tag = 'A';// 测试用

// 清除group中的所有子物件
function clearGroup(group) {
  while (group.children.length > 0) {
    const child = group.children[0]; // 始终移除第一个子物体
    group.remove(child); // 从组中移除
  }
}


//这个是场景管理器，管理场景中的物体, 通过按钮控制
const sceneManager = {
  testTag : Tag,
  // 测试用
  'RandomCubeTest': function () {
    let x = Math.random()
    let y = Math.random()
    let z = Math.random()
    const geometry = new THREE.BoxGeometry(1,1,1)
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0.8,0.8,0.8),
      flatShading: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x*20,y*20,z*20)


    const texLoader= new THREE.TextureLoader();
    const texture = texLoader.load("https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header_schinese.jpg?t=1729703045");
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.6, 0.9, 1);
    sprite.position.y = 1; //标签底部箭头和空对象标注点重合  

    mesh.add(sprite)
    gameGroup.add(mesh)
    // scene.add(mesh)
    console.log(Tag);
  },
  'changeTag': function(tag){
    Tag = tag;
    console.log(Tag);
    // 清空 gameGroup 的所有子物体
    clearGroup(gameGroup);

  },

  // 功能一：选择类型
  // 选择类型后会改变标签，然后绘制场景
  'changeLabel': function(label){
    Label = label;
    sceneManager.drawScene(Label, R)
  },
  // 功能二：调整好评率
  // 可以选择好评率区间， 然后绘制场景
  'chooseRate': function(min, max){
    minRate = min;
    maxRate = max;
    sceneManager.drawScene(Label, R)
  },
  // 绘制场景函数：先清空场景，然后重新绘制图形
  'drawScene': async function(label= "A", minR=0.1){
    clearGroup(gameGroup)
    Label = label;
    R = minR;//R也是相关度，会根据R筛选剔除掉相关度较小的游戏
    console.log("minR:",R)
    await getData(Label,R) //数据存储到 Games2show
    let rel;
    switch (Label) {
      case "A":
      case "B":
      case "C":
      case "D":
      case "E":
        rel = Label; // 直接用 Label 赋值给 rel //rel是相关度，会根据标签去获取游戏对于该标签的相关度
        break;
      default:
        rel = null; // 处理其他情况
    }
    
    for (let i in Games2show) {
      const currentGame = Games2show[i];
      sceneManager.GroupAddMesh(
        currentGame.天数,
        currentGame.好评率,
        currentGame.评论人数,
        currentGame[rel], // 使用方括号语法
        currentGame.图标网址,
      );
    }
    
  },
  // 这是向gameGroup添加物体的函数，会根据每一个游戏的数据去定义游戏数据的大小、位置、颜色等，好评率80%以上的游戏还会显示图标
  'GroupAddMesh': function(days, rate, logP, relevance, imageUrl){
    
    const geometry = new THREE.BoxGeometry(logP/10,rate/100,logP/10)
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(relevance,1-relevance,1-relevance),
      flatShading: true,
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((1-relevance)*15 ,rate/200,days/100);

    if (rate >= minRate && rate < maxRate){
      const texLoader= new THREE.TextureLoader();
      const texture = texLoader.load(imageUrl);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.8, 0.45, 1);
      sprite.position.y = rate/100; //标签底部箭头和空对象标注点重合  

      mesh.add(sprite)
    }
    gameGroup.add(mesh);
    console.log(mesh.position)
  }


}
initGui();
function initGui() {

  gui = new GUI();

  gui.title( 'Camera Layers' );

  gui.add(sceneManager, 'changeLabel', {
    "策略经营" : "A",
    "独立游戏" : "B",
    "战争模拟" : "C",
    "混合多元" : "D",
    "3A大作" : "E",
  }).name("选择类别").onChange(function (label){
    Label = label;
    sceneManager.drawScene(Label, R)
  })
  // 添加输入框来设置 minRate 和 maxRate
  // 定义选项
  const minRateOptions = { "极差":0, "差":60, "一般":80, "优秀":90, "佳作":95};

  // 添加输入框来设置 minRate
  gui.add({ minRate: 0 }, 'minRate', minRateOptions).onChange(value => {
      sceneManager.chooseRate(value, maxRate); // 假设 maxRate 是一个可访问的属性
  });

  // 添加输入框来设置 maxRate
  const maxRateOptions = { "差":60, "一般":80, "优秀":90, "佳作":95, "神作":100};
  gui.add({ maxRate: 10 }, 'maxRate', maxRateOptions).onChange(value => {
      sceneManager.chooseRate(minRate, value); // 假设 minRate 是一个可访问的属性
  });
  gui.open();

}






function init(){
  // scene
  scene = new THREE.Scene();

  const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
  dirLight.position.set( 0, 0, 1 );
  dirLight.layers.enableAll();
  scene.add( dirLight );

  const dirLight2 = new THREE.DirectionalLight( 0xffffff, 3 );
  dirLight2.position.set( 0, 1, -1 );
  dirLight2.layers.enableAll();
  scene.add( dirLight2 );

  const ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add( ambientLight );

  const axesHelper = new THREE.AxesHelper( 5 );
  axesHelper.layers.enableAll();
  scene.add( axesHelper );


  // // 创建一个立方体并添加到 gameGroup
  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const cube = new THREE.Mesh(geometry, material);
  // gameGroup.add(cube); // 将立方体添加到 gameGroup 中
  scene.add(gameGroup)





  // camera
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
  camera.position.set( 10, 5, 20 );
  camera.layers.enableAll();



   //renderer
   renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio( window.devicePixelRatio );
   width = window.innerWidth; height = window.innerHeight;
   renderer.setSize( width, height );
   document.getElementById('webgl').appendChild(renderer.domElement);
   window.addEventListener( 'resize', onWindowResize );


  // controls
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );

  const controls = new OrbitControls( camera, labelRenderer.domElement );
  controls.minDistance = 1;
  controls.maxDistance = 1000;

  // resize
  window.addEventListener( 'resize', onWindowResize );

  
}


// onResize
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  labelRenderer.setSize( window.innerWidth, window.innerHeight );

}


// animate函数会循环渲染场景
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  labelRenderer.render( scene, camera );
}




renderer.domElement.addEventListener('click', function (event) {
  console.log('点击事件触发', event);
  const px = event.offsetX;
  const py = event.offsetY;
  const x = (px / width) * 2 - 1;
  const y = -(py / height) * 2 + 1;
  //创建一个射线投射器`Raycaster`
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
 
  const intersects = raycaster.intersectObjects(gameGroup.children);
  // console.log("射线器返回的对象", intersects[0]);
  // intersects.length大于0说明，说明选中了模型
  if (intersects.length > 0) {
    console.log("射线器返回的对象", intersects[0]);
  } else {
    console.log("没有选中任何对象");
  }
})

// // 坐标转化公式
// addEventListener('click',function(event){
//   const px = event.offsetX;
//   const py = event.offsetY;
//   //屏幕坐标px、py转标准设备坐标x、y
//   //width、height表示canvas画布宽高度
//   const x = (px / width) * 2 - 1;
//   const y = -(py / height) * 2 + 1;
//   console.log(x)
// })
















// let gui;

// let camera, scene, renderer, labelRenderer;

// const layers = {

//   'Toggle Name': function () {

//     camera.layers.toggle( 0 );

//   },
//   'Toggle Mass': function () {

//     camera.layers.toggle( 1 );

//   },
//   'Enable All': function () {

//     camera.layers.enableAll();

//   },

//   'Disable All': function () {

//     camera.layers.disableAll();

//   }

// };

// const RandomCube = {
//   'add random cube': function(){
//     const geometry = new THREE.SphereGeometry(1, 50, 50);
//     const material = new THREE.MeshLambertMaterial({
//         color: 0x009999,
//     });
//     const mesh  =new THREE.Mesh(geometry, material)
//     let x = Math.random();
//     let y = Math.random();
//     let z = Math.random();
//     mesh.position.set(x*20,y*20,z*20)
//     mesh.layers.set(1)
//     const axesHelper = new THREE.AxesHelper(30); // 1 是坐标轴的长度
//     mesh.add(axesHelper); // 将坐标系添加到物体中


//   const texLoader= new THREE.TextureLoader();
//   const texture = texLoader.load("https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header_schinese.jpg?t=1729703045");
//   const spriteMaterial = new THREE.SpriteMaterial({
//     map: texture,
//   });
//   const sprite = new THREE.Sprite(spriteMaterial);
//   sprite.scale.set(1.6, 0.9, 1);
//   sprite.position.y =2; //标签底部箭头和空对象标注点重合  

//   mesh.add(sprite)



//   scene.add(mesh)
//   console.log("Add Random Cube!")
//   }
// }

// const clock = new THREE.Clock();
// const textureLoader = new THREE.TextureLoader();

// let moon;

// init();
// animate();

// function init() {
//   camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
//   camera.position.set( 10, 5, 20 );
//   camera.layers.enableAll();





// // 场景Scene
//   scene = new THREE.Scene();

//   const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
//   dirLight.position.set( 0, 0, 1 );
//   dirLight.layers.enableAll();
//   scene.add( dirLight );

//   const dirLight2 = new THREE.DirectionalLight( 0xffffff, 3 );
//   dirLight2.position.set( 2, 2, 1 );
//   dirLight2.layers.enableAll();
//   scene.add( dirLight2 );

//   const axesHelper = new THREE.AxesHelper( 5 );
//   axesHelper.layers.enableAll();
//   scene.add( axesHelper );




// // 地球Mesh
//   const earthGeometry = new THREE.SphereGeometry( 1, 16, 16 );
//   const earthMaterial = new THREE.MeshPhongMaterial( {
//     specular: 0x333333,
//     shininess: 5,
//     normalScale: new THREE.Vector2( 0.85, 0.85 )
//   } );
//   const earth = new THREE.Mesh( earthGeometry, earthMaterial );
//   scene.add( earth );
// //  月球Mesh
//   const moonGeometry = new THREE.SphereGeometry( 0.27, 16, 16 );
//   const moonMaterial = new THREE.MeshPhongMaterial( {
//     shininess: 5,
//   } );
//   moon = new THREE.Mesh( moonGeometry, moonMaterial );
//   scene.add( moon );

//   earth.layers.enableAll();
//   moon.layers.enableAll();

//   const earthDiv = document.createElement( 'div' );
//   earthDiv.className = 'label';
//   earthDiv.textContent = 'Earth';
//   earthDiv.style.backgroundColor = 'transparent';

//   const earthLabel = new CSS2DObject( earthDiv );
//   earthLabel.position.set( 0, 1, 0 );
//   earthLabel.center.set( 0, 1 );
//   earth.add( earthLabel );
//   earthLabel.layers.set( 0 );

//   const earthMassDiv = document.createElement( 'div' );
//   earthMassDiv.className = 'label';
//   earthMassDiv.textContent = '5.97237e24 kg';
//   earthMassDiv.style.backgroundColor = 'transparent';

//   const earthMassLabel = new CSS2DObject( earthMassDiv );
//   earthMassLabel.position.set( 0, 1, 0 );
//   earthMassLabel.center.set( 0, 0 );
//   earth.add( earthMassLabel );
//   earthMassLabel.layers.set( 1 );

//   const moonDiv = document.createElement( 'div' );
//   moonDiv.className = 'label';
//   moonDiv.textContent = 'Moon';
//   moonDiv.style.backgroundColor = 'transparent';

//   const moonLabel = new CSS2DObject( moonDiv );
//   moonLabel.position.set( 1.5 * 0.27, 0, 0 );
//   moonLabel.center.set( 0, 1 );
//   moon.add( moonLabel );
//   moonLabel.layers.set( 0 );

//   const moonMassDiv = document.createElement( 'div' );
//   moonMassDiv.className = 'label';
//   moonMassDiv.textContent = '7.342e22 kg';
//   moonMassDiv.style.backgroundColor = 'transparent';

//   const moonMassLabel = new CSS2DObject( moonMassDiv );
//   moonMassLabel.position.set( 1.5 * 0.27, 0, 0 );
//   moonMassLabel.center.set( 0, 0 );
//   moon.add( moonMassLabel );
//   moonMassLabel.layers.set( 1 );

//   //

//   renderer = new THREE.WebGLRenderer();
//   renderer.setPixelRatio( window.devicePixelRatio );
//   renderer.setSize( window.innerWidth, window.innerHeight );
//   document.body.appendChild( renderer.domElement );

//   labelRenderer = new CSS2DRenderer();
//   labelRenderer.setSize( window.innerWidth, window.innerHeight );
//   labelRenderer.domElement.style.position = 'absolute';
//   labelRenderer.domElement.style.top = '0px';
//   document.body.appendChild( labelRenderer.domElement );

//   const controls = new OrbitControls( camera, labelRenderer.domElement );
//   controls.minDistance = 1;
//   controls.maxDistance = 1000;

//   //

//   window.addEventListener( 'resize', onWindowResize );

//   initGui();

// }

// function onWindowResize() {

//   camera.aspect = window.innerWidth / window.innerHeight;

//   camera.updateProjectionMatrix();

//   renderer.setSize( window.innerWidth, window.innerHeight );

//   labelRenderer.setSize( window.innerWidth, window.innerHeight );

// }


// function animate() {

//   requestAnimationFrame( animate );

//   const elapsed = clock.getElapsedTime();

//   moon.position.set( Math.sin( elapsed ) * 5, 0, Math.cos( elapsed ) * 5 );

//   renderer.render( scene, camera );
//   labelRenderer.render( scene, camera );

// }

// //

// function initGui() {

//   gui = new GUI();

//   gui.title( 'Camera Layers' );

//   gui.add(layers, 'Toggle Name').name('Toggle Name Layer');
//   gui.add(layers, 'Toggle Mass').name('Toggle Mass Layer');
//   gui.add(layers, 'Enable All').name('Enable All Layers');
//   gui.add(layers, 'Disable All').name('Disable All Layers');
//   gui.add(RandomCube, 'add random cube');
  

//   gui.open();

// }





