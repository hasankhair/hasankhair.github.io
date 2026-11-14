import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT)
const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const lerp = (a, b, t) => a + (b - a) * t;

export function createScene(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05040d);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05040d, 0.035);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 8);

  // ---------- Morphing blob ----------
  const blobUniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.35 },
    uFreq: { value: 1.2 },
    uColorA: { value: new THREE.Color('#7c5cff') },
    uColorB: { value: new THREE.Color('#00d4ff') },
    uHover: { value: 0 },
  };
  const blobMat = new THREE.ShaderMaterial({
    uniforms: blobUniforms,
    vertexShader: /* glsl */ `
      uniform float uTime, uAmp, uFreq, uHover;
      varying vec3 vNormal; varying vec3 vView; varying float vNoise;
      ${noiseGLSL}
      void main(){
        float n = snoise(normal * uFreq + uTime * 0.35);
        float n2 = snoise(normal * uFreq * 3.0 - uTime * 0.6) * 0.25;
        float d = (n + n2) * (uAmp + uHover * 0.25);
        vNoise = d;
        vec3 pos = position + normal * d;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA, uColorB; uniform float uTime;
      varying vec3 vNormal; varying vec3 vView; varying float vNoise;
      void main(){
        float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
        float t = smoothstep(-0.4, 0.5, vNoise);
        vec3 col = mix(uColorA, uColorB, t);
        col = col * (0.15 + 0.45 * t) + fres * mix(uColorB, vec3(1.0), 0.2) * 0.9;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 64), blobMat);
  const blobGroup = new THREE.Group();
  blobGroup.add(blob);

  // Wireframe shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 1),
    new THREE.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.12 })
  );
  blobGroup.add(shell);

  // Orbit rings
  const rings = [];
  [
    { r: 2.9, tilt: [1.2, 0.2, 0], color: 0x00d4ff },
    { r: 3.4, tilt: [0.4, 1.1, 0.3], color: 0xff4d8d },
    { r: 3.9, tilt: [1.6, -0.6, 0.8], color: 0x7c5cff },
  ].forEach(({ r, tilt, color }, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.008, 8, 200),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 })
    );
    ring.rotation.set(...tilt);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color })
    );
    ring.add(moon);
    ring.userData = { moon, r, speed: 0.4 + i * 0.15, phase: i * 2 };
    rings.push(ring);
    blobGroup.add(ring);
  });
  scene.add(blobGroup);

  // ---------- Floating shapes ----------
  const shapes = new THREE.Group();
  const geos = [
    new THREE.OctahedronGeometry(0.3),
    new THREE.TetrahedronGeometry(0.3),
    new THREE.TorusKnotGeometry(0.18, 0.06, 64, 8),
    new THREE.BoxGeometry(0.35, 0.35, 0.35),
  ];
  const palette = [0x7c5cff, 0x00d4ff, 0xff4d8d, 0x38f5a0];
  for (let i = 0; i < 28; i++) {
    const m = new THREE.Mesh(
      geos[i % geos.length],
      new THREE.MeshBasicMaterial({ color: palette[i % palette.length], wireframe: i % 2 === 0 })
    );
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 7;
    m.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 40, Math.sin(angle) * radius - 4);
    m.userData = { spin: (Math.random() - 0.5) * 1.5, bob: Math.random() * Math.PI * 2 };
    shapes.add(m);
  }
  scene.add(shapes);

  // ---------- Star field ----------
  const starCount = 2500;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  const c = new THREE.Color();
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 80;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
    c.set(palette[i % palette.length]).lerp(new THREE.Color(0xffffff), 0.6);
    starCol.set([c.r, c.g, c.b], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true })
  );
  scene.add(stars);

  // ---------- Post-processing ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.5, 0.55);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- Per-section states ----------
  // x: blob horizontal offset, s: scale, amp: noise, colors
  const states = [
    { x: 2.2, s: 0.9, amp: 0.35, freq: 1.2, a: '#7c5cff', b: '#00d4ff' }, // home
    { x: -2.6, s: 0.8, amp: 0.25, freq: 2.0, a: '#ff4d8d', b: '#7c5cff' }, // about
    { x: 2.8, s: 0.75, amp: 0.3, freq: 1.6, a: '#7c5cff', b: '#ff4d8d' }, // experience
    { x: -2.8, s: 0.7, amp: 0.5, freq: 0.8, a: '#00d4ff', b: '#38f5a0' }, // projects
    { x: 2.6, s: 0.85, amp: 0.15, freq: 3.0, a: '#38f5a0', b: '#7c5cff' }, // skills
    { x: 0, s: 1.15, amp: 0.45, freq: 1.0, a: '#ff4d8d', b: '#ffb347' }, // contact
  ];
  const ca = new THREE.Color(), cb = new THREE.Color();

  // ---------- Input ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollProgress = 0; // 0..states.length-1
  let hoverTarget = 0;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    ndc.set(mouse.tx, mouse.ty);
  });

  function setScroll(p) { scrollProgress = p; }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    // Keep the blob framed on narrow screens
    camera.position.z = w < 700 ? 11 : 8;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  const narrow = () => window.innerWidth < 900;

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime * (reduceMotion ? 0.2 : 1);

    mouse.x = lerp(mouse.x, mouse.tx, 0.06);
    mouse.y = lerp(mouse.y, mouse.ty, 0.06);

    // Interpolate between section states
    const i = Math.min(Math.floor(scrollProgress), states.length - 2);
    const f = THREE.MathUtils.smoothstep(scrollProgress - i, 0, 1);
    const A = states[i], B = states[i + 1];
    const x = narrow() ? 0 : lerp(A.x, B.x, f);
    blobGroup.position.x = lerp(blobGroup.position.x, x, 0.08);
    const s = lerp(A.s, B.s, f) * (narrow() ? 0.75 : 1);
    blobGroup.scale.setScalar(lerp(blobGroup.scale.x, s, 0.08));
    blobUniforms.uAmp.value = lerp(A.amp, B.amp, f);
    blobUniforms.uFreq.value = lerp(A.freq, B.freq, f);
    blobUniforms.uColorA.value.copy(ca.set(A.a).lerp(cb.set(B.a), f));
    blobUniforms.uColorB.value.copy(ca.set(A.b).lerp(cb.set(B.b), f));
    blobUniforms.uTime.value = t;

    // Hover reaction
    raycaster.setFromCamera(ndc, camera);
    hoverTarget = raycaster.intersectObject(blob).length ? 1 : 0;
    blobUniforms.uHover.value = lerp(blobUniforms.uHover.value, hoverTarget, 0.05);
    document.body.classList.toggle('blob-hover', hoverTarget === 1);

    blob.rotation.y = t * 0.15 + mouse.x * 0.6;
    blob.rotation.x = mouse.y * -0.4;
    shell.rotation.y = -t * 0.08;
    shell.rotation.x = t * 0.05;

    rings.forEach((ring) => {
      const { moon, r, speed, phase } = ring.userData;
      const a = t * speed + phase;
      moon.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      ring.rotation.z += dt * 0.1;
    });

    // Floating shapes scroll past (parallax)
    shapes.position.y = scrollProgress * 8;
    shapes.children.forEach((m) => {
      m.rotation.x += dt * m.userData.spin;
      m.rotation.y += dt * m.userData.spin * 0.7;
      m.position.y += Math.sin(t + m.userData.bob) * 0.002;
    });

    stars.rotation.y = t * 0.01;
    stars.position.y = scrollProgress * 1.5;

    // Camera parallax
    camera.position.x = lerp(camera.position.x, mouse.x * 0.6, 0.05);
    camera.position.y = lerp(camera.position.y, mouse.y * 0.4, 0.05);
    camera.lookAt(blobGroup.position.x * 0.3, 0, 0);

    composer.render();
    requestAnimationFrame(tick);
  }

  return { start: tick, setScroll, sectionCount: states.length };
}
