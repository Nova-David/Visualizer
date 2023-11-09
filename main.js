import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
let $ = {}, controls, light, gui, roof, beam, beam2, post, post2, post3, post4;
let data2;

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement)


fetch('parameters.json')
    .then(response => response.json())
    .then(data => {
        //Place parameters into $ varaible
        for(let key in data) {
            if(data[key].default == null) {
                $[key] = {};

                for (let subKey in data[key]) {
                    $[key][subKey] = data[key][subKey].default;
                }
            } else $[key] = data[key].default;
        }

        // GUI
        gui = new GUI();

        gui.add($, 'width', data.width.min, data.width.max, data.width.step)
            .name('Width')
            .onChange(updateWidth);

        gui.add($, 'height', data.height.min, data.height.max, data.height.step)
            .name('Height')
            .onChange(updateHeight);

        gui.add($, 'projection', data.projection.min, data.projection.max, data.projection.step)
            .name('Projection')
            .onChange(updateProjection);

        gui.add($, 'front_oh', data.front_oh.min, data.front_oh.max, data.front_oh.step)
            .name('Front O.H.')
            .onChange(updateFrontOH);

        gui.add($, 'side_oh', data.side_oh.min, data.side_oh.max, data.side_oh.step)
            .name('Side O.H.')
            .onChange(updateSideOH);

        gui.add($, 'freestanding')
            .name('Freestanding')
            .onChange(changeAttachment);

        gui.add($.beam, 'extended')
            .name('Extend Beams')
            .onChange(updateBeams);

        gui.add( { materials: showMaterials }, 'materials')
            .name("Show Estimate")

        init();
    })

function init() {
    // GRIDS
    const size = 30;
    let rotation = Math.PI/2;
    const gridHelper = new THREE.GridHelper(size, size)
    scene.add(gridHelper)
    gridHelper.rotateX(rotation)
    gridHelper.position.y = size/2;

    const gridHelper2 = new THREE.GridHelper(size, size)
    scene.add(gridHelper2)
    gridHelper2.position.z = size/2;

    // ROOF
    const geometry = new THREE.BoxGeometry($.width, $.roof.thickness, $.projection)
    const material = new THREE.MeshPhongMaterial({color: 0xbbbbbb})
    roof = new THREE.Mesh(geometry, material)
    scene.add(roof)
    // cube.material.opacity = 0.2
    // cube.material.transparent = true;


    //POSTS
    let postGeometry = new THREE.BoxGeometry($.post.size, $.height, $.post.size);
    let postMaterial = new THREE.MeshPhongMaterial({color: 0xeeeeee})

    post = new THREE.Mesh(postGeometry, postMaterial);
    roof.add(post);
    post.position.z = ($.projection/2) - ($.post.size/2) - $.front_oh;
    post.position.x = (($.width/2) - ($.post.size/2) - $.side_oh)*-1;
    post.position.y = (($.height/2))*-1 - ($.roof.thickness/2);

    post2 = new THREE.Mesh(postGeometry, postMaterial);
    roof.add(post2);
    post2.position.z = ($.projection/2) - ($.post.size/2) - $.front_oh;
    post2.position.x = (($.width/2) - ($.post.size/2) - $.side_oh);
    post2.position.y = (($.height/2))*-1 - ($.roof.thickness/2);

    post3 = new THREE.Mesh(postGeometry, postMaterial);
    post3.position.z = $.front_oh - ($.projection/2 - $.post.size/2);
    post3.position.x = (($.width/2) - ($.post.size/2) - $.side_oh)*-1;
    post3.position.y = (($.height/2))*-1 - ($.roof.thickness/2);

    post4 = new THREE.Mesh(postGeometry, postMaterial);
    post4.position.z = $.front_oh - ($.projection/2 - $.post.size/2);
    post4.position.x = (($.width/2) - ($.post.size/2) - $.side_oh);
    post4.position.y = (($.height/2))*-1 - ($.roof.thickness/2);


    //BEAM
    let beamGeometry = new THREE.BoxGeometry($.width, $.beam.height, $.beam.thickness);
    let beamMaterial = new THREE.MeshPhongMaterial({color: 0xdddddd})
    beam = new THREE.Mesh(beamGeometry, beamMaterial)
    roof.add(beam)
    beam.position.z = ($.projection/2) - $.front_oh - $.post.size/2; 
    beam.position.y = ($.beam.height/2)*-1 - ($.roof.thickness/2)

    beam2 = new THREE.Mesh(beamGeometry, beamMaterial)
    beam2.position.z = -1 * (($.projection/2) - $.front_oh - $.post.size/2); 
    beam2.position.y = ($.beam.height/2)*-1 - ($.roof.thickness/2)


    // LIGHT
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-40, 40, 40);
    scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.1);
    light2.position.set(40, -40, -40);
    scene.add(light2);


    //ROTATION AND ZOOM CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, ($.height+$.roof.thickness)/2, $.projection/2);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    roof.position.y = $.height + $.roof.thickness/2
    roof.position.z = $.projection/2

    camera.position.z = $.projection/2 + 20;
    camera.position.y = ($.height+$.roof.thickness) + 4;

    animate()
}

