import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Mouse-tracking camera — moves smoothly toward the cursor
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.current.y * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// 3,000 random star points scattered across a wide field
function Starfield() {
  const geo = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) pos[i] = (Math.random() - 0.5) * 80;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color={0xffffff} size={0.035} transparent opacity={0.4} />
    </points>
  );
}

// 3 layered dark-blue spheres rendered from inside — deep space shell
function BackgroundShells() {
  const shells: [number, number, number][] = [
    [2.8, 0x001428, 0.06],
    [2.1, 0x002244, 0.07],
    [1.65, 0x001e44, 0.05],
  ];
  return (
    <>
      {shells.map(([r, c, o], i) => (
        <mesh key={i}>
          <sphereGeometry args={[r, 32, 32]} />
          <meshBasicMaterial color={c} transparent opacity={o} side={THREE.BackSide} />
        </mesh>
      ))}
    </>
  );
}

// Rotating globe with cyan wireframe overlay
function Globe() {
  const wfRef = useRef<THREE.Mesh>(null);
  const solidRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (solidRef.current) {
      solidRef.current.rotation.y = t * 0.2;
      const s = 1 + Math.sin(t * 0.5) * 0.008;
      solidRef.current.scale.set(s, s, s);
    }
    if (wfRef.current) wfRef.current.rotation.y = t * 0.16;
  });

  return (
    <>
      <mesh ref={wfRef}>
        <sphereGeometry args={[1.002, 36, 20]} />
        <meshBasicMaterial color={0x06b6d4} wireframe transparent opacity={0.11} />
      </mesh>
      <mesh ref={solidRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color={0x040d1a}
          emissive={0x001428}
          shininess={30}
          transparent
          opacity={0.97}
        />
      </mesh>
    </>
  );
}

// Spinning cyan octahedron gem at the center
function CentralGem() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.5;
      ref.current.rotation.x = t * 0.18;
    }
  });

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial
        color={0x06b6d4}
        emissive={0x06b6d4}
        emissiveIntensity={0.55}
        roughness={0.05}
        metalness={0.95}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// 4 flat torus rings at different angles and radii — cyan/blue/purple/pink
function OrbitRings() {
  const rings: [number, number, number, number, number, number][] = [
    [1.05, 0.007, Math.PI / 2,   0,    0x06b6d4, 0.5],
    [1.3,  0.006, Math.PI / 2.3, 0.3,  0x3b82f6, 0.28],
    [1.6,  0.004, Math.PI / 2.7, -0.4, 0x8b5cf6, 0.2],
    [1.95, 0.003, Math.PI / 3,   0.6,  0xec4899, 0.12],
  ];

  return (
    <>
      {rings.map(([r, t, rx, ry, c, o], i) => (
        <mesh key={i} rotation={[rx, ry, 0]}>
          <torusGeometry args={[r, t, 6, 120]} />
          <meshBasicMaterial color={c} transparent opacity={o} />
        </mesh>
      ))}
    </>
  );
}

// 3 glowing dots orbiting at different radii and speeds
function OrbitDots() {
  const dotDefs = [
    { r: 1.3,  speed: 1.1,  color: 0x06b6d4, size: 0.034 },
    { r: 1.6,  speed: -0.8, color: 0x8b5cf6, size: 0.026 },
    { r: 1.95, speed: 0.5,  color: 0xec4899, size: 0.02  },
  ];
  const refs = dotDefs.map(() => useRef<THREE.Mesh>(null));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    dotDefs.forEach(({ r, speed }, i) => {
      const m = refs[i].current;
      if (m) {
        m.position.x = Math.cos(t * speed) * r;
        m.position.y = Math.sin(t * speed) * r * 0.5;
        m.position.z = Math.sin(t * speed) * r * 0.4;
      }
    });
  });

  return (
    <>
      {dotDefs.map(({ color, size }, i) => (
        <mesh key={i} ref={refs[i]}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </>
  );
}

// 400-particle orbital band that rotates around the globe equator
function ParticleBelt() {
  const pN = 400;

  const geo = useMemo(() => {
    const arr = new Float32Array(pN * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  const angles = useMemo(() => Array.from({ length: pN }, () => Math.random() * Math.PI * 2), []);
  const radii  = useMemo(() => Array.from({ length: pN }, () => 1.1 + Math.random() * 1.1), []);
  const yOff   = useMemo(() => Array.from({ length: pN }, () => (Math.random() - 0.5) * 1.4), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < pN; i++) {
      angles[i] += 0.003;
      a[i * 3]     = Math.cos(angles[i]) * radii[i];
      a[i * 3 + 1] = yOff[i] + Math.sin(t * 0.35 + i) * 0.04;
      a[i * 3 + 2] = Math.sin(angles[i]) * radii[i] * 0.55;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial color={0x06b6d4} size={0.013} transparent opacity={0.32} />
    </points>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight color={0x0a1628} intensity={1.5} />
      <pointLight color={0x06b6d4} intensity={4}   distance={8} position={[1.5,  1.5,  2]} />
      <pointLight color={0x8b5cf6} intensity={2}   distance={6} position={[-2,  -1,   1]} />
      <pointLight color={0xec4899} intensity={1.2} distance={5} position={[0,   -2,  -1]} />

      <Starfield />
      <BackgroundShells />
      <Globe />
      <CentralGem />
      <OrbitRings />
      <OrbitDots />
      <ParticleBelt />
      <CameraController />
    </>
  );
}

export function HeroScene({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x070b14, 1);
        }}
      >
        <GlobeScene />
      </Canvas>
    </div>
  );
}
