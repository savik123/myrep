import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

console.log("SCENE LOADED");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181b22);
scene.fog = new THREE.Fog(0x181b22, 35, 95);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 13, 30);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

document.getElementById("scene-container").appendChild(renderer.domElement);

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";
const machineCard = document.getElementById("machine-card");

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 90;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(6, 0.8, 4);

const hemiLight = new THREE.HemisphereLight(0xffeddc, 0x2b2f3a, 1.3);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
directionalLight.position.set(12, 18, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

const floorGeometry = new THREE.PlaneGeometry(120, 120);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b4f58,
    roughness: 1,
    metalness: 0
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(120, 120, 0x7c8290, 0x4d5360);
grid.position.y = 0.01;
scene.add(grid);

function normalizeModel(model, scale = 1) {
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();

    box.getCenter(center);

    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y;

    return box;
}

function createNeonOutline(root, color = 0xff8a00) {
    const outlineGroup = new THREE.Group();
    outlineGroup.name = "neon-outline";

    root.traverse((child) => {
        if (!child.isMesh) return;

        const outlineMesh = child.clone();
        outlineMesh.material = new THREE.MeshBasicMaterial({
            color,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.95,
            depthWrite: false
        });

        outlineMesh.scale.multiplyScalar(1.04);
        outlineMesh.renderOrder = 999;
        outlineGroup.add(outlineMesh);
    });

    outlineGroup.visible = false;
    return outlineGroup;
}

function getOutlines(machine) {
    if (!machine?.userData) return [];

    if (Array.isArray(machine.userData.outlines)) {
        return machine.userData.outlines;
    }

    if (machine.userData.outline) {
        return [machine.userData.outline];
    }

    return [];
}

function groupWarehouseItems(items) {
    const list = Array.isArray(items) ? items : [];

    return list.reduce((acc, item) => {
        const key = item.category || "Прочее";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}

const machines = [];
const loader = new GLTFLoader();

function getMachineMetaFromPath(path) {
    const p = path.toLowerCase();

    if (p.includes("bambu_lab_x1_carbon")) {
        return {
            label: "Bambu Lab X1 Carbon",
            category: "3D-принтер",
            summary: "Быстрый FDM-принтер для прототипов, учебных изделий и функциональных деталей."
        };
    }

    if (p.includes("colorful_enclosed_3d")) {
        return {
            label: "Закрытый 3D-принтер",
            category: "3D-принтер",
            summary: "Закрытая модель для печати деталей, которым важна стабильная температура."
        };
    }

    if (p.includes("creality_3d_printer")) {
        return {
            label: "Creality 3D Printer",
            category: "3D-принтер",
            summary: "Простой и распространённый 3D-принтер для базовой печати и проверки идей."
        };
    }

    if (p.includes("ender_3d_printer")) {
        return {
            label: "Ender 3D Printer",
            category: "3D-принтер",
            summary: "Популярный учебный 3D-принтер для первых шагов в прототипировании."
        };
    }

    if (p.includes("metal_lathe") || p.includes("bd_10vs")) {
        return {
            label: "Токарный станок",
            category: "Металлообработка",
            summary: "Используется для обработки вращающихся деталей: точения, подрезки торцов и нарезки резьбы."
        };
    }

    if (p.includes("vertical_milling")) {
        return {
            label: "Вертикально-фрезерный станок",
            category: "Металлообработка",
            summary: "Подходит для обработки плоскостей, пазов, канавок и карманов."
        };
    }

    if (p.includes("drill_press")) {
        return {
            label: "Сверлильный станок",
            category: "Металлообработка",
            summary: "Нужен для точного сверления отверстий и небольших вспомогательных операций."
        };
    }

    if (p.includes("belt_and_disc_san")) {
        return {
            label: "Шлифовальный станок",
            category: "Обработка поверхности",
            summary: "Применяется для шлифования кромок, снятия заусенцев и доводки поверхностей."
        };
    }

    if (p.includes("mp29s_cnc_rout") || p.includes("cnc")) {
        return {
            label: "CNC Router",
            category: "ЧПУ-обработка",
            summary: "Станок для автоматической обработки материалов по программе."
        };
    }

    if (p.includes("five_tier_steel_shelv")) {
        return {
            label: "Стеллаж",
            category: "Хранение",
            summary: "Стеллаж для хранения материалов, оснастки и вспомогательных элементов."
        };
    }

    return {
        label: "Оборудование",
        category: "Станок",
        summary: "3D-модель оборудования для виртуальной лаборатории."
    };
}

function loadMachine(id, path, x, y, z, scale = 1, rotationY = 0) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        const meta = getMachineMetaFromPath(path);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        normalizeModel(model, scale);
        model.rotation.y = rotationY;

        model.userData = {
            machineId: id,
            path,
            meta
        };

        const outline = createNeonOutline(model, 0xff8a00);
        model.add(outline);
        model.userData.outline = outline;

        const wrapper = new THREE.Group();
        wrapper.position.set(x, y, z);
        wrapper.userData = model.userData;
        wrapper.userData.outline = outline;
        wrapper.add(model);

        scene.add(wrapper);
        machines.push(wrapper);
    });
}

