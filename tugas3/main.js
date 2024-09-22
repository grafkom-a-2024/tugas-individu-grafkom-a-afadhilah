let scene, camera, renderer;
let sphere1, sphere2, sphere3;
let boxSize = 10;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.z = 15;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create objects
    createObjects();

    // Create colored walls
    createColoredWalls();

    // Start animation
    animate();
}

function createObjects() {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

    // Buat texture loader
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const texture1 = textureLoader.load('10700677_43402.jpg');
    // Sphere 1
    const material1 = new THREE.MeshPhongMaterial({color: 0xff0000});
    sphere1 = new THREE.Mesh(sphereGeometry, material1);
    sphere1.position.set(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4);
    sphere1.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
    );
    scene.add(sphere1);

    // Sphere 2
    const material2 = new THREE.MeshPhongMaterial({color: 0x00ff00});
    sphere2 = new THREE.Mesh(sphereGeometry, material2);
    sphere2.position.set(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4);
    sphere2.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
    );
    scene.add(sphere2);

    // Sphere 3
    const material3 = new THREE.MeshPhongMaterial({color: 0x0000ff});
    sphere3 = new THREE.Mesh(sphereGeometry, material3);
    sphere3.position.set(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4);
    sphere3.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
    );
    scene.add(sphere3);
}

function createColoredWalls() {
    const wallGeometry = new THREE.PlaneGeometry(boxSize, boxSize);

    // Buat texture loader
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const texture1 = textureLoader.load('10700677_43402.jpg');

    const wallMaterials = [
        new THREE.MeshPhongMaterial({color: 0xff0000, transparent: true, opacity: 0.2, side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({color: 0x00ff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({color: 0x0000ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({color: 0xffff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({color: 0xff00ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({map: texture1, side: THREE.DoubleSide})
    ];

    const wallPositions = [
        {position: [boxSize/2, 0, 0], rotation: [0, Math.PI/2, 0]},
        {position: [-boxSize/2, 0, 0], rotation: [0, -Math.PI/2, 0]},
        {position: [0, boxSize/2, 0], rotation: [-Math.PI/2, 0, 0]},
        {position: [0, -boxSize/2, 0], rotation: [Math.PI/2, 0, 0]},
        {position: [0, 0, boxSize/2], rotation: [0, 0, 0]},
        {position: [0, 0, -boxSize/2], rotation: [0, Math.PI, 0]}
    ];

    wallPositions.forEach((wallPos, index) => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterials[index]);
        wall.position.set(...wallPos.position);
        wall.rotation.set(...wallPos.rotation);
        scene.add(wall);
    });
}

function animate() {
    requestAnimationFrame(animate);

    updateSpherePosition(sphere1);
    updateSpherePosition(sphere2);
    updateSpherePosition(sphere3);

    checkCollisions();

    renderer.render(scene, camera);
}

function updateSpherePosition(sphere) {
    sphere.position.add(sphere.velocity);

    // Check wall collisions
    if (Math.abs(sphere.position.x) > boxSize / 2 - sphere.geometry.parameters.radius) {
        sphere.velocity.x *= -1;
    }
    if (Math.abs(sphere.position.y) > boxSize / 2 - sphere.geometry.parameters.radius) {
        sphere.velocity.y *= -1;
    }
    if (Math.abs(sphere.position.z) > boxSize / 2 - sphere.geometry.parameters.radius) {
        sphere.velocity.z *= -1;
    }
}

function checkCollisions() {
    checkSpheresCollision(sphere1, sphere2);
    checkSpheresCollision(sphere1, sphere3);
    checkSpheresCollision(sphere2, sphere3);
}

function checkSpheresCollision(sphere1, sphere2) {
    const distance = sphere1.position.distanceTo(sphere2.position);
    const sumOfRadii = sphere1.geometry.parameters.radius + sphere2.geometry.parameters.radius;

    if (distance < sumOfRadii) {
        // Collision detected
        const normal = new THREE.Vector3().subVectors(sphere2.position, sphere1.position).normalize();
        
        // Calculate relative velocity
        const relativeVelocity = new THREE.Vector3().subVectors(sphere2.velocity, sphere1.velocity);
        
        // Calculate velocity along the normal
        const velocityAlongNormal = relativeVelocity.dot(normal);
        
        // Do not resolve if velocities are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate impulse scalar
        const restitution = 0.8; // Coefficient of restitution
        const impulseScalar = -(1 + restitution) * velocityAlongNormal / 2;
        
        // Apply impulse
        const impulse = normal.multiplyScalar(impulseScalar);
        sphere1.velocity.sub(impulse);
        sphere2.velocity.add(impulse);
        
        // Move spheres apart to prevent sticking
        const correction = normal.multiplyScalar(sumOfRadii - distance);
        sphere1.position.sub(correction.multiplyScalar(0.5));
        sphere2.position.add(correction.multiplyScalar(0.5));
    }
}

window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Call init function when the window loads
window.onload = init;