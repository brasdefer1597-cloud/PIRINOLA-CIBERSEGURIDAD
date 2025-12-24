'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useTexture, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURACIÓN DE LAS CARAS (Ángulos de Aterrizaje) ---
// Un prisma hexagonal tiene caras cada 60 grados (PI/3 radianes)
const FACE_ROTATIONS = {
  toma:      [0, 0, 0],             // Frente
  pon:       [0, Math.PI / 3, 0],   // 60°
  todos:     [0, (Math.PI / 3) * 2, 0],
  error:     [0, Math.PI, 0],       // Atrás
  intrusion: [0, (Math.PI / 3) * 4, 0],
  escudo:    [0, (Math.PI / 3) * 5, 0]
};

function Artifact({ isSpinning, targetFace }) {
  const meshRef = useRef();

  // Estado para controlar la velocidad de rotación actual
  const [currentSpeed, setCurrentSpeed] = useState(0.5);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. MODO GIRO (CAOS)
    if (isSpinning) {
      // Acelerar rotación en ejes aleatorios
      meshRef.current.rotation.y += 15 * delta;
      meshRef.current.rotation.x += 5 * delta;
      // Flotación nerviosa
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.2;
    }
    // 2. MODO ATERRIZAJE (ORDEN)
    else if (targetFace && FACE_ROTATIONS[targetFace]) {
      const targetRot = FACE_ROTATIONS[targetFace];

      // Interpolación suave (Lerp) hacia el ángulo objetivo
      // Usamos un 'damp' manual para suavizar la llegada
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.2, 0.05); // Inclinación leve elegante

      // La rotación Y es la clave. Necesitamos calcular el ángulo más corto
      // para evitar que de vueltas locas al frenar.
      // (Simplificado para este demo: forzamos la rotación continua hasta llegar al target)

      // Nota: Para un efecto perfecto, reseteamos la rotación Y al múltiplo más cercano
      // Pero aquí usaremos una aproximación visual simple:

      const currentY = meshRef.current.rotation.y % (Math.PI * 2);
      const targetY = targetRot[1];

      // "Snapping" suave
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY + (Math.PI * 2 * 5), 0.05); // Truco: sumamos vueltas para que no regrese de golpe

      // Flotación calmada
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
    // 3. MODO IDLE (RESPIRACIÓN)
    else {
      meshRef.current.rotation.y += 0.5 * delta;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  // Materiales Élite: Oro mate y Obsidiana
  return (
    <group rotation={[0.2, 0, 0]}> {/* Inclinación base para ver mejor las caras */}
      <mesh ref={meshRef}>
        {/* GEOMETRÍA: Prisma Hexagonal (Cylinder con 6 segmentos) */}
        <cylinderGeometry args={[1.5, 1.5, 1, 6]} />

        {/* MATERIAL DEL CUERPO (Verde Pino Oscuro / Obsidiana) */}
        <meshStandardMaterial
          color="#0E2A24"
          roughness={0.2}
          metalness={0.8}
        />

        {/* BORDES DORADOS (Wireframe elegante) */}
        <lineSegments>
          <edgesGeometry args={[new THREE.CylinderGeometry(1.5, 1.5, 1, 6)]} />
          <lineBasicMaterial color="#C9A44C" linewidth={2} />
        </lineSegments>

        {/* ETIQUETAS DE TEXTO (Flotando sobre las caras) */}
        {/* TOMA (Frente) */}
        <Text position={[0, 0, 1.6]} fontSize={0.3} color="#C9A44C" anchorX="center" anchorY="middle">
          🌟 TOMA
        </Text>

        {/* PON (60 grados) */}
        <group rotation={[0, Math.PI / 3, 0]}>
          <Text position={[0, 0, 1.6]} fontSize={0.3} color="#F6F2EA" anchorX="center" anchorY="middle">
             🤲 PON
          </Text>
        </group>

        {/* TODOS (120 grados) */}
        <group rotation={[0, (Math.PI / 3) * 2, 0]}>
          <Text position={[0, 0, 1.6]} fontSize={0.3} color="#bd26f6" anchorX="center" anchorY="middle">
             🕯️ TODOS
          </Text>
        </group>

        {/* ERROR (180 grados - Atrás) */}
        <group rotation={[0, Math.PI, 0]}>
          <Text position={[0, 0, 1.6]} fontSize={0.3} color="#ff2a2a" anchorX="center" anchorY="middle">
             ❄️ ERROR
          </Text>
        </group>

        {/* INTRUSIÓN (240 grados) */}
        <group rotation={[0, (Math.PI / 3) * 4, 0]}>
          <Text position={[0, 0, 1.6]} fontSize={0.3} color="#7A1E2B" anchorX="center" anchorY="middle">
             🌑 INTRUSO
          </Text>
        </group>

        {/* ESCUDO (300 grados) */}
        <group rotation={[0, (Math.PI / 3) * 5, 0]}>
          <Text position={[0, 0, 1.6]} fontSize={0.3} color="#26c6f6" anchorX="center" anchorY="middle">
             🛡️ ESCUDO
          </Text>
        </group>

      </mesh>
    </group>
  );
}

export default function Pirinola3D({ isSpinning, targetFace }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      {/* ILUMINACIÓN DRAMÁTICA */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#C9A44C" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#26c6f6" />

      <Artifact isSpinning={isSpinning} targetFace={targetFace} />

      {/* REFLEJOS DE ENTORNO (Para que el metal brille) */}
      <Environment preset="city" />

      {/* CONTROLES (Opcional: permite al usuario rotar manualmente si quiere) */}
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
