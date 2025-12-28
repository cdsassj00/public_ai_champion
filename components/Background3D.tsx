
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- Layer 1: Tiny Gold Dust (The Nebula) ---
    const dustCount = 4000;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i++) {
      dustPos[i] = (Math.random() - 0.5) * 12;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.003,
      color: 0xbf953f,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const dustMesh = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustMesh);

    // --- Layer 2: Floating Embers (Foreground focus) ---
    const emberCount = 200;
    const emberGeometry = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberSizes = new Float32Array(emberCount);
    for (let i = 0; i < emberCount * 3; i++) {
      emberPos[i] = (Math.random() - 0.5) * 8;
    }
    for (let i = 0; i < emberCount; i++) {
      emberSizes[i] = Math.random();
    }
    emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const emberMesh = new THREE.Points(emberGeometry, emberMaterial);
    scene.add(emberMesh);

    camera.position.z = 3;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5);
      mouseY = (event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      requestAnimationFrame(animate);
      
      // Target interpolation for smooth movement
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Layer 1: Drifting Dust
      dustMesh.rotation.y = elapsedTime * 0.05;
      dustMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
      dustMesh.position.x = -targetX * 0.5;
      dustMesh.position.y = targetY * 0.5;

      // Layer 2: Floating Embers with pulsating effect
      emberMesh.rotation.y = -elapsedTime * 0.08;
      emberMesh.position.x = -targetX * 1.5; // More intense parallax
      emberMesh.position.y = targetY * 1.5;
      
      // Individual ember drifting
      const positions = emberMesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(elapsedTime + positions[i3]) * 0.001; // Vertical drift
      }
      emberMesh.geometry.attributes.position.needsUpdate = true;
      
      // Pulsing opacity
      emberMaterial.opacity = 0.4 + Math.sin(elapsedTime * 2) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      emberGeometry.dispose();
      emberMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default Background3D;
