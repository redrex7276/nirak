import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, MousePointer, Hand } from 'lucide-react';

interface RobotMascotProps {
  className?: string;
  showBadge?: boolean;
  interactiveHint?: boolean;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  className = 'w-full h-[420px]',
  showBadge = true,
  interactiveHint = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.4, 5.8);

    // 2. Renderer with Transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xffedd5, 0.45);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -3;
    dirLight.shadow.camera.right = 3;
    dirLight.shadow.camera.top = 3;
    dirLight.shadow.camera.bottom = -3;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffedd5, 0.3, 10);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // Ground Shadow Catcher Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.75;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 4. Mascot Materials Palette
    const orangeTorsoMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.32,
      metalness: 0.15,
    });

    const navyLimbMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4,
      metalness: 0.25,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.6,
    });

    const whiteHelmetMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.1,
    });

    const visorBlackMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.15,
      metalness: 0.7,
    });

    const cyanEyeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.4,
      roughness: 0.1,
    });

    const hazardYellowMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 });
    const hazardDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    // 5. Robot Construction
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Torso Group
    const torsoGroup = new THREE.Group();
    robotGroup.add(torsoGroup);

    const bodyHeight = 0.95;
    const bodyRadius = 0.65;
    const cylinderGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 28);
    const cylinderMesh = new THREE.Mesh(cylinderGeo, orangeTorsoMat);
    cylinderMesh.castShadow = true;
    cylinderMesh.receiveShadow = true;
    torsoGroup.add(cylinderMesh);

    const topCapGeo = new THREE.SphereGeometry(bodyRadius, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topCap = new THREE.Mesh(topCapGeo, orangeTorsoMat);
    topCap.position.y = bodyHeight / 2;
    topCap.castShadow = true;
    torsoGroup.add(topCap);

    const bottomCapGeo = new THREE.SphereGeometry(bodyRadius, 28, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bottomCap = new THREE.Mesh(bottomCapGeo, orangeTorsoMat);
    bottomCap.position.y = -bodyHeight / 2;
    bottomCap.castShadow = true;
    torsoGroup.add(bottomCap);

    // Chest Plate with Hazard Stripes
    const chestPlateGeo = new THREE.BoxGeometry(0.68, 0.42, 0.08);
    const chestPlate = new THREE.Mesh(chestPlateGeo, jointMat);
    chestPlate.position.set(0, 0.1, 0.64);
    chestPlate.rotation.x = -0.05;
    torsoGroup.add(chestPlate);

    for (let i = -2; i <= 2; i++) {
      const stripeGeo = new THREE.BoxGeometry(0.07, 0.32, 0.02);
      const stripe = new THREE.Mesh(stripeGeo, i % 2 === 0 ? hazardYellowMat : hazardDarkMat);
      stripe.position.set(i * 0.11, 0.1, 0.69);
      stripe.rotation.z = 0.45;
      torsoGroup.add(stripe);
    }

    // Belt & Buckle
    const beltGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.12, 28);
    const belt = new THREE.Mesh(beltGeo, jointMat);
    belt.position.y = -0.32;
    torsoGroup.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.24, 0.15, 0.06);
    const buckle = new THREE.Mesh(buckleGeo, hazardYellowMat);
    buckle.position.set(0, -0.32, 0.68);
    torsoGroup.add(buckle);

    // Head & Pivot
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.92, 0);
    robotGroup.add(headPivot);

    const neckGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.22, 18);
    const neck = new THREE.Mesh(neckGeo, jointMat);
    neck.position.y = -0.1;
    headPivot.add(neck);

    const headCoreGeo = new THREE.SphereGeometry(0.56, 28, 20);
    const headCore = new THREE.Mesh(headCoreGeo, orangeTorsoMat);
    headCore.castShadow = true;
    headPivot.add(headCore);

    // Visor Screen
    const visorGeo = new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI, 0, Math.PI / 1.7);
    const visor = new THREE.Mesh(visorGeo, visorBlackMat);
    visor.rotation.x = Math.PI / 2.3;
    visor.position.set(0, 0.05, 0.14);
    visor.scale.set(0.95, 0.65, 0.95);
    headPivot.add(visor);

    // Glowing Eyes
    const eyeGroup = new THREE.Group();
    headPivot.add(eyeGroup);

    const eyeGeo = new THREE.BoxGeometry(0.16, 0.09, 0.04);
    const leftEye = new THREE.Mesh(eyeGeo, cyanEyeMat);
    leftEye.position.set(-0.19, 0.06, 0.54);
    leftEye.rotation.y = -0.2;
    eyeGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, cyanEyeMat);
    rightEye.position.set(0.19, 0.06, 0.54);
    rightEye.rotation.y = 0.2;
    eyeGroup.add(rightEye);

    // Hard Hat
    const hardHatGroup = new THREE.Group();
    hardHatGroup.position.set(0, 0.3, 0);
    hardHatGroup.rotation.x = -0.08;
    headPivot.add(hardHatGroup);

    const hatDomeGeo = new THREE.SphereGeometry(0.64, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hatDome = new THREE.Mesh(hatDomeGeo, whiteHelmetMat);
    hatDome.castShadow = true;
    hardHatGroup.add(hatDome);

    const brimGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.06, 32);
    const brim = new THREE.Mesh(brimGeo, whiteHelmetMat);
    brim.position.y = 0.02;
    brim.castShadow = true;
    hardHatGroup.add(brim);

    const peakGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.04, 32, 1, false, -Math.PI / 4, Math.PI / 2);
    const peak = new THREE.Mesh(peakGeo, whiteHelmetMat);
    peak.position.set(0, -0.01, 0.12);
    peak.scale.set(1.05, 1, 1.25);
    hardHatGroup.add(peak);

    const spineGeo = new THREE.BoxGeometry(0.13, 0.2, 0.9);
    const spine = new THREE.Mesh(spineGeo, whiteHelmetMat);
    spine.position.set(0, 0.44, -0.02);
    hardHatGroup.add(spine);

    const antennaStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.26, 12);
    const antennaStem = new THREE.Mesh(antennaStemGeo, jointMat);
    antennaStem.position.set(0.4, 0.38, -0.2);
    antennaStem.rotation.z = -0.3;
    hardHatGroup.add(antennaStem);

    const beaconGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      roughness: 0.1
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0.48, 0.52, -0.2);
    hardHatGroup.add(beacon);

    // Blue Robotic Limbs
    const shoulderGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const bicepGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.42, 16);
    const forearmGeo = new THREE.CylinderGeometry(0.11, 0.14, 0.38, 16);
    const handGeo = new THREE.BoxGeometry(0.2, 0.11, 0.2);

    // Left Arm
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.73, 0.32, 0);
    robotGroup.add(leftArmPivot);
    leftArmPivot.add(new THREE.Mesh(shoulderGeo, jointMat));
    const leftBicep = new THREE.Mesh(bicepGeo, navyLimbMat);
    leftBicep.position.y = -0.26;
    leftArmPivot.add(leftBicep);
    const leftForearm = new THREE.Mesh(forearmGeo, navyLimbMat);
    leftForearm.position.y = -0.68;
    leftArmPivot.add(leftForearm);
    const leftHand = new THREE.Mesh(handGeo, jointMat);
    leftHand.position.y = -0.92;
    leftArmPivot.add(leftHand);

    // Right Arm
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.73, 0.32, 0);
    robotGroup.add(rightArmPivot);
    rightArmPivot.add(new THREE.Mesh(shoulderGeo, jointMat));
    const rightBicep = new THREE.Mesh(bicepGeo, navyLimbMat);
    rightBicep.position.y = -0.26;
    rightArmPivot.add(rightBicep);
    const rightForearm = new THREE.Mesh(forearmGeo, navyLimbMat);
    rightForearm.position.y = -0.68;
    rightArmPivot.add(rightForearm);
    const rightHand = new THREE.Mesh(handGeo, jointMat);
    rightHand.position.y = -0.92;
    rightArmPivot.add(rightHand);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.42, 18);
    const footGeo = new THREE.BoxGeometry(0.34, 0.16, 0.5);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.36, -0.88, 0);
    robotGroup.add(leftLegGroup);
    leftLegGroup.add(new THREE.Mesh(shoulderGeo, jointMat));
    const leftLeg = new THREE.Mesh(legGeo, navyLimbMat);
    leftLeg.position.y = -0.24;
    leftLegGroup.add(leftLeg);
    const leftFoot = new THREE.Mesh(footGeo, jointMat);
    leftFoot.position.set(0, -0.48, 0.08);
    leftFoot.castShadow = true;
    leftLegGroup.add(leftFoot);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.36, -0.88, 0);
    robotGroup.add(rightLegGroup);
    rightLegGroup.add(new THREE.Mesh(shoulderGeo, jointMat));
    const rightLeg = new THREE.Mesh(legGeo, navyLimbMat);
    rightLeg.position.y = -0.24;
    rightLegGroup.add(rightLeg);
    const rightFoot = new THREE.Mesh(footGeo, jointMat);
    rightFoot.position.set(0, -0.48, 0.08);
    rightFoot.castShadow = true;
    rightLegGroup.add(rightFoot);

    leftArmPivot.rotation.z = 0.18;
    leftArmPivot.rotation.x = 0.1;
    rightArmPivot.rotation.z = -0.18;
    rightArmPivot.rotation.x = 0.1;

    // 6. Mouse & Cursor Tracking
    const mouse = { x: 0, y: 0 };
    const targetRotation = { headX: 0, headY: 0, torsoX: 0, torsoY: 0 };
    let lastMouseMoveTime = performance.now();
    let wavingActive = false;
    let waveStartTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMouseMoveTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        lastMouseMoveTime = performance.now();
      }
    };

    const triggerWave = () => {
      wavingActive = true;
      waveStartTime = performance.now();
      setIsWaving(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('click', triggerWave);

    // 7. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const now = performance.now();
      const isIdle = now - lastMouseMoveTime > 2400;

      // Idle Hover & Breathing
      const floatOffsetY = Math.sin(elapsedTime * 2.2) * 0.08;
      robotGroup.position.y = floatOffsetY;

      const breathScale = 1.0 + Math.sin(elapsedTime * 2.0) * 0.02;
      torsoGroup.scale.set(1 / Math.sqrt(breathScale), breathScale, 1 / Math.sqrt(breathScale));

      shadowPlane.scale.set(1.0 - floatOffsetY * 1.5, 1.0 - floatOffsetY * 1.5, 1.0);
      shadowPlaneMat.opacity = 0.12 - floatOffsetY * 0.05;

      leftArmPivot.rotation.x = 0.1 + Math.sin(elapsedTime * 1.8) * 0.05;

      // Cursor tracking calculations
      if (!isIdle) {
        targetRotation.headY = THREE.MathUtils.clamp(mouse.x * 0.75, -0.75, 0.75);
        targetRotation.headX = THREE.MathUtils.clamp(-mouse.y * 0.45, -0.45, 0.45);
        targetRotation.torsoY = THREE.MathUtils.clamp(mouse.x * 0.32, -0.32, 0.32);
        targetRotation.torsoX = THREE.MathUtils.clamp(-mouse.y * 0.15, -0.15, 0.15);
      } else {
        targetRotation.headY = Math.sin(elapsedTime * 0.8) * 0.35;
        targetRotation.headX = Math.cos(elapsedTime * 0.6) * 0.15;
        targetRotation.torsoY = Math.sin(elapsedTime * 0.8) * 0.12;
        targetRotation.torsoX = 0;
      }

      // Smooth LERP interpolation
      const lerpSpeed = 0.065;
      headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, targetRotation.headY, lerpSpeed);
      headPivot.rotation.x = THREE.MathUtils.lerp(headPivot.rotation.x, targetRotation.headX, lerpSpeed);
      torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, targetRotation.torsoY, lerpSpeed);
      torsoGroup.rotation.x = THREE.MathUtils.lerp(torsoGroup.rotation.x, targetRotation.torsoX, lerpSpeed);

      // Pupils glance
      eyeGroup.position.x = THREE.MathUtils.lerp(eyeGroup.position.x, targetRotation.headY * 0.08, 0.1);
      eyeGroup.position.y = THREE.MathUtils.lerp(eyeGroup.position.y, -targetRotation.headX * 0.06, 0.1);

      // Wave animation
      if (wavingActive) {
        const waveElapsed = (now - waveStartTime) / 1000;
        if (waveElapsed < 1.6) {
          rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -2.4, 0.15);
          rightArmPivot.rotation.x = Math.sin(waveElapsed * 16) * 0.35;
          rightForearm.rotation.z = Math.sin(waveElapsed * 20) * 0.4;
        } else {
          wavingActive = false;
          setIsWaving(false);
          rightForearm.rotation.z = 0;
        }
      } else {
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.18, 0.08);
        rightArmPivot.rotation.x = 0.1 - Math.sin(elapsedTime * 1.8) * 0.05;
      }

      beaconMat.emissiveIntensity = 1.0 + Math.sin(elapsedTime * 6) * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', triggerWave);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Mascot Badge Overlay */}
      {showBadge && (
        <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Shramik Bot 3D</span>
        </div>
      )}

      {/* Interactive Floating Hint */}
      {interactiveHint && (
        <div className="absolute bottom-3 inset-x-0 mx-auto w-fit pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium shadow-md transition-all">
          {isWaving ? (
            <>
              <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Shramik Bot says hello!</span>
            </>
          ) : (
            <>
              <MousePointer className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Move cursor to track • Click to wave</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
