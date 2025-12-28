import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

export function LuxuryScene() {
    const sphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!sphereRef.current) return;
        sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <group>
            {/* Cinematic Lighting */}
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#e9c49a" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b6544" />

            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Sphere ref={sphereRef} args={[1, 100, 100]} scale={1.8}>
                    <MeshDistortMaterial
                        color="#e9c49a"
                        speed={3}
                        distort={0.4}
                        radius={1}
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#8b6544"
                        emissiveIntensity={0.2}
                    />
                </Sphere>
            </Float>

            {/* Background Atmosphere */}
            <mesh scale={10}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#050505" side={THREE.BackSide} />
            </mesh>
        </group>
    );
}
