import * as THREE from 'three';

export function test()
{
    return 'OK';
}

export function createChart(file) {
    return fetch(file)  // 返回 Promise
        .then(response => response.json())
        .then(data => {
            const meshList = [];
            let index = 0;  // 使用 let 以便可以修改值
            
            data.forEach(item => {
                //console.log(`姓名: ${item.Name}, 年龄: ${item.Age}`);
                const mesh = createCube(item.Age);
                mesh.position.set(index*3-1, item.Age/2, -4);
                index += 1;  // 递增索引
                meshList.push(mesh);  // 添加到 meshList
            });

            return meshList;  // 返回 meshList
        })
        .catch(error => {
            console.error('Error:', error);
            throw error;  // 抛出错误以便外部处理
        });
}


function createCube(height){
    const geometry = new THREE.BoxGeometry(2,height,2);
    const material = new THREE.MeshLambertMaterial({
        color: randomColor(),
      });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function randomColor(){
    const randomColor = Math.floor(Math.random() * 16777215); 
    // 生成 0x000000 到 0xFFFFFF 之间的随机数
    return randomColor;
}


