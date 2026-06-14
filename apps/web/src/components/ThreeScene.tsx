"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function EmeraldGem() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <group>
        {/* Main Crystal */}
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[1.8, 0]} />
          <MeshDistortMaterial
            color="#0d6b4e"
            roughness={0.1}
            metalness={0.8}
            distort={0.15}
            speed={2}
            envMapIntensity={3}
          />
        </mesh>

        {/* Inner Core Glow */}
        <mesh ref={glowRef}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.9} />
          <pointLight color="#d4af37" intensity={3} distance={8} />
        </mesh>

        {/* Outer Ring Particle */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[
            Math.cos((i / 6) * Math.PI * 2) * 2.5,
            Math.sin((i / 6) * Math.PI * 2) * 0.5,
            Math.sin((i / 6) * Math.PI * 2) * 2.5,
          ]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
            <pointLight color="#10b981" intensity={0.5} distance={3} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, -2, -5]} intensity={0.4} color="#0d6b4e" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#d4af37" />

      <EmeraldGem />

      {/* Fog for depth */}
      <fog attach="fog" args={["#0a0c0e", 8, 20]} />
    </>
  );
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: "100%", height: "100%", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508" }}>
          <div style={{ textAlign: "center", color: "var(--color-gold)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem auto" }}>
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
            <p style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}>3D Environment Unavailable</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function hasWebGLSupport() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

export default function ThreeScene() {
  const [isSupported, setIsSupported] = React.useState(true);

  React.useEffect(() => {
    if (!hasWebGLSupport()) {
      setIsSupported(false);
    }
  }, []);

  if (!isSupported) {
    return (
      <div style={{ width: "100%", height: "100%", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508" }}>
        <div style={{ textAlign: "center", color: "var(--color-gold)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem auto" }}>
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
          <p style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}>WebGL Not Supported</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ width: "100%", height: "100%", minHeight: "400px" }}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: "default" }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', function(e) {
              e.preventDefault();
              setIsSupported(false);
            }, false);
          }}
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
