import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";

function DashboardCard({
  position,
  rotation,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    }
  });

  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.5}>
      <group position={position} rotation={rotation} scale={scale}>
        <RoundedBox args={[2, 1.2, 0.08]} radius={0.06} smoothness={4} ref={meshRef as any}>
          <meshStandardMaterial
            color={threeColor}
            emissive={threeColor}
            emissiveIntensity={0.1}
            transparent
            opacity={0.95}
            roughness={0.2}
            metalness={0.7}
          />
        </RoundedBox>
        {/* Accent stripe */}
        <mesh position={[-0.55, 0.35, 0.05]}>
          <planeGeometry args={[0.5, 0.07]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.1, 0.35, 0.05]}>
          <planeGeometry args={[0.6, 0.07]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0.05]}>
          <planeGeometry args={[1.5, 0.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </mesh>
        <mesh position={[0, -0.1, 0.05]}>
          <planeGeometry args={[1.2, 0.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
      </group>
    </Float>
  );
}

function BarChart({ position }: { position: [number, number, number] }) {
  const heights = [0.3, 0.55, 0.42, 0.75, 0.62, 0.9, 0.7];
  const colors = ["#06B6D4", "#3B82F6", "#06B6D4", "#8B5CF6", "#3B82F6", "#06B6D4", "#8B5CF6"];

  return (
    <Float speed={1} floatIntensity={0.3}>
      <group position={position}>
        <RoundedBox args={[2.4, 1.5, 0.07]} radius={0.06} smoothness={4} position={[0, 0, -0.04]}>
          <meshStandardMaterial color="#0a1628" transparent opacity={0.98} roughness={0.3} metalness={0.3} />
        </RoundedBox>
        {heights.map((h, i) => (
          <mesh key={i} position={[-0.84 + i * 0.28, -0.45 + h / 2, 0.05]}>
            <boxGeometry args={[0.16, h, 0.05]} />
            <meshStandardMaterial
              color={colors[i]}
              emissive={colors[i]}
              emissiveIntensity={0.25}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function OrbitRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  const dot = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[radius, 0.006, 8, 64]} />
        <meshBasicMaterial color={dot} transparent opacity={0.2} />
      </mesh>
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={dot} />
      </mesh>
    </group>
  );
}

function CentralGem() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
      ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={0.6} floatIntensity={0.4}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={0.4}
          roughness={0.05}
          metalness={0.95}
          transparent
          opacity={0.85}
        />
      </mesh>
      <pointLight color="#06B6D4" intensity={2.5} distance={4} />
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#8B5CF6" distance={8} />
      <pointLight position={[3, -2, 1]} intensity={1.2} color="#06B6D4" distance={8} />
      <pointLight position={[0, 3, -2]} intensity={0.8} color="#EC4899" distance={6} />

      <Environment preset="night" />

      <CentralGem />

      <OrbitRing radius={1.5} speed={0.4} color="#06B6D4" />
      <OrbitRing radius={2.2} speed={-0.25} color="#8B5CF6" />
      <OrbitRing radius={3.0} speed={0.15} color="#EC4899" />

      <DashboardCard position={[-3.0, 1.3, -1]} rotation={[0.05, 0.3, -0.04]} color="#0d1a2e" scale={0.9} />
      <DashboardCard position={[3.0, 0.9, -1.2]} rotation={[0.02, -0.3, 0.03]} color="#111827" scale={0.85} />
      <DashboardCard position={[-2.8, -1.5, -0.8]} rotation={[-0.04, 0.2, 0.04]} color="#0d1a2e" scale={0.8} />
      <BarChart position={[2.5, -1.3, -0.5]} />
    </>
  );
}

export function HeroScene({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
