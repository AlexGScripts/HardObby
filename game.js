import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

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

  // Player
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff6600 })
  );
  player.position.set(0, 1, 0);
  scene.add(player);

  // Platforms
  const platforms = [];
  function createPlatform(x, z, color = 0x00ff00) {
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshBasicMaterial({ color })
    );
    platform.position.set(x, 0, z);
    scene.add(platform);
    platforms.push(platform);
  }

  for (let i = 0; i < 10; i++) {
    createPlatform(i * 6, 0);
  }
  createPlatform(30, 0, 0xff0000); // Checkpoint

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff));

  // Controls
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  let velocityY = 0;
  let isGrounded = false;
  let respawnPoint = player.position.clone();

  function animate() {
    requestAnimationFrame(animate);

    // Gravity
    velocityY -= 0.05;
    player.position.y += velocityY;

    // Movement
    if (keys['w']) player.position.z -= 0.2;
    if (keys['s']) player.position.z += 0.2;
    if (keys['a']) player.position.x -= 0.2;
    if (keys['d']) player.position.x += 0.2;

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
        if (platform.material.color.getHex() === 0xff0000) {
          respawnPoint = platform.position.clone();
          respawnPoint.y = 1;
        }
      }
    }

    // Jump
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
} // end initGame
