/**
 * JavaVerse 3D Memory Model Visualizer (Stack vs Heap)
 * A standalone Three.js visualization that renders the Java Virtual Machine's memory regions in 3D:
 * - Stack Memory: Thread-safe, LIFO, stores primitive values & reference pointers.
 * - Heap Memory: Shared object repository where dynamically instantiated objects reside.
 * - Interactive 3D Laser Reference Pointers connecting Stack variables to Heap Objects.
 * - Live Garbage Collection (GC) sweep simulation with particle disintegration!
 */

class MemoryVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 3D Visual elements
    this.stackItems = [];
    this.heapObjects = [];
    this.pointerBeams = [];
    this.gcScannerMesh = null;
    this.particleBursts = [];

    // Memory steps definition
    this.currentStep = 0;
    this.steps = [
      {
        code: "int score = 42;",
        desc: "Primitive integer is pushed directly onto the STACK frame. No Heap allocation needed.",
        action: 'step1'
      },
      {
        code: 'Dog d1 = new Dog("Buddy", 3);',
        desc: "New Dog object is created in the HEAP. Pointer variable 'd1' is pushed to the STACK, referencing Heap address @0x4A12 via laser link.",
        action: 'step2'
      },
      {
        code: "Dog d2 = d1;",
        desc: "Reference copying: 'd2' is pushed to the STACK, copying the memory address. BOTH variables now point to the SAME object in the Heap!",
        action: 'step3'
      },
      {
        code: "d1 = null;",
        desc: "Reference 'd1' is cleared. The Heap object remains safe and alive because 'd2' is still holding an active reference!",
        action: 'step4'
      },
      {
        code: "d2 = null;",
        desc: "Reference 'd2' is cleared. The Heap object now has ZERO active incoming references! It is now marked as ELIGIBLE FOR GARBAGE COLLECTION.",
        action: 'step5'
      },
      {
        code: "System.gc(); // JVM Garbage Collector",
        desc: "Garbage Collector sweeps through the Heap, identifies unreferenced orphan objects, and reclaims their memory!",
        action: 'step6'
      }
    ];

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 520;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 4, 18);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(amb);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const amberLight = new THREE.PointLight(0xff9d00, 2.5, 30);
    amberLight.position.set(6, 2, 4);
    this.scene.add(amberLight);

    // Build the 3D Architectural Zones
    this.buildZones();

    // Resize listener
    window.addEventListener('resize', () => {
      if (!this.canvas) return;
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      if (w && h) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Execute first step
    this.applyStep(0);
  }

  buildZones() {
    // 1. Stack Column (Left side, cyan theme)
    const stackBaseGeo = new THREE.BoxGeometry(4.5, 0.4, 4.5);
    const stackBaseMat = new THREE.MeshStandardMaterial({ color: 0x003344, emissive: 0x00f0ff, emissiveIntensity: 0.3 });
    const stackBase = new THREE.Mesh(stackBaseGeo, stackBaseMat);
    stackBase.position.set(-6, -4, 0);
    this.scene.add(stackBase);

    // Stack Pillar Glass Column
    const pillarGeo = new THREE.BoxGeometry(4.2, 8, 4.2);
    const pillarMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transmission: 0.85,
      transparent: true,
      opacity: 0.25,
      roughness: 0.2,
      wireframe: false
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(-6, 0.2, 0);
    this.scene.add(pillar);

    // Stack Wireframe
    const wireGeo = new THREE.BoxGeometry(4.25, 8.05, 4.25);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.4 });
    const wirePillar = new THREE.Mesh(wireGeo, wireMat);
    wirePillar.position.set(-6, 0.2, 0);
    this.scene.add(wirePillar);

    // 2. Heap Matrix (Right side, amber/purple theme)
    const heapBaseGeo = new THREE.BoxGeometry(8, 0.4, 8);
    const heapBaseMat = new THREE.MeshStandardMaterial({ color: 0x221100, emissive: 0xff9d00, emissiveIntensity: 0.3 });
    const heapBase = new THREE.Mesh(heapBaseGeo, heapBaseMat);
    heapBase.position.set(5.5, -4, 0);
    this.scene.add(heapBase);

    // Heap Grid Floor
    const grid = new THREE.GridHelper(7.6, 8, 0xff9d00, 0x553300);
    grid.position.set(5.5, -3.75, 0);
    this.scene.add(grid);
  }

  // Create a 3D block representing a stack frame entry
  createStackSlot(label, value, posY, colorHex = 0x00f0ff) {
    const group = new THREE.Group();

    const boxGeo = new THREE.BoxGeometry(3.6, 1.1, 3.6);
    const boxMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.2
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    group.add(box);

    // Label canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1024';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 122);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, 128, 52);

    ctx.fillStyle = '#00ffa3';
    ctx.font = '22px monospace';
    ctx.fillText(value, 128, 95);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(3.2, 0.9);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0, 1.82);
    group.add(labelMesh);

    group.position.set(-6, posY, 0);
    this.scene.add(group);
    return group;
  }

  // Create a 3D Heap Object
  createHeapObject(label, fields, pos, colorHex = 0xff9d00) {
    const group = new THREE.Group();

    // Dodecahedron / Beveled Box representation
    const geo = new THREE.BoxGeometry(3.2, 2.4, 3.2);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Glowing wireframe
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.4 });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.scale.set(1.04, 1.04, 1.04);
    group.add(wireMesh);

    // Label texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#100a20';
    ctx.fillRect(0, 0, 256, 160);
    ctx.strokeStyle = '#ff9d00';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 154);

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, 128, 45);

    ctx.fillStyle = '#f0f4fc';
    ctx.font = '18px monospace';
    fields.forEach((f, idx) => {
      ctx.fillText(f, 128, 85 + idx * 30);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(2.8, 1.8);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0, 1.62);
    group.add(labelMesh);

    group.position.copy(pos);
    this.scene.add(group);
    return { group, mesh, labelMesh };
  }

  // Draw 3D glowing laser beam connecting Stack slot to Heap object
  createLaserPointer(startPos, endPos, colorHex = 0x00f0ff) {
    const points = [startPos, endPos];
    const curve = new THREE.LineCurve3(startPos, endPos);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85
    });
    const laserMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(laserMesh);

    return laserMesh;
  }

  clearSceneEntities() {
    this.stackItems.forEach(item => this.scene.remove(item));
    this.stackItems = [];

    this.heapObjects.forEach(obj => this.scene.remove(obj.group));
    this.heapObjects = [];

    this.pointerBeams.forEach(b => this.scene.remove(b));
    this.pointerBeams = [];

    if (this.gcScannerMesh) {
      this.scene.remove(this.gcScannerMesh);
      this.gcScannerMesh = null;
    }
  }

  applyStep(index) {
    this.currentStep = Math.max(0, Math.min(index, this.steps.length - 1));
    this.clearSceneEntities();

    const info = this.steps[this.currentStep];
    const previewEl = document.getElementById('step-code-preview');
    const descEl = document.getElementById('step-explanation');
    const trackerEl = document.getElementById('step-tracker-label');

    if (previewEl) previewEl.textContent = info.code;
    if (descEl) descEl.textContent = info.desc;
    if (trackerEl) trackerEl.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;

    // Play laser/click sound
    window.soundEngine.playClick();

    switch (info.action) {
      case 'step1': {
        // Only int score = 42 on stack
        const s1 = this.createStackSlot("int score", "val: 42", -3.2, 0x00f0ff);
        this.stackItems.push(s1);
        break;
      }

      case 'step2': {
        // int score + Dog d1 -> Heap Dog
        const s1 = this.createStackSlot("int score", "val: 42", -3.2, 0x00f0ff);
        const s2 = this.createStackSlot("Dog d1", "@0x4A12", -1.8, 0x00f0ff);
        this.stackItems.push(s1, s2);

        const heapPos = new THREE.Vector3(5.5, 0.5, 0);
        const h1 = this.createHeapObject("Dog @0x4A12", ['name: "Buddy"', 'age: 3'], heapPos, 0xff9d00);
        this.heapObjects.push(h1);

        const laser = this.createLaserPointer(new THREE.Vector3(-4.2, -1.8, 0), new THREE.Vector3(3.9, 0.5, 0), 0x00f0ff);
        this.pointerBeams.push(laser);
        window.soundEngine.playLaser();
        break;
      }

      case 'step3': {
        // Dog d2 = d1 (Two pointers to same heap object)
        const s1 = this.createStackSlot("int score", "val: 42", -3.2, 0x00f0ff);
        const s2 = this.createStackSlot("Dog d1", "@0x4A12", -1.8, 0x00f0ff);
        const s3 = this.createStackSlot("Dog d2", "@0x4A12", -0.4, 0x00f0ff);
        this.stackItems.push(s1, s2, s3);

        const heapPos = new THREE.Vector3(5.5, 0.5, 0);
        const h1 = this.createHeapObject("Dog @0x4A12", ['name: "Buddy"', 'age: 3'], heapPos, 0xff9d00);
        this.heapObjects.push(h1);

        // Beam from d1 to object
        const laser1 = this.createLaserPointer(new THREE.Vector3(-4.2, -1.8, 0), new THREE.Vector3(3.9, 0.2, 0), 0x00f0ff);
        // Beam from d2 to object
        const laser2 = this.createLaserPointer(new THREE.Vector3(-4.2, -0.4, 0), new THREE.Vector3(3.9, 0.8, 0), 0x00ffa3);
        this.pointerBeams.push(laser1, laser2);
        window.soundEngine.playLaser();
        break;
      }

      case 'step4': {
        // d1 = null; d2 still points!
        const s1 = this.createStackSlot("int score", "val: 42", -3.2, 0x00f0ff);
        const s2 = this.createStackSlot("Dog d1", "null", -1.8, 0x5c6882); // dimmed
        const s3 = this.createStackSlot("Dog d2", "@0x4A12", -0.4, 0x00ffa3);
        this.stackItems.push(s1, s2, s3);

        const heapPos = new THREE.Vector3(5.5, 0.5, 0);
        const h1 = this.createHeapObject("Dog @0x4A12", ['name: "Buddy"', 'age: 3'], heapPos, 0xff9d00);
        this.heapObjects.push(h1);

        // Only d2 beam remains
        const laser2 = this.createLaserPointer(new THREE.Vector3(-4.2, -0.4, 0), new THREE.Vector3(3.9, 0.5, 0), 0x00ffa3);
        this.pointerBeams.push(laser2);
        break;
      }

      case 'step5': {
        // d2 = null; 0 pointers left! Object turns red/amber (Garbage collection eligible)
        const s1 = this.createStackSlot("int score", "val: 42", -3.2, 0x00f0ff);
        const s2 = this.createStackSlot("Dog d1", "null", -1.8, 0x5c6882);
        const s3 = this.createStackSlot("Dog d2", "null", -0.4, 0x5c6882);
        this.stackItems.push(s1, s2, s3);

        const heapPos = new THREE.Vector3(5.5, 0.5, 0);
        const h1 = this.createHeapObject("Dog [ORPHAN]", ['REFS: 0', 'ELIGIBLE FOR GC!'], heapPos, 0xff3366);
        this.heapObjects.push(h1);
        window.soundEngine.playError();
        break;
      }

      case 'step6': {
        // GC runs! Laser scanner sweeps and disintegrates the orphan object
        const s1 = this.createStackSlot("int score", "val: 42", -3.2, 0x00f0ff);
        const s2 = this.createStackSlot("Dog d1", "null", -1.8, 0x5c6882);
        const s3 = this.createStackSlot("Dog d2", "null", -0.4, 0x5c6882);
        this.stackItems.push(s1, s2, s3);

        // Trigger sweeping GC Scanner
        this.triggerGCSweep();
        break;
      }
    }
  }

  triggerGCSweep() {
    window.soundEngine.playGCSweep();

    const planeGeo = new THREE.PlaneGeometry(8, 6);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x00ffa3,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    this.gcScannerMesh = new THREE.Mesh(planeGeo, planeMat);
    this.gcScannerMesh.rotation.y = Math.PI / 2;
    this.gcScannerMesh.position.set(1.5, 0, 0);
    this.scene.add(this.gcScannerMesh);

    // Particle burst simulation
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVelo = [];

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = 5.5 + (Math.random() - 0.5) * 2;
      pPos[i * 3 + 1] = 0.5 + (Math.random() - 0.5) * 2;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      pVelo.push({
        x: (Math.random() - 0.5) * 0.1,
        y: Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.1
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00ffa3, size: 0.35, transparent: true, opacity: 1 });
    const burstMesh = new THREE.Points(pGeo, pMat);
    this.scene.add(burstMesh);

    this.particleBursts.push({ mesh: burstMesh, velo: pVelo, life: 1.0 });
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.applyStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.applyStep(this.currentStep - 1);
    }
  }

  reset() {
    this.applyStep(0);
  }

  runGC() {
    this.applyStep(5); // Jump directly to GC step
  }

  animate() {
    requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;

    // Gentle floating for heap objects
    this.heapObjects.forEach(obj => {
      obj.group.position.y += Math.sin(time * 2) * 0.003;
      obj.group.rotation.y += 0.005;
    });

    // Animate GC Scanner Plane if active
    if (this.gcScannerMesh) {
      this.gcScannerMesh.position.x += 0.08;
      if (this.gcScannerMesh.position.x > 9.5) {
        this.scene.remove(this.gcScannerMesh);
        this.gcScannerMesh = null;
      }
    }

    // Animate disintegration particles
    for (let i = this.particleBursts.length - 1; i >= 0; i--) {
      const b = this.particleBursts[i];
      b.life -= 0.02;
      const posAttr = b.mesh.geometry.attributes.position;
      for (let j = 0; j < b.velo.length; j++) {
        posAttr.setXYZ(
          j,
          posAttr.getX(j) + b.velo[j].x,
          posAttr.getY(j) + b.velo[j].y,
          posAttr.getZ(j) + b.velo[j].z
        );
      }
      posAttr.needsUpdate = true;
      b.mesh.material.opacity = Math.max(0, b.life);

      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.particleBursts.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.MemoryVisualizer = MemoryVisualizer;
