console.log("SCENE LOADED");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("scene-container")
    .appendChild(renderer.domElement);

// свет
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// пол
const grid = new THREE.GridHelper(10, 10);
scene.add(grid);

// станки (кубы)
const machines = [];

function createMachine(id, x, y, z) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff6600 });

    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(x, y, z);
    cube.userData = { id: id };

    scene.add(cube);
    machines.push(cube);
}

createMachine(1, 0, 0, 0);
createMachine(2, 2, 0, 0);
createMachine(3, -2, 0, 0);

camera.position.z = 5;

// клик
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(machines);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        fetch(`/machines/${obj.userData.id}`)
            .then(res => res.json())
            .then(data => showPopup(data));
    }
});

function showPopup(data) {
    const popup = document.getElementById("popup");

    popup.innerHTML = `
    <h3>${data.name}</h3>
    <p>${data.description}</p>
  `;

    popup.style.display = "block";
}

// рендер
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();