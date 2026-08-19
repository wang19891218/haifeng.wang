// Boid class representing a single boid
class Boid {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new THREE.Vector3();
        this.maxSpeed = 0.8;  // Increased speed for more dynamic movement
        this.maxForce = 0.05;
        this.perceptionRadius = 50;
        this.wingAngle = 0;
        this.wingSpeed = 0.2;
    }

    // Apply the three rules of boids
    flock(boids) {
        const alignment = this.align(boids);
        const cohesion = this.cohere(boids);
        const separation = this.separate(boids);

        // Apply weights from UI controls
        alignment.multiplyScalar(alignmentWeight);
        cohesion.multiplyScalar(cohesionWeight);
        separation.multiplyScalar(separationWeight);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    // Alignment: Steer towards average heading of local flockmates
    align(boids) {
        const steering = new THREE.Vector3();
        let total = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }

        if (total > 0) {
            steering.divideScalar(total);
            steering.normalize();
            steering.multiplyScalar(this.maxSpeed);
            steering.sub(this.velocity);
            steering.clampLength(0, this.maxForce);
        }

        return steering;
    }

    // Cohesion: Steer towards average position of local flockmates
    cohere(boids) {
        const steering = new THREE.Vector3();
        let total = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }

        if (total > 0) {
            steering.divideScalar(total);
            return this.seek(steering);
        }

        return steering;
    }

    // Separation: Avoid crowding local flockmates
    separate(boids) {
        const steering = new THREE.Vector3();
        let total = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if (other !== this && d < this.perceptionRadius) {
                const diff = new THREE.Vector3()
                    .subVectors(this.position, other.position)
                    .normalize()
                    .divideScalar(d);
                steering.add(diff);
                total++;
            }
        }

        if (total > 0) {
            steering.divideScalar(total);
            steering.normalize();
            steering.multiplyScalar(this.maxSpeed);
            steering.sub(this.velocity);
            steering.clampLength(0, this.maxForce);
        }

        return steering;
    }

    // Seek: Steer towards a target
    seek(target) {
        const desired = new THREE.Vector3()
            .subVectors(target, this.position)
            .normalize()
            .multiplyScalar(this.maxSpeed);
        const steering = new THREE.Vector3()
            .subVectors(desired, this.velocity)
            .clampLength(0, this.maxForce);
        return steering;
    }

    // Update position and velocity
    update() {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.multiplyScalar(0);

        // Update wing animation
        this.wingAngle += this.wingSpeed;
        if (this.wingAngle > Math.PI) {
            this.wingAngle = 0;
        }

        // Wrap around edges
        const margin = 50;
        if (this.position.x < -margin) this.position.x = containerWidth + margin;
        if (this.position.x > containerWidth + margin) this.position.x = -margin;
        if (this.position.y < -margin) this.position.y = containerHeight + margin;
        if (this.position.y > containerHeight + margin) this.position.y = -margin;
        if (this.position.z < -margin) this.position.z = containerDepth + margin;
        if (this.position.z > containerDepth + margin) this.position.z = -margin;
    }
}

