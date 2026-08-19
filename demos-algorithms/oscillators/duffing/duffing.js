// Duffing oscillator parameters
// The Duffing equation is a second-order differential equation:
// d²x/dt² + δ(dx/dt) + αx + βx³ = γcos(ωt)
// where:
// δ is the damping coefficient
// α is the linear stiffness
// β is the nonlinear stiffness
// γ is the forcing amplitude
// ω is the forcing frequency
const alpha = 1;    // α: linear stiffness coefficient
const beta = -1;    // β: nonlinear stiffness coefficient (negative for softening spring)
const delta = 0.3;  // δ: damping coefficient
const gamma = 0.37; // γ: forcing amplitude
const omega = 1.2;  // ω: forcing frequency

// Three.js setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI;

// Set initial camera position
camera.position.set(5, 5, 5);
controls.update();

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create particle system for the trajectory
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = 0;
    particlePositions[i * 3 + 2] = 0;
    
    // Create rainbow colors
    const hue = i / particleCount;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Add a glowing sphere at the current position
const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Add a trail effect
const trailGeometry = new THREE.BufferGeometry();
const trailMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
});
const trail = new THREE.Line(trailGeometry, trailMaterial);
scene.add(trail);

// Initial conditions
let x = 0;
let y = 0;
let z = 0;
let t = 0;
const dt = 0.01;
const trailPoints = [];

// Duffing oscillator equations
// To solve the second-order differential equation, we convert it to a system of first-order equations:
// Let y = dx/dt, then:
// dy/dt = d²x/dt² = -δ(dx/dt) - αx - βx³ + γcos(ωt)
// dx/dt = y
function dx(x, y, t) {
    // dx/dt = y
    return y;
}

function dy(x, y, t) {
    // dy/dt = -δy - αx - βx³ + γcos(ωt)
    return -delta * y - alpha * x - beta * x * x * x + gamma * Math.cos(omega * t);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update Duffing oscillator using Runge-Kutta 4th order method
    // This is a numerical method to solve the differential equations
    // k1 = f(t, y)
    const k1x = dx(x, y, t);
    const k1y = dy(x, y, t);
    
    // k2 = f(t + dt/2, y + dt/2 * k1)
    const k2x = dx(x + dt/2 * k1x, y + dt/2 * k1y, t + dt/2);
    const k2y = dy(x + dt/2 * k1x, y + dt/2 * k1y, t + dt/2);
    
    // k3 = f(t + dt/2, y + dt/2 * k2)
    const k3x = dx(x + dt/2 * k2x, y + dt/2 * k2y, t + dt/2);
    const k3y = dy(x + dt/2 * k2x, y + dt/2 * k2y, t + dt/2);
    
    // k4 = f(t + dt, y + dt * k3)
    const k4x = dx(x + dt * k3x, y + dt * k3y, t + dt);
    const k4y = dy(x + dt * k3x, y + dt * k3y, t + dt);

    // Update state using weighted average of k1, k2, k3, k4
    // y(t + dt) = y(t) + dt/6 * (k1 + 2k2 + 2k3 + k4)
    x += dt/6 * (k1x + 2*k2x + 2*k3x + k4x);
    y += dt/6 * (k1y + 2*k2y + 2*k3y + k4y);
    t += dt;

    // Update particle system
    const positions = particles.attributes.position.array;
    for (let i = 0; i < particleCount - 1; i++) {
        positions[i * 3] = positions[(i + 1) * 3];
        positions[i * 3 + 1] = positions[(i + 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i + 1) * 3 + 2];
    }
    positions[(particleCount - 1) * 3] = x;
    positions[(particleCount - 1) * 3 + 1] = y;
    positions[(particleCount - 1) * 3 + 2] = 0;
    particles.attributes.position.needsUpdate = true;

    // Update sphere position
    sphere.position.set(x, y, 0);

    // Update trail
    trailPoints.push(new THREE.Vector3(x, y, 0));
    if (trailPoints.length > 100) {
        trailPoints.shift();
    }
    trail.geometry.setFromPoints(trailPoints);

    // Update controls
    controls.update();

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Start animation
animate(); 