function updateWidth() {
    roof.geometry.dispose();
    updateBeams();

    roof.geometry = new THREE.BoxGeometry($.width, $.roof.thickness, $.projection);
    post.position.x = (($.width/2) - ($.post.size/2) - $.side_oh)*-1;
    post2.position.x = (($.width/2) - ($.post.size/2) - $.side_oh);
    post3.position.x = (($.width/2) - ($.post.size/2) - $.side_oh)*-1;
    post4.position.x = (($.width/2) - ($.post.size/2) - $.side_oh);
}

function updateHeight() {
    post.geometry.dispose();
    post2.geometry.dispose();
    post3.geometry.dispose();
    post4.geometry.dispose();

    roof.position.y = $.height + $.roof.thickness/2;
    post.geometry = new THREE.BoxGeometry($.post.size, $.height, $.post.size);
    post2.geometry = new THREE.BoxGeometry($.post.size, $.height, $.post.size);
    post3.geometry = new THREE.BoxGeometry($.post.size, $.height, $.post.size);
    post4.geometry = new THREE.BoxGeometry($.post.size, $.height, $.post.size);
    post.position.y = (($.height/2))*-1 - ($.roof.thickness/2);
    post2.position.y = (($.height/2))*-1 - ($.roof.thickness/2);
    post3.position.y = (($.height/2))*-1 - ($.roof.thickness/2);
    post4.position.y = (($.height/2))*-1 - ($.roof.thickness/2);
}

function updateProjection() {
    roof.geometry.dispose();


    roof.geometry = new THREE.BoxGeometry($.width, $.roof.thickness, $.projection);
    beam.position.z = ($.projection/2) - $.front_oh - $.post.size/2; 
    beam2.position.z = -1 * ( ($.projection/2) - $.front_oh - $.post.size/2 ); 
    post.position.z = ($.projection/2) - ($.post.size/2) - $.front_oh;
    post2.position.z = ($.projection/2) - ($.post.size/2) - $.front_oh;
    post3.position.z = -1 * ( ($.projection/2) - ($.post.size/2) - $.front_oh );
    post4.position.z = -1 * ( ($.projection/2) - ($.post.size/2) - $.front_oh );
    roof.position.z = $.projection/2;
    // camera.position.z = $.projection/2 + 20;
}

function updateFrontOH() {
    beam.position.z = ($.projection/2) - $.front_oh - $.post.size/2; 
    post.position.z = ($.projection/2) - ($.post.size/2) - $.front_oh;
    post2.position.z = ($.projection/2) - ($.post.size/2) - $.front_oh;

    beam2.position.z = -beam.position.z;
    post3.position.z = -post.position.z;
    post4.position.z = -post2.position.z;
}

function updateSideOH() {
    updateBeams();
    post.position.x = (($.width/2) - ($.post.size/2) - $.side_oh)*-1;
    post2.position.x = (($.width/2) - ($.post.size/2) - $.side_oh);
    post3.position.x = (($.width/2) - ($.post.size/2) - $.side_oh)*-1;
    post4.position.x = (($.width/2) - ($.post.size/2) - $.side_oh);
}

