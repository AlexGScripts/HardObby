import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

// Title screen handling
const titleScreen = document.getElementById('title-screen');
const startButton = document.getElementById('start-button');
const canvas = document.getElementById('game-canvas');

// Start game
startButton.addEventListener('click', () => {
  titleScreen.style.display = 'none';
  initGame();
});

// Game setup
function initGame() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Skybox (Blue background)
  scene.background = new THREE.Color(0x87ceeb);

  // Player
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff6600 })
  );
  player.position.set(0, 1, 0);
  scene.add(player);

  // Platforms
  const platforms = [];
  function createPlatform(x, y, z, color = 0x00ff00) {
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshBasicMaterial({ color })
    );
    platform.position.set(x, y, z);
    scene.add(platform);
    platforms.push(platform);
  }

  // Creating multiple levels
  const platformPositions = [
    [0, 0, 0], [10, 0, 10], [20, 0, 15], [30, 0, 20], [40, 0, 25],
    [50, 0, 30], [60, 0, 35], [70, 0, 40], [80, 0, 45], [90, 0, 50]
  ];
  platformPositions.forEach(pos => createPlatform(...pos));

  // Checkpoints (Blue)
  function createCheckpoint(x, y, z) {
    const checkpoint = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    checkpoint.position.set(x, y, z);
    scene.add(checkpoint);
    platforms.push(checkpoint);
  }
  createCheckpoint(30, 0, 20); // Example checkpoint

  // Killbricks (Red)
  function createKillbrick(x, y, z) {
    const killbrick = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    killbrick.position.set(x, y, z);
    scene.add(killbrick);
  }
  createKillbrick(15, 0, 15); // Example killbrick
  createKillbrick(25, 0, 25); // Example killbrick

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff));

  // Controls
  const keys = {};
  const touchControls = { left: false, right: false, up: false };  // For mobile

  // Keyboard (PC) controls
  document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  // Touch (Mobile) controls
  const joystick = document.getElementById('joystick');
  joystick.addEventListener('touchstart', e => {
    // Implement movement on touch start
    const touch = e.touches[0];
    touchControls.left = touch.clientX < window.innerWidth / 2;
    touchControls.right = touch.clientX > window.innerWidth / 2;
  });
  joystick.addEventListener('touchend', () => {
    touchControls.left = touchControls.right = false;
  });

  const jumpButton = document.getElementById('jump-button');
  jumpButton.addEventListener('click', () => {
    if (isGrounded) {
      velocityY = 0.4;
    }
  });

  let velocityY = 0;
  let isGrounded = false;
  let respawnPoint = player.position.clone();

  function animate() {
    requestAnimationFrame(animate);

    // Gravity
    velocityY -= 0.05;
    player.position.y += velocityY;

    // Movement (PC)
    if (keys['w'] || touchControls.up) player.position.z -= 0.2;
    if (keys['s']) player.position.z += 0.2;
    if (keys['a'] || touchControls.left) player.position.x -= 0.2;
    if (keys['d'] || touchControls.right) player.position.x += 0.2;

    // Collision check
    isGrounded = false;
    for (let platform of platforms) {
      const px = player.position;
      const bx = platform.position;
      if (Math.abs(px.x - bx.x) < 3 && Math.abs(px.z - bx.z) < 3 && px.y - bx.y <= 1.5 && px.y - bx.y > 0) {
        isGrounded = true;
        velocityY = 0;
        player.position.y = bx.y + 1;

        // Checkpoint
        if (platform.material.color.getHex() === 0x0000ff) {
          respawnPoint = platform.position.clone();
          respawnPoint.y = 1;
        }
      }
    }

    // Jump (PC)
    if (keys[' '] && isGrounded) {
      velocityY = 0.4;
    }

    // Respawn if fallen
    if (player.position.y < -10) {
      player.position.copy(respawnPoint);
      velocityY = 0;
    }

    camera.position.set(player.position.x, player.position.y + 5, player.position.z + 10);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
  }

  animate();
}
