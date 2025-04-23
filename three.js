<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Obby Game</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Player
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff6600 })
  );
  player.position.set(0, 1, 0);
  scene.add(player);

  // Ground
  const platforms = [];
  function createPlatform(x, z) {
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    platform.position.set(x, 0, z);
    scene.add(platform);
    platforms.push(platform);
  }

  // Create 10 platforms in a row
  for (let i = 0; i < 10; i++) {
    createPlatform(i * 6, 0);
  }

  // Checkpoints (just red platforms)
  function createCheckpoint(x, z) {
    const checkpoint = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    checkpoint.position.set(x, 0, z);
    scene.add(checkpoint);
    platforms.push(checkpoint);
  }
  createCheckpoint(30, 0); // After 5th platform

  // Lighting
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  // Controls
  let keys = {};
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

    // Check collisions
    isGrounded = false;
    for (let platform of platforms) {
      const px = player.position;
      const bx = platform.position;
      if (Math.abs(px.x - bx.x) < 3 && Math.abs(px.z - bx.z) < 3 && px.y - bx.y <= 1.5 && px.y - bx.y > 0) {
        isGrounded = true;
        velocityY = 0;
        player.position.y = bx.y + 1;

        // Set checkpoint if red platform
        if (platform.material.color.getHex() === 0xff0000) {
          respawnPoint = platform.position.clone();
          respawnPoint.y = 1;
        }
      }
    }

    // Jump
    if (keys[' ']) {
      if (isGrounded) {
        velocityY = 0.4;
      }
    }

    // Fall reset
    if (player.position.y < -10) {
      player.position.copy(respawnPoint);
      velocityY = 0;
    }

    camera.position.set(player.position.x, player.position.y + 5, player.position.z + 10);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
  }

  animate();
</script>
</body>
</html>