function changeAttachment() {
    if ($.freestanding) {
        roof.add(beam2);
        roof.add(post3);
        roof.add(post4);
    } else {
        roof.remove(beam2);
        roof.remove(post3);
        roof.remove(post4);
    }
}

function updateBeams() {
    beam.geometry.dispose();
    beam2.geometry.dispose();

    if (!$.beam.extended) {
        let beamWidth = $.width - 2*$.post.size - 2*$.side_oh;
        beam.geometry = new THREE.BoxGeometry(beamWidth, $.beam.height, $.beam.thickness);
        beam2.geometry = new THREE.BoxGeometry(beamWidth, $.beam.height, $.beam.thickness);
    } else {
        beam.geometry = new THREE.BoxGeometry($.width, $.beam.height, $.beam.thickness);
        beam2.geometry = new THREE.BoxGeometry($.width, $.beam.height, $.beam.thickness);
    }
}

function animate() {
    requestAnimationFrame(animate)

    controls.update();

    renderer.render(scene, camera)
}

async function showMaterials() {
    console.log("WIP")
    let materials = await getMaterialsFromDB();

    fetch("linker.json")
        .then(response => response.json())
        .then(data => {
            const linker = data;
            let materialList = generateList($, materials, linker);
            let totalPrice = 0;
            
            const tableBody = document.querySelector("#materialList tbody")
            tableBody.innerHTML = '';

            for (const elem of materialList) {
                const [code, name, quantity, price] = elem;

                const row = document.createElement('tr');
        
                const codeCell = document.createElement('td');
                codeCell.textContent = code;
                row.appendChild(codeCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                row.appendChild(nameCell);
                
                const quantityCell = document.createElement('td');
                quantityCell.textContent = quantity;
                row.appendChild(quantityCell);
                
                const priceCell = document.createElement('td');
                priceCell.textContent = `$${price.toFixed(2)}`;
                row.appendChild(priceCell);
                
                tableBody.appendChild(row);

                totalPrice += price;
            }

            document.querySelector("#totalPrice").textContent = `$${totalPrice.toFixed(2)}`

            document.querySelector(".overlay").style.display = 'flex';
        })
}

function closeOverlay() {
    document.querySelector(".overlay").style.display = 'none';
}

async function getMaterialsFromDB() {
    //Replaceable function to get object from any database
    const response = await fetch("database.txt");
    const text = await response.text();

    const lines = text.split('\n');
    const materials = {};

    for (const line of lines) {
        const [code, name, price] = line.split(', ');

        if (code && name && price) {
            materials[code] = { name, price };
        }
    }

    return materials;
}

function generateList(parameters, materials, linker) {
    let materialList = [];
    for (const code in linker) {
        const data = linker[code];
        const conditions = data.conditions;
        let multiplier = 0;

        if (conditions) {
            for (const condition of conditions) {
                const { parameter, amount, unit } = condition;

                if (unit == 'feet') {

                    console.log(unit, parameter, amount)

                    if (parameter == "post") {
                        let length = $.freestanding ? post.geometry.parameters.height * 4 : post.geometry.parameters.height * 2;
                        multiplier = Math.floor(length/amount) + 1;
                        console.log(length, amount, multiplier);
                    } else if (parameter == "beam") {
                        let length = $.freestanding ? beam.geometry.parameters.width * 2 : beam.geometry.parameters.width;
                        multiplier = Math.floor(length/amount) + 1;
                        console.log(length, amount, multiplier);
                    } else if ($[parameter]) {
                        multiplier = Math.floor($[parameter]/amount) + 1;
                        console.log($[parameter], amount, multiplier);
                    }
                } else if (unit == 'units') {

                    if (parameter == "post") {
                        multiplier = $.freestanding ? 4 : 2;
                    } else if (parameter == "beam") {
                        multiplier = $.freestanding ? 2 : 1;
                    } else {
                        multiplier = 1;
                    }
                }
            }
        } else multiplier = 1;

        let quantity = data.quantity * multiplier;


        if (quantity > 0)
            materialList.push([code, materials[code].name, quantity, +materials[code].price * quantity])
    }

    return materialList;
}










