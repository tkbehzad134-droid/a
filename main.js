(() => {
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(1);  // مهم برای موبایل
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 0, 2.8);
  scene.add(camera);

  const clock = new THREE.Clock();

  // --- Shader ---
  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  };

  const geometry = new THREE.PlaneGeometry(4, 2.4, 32, 16);

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      varying float vWave;
      uniform float uTime;

      void main(){
        vUv = uv;
        vec3 pos = position;

        float waveX = sin((pos.x + uTime * 0.8) * 2.5) * 0.18;
        float waveY = cos((pos.y + uTime * 0.6) * 3.0) * 0.12;

        pos.z += waveX + waveY;
        vWave = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      varying float vWave;
      uniform float uTime;
      uniform vec2 uMouse;

      void main(){
        float d = length(vUv - 0.5);

        vec3 colA = vec3(0.07, 0.09, 0.20);
        vec3 colB = vec3(0.65, 0.10, 0.15);

        vec3 col = mix(colA, colB, vUv.y + sin(uTime*0.3)*0.08);
        col += vWave * 0.1;

        float mouseGlow = exp(-dot(vUv - uMouse, vUv - uMouse) * 12.0);
        col += mouseGlow * 0.25;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // --- Events ---
  function handleMove(e){
    const x = (e.touches ? e.touches[0].clientX : e.clientX) / innerWidth;
    const y = 1 - (e.touches ? e.touches[0].clientY : e.clientY) / innerHeight;
    uniforms.uMouse.value.set(x, y);
  }

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("touchmove", handleMove, { passive:true });

  window.addEventListener("resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  // --- Animation ---
  function animate(){
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // --- Intro animations ---
  gsap.from(".title", { y:30, opacity:0, duration:1, delay:0.3 });
  gsap.from(".subtitle", { y:20, opacity:0, duration:1, delay:0.5 });
  gsap.from(".card", { y:20, opacity:0, stagger:0.1, duration:1, delay:0.7 });
})();