// Three.js setup
const container = document.getElementById('canvas-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;
const containerDepth = 1000;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
});
renderer.setSize(containerWidth, containerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 1000;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Set initial camera position
camera.position.set(0, 300, 600);
controls.update();

// Create game-style terrain
function generateTerrain() {
    const size = 2000;
    const resolution = 128;
    const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
    
    // Generate height map with more dramatic features
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Create more dramatic terrain features
        const height = 
            Math.sin(x * 0.005) * 50 + 
            Math.sin(z * 0.005) * 50 +
            Math.sin(x * 0.01 + z * 0.01) * 25 +
            Math.sin(x * 0.02 + z * 0.02) * 12.5 +
            Math.sin(x * 0.04 + z * 0.04) * 6.25;
            
        // Add some random noise
        const noise = (Math.random() - 0.5) * 5;
        vertices[i + 1] = height + noise;
    }
    
    geometry.computeVertexNormals();
    
    // Create terrain material with more vibrant colors
    const terrainMaterial = new THREE.MeshPhongMaterial({
        vertexColors: true,
        shininess: 30,
        flatShading: true
    });
    
    // Add vertex colors based on height with more vibrant colors
    const colors = [];
    for (let i = 0; i < vertices.length; i += 3) {
        const height = vertices[i + 1];
        let color = new THREE.Color();
        
        if (height < -20) {
            // Deep water
            color.setRGB(0.1, 0.2, 0.4);
        } else if (height < 0) {
            // Shallow water
            color.setRGB(0.2, 0.4, 0.8);
        } else if (height < 20) {
            // Sand/Beach
            color.setRGB(0.9, 0.8, 0.6);
        } else if (height < 40) {
            // Grass
            color.setRGB(0.3, 0.8, 0.3);
        } else if (height < 60) {
            // Forest
            color.setRGB(0.2, 0.6, 0.2);
        } else if (height < 80) {
            // Hills
            color.setRGB(0.6, 0.6, 0.4);
        } else {
            // Snow capped mountains
            color.setRGB(0.9, 0.9, 0.95);
        }
        
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const terrain = new THREE.Mesh(geometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -100;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    // Add a water plane for lakes
    const waterGeometry = new THREE.PlaneGeometry(size, size);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.6,
        shininess: 100
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -15;
    water.receiveShadow = true;
    scene.add(water);
    
    return { terrain, water };
}

const { terrain, water } = generateTerrain();

// Add water animation
function animateWater() {
    const time = Date.now() * 0.001;
    water.position.y = -15 + Math.sin(time) * 0.5;
    water.material.opacity = 0.6 + Math.sin(time * 2) * 0.1;
}

// Create realistic clouds
function createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
        specular: 0x444444
    });

    // Create multiple spheres for each cloud with varying sizes
    const numPieces = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numPieces; i++) {
        const size = 30 + Math.random() * 40;
        const cloudPiece = new THREE.Mesh(
            new THREE.SphereGeometry(size, 32, 32),
            cloudMaterial
        );
        cloudPiece.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 60
        );
        cloudPiece.castShadow = true;
        cloudGroup.add(cloudPiece);
    }

    return cloudGroup;
}

// Add several clouds at high altitude
const clouds = [];
for (let i = 0; i < 15; i++) {
    const cloud = createCloud();
    cloud.position.set(
        (Math.random() - 0.5) * 1500,
        400 + Math.random() * 200, // Much higher than birds
        (Math.random() - 0.5) * 1500
    );
    cloud.scale.set(2, 1, 2); // Flatten clouds slightly
    scene.add(cloud);
    clouds.push(cloud);
}

// Create realistic bird shape
function createBirdShape() {
    const birdGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.SphereGeometry(5, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x2c3e50, // Dark blue-gray
        shininess: 100,
        specular: 0x666666,
        emissive: 0x111111
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    birdGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(3, 32, 32);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(5, 2, 0);
    head.castShadow = true;
    birdGroup.add(head);

    // Beak
    const beakGeometry = new THREE.ConeGeometry(1, 3, 32);
    const beakMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6b6b, // Coral red
        shininess: 100
    });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(7, 2, 0);
    beak.rotation.z = Math.PI / 2;
    beak.castShadow = true;
    birdGroup.add(beak);

    // Wings with gradient
    const wingGeometry = new THREE.BoxGeometry(20, 0.5, 8);
    const wingMaterial = new THREE.MeshPhongMaterial({
        color: 0x3498db, // Bright blue
        shininess: 100,
        specular: 0x888888,
        transparent: true,
        opacity: 0.9
    });

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(0, 0, 0);
    leftWing.castShadow = true;
    birdGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0, 0, 0);
    rightWing.castShadow = true;
    birdGroup.add(rightWing);

    // Tail
    const tailGeometry = new THREE.ConeGeometry(3, 8, 32);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(-5, 0, 0);
    tail.rotation.z = -Math.PI / 2;
    tail.castShadow = true;
    birdGroup.add(tail);

    return { birdGroup, leftWing, rightWing };
}

// Create boids
let boids = [];
let boidMeshes = [];