function loadShelfPair(id, path, x, y, z, scale = 1) {
    loader.load(path, (gltf) => {
        const meta = {
            label: "Стеллаж",
            category: "Хранение",
            summary: "Два стеллажа для хранения материалов, оснастки и вспомогательных элементов."
        };

        const wrapper = new THREE.Group();
        wrapper.position.set(x, y, z);
        wrapper.userData = {
            machineId: id,
            path,
            meta,
            outlines: []
        };

        const offsets = [-2.2, 2.2];

        offsets.forEach((offset) => {
            const instance = gltf.scene.clone(true);

            instance.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            normalizeModel(instance, scale);
            instance.rotation.y = Math.PI / 2;
            instance.position.set(0, 0, offset);

            const outline = createNeonOutline(instance, 0xff8a00);
            instance.add(outline);

            wrapper.userData.outlines.push(outline);
            wrapper.add(instance);
        });

        scene.add(wrapper);
        machines.push(wrapper);
    });
}

loadMachine(
    1,
    "/models/Meshy_AI_BD_10VS_Metal_Lathe_0506201411_generate.glb",
    -12,
    0,
    2,
    1
);

loadMachine(
    2,
    "/models/Meshy_AI_Precision_Metal_Lathe_0506202048_generate.glb",
    0,
    0,
    2,
    1
);

loadMachine(
    3,
    "/models/Meshy_AI_Jet_vertical_milling__0506201820_generate.glb",
    12,
    0,
    2,
    1
);

loadMachine(
    4,
    "/models/Meshy_AI_Optimum_drill_press_0506202745_generate.glb",
    -12,
    0,
    12,
    1
);

loadMachine(
    5,
    "/models/Meshy_AI_Jet_belt_and_disc_san_0506201618_generate.glb",
    0,
    0,
    12,
    1
);

loadMachine(
    6,
    "/models/Meshy_AI_Reimer_MP29S_CNC_Rout_0506202513_generate.glb",
    12,
    0,
    12,
    1
);

loadMachine(
    7,
    "/models/Meshy_AI_Bambu_Lab_X1_Carbon_3_0506195912_generate.glb",
    -12,
    0,
    -10,
    1
);

loadMachine(
    8,
    "/models/Meshy_AI_Colorful_Enclosed__3D_0506201153_generate.glb",
    -4,
    0,
    -10,
    1
);

loadMachine(
    9,
    "/models/Meshy_AI_Creality_3D_Printer_E_0506200933_generate.glb",
    4,
    0,
    -10,
    1
);

loadMachine(
    10,
    "/models/Meshy_AI_Ender_3D_Printer_0506200217_generate.glb",
    12,
    0,
    -10,
    1
);

loadShelfPair(
    11,
    "/models/Meshy_AI_Five_Tier_Steel_Shelv_0507195400_generate.glb",
    24,
    0,
    4,
    1
);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hoveredMachine = null;

function resolveMachineRoot(object) {
    let current = object;

    while (current && !current.userData?.machineId) {
        current = current.parent;
    }

    return current && current.userData?.machineId ? current : null;
}

function setHoveredMachine(nextMachine) {
    if (hoveredMachine === nextMachine) return;

    if (hoveredMachine) {
        getOutlines(hoveredMachine).forEach((outline) => {
            outline.visible = false;
        });
    }

    hoveredMachine = nextMachine;

    if (hoveredMachine) {
        getOutlines(hoveredMachine).forEach((outline) => {
            outline.visible = true;
        });
    }

    renderer.domElement.style.cursor = hoveredMachine ? "pointer" : "default";
}

function pickMachine(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length === 0) {
        return null;
    }

    return resolveMachineRoot(intersects[0].object);
}

renderer.domElement.addEventListener("pointermove", (event) => {
    const machine = pickMachine(event);
    setHoveredMachine(machine);
});

renderer.domElement.addEventListener("pointerleave", () => {
    setHoveredMachine(null);
});

function getStatusClass(status) {
    const s = String(status || "").toLowerCase();

    if (s.includes("active") || s.includes("готов") || s.includes("working")) {
        return "is-active";
    }

    if (s.includes("service") || s.includes("ремонт") || s.includes("maintenance")) {
        return "is-service";
    }

    if (s.includes("off") || s.includes("выкл") || s.includes("idle")) {
        return "is-off";
    }

    return "";
}

function closePopup() {
    const card = document.getElementById("machine-card");
    card.className = "machine-card";
}

