'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientLocation } from '@/types/location';

const latLonToVector3 = (
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

type GlobeProps = {
  targetLocation: PatientLocation | null;
  patientLocations: PatientLocation[];
  onHover: (data: PatientLocation | null, pos: { x: number; y: number }) => void;
};

export default function Globe({ targetLocation, patientLocations, onHover }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const targetPositionRef = useRef<THREE.Vector3 | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const patientMeshesRef = useRef<THREE.Mesh[]>([]);
  const globeRef = useRef<THREE.Mesh | null>(null);

  const onHoverRef = useRef(onHover);

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    if (targetLocation) {
      targetPositionRef.current = latLonToVector3(
        targetLocation.lat,
        targetLocation.lon,
        2
      );
    }
  }, [targetLocation]);

  // Update markers when patientLocations change
  useEffect(() => {
    if (!globeRef.current) return;

    // Remove old markers
    patientMeshesRef.current.forEach(mesh => {
      globeRef.current?.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    patientMeshesRef.current = [];

    // Add new markers
    const newMeshes: THREE.Mesh[] = patientLocations.map((loc) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.015 * loc.scale, 20, 20),
        new THREE.MeshBasicMaterial({ color: loc.color })
      );
      marker.position.copy(latLonToVector3(loc.lat, loc.lon, 1.01));
      marker.userData = loc;
      globeRef.current?.add(marker);
      return marker;
    });

    patientMeshesRef.current = newMeshes;
  }, [patientLocations]);

  useEffect(() => {
    if (!mountRef.current || isInitialized.current) return;
    const currentMount = mountRef.current;
    isInitialized.current = true;
    let animationFrameId: number;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('/textures/world.jpg'),
        roughness: 0.7,
        metalness: 0.1,
      })
    );
    scene.add(globe);
    globeRef.current = globe;

    // Initial markers will be added by the patientLocations useEffect
    const patientMeshes: THREE.Mesh[] = patientLocations.map((loc) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.015 * loc.scale, 20, 20),
        new THREE.MeshBasicMaterial({ color: loc.color })
      );
      marker.position.copy(latLonToVector3(loc.lat, loc.lon, 1.01));
      marker.userData = loc;
      globe.add(marker);
      return marker;
    });
    patientMeshesRef.current = patientMeshes;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mousePosRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (targetPositionRef.current) {
        camera.position.lerp(targetPositionRef.current, 0.05);
        if (camera.position.distanceTo(targetPositionRef.current) < 0.01) {
          targetPositionRef.current = null;
        }
      }

      controls.update();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(patientMeshesRef.current);

      if (intersects.length > 0) {
        const loc = intersects[0].object.userData as PatientLocation;
        onHoverRef.current(loc, mousePosRef.current);
        controls.autoRotate = false;
      } else {
        onHoverRef.current(null, mousePosRef.current);
        controls.autoRotate = true;
      }

      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = currentMount;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    });
    resizeObserver.observe(currentMount);

    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) currentMount.innerHTML = '';
      isInitialized.current = false;
    };
    // This dependency array remains empty on purpose. The heavy lifting runs only once.
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}