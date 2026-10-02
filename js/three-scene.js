/**
 * JavaVerse 3D Scene Engine
 * High-performance Three.js experience featuring holographic Java Core,
 * procedural steam particle helix, orbiting planetary rings, cosmic nebula,
 * and raycast-interactive 3D chapter crystals.
 */

class JavaVerse3DScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.hoveredObject = null;

    // Animation nodes & objects
    this.coreGroup = new THREE.Group();
    this.crystalsGroup = new THREE.Group();
    this.steamParticles = null;
    this.galaxyPoints = null;
    this.nebulaPoints = null;
    this.orbitRings = [];
    this.crystals = [];

    // Interaction & Camera tweening
    this.isDragging = false;
    this.activePointers = new Map();
    this.pinchDistance = 0;

    this.prevMousePos = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.002 };
    this.cameraTargetPos = new THREE.Vector3(0, 4, 22);
    this.cameraLookTarget = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    // Gentle deep space fog (0.0035 preserves star clarity while giving infinite depth)
    this.scene.fog = new THREE.FogExp2(0x040612, 0.0035);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / Math.max(height, 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 4, 22);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.5 : 2));
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.setupLighting();

    // 4. Build 3D Entities
    this.buildStarGalaxy();
    this.buildJavaHoloCup();
    this.buildOrbitingRings();
    this.buildChapterCrystals();

    this.scene.add(this.coreGroup);
    this.scene.add(this.crystalsGroup);

    // 5. Events
    this.bindEvents();

    // 6. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // 1. High-illumination cosmic ambient light
    const ambientLight = new THREE.AmbientLight(0x243665, 2.8);
    this.scene.add(ambientLight);

    // 2. Dual-color hemisphere skylight (Cyan heavens & Violet ground)
    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x8811ff, 2.4);
    this.scene.add(hemiLight);

    // 3. Intense JVM Core Light (Illuminates central cup and inner space)
    const coreLight = new THREE.PointLight(0xffa200, 6.5, 45, 1.2);
    coreLight.position.set(0, 1.6, 0);
    this.scene.add(coreLight);

    // 4. Electric Cyan key light
    const cyanLight = new THREE.PointLight(0x00f0ff, 5.5, 80);
    cyanLight.position.set(16, 12, 14);
    this.scene.add(cyanLight);

    // 5. Magenta/Purple fill light
    const purpleLight = new THREE.PointLight(0xff00cc, 4.8, 80);
    purpleLight.position.set(-16, -8, 14);
    this.scene.add(purpleLight);

    // 6. Brilliant back rim light (Silhouettes all floating crystals)
    const backRimLight = new THREE.PointLight(0x00ffff, 4.5, 90);
    backRimLight.position.set(0, 18, -25);
    this.scene.add(backRimLight);
  }

  buildStarGalaxy() {
    const starCount = 3200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xffffff), // Pure Brilliant White
      new THREE.Color(0xffffff), // White (weighted)
      new THREE.Color(0xffbe33), // Golden Amber
      new THREE.Color(0xb55fe6), // Radiant Violet
      new THREE.Color(0x44ee99)  // Emerald
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 25 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // High-resolution radiant star corona texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.45, 'rgba(160, 230, 255, 0.65)');
    grad.addColorStop(0.8, 'rgba(100, 180, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    // Noticeably larger star size (3.4 vs 1.2) for high-DPI crystal clarity
    const material = new THREE.PointsMaterial({
      size: 3.4,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.galaxyPoints = new THREE.Points(geometry, material);
    this.scene.add(this.galaxyPoints);

    // 2. Cosmic Nebula Clouds (Gives space rich, luminous atmosphere)
    const nebulaCount = 450;
    const nebGeo = new THREE.BufferGeometry();
    const nebPos = new Float32Array(nebulaCount * 3);
    const nebCols = new Float32Array(nebulaCount * 3);
    const nebPalette = [
      new THREE.Color(0x00d4ff), // Cyan nebula
      new THREE.Color(0x9d4edd), // Purple nebula
      new THREE.Color(0xff4088), // Rose nebula
      new THREE.Color(0xff9900)  // Golden nebula
    ];

    for (let i = 0; i < nebulaCount; i++) {
      const r = 20 + Math.random() * 95;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      nebPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      nebPos[i * 3 + 1] = (r * Math.sin(p) * Math.sin(t)) * 0.6; // flattened cosmic disk
      nebPos[i * 3 + 2] = r * Math.cos(p);

      const c = nebPalette[Math.floor(Math.random() * nebPalette.length)];
      nebCols[i * 3] = c.r;
      nebCols[i * 3 + 1] = c.g;
      nebCols[i * 3 + 2] = c.b;
    }
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
    nebGeo.setAttribute('color', new THREE.BufferAttribute(nebCols, 3));

    const nebMat = new THREE.PointsMaterial({
      size: 26.0,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.nebulaPoints = new THREE.Points(nebGeo, nebMat);
    this.scene.add(this.nebulaPoints);
  }

  buildJavaHoloCup() {
    const cupGroup = new THREE.Group();

    // 1. Holographic Cyber Cup Outer Wall (Bright & luminous)
    const cupGeo = new THREE.CylinderGeometry(2.2, 1.6, 3.4, 32, 1, true);
    const cupMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c3b7a,
      emissive: 0x00aaff,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
      wireframe: false
    });
    const cupMesh = new THREE.Mesh(cupGeo, cupMat);
    cupGroup.add(cupMesh);

    // Cup Wireframe Glow Lattice (Vibrant electric cyan)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const cupWireMesh = new THREE.Mesh(cupGeo, wireMat);
    cupWireMesh.scale.set(1.02, 1.02, 1.02);
    cupGroup.add(cupWireMesh);

    // 2. Glowing Molten Java Energy Surface
    const liquidGeo = new THREE.CircleGeometry(2.1, 32);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.2
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.rotation.x = -Math.PI / 2;
    liquidMesh.position.y = 1.35;
    cupGroup.add(liquidMesh);

    // 3. Saucer Base Plate with glowing edge
    const saucerGeo = new THREE.CylinderGeometry(3.6, 2.8, 0.35, 32);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0x142e65,
      emissive: 0x0066aa,
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.2
    });
    const saucerMesh = new THREE.Mesh(saucerGeo, saucerMat);
    saucerMesh.position.y = -1.8;
    cupGroup.add(saucerMesh);

    // Glowing rim around saucer
    const rimGeo = new THREE.TorusGeometry(3.65, 0.08, 16, 64);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = -1.75;
    cupGroup.add(rimMesh);

    // 4. Curved Cyber Handle
    const handleGeo = new THREE.TorusGeometry(1.2, 0.22, 16, 32, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x142e65,
      emissive: 0x0088dd,
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.2
    });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(2.2, 0, 0);
    handleMesh.rotation.z = -Math.PI / 2;
    cupGroup.add(handleMesh);

    // 5. Rising Steam Helix Particles
    this.setupSteamParticles(cupGroup);

    this.coreGroup.add(cupGroup);
    this.cupGroup = cupGroup;
  }

  setupSteamParticles(parentGroup) {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const progress = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      progress[i] = Math.random();
      speeds[i] = 0.003 + Math.random() * 0.005;
      offsets[i] = Math.random() * Math.PI * 2;

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 1.5;
      positions[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffcc33,
      size: 0.85,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.steamParticles = new THREE.Points(geometry, material);
    this.steamData = { progress, speeds, offsets, count: particleCount };
    parentGroup.add(this.steamParticles);
  }

  buildOrbitingRings() {
    const ringConfigs = [
      { radius: 6.2, tube: 0.06, color: 0x00f0ff, rotX: 1.1, rotY: 0.4, speed: 0.006 },
      { radius: 7.6, tube: 0.07, color: 0xffae19, rotX: 0.6, rotY: 1.2, speed: -0.004 },
      { radius: 9.0, tube: 0.05, color: 0xa855f7, rotX: 1.8, rotY: -0.7, speed: 0.003 }
    ];

    ringConfigs.forEach(conf => {
      const geo = new THREE.TorusGeometry(conf.radius, conf.tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: conf.color,
        transparent: true,
        opacity: 0.85,
        wireframe: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = conf.rotX;
      mesh.rotation.y = conf.rotY;

      this.scene.add(mesh);
      this.orbitRings.push({ mesh, speed: conf.speed });
    });
  }

  buildChapterCrystals() {
    const chapters = window.JAVA_CURRICULUM || [];
    const total = chapters.length;
    const orbitRadius = 12.5;

    // Geometric polyhedra shapes for chapters
    const geometries = [
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.3, 0),
      new THREE.DodecahedronGeometry(1.1, 0),
      new THREE.TetrahedronGeometry(1.4, 0),
      new THREE.IcosahedronGeometry(1.25, 1),
      new THREE.OctahedronGeometry(1.35, 1),
      new THREE.DodecahedronGeometry(1.15, 0)
    ];

    chapters.forEach((ch, idx) => {
      const angle = (idx / total) * Math.PI * 2;
      const crystalNode = new THREE.Group();

      const hexColor = parseInt(ch.accent.replace('#', '0x'), 16);
      const geo = geometries[idx % geometries.length];

      // Inner glowing core (High emissive intensity for radiant gemstone brightness)
      const coreMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 1.8,
        metalness: 0.1,
        roughness: 0.15
      });
      const coreMesh = new THREE.Mesh(geo, coreMat);
      crystalNode.add(coreMesh);

      // Outer holographic wireframe shield (Crisp, sharp polyhedral facets)
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.75
      });
      const wireMesh = new THREE.Mesh(geo, wireMat);
      wireMesh.scale.set(1.25, 1.25, 1.25);
      crystalNode.add(wireMesh);

      // Position along orbit
      const posX = Math.cos(angle) * orbitRadius;
      const posZ = Math.sin(angle) * orbitRadius;
      const posY = (idx % 2 === 0 ? 1 : -1) * 1.5;
      crystalNode.position.set(posX, posY, posZ);

      // Tag node for raycasting
      crystalNode.userData = {
        chapterId: ch.id,
        title: ch.title,
        index: idx,
        baseScale: 1.0,
        targetScale: 1.0,
        mesh: coreMesh
      };

      this.crystalsGroup.add(crystalNode);
      this.crystals.push(crystalNode);
    });
  }

  bindEvents() {
    const interactiveSelector = 'button, input, textarea, select, a, header, nav, .interactive-panel, .curriculum-sidebar, .code-container, .modal-overlay, .editor-card, .console-card, .lesson-card, .module-card, .memory-viz-card, .viz-controls-panel';
    const isInteractiveTarget = (target) => Boolean(target?.closest?.(interactiveSelector));
    const getPinchDistance = () => {
      const points = Array.from(this.activePointers.values());
      if (points.length < 2) return 0;
      return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    };

    const resizeScene = () => {
      if (!this.camera || !this.renderer || !this.container) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      if (!width || !height) return;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.5 : 2));
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', resizeScene);
    window.visualViewport?.addEventListener('resize', resizeScene);

    // Mouse drag rotates the cosmos. Two-finger pinch changes its camera distance.
    window.addEventListener('pointermove', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (rect.width && rect.height) {
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }

      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (this.activePointers.size >= 2) {
        const nextDistance = getPinchDistance();
        if (this.pinchDistance > 0) {
          this.cameraTargetPos.z = THREE.MathUtils.clamp(
            this.cameraTargetPos.z - (nextDistance - this.pinchDistance) * 0.035,
            7,
            40
          );
        }
        this.pinchDistance = nextDistance;
        this.isDragging = false;
        return;
      }

      if (this.isDragging && (e.pointerType !== 'touch' || this.activePointers.has(e.pointerId))) {
        const deltaX = e.clientX - this.prevMousePos.x;
        this.coreGroup.rotation.y += deltaX * 0.005;
        this.crystalsGroup.rotation.y += deltaX * 0.005;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('pointerdown', (e) => {
      if (isInteractiveTarget(e.target)) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      if (e.pointerType === 'touch') {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.activePointers.size >= 2) {
          this.pinchDistance = getPinchDistance();
          this.isDragging = false;
          return;
        }
      }
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    const finishPointer = (e) => {
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size >= 2) {
        this.pinchDistance = getPinchDistance();
        this.isDragging = false;
      } else if (this.activePointers.size === 1) {
        const remainingPointer = Array.from(this.activePointers.values())[0];
        this.prevMousePos = { x: remainingPointer.x, y: remainingPointer.y };
        this.pinchDistance = 0;
        this.isDragging = true;
      } else {
        this.pinchDistance = 0;
        this.isDragging = false;
      }
    };
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
    window.addEventListener('blur', () => {
      this.activePointers.clear();
      this.pinchDistance = 0;
      this.isDragging = false;
    });

    window.addEventListener('wheel', (e) => {
      if (!window.App || window.App.currentView !== '3d-world') return;
      if (isInteractiveTarget(e.target) || e.target.closest?.('.hero-banner, .orbit-modules-container')) return;
      this.cameraTargetPos.z = THREE.MathUtils.clamp(this.cameraTargetPos.z + e.deltaY * 0.015, 7, 40);
    }, { passive: true });
    // Click handler for 3D chapter crystals
    window.addEventListener('click', (e) => {
      if (isInteractiveTarget(e.target)) {
        return;
      }
      if (this.hoveredObject) {
        const chapterId = this.hoveredObject.userData.chapterId;
        if (chapterId && window.App) {
          if (!window.App.isChapterUnlocked(chapterId)) {
            window.App.showLockedNotice(chapterId);
            return;
          }
          window.soundEngine.playSuccess();
          window.App.selectChapter(chapterId);
          window.App.switchView('lessons');
        }
      }
    });
  }

  updateCrystalsLockStatus() {
    if (!window.App) return;
    this.crystals.forEach(c => {
      const chId = c.userData.chapterId;
      const isUnlocked = window.App.isChapterUnlocked(chId);
      c.userData.isUnlocked = isUnlocked;
      if (c.userData.mesh && c.userData.mesh.material) {
        if (isUnlocked) {
          c.userData.mesh.material.emissiveIntensity = 0.9;
        } else {
          c.userData.mesh.material.emissiveIntensity = 0.15;
        }
      }
    });
  }

  focusOnChapter(chapterId) {
    const crystal = this.crystals.find(c => c.userData.chapterId === chapterId);
    if (!crystal) return;

    // Smoothly pan camera towards crystal
    const worldPos = new THREE.Vector3();
    crystal.getWorldPosition(worldPos);

    this.cameraTargetPos.set(worldPos.x * 0.7, worldPos.y + 1.5, worldPos.z * 0.7 + 6);
    this.cameraLookTarget.copy(worldPos);
  }

  resetCamera() {
    this.cameraTargetPos.set(0, 4, 22);
    this.cameraLookTarget.set(0, 0, 0);
  }

  updateSteamParticles() {
    if (!this.steamParticles) return;
    const posAttr = this.steamParticles.geometry.attributes.position;
    const { progress, speeds, offsets, count } = this.steamData;

    for (let i = 0; i < count; i++) {
      progress[i] += speeds[i];
      if (progress[i] > 1.0) {
        progress[i] = 0.0;
      }

      const p = progress[i];
      const helixRadius = 0.4 + p * 1.2;
      const angle = offsets[i] + p * 8.0;

      const x = Math.sin(angle) * helixRadius;
      const y = 1.4 + p * 4.2;
      const z = Math.cos(angle) * helixRadius;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;

    // 1. Slow cosmic rotation
    if (!this.isDragging) {
      this.coreGroup.rotation.y += 0.004;
      this.crystalsGroup.rotation.y += 0.0015;
    }

    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.y = time * 0.015;
    }

    if (this.nebulaPoints) {
      this.nebulaPoints.rotation.y = time * 0.008;
    }

    // 2. Orbit rings spin
    this.orbitRings.forEach(r => {
      r.mesh.rotation.z += r.speed;
    });

    // 3. Floating animation on Java Cup
    if (this.cupGroup) {
      this.cupGroup.position.y = Math.sin(time * 1.5) * 0.25;
    }

    // 4. Animate chapter crystals
    this.crystals.forEach(c => {
      c.rotation.x += 0.01;
      c.rotation.y += 0.015;

      // Smooth scale interpolation on hover
      const s = THREE.MathUtils.lerp(c.scale.x, c.userData.targetScale, 0.1);
      c.scale.set(s, s, s);
    });

    // 5. Steam particles update
    this.updateSteamParticles();

    // 6. Raycast detection for chapter nodes
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.crystals, true);

    if (intersects.length > 0) {
      let targetNode = intersects[0].object;
      while (targetNode.parent && targetNode.parent !== this.crystalsGroup) {
        targetNode = targetNode.parent;
      }

      if (this.hoveredObject !== targetNode) {
        if (this.hoveredObject) {
          this.hoveredObject.userData.targetScale = 1.0;
        }
        this.hoveredObject = targetNode;
        this.hoveredObject.userData.targetScale = 1.4;
        document.body.style.cursor = 'pointer';
        window.soundEngine.playClick();
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject.userData.targetScale = 1.0;
        this.hoveredObject = null;
        document.body.style.cursor = 'default';
      }
    }

    // 7. Smooth camera interpolation
    this.camera.position.lerp(this.cameraTargetPos, 0.05);
    const currentLook = new THREE.Vector3(0, 0, 0);
    this.camera.getWorldDirection(currentLook);
    // Smooth lookAt
    this.camera.lookAt(this.cameraLookTarget);

    this.renderer.render(this.scene, this.camera);
  }
}

window.JavaVerse3DScene = JavaVerse3DScene;