function showPopup(data, machine) {
    const card = document.getElementById("machine-card");

    const meta = machine?.userData?.meta || {
        label: "Оборудование",
        category: "Станок",
        summary: "3D-модель оборудования для виртуальной лаборатории."
    };

    const name = String(data?.name || meta.label || `Станок #${machine?.userData?.machineId || ""}`).trim();
    const status = String(data?.status || "не указан").trim();
    const description = String(data?.description || meta.summary).trim();
    const category = String(meta.category || "Станок");

    card.className = `machine-card ${getStatusClass(status)} is-visible`;

    card.innerHTML = `
        <button class="machine-card__close" id="machine-card-close" aria-label="Закрыть">×</button>
        <div class="machine-card__tag">${category}</div>
        <h3 class="machine-card__title">${name}</h3>
        <div class="machine-card__status">Статус: ${status}</div>
        <p class="machine-card__desc">${description}</p>
        <div class="machine-card__meta">Нажми Esc, чтобы закрыть</div>
    `;

    document.getElementById("machine-card-close").addEventListener("click", closePopup);
}

function showShelfPopup(items) {
    const card = document.getElementById("machine-card");
    const grouped = groupWarehouseItems(items || []);

    const groupsHtml = Object.entries(grouped).map(([category, arr]) => {
        const listHtml = arr.map((item) => `
            <li class="warehouse-item" data-item-id="${item.id}">
                <div class="warehouse-item__content">
                    <div class="warehouse-item__name">${item.name}</div>
                    <div class="warehouse-item__meta">
                        ${item.quantity} ${item.unit} · ${item.material || "—"}
                    </div>
                    <div class="warehouse-item__desc">${item.description || ""}</div>
                </div>

                <div class="warehouse-item__actions">
                    <button
                        type="button"
                        class="warehouse-item__take"
                        data-item-id="${item.id}"
                    >
                        − Взять
                    </button>
                </div>
            </li>
        `).join("");

        return `
            <div class="warehouse-group">
                <h4 class="warehouse-group__title">${category}</h4>
                <ul class="warehouse-list">
                    ${listHtml}
                </ul>
            </div>
        `;
    }).join("");

    card.className = "machine-card is-visible warehouse-card";

    card.innerHTML = `
        <button class="machine-card__close" id="machine-card-close" aria-label="Закрыть">×</button>
        <div class="machine-card__tag">Склад</div>
        <h3 class="machine-card__title">Содержимое стеллажа</h3>
        <div class="machine-card__status">Позиции: ${items?.length || 0}</div>
        <div class="warehouse-content">
            ${groupsHtml || "<p>Склад пока пуст.</p>"}
        </div>
        <div class="machine-card__meta">Нажми Esc, чтобы закрыть</div>
    `;

    document.getElementById("machine-card-close").addEventListener("click", closePopup);
}

async function fetchShelfItems() {
    const response = await fetch("/warehouse/shelf", {
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

async function openShelfPopup() {
    try {
        const items = await fetchShelfItems();
        showShelfPopup(items);
    } catch (error) {
        console.error(error);
        showShelfPopup([]);
    }
}

machineCard.addEventListener("click", async (event) => {
    const takeButton = event.target.closest(".warehouse-item__take");
    if (!takeButton) return;

    event.preventDefault();
    event.stopPropagation();

    const itemId = takeButton.dataset.itemId;
    const itemName =
        takeButton.closest(".warehouse-item")?.querySelector(".warehouse-item__name")?.textContent?.trim() ||
        "эту позицию";

    const confirmed = window.confirm(`Взять "${itemName}" со склада?`);
    if (!confirmed) return;

    takeButton.disabled = true;

    try {
        const response = await fetch(`/warehouse_items/${itemId}/take`, {
            method: "POST",
            headers: {
                "X-CSRF-Token": csrfToken,
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const items = await fetchShelfItems();
        showShelfPopup(items);
    } catch (error) {
        console.error(error);
        takeButton.disabled = false;
        alert("Не удалось взять предмет со склада.");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closePopup();
    }
});

renderer.domElement.addEventListener("click", (event) => {
    const machine = pickMachine(event);

    if (!machine) {
        closePopup();
        return;
    }

    if (machine.userData.machineId === 11) {
        openShelfPopup();
        return;
    }

    fetch(`/machines/${machine.userData.machineId}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            showPopup(data, machine);
        })
        .catch(() => {
            showPopup({
                name: machine.userData.meta?.label || "Оборудование",
                status: "не указан",
                description: machine.userData.meta?.summary || "Описание недоступно."
            }, machine);
        });
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    if (hoveredMachine) {
        const outlines = getOutlines(hoveredMachine);
        outlines.forEach((outline) => {
            const pulse = 1.04 + Math.sin(performance.now() * 0.008) * 0.005;
            outline.scale.setScalar(pulse);
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();