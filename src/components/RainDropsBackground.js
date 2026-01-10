import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const RainDropsBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Licht für die Lichtbrechung der Tropfen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dropCount = 120; // Weniger Tropfen für einen cleaner Look
    const drops = [];
    
    // Geometrie für einen Tropfen (halbe Kugel)
    const dropGeometry = new THREE.SphereGeometry(1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);

    for (let i = 0; i < dropCount; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        shininess: 100,
        specular: 0xffffff
      });

      const drop = new THREE.Mesh(dropGeometry, material);
      
      // Zufällige Größe für Realismus
      const scale = 0.2 + Math.random() * 0.5;
      drop.scale.set(scale, scale, scale * 0.3); // Flach gegen die Scheibe

      // Startposition
      drop.position.set(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        0
      );

      // Sehr langsame Geschwindigkeit
      drop.userData = {
        speed: 0.01 + Math.random() * 0.03,
        wobble: Math.random() * 100
      };

      scene.add(drop);
      drops.push(drop);
    }

    camera.position.z = 50;

    const animate = () => {
      requestAnimationFrame(animate);

      drops.forEach(drop => {
        // Ganz langsames Heruntergleiten
        drop.position.y -= drop.userData.speed;
        
        // Leichtes seitliches "Zittern" beim Gleiten
        drop.position.x += Math.sin(Date.now() * 0.001 + drop.userData.wobble) * 0.005;

        // Reset wenn unten aus dem Sichtfeld
        if (drop.position.y < -60) {
          drop.position.y = 60;
          drop.position.x = (Math.random() - 0.5) * 150;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />;
};

export default RainDropsBackground;