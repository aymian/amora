import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMood } from "@/contexts/MoodContext";

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const { motionSpeed, colorIntensity } = useMood();
  
  const particleCount = 800;
  
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    return [positions, sizes];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    
    const time = state.clock.getElapsedTime() * motionSpeed * 0.1;
    
    // Gentle floating motion
    ref.current.rotation.y = time * 0.05;
    ref.current.rotation.x = Math.sin(time * 0.3) * 0.02;
    
    // Breathing effect - subtle pulsation
    const breathe = Math.sin(time * 0.5) * 0.02 + 1;
    ref.current.scale.setScalar(breathe);
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        transparent
        color={`hsl(350, 70%, ${60 * colorIntensity}%)`}
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.4 * colorIntensity}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function AmbientOrbs() {
  const orbRef1 = useRef<THREE.Mesh>(null);
  const orbRef2 = useRef<THREE.Mesh>(null);
  const { motionSpeed, colorIntensity } = useMood();

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * motionSpeed * 0.3;
    
    if (orbRef1.current) {
      orbRef1.current.position.x = Math.sin(time * 0.3) * 3;
      orbRef1.current.position.y = Math.cos(time * 0.2) * 2;
      const scale1 = 1.5 + Math.sin(time * 0.5) * 0.3;
      orbRef1.current.scale.setScalar(scale1);
    }
    
    if (orbRef2.current) {
      orbRef2.current.position.x = Math.cos(time * 0.25) * 4;
      orbRef2.current.position.y = Math.sin(time * 0.35) * 1.5 - 1;
      const scale2 = 1.2 + Math.cos(time * 0.4) * 0.25;
      orbRef2.current.scale.setScalar(scale2);
    }
  });

  return (
    <>
      <mesh ref={orbRef1} position={[-2, 1, -5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={`hsl(350, 70%, 50%)`}
          transparent
          opacity={0.08 * colorIntensity}
        />
      </mesh>
      <mesh ref={orbRef2} position={[3, -1, -6]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={`hsl(280, 60%, 50%)`}
          transparent
          opacity={0.06 * colorIntensity}
        />
      </mesh>
    </>
  );
}

export function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["hsl(240, 15%, 6%)", 5, 20]} />
        <ambientLight intensity={0.2} />
        <FloatingParticles />
        <AmbientOrbs />
      </Canvas>
    </div>
  );
}