// Initialize boids
function initBoids(count) {
    // Remove existing boids
    boids.forEach((_, index) => {
        scene.remove(boidMeshes[index].birdGroup);
    });
    boids = [];
    boidMeshes = [];

    // Create new boids
    for (let i = 0; i < count; i++) {
        const position = new THREE.Vector3(
            Math.random() * containerWidth - containerWidth / 2,
            Math.random() * 200 + 50, // Keep birds above ground
            Math.random() * containerDepth - containerDepth / 2
        );
        const velocity = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize().multiplyScalar(0.5);

        const boid = new Boid(position, velocity);
        boids.push(boid);

        const { birdGroup, leftWing, rightWing } = createBirdShape();
        birdGroup.position.copy(position);
        scene.add(birdGroup);
        boidMeshes.push({ birdGroup, leftWing, rightWing });
    }
}

// Get weights from UI controls
let alignmentWeight = 1.0;
let cohesionWeight = 1.0;
let separationWeight = 1.5;

document.getElementById('alignment').addEventListener('input', (e) => {
    alignmentWeight = parseFloat(e.target.value);
    document.getElementById('alignmentValue').textContent = e.target.value;
});

document.getElementById('cohesion').addEventListener('input', (e) => {
    cohesionWeight = parseFloat(e.target.value);
    document.getElementById('cohesionValue').textContent = e.target.value;
});

document.getElementById('separation').addEventListener('input', (e) => {
    separationWeight = parseFloat(e.target.value);
    document.getElementById('separationValue').textContent = e.target.value;
});

document.getElementById('boidCount').addEventListener('input', (e) => {
    const count = parseInt(e.target.value);
    document.getElementById('boidCountValue').textContent = count;
    initBoids(count);
});

// Handle window resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Add this function after the Boid class definition
function updateBirdTable() {
    const tableBody = document.getElementById('birdTableBody');
    tableBody.innerHTML = '';

    boids.forEach((boid, index) => {
        const row = document.createElement('tr');
        
        // Calculate number of neighbors
        const neighbors = boids.filter(other => 
            other !== boid && 
            boid.position.distanceTo(other.position) < boid.perceptionRadius
        ).length;

        // Calculate speed
        const speed = boid.velocity.length() * 100; // Scale for better readability

        // Format direction vector
        const direction = boid.velocity.clone().normalize();
        const directionStr = `(${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)})`;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>(${boid.position.x.toFixed(1)}, ${boid.position.y.toFixed(1)}, ${boid.position.z.toFixed(1)})</td>
            <td>${speed.toFixed(1)}</td>
            <td>${directionStr}</td>
            <td>${neighbors}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Modify the animate function
function animate() {
    requestAnimationFrame(animate);

    // Animate water
    animateWater();

    // Update clouds with gentle movement
    clouds.forEach(cloud => {
        cloud.position.x += 0.05;
        if (cloud.position.x > 800) {
            cloud.position.x = -800;
        }
        // Add subtle vertical movement
        cloud.position.y += Math.sin(Date.now() * 0.0001 + cloud.position.x) * 0.1;
    });

    // Update point lights
    const time = Date.now() * 0.001;
    pointLight1.position.x = Math.sin(time) * 100;
    pointLight1.position.z = Math.cos(time) * 100;
    pointLight2.position.x = Math.cos(time) * 100;
    pointLight2.position.z = Math.sin(time) * 100;

    // Update boids
    boids.forEach((boid, index) => {
        boid.flock(boids);
        boid.update();

        // Update bird position and rotation
        const { birdGroup, leftWing, rightWing } = boidMeshes[index];
        birdGroup.position.copy(boid.position);
        
        // Rotate bird to face direction of movement
        if (boid.velocity.length() > 0) {
            birdGroup.lookAt(boid.position.clone().add(boid.velocity));
        }

        // Animate wings with more natural movement
        const wingAngle = Math.sin(boid.wingAngle) * 0.7;
        leftWing.rotation.x = wingAngle;
        rightWing.rotation.x = -wingAngle;
    });

    // Update the bird parameters table
    updateBirdTable();

    controls.update();
    renderer.render(scene, camera);
}

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

// Add point lights for dramatic effect
const pointLight1 = new THREE.PointLight(0x4a90e2, 1, 300);
pointLight1.position.set(100, 100, 100);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xe24a90, 1, 300);
pointLight2.position.set(-100, 100, -100);
scene.add(pointLight2);

// Add fog for depth
scene.fog = new THREE.FogExp2(0x1a2b3c, 0.0005);

// Initialize with default number of boids
initBoids(200);
animate(); 