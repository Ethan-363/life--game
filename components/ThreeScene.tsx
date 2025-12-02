import React, { Suspense, useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF, Center, Html, Stars, Grid, Sky, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { StatKey, CharacterStats, getLevelInfo } from '../types';
import { Brain, Heart, Crown, Zap, Coins, Clover } from 'lucide-react';
import { ModelData } from '../App';

// Fix for missing JSX Intrinsic Elements for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      cylinderGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      directionalLight: any;
      orthographicCamera: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      primitive: any;
    }
  }
}

// --- Error Boundary ---

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error) => void;
  // Explicitly allowing key in props to resolve TS strict checking issues
  key?: React.Key | null | undefined;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare state property for TypeScript
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error loading 3D model:", error);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// --- Helper Components ---

const ProgressLoader = () => {
  const { progress, active, item } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-5 bg-black/80 rounded-2xl border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        {/* Progress Circle */}
        <div className="relative w-16 h-16 mb-3">
           <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
             {/* Background Circle */}
             <path
               className="text-gray-800"
               d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
               fill="none"
               stroke="currentColor"
               strokeWidth="4"
             />
             {/* Progress Circle */}
             <path
               className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-out"
               strokeDasharray={`${progress}, 100`}
               d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
               fill="none"
               stroke="currentColor"
               strokeWidth="4"
             />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-xs font-black font-mono text-cyan-50">{Math.round(progress)}%</span>
           </div>
        </div>
        <div className="flex flex-col items-center max-w-[200px]">
           <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse mb-1">
             {active ? 'Loading Assets' : 'Finalizing'}
           </span>
           {item && <span className="text-[8px] text-gray-500 truncate w-full text-center opacity-70">{item.split('/').pop()?.substring(0, 20)}...</span>}
        </div>
      </div>
    </Html>
  );
};

const STAT_ICONS: Record<StatKey, any> = {
  intelligence: Brain,
  vitality: Heart,
  charisma: Crown,
  skill: Zap,
  wealth: Coins,
  luck: Clover,
};

interface StatPanelProps {
  statKey: StatKey;
  value: number;
  label: string;
  colorClass: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: () => void;
  index: number;
}

const StatPanel: React.FC<StatPanelProps> = ({ statKey, value, label, colorClass, position, rotation, onClick, index }) => {
  const levelInfo = getLevelInfo(value);
  const progress = levelInfo.progress;
  const level = levelInfo.level;
  const Icon = STAT_ICONS[statKey];
  const ref = useRef<HTMLDivElement>(null);

  // Floating animation offset logic
  useFrame(({ clock }) => {
    if (ref.current) {
      // Sine wave bobbing based on time and index for variety
      const yOffset = Math.sin(clock.elapsedTime * 1.5 + index) * 5; 
      ref.current.style.transform = `translate3d(-50%, calc(-50% + ${yOffset}px), 0)`;
    }
  });
  
  // Extract main color from the tailwind class string provided
  let barColor = 'bg-gray-400';
  let glowColor = 'shadow-gray-500/50';
  let ringColor = 'border-gray-400';
  
  if (colorClass.includes('blue')) { barColor = 'bg-blue-500'; glowColor = 'shadow-blue-500/50'; ringColor = 'border-blue-400'; }
  else if (colorClass.includes('red')) { barColor = 'bg-red-500'; glowColor = 'shadow-red-500/50'; ringColor = 'border-red-400'; }
  else if (colorClass.includes('purple')) { barColor = 'bg-purple-500'; glowColor = 'shadow-purple-500/50'; ringColor = 'border-purple-400'; }
  else if (colorClass.includes('yellow')) { barColor = 'bg-yellow-500'; glowColor = 'shadow-yellow-500/50'; ringColor = 'border-yellow-400'; }
  else if (colorClass.includes('amber')) { barColor = 'bg-amber-500'; glowColor = 'shadow-amber-500/50'; ringColor = 'border-amber-400'; }
  else if (colorClass.includes('green')) { barColor = 'bg-green-500'; glowColor = 'shadow-green-500/50'; ringColor = 'border-green-400'; }
  else if (colorClass.includes('cyan')) { barColor = 'bg-cyan-500'; glowColor = 'shadow-cyan-500/50'; ringColor = 'border-cyan-400'; }

  return (
    // SCALE 0.5: Shrink the high-res content back to normal size in 3D space for clarity
    <Html transform scale={0.5} position={position} rotation={rotation} occlude distanceFactor={8} className="pointer-events-none">
      <div 
        ref={ref}
        className="flex flex-col items-center gap-4 select-none will-change-transform"
        style={{ perspective: '1000px' }}
      >
        {/* Stereoscopic Circular Window - Interactive */}
        {/* DOUBLED SIZES: w-14 -> w-28, h-14 -> h-28 */}
        <div 
          onClick={onClick}
          className={`pointer-events-auto cursor-pointer group relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform-style-3d hover:scale-110 active:scale-90 active:brightness-125`}
        >
          
          {/* Outer Ring / Thickness simulation */}
          {/* border-2 -> border-4 */}
          <div className={`absolute inset-0 rounded-full border-4 ${ringColor} bg-gray-900 opacity-90 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_-8px_8px_rgba(0,0,0,0.5)]`} />
          
          {/* Inner Glass */}
          {/* inset-1 -> inset-2 */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-black/80 backdrop-blur-md flex flex-col items-center justify-center border-t border-white/20 border-b border-black/50 ${glowColor} group-hover:shadow-[0_0_40px_currentColor]`}>
            {/* DOUBLED ICON: size 20 -> 40 */}
            <Icon size={40} strokeWidth={2.5} className={`${colorClass.split(' ')[0]} mb-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]`} />
            {/* DOUBLED TEXT: text-xs -> text-2xl */}
            <span className="font-mono font-black text-white text-2xl leading-none drop-shadow-md">{value}</span>
          </div>

          {/* Label Badge (Floating above) - Non-interactive */}
          {/* top-3 -> top-6, px-1.5 -> px-3, text-[8px] -> text-sm */}
          <div className="absolute -top-6 px-3 py-1 bg-black/90 border border-white/10 rounded-full shadow-lg transform translate-z-8 pointer-events-none">
            <span className={`text-sm font-bold uppercase tracking-widest ${colorClass.split(' ')[0]}`}>{label}</span>
          </div>

          {/* Level Badge - Bottom (Floating above) - Non-interactive */}
          {/* bottom-2 -> bottom-4, px-1.5 -> px-3, text-[7px] -> text-xs */}
          <div className="absolute -bottom-4 px-3 py-1 bg-gray-900 border border-yellow-500/30 rounded-full flex items-center shadow-lg transform translate-z-4 pointer-events-none">
             <span className="text-xs font-mono text-yellow-400 font-bold tracking-tight">LV.{level}</span>
          </div>
        </div>
        
        {/* Stereoscopic Rectangular Progress Bar - Interactive */}
        {/* DOUBLED SIZES: w-20 -> w-40, h-2 -> h-4 */}
        <div 
          onClick={onClick}
          className="pointer-events-auto cursor-pointer w-40 h-4 bg-gray-900 rounded-full border-2 border-gray-700/50 shadow-[0_8px_16px_rgba(0,0,0,0.6)] overflow-hidden relative active:scale-95 transition-transform"
        >
           {/* Inner Shadow for depth */}
           <div className="absolute inset-0 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] z-10 pointer-events-none rounded-full" />
           
           {/* Progress Fill */}
           <div 
            className={`h-full transition-all duration-500 ease-out ${barColor} relative`} 
            style={{ width: `${progress}%` }} 
           >
             {/* Glass shine on bar */}
             <div className="absolute top-0 left-0 right-0 h-[50%] bg-white/20 pointer-events-none" />
             <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-white/60 shadow-[0_0_16px_white] pointer-events-none" />
           </div>
        </div>
      </div>
    </Html>
  );
};

// --- Default City Environment ---

const DefaultCityEnvironment = () => {
  const buildings = useMemo(() => {
    const items = [];
    // Create a grid of buildings
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        // Skip central area for character
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
        
        // Randomly skip some to make it look organic
        if (Math.random() > 0.7) continue;

        const height = 10 + Math.random() * 30; // 10 to 40 units high
        const width = 4 + Math.random() * 3;
        
        const posX = x * 15 + (Math.random() - 0.5) * 5;
        const posZ = z * 15 + (Math.random() - 0.5) * 5;
        
        const isGlass = Math.random() > 0.4;

        items.push({
          position: [posX, height / 2, posZ] as [number, number, number],
          size: [width, height, width] as [number, number, number],
          color: isGlass ? '#94a3b8' : '#e2e8f0', // Glass-like blue-grey or white-grey concrete
          isGlass
        });
      }
    }
    return items;
  }, []);

  return (
    <group>
      <Sky distance={450000} sunPosition={[100, 40, 100]} inclination={0.6} azimuth={0.1} />
      
      {/* Sunlight */}
      <directionalLight position={[100, 40, 100]} intensity={1.5} castShadow shadow-mapSize={2048}>
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      {/* Pavement Ground - At y=0 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      
      {/* Decorative Grid on floor */}
      <Grid 
        infiniteGrid 
        fadeDistance={60} 
        cellColor="#64748b" 
        sectionColor="#334155" 
        sectionSize={15} 
        cellSize={5} 
        position={[0, 0.01, 0]} 
      />

      {buildings.map((b, i) => (
        <group key={i} position={b.position}>
           <mesh castShadow receiveShadow>
             <boxGeometry args={b.size} />
             <meshStandardMaterial 
                color={b.color} 
                roughness={b.isGlass ? 0.1 : 0.8} 
                metalness={b.isGlass ? 0.8 : 0.1} 
             />
           </mesh>
           {/* Simple window detail */}
           {b.isGlass && (
             <mesh scale={[1.01, 0.98, 1.01]}>
               <boxGeometry args={[b.size[0], b.size[1], b.size[2]]} />
               <meshStandardMaterial color="#0f172a" wireframe transparent opacity={0.1} />
             </mesh>
           )}
        </group>
      ))}
    </group>
  );
};

// --- Default Realistic Male Character Model ---

const DefaultMaleCharacter = () => {
  // Realistic Materials
  const skinMaterial = <meshStandardMaterial color="#eac086" roughness={0.5} />; // Warm beige skin
  const shirtMaterial = <meshStandardMaterial color="#374151" roughness={0.9} />; // Dark Grey tight T-shirt
  const pantsMaterial = <meshStandardMaterial color="#1e3a8a" roughness={0.8} />; // Blue Jeans
  const shoesMaterial = <meshStandardMaterial color="#111827" roughness={0.7} />; // Black Boots
  const hairMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.9} />; // Black hair

  return (
    <group dispose={null}>
      {/* --- LEGS --- */}
      {/* Hips / Pelvis */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.35, 0.35]} />
        {pantsMaterial}
      </mesh>
      
      {/* Left Leg */}
      <group position={[-0.28, 0.1, 0]}>
        {/* Thigh (Jeans) */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0.03]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.15, 0.9, 16]} />
          {pantsMaterial}
        </mesh>
        {/* Knee (Jeans) */}
        <mesh position={[0.02, -0.1, 0]} castShadow receiveShadow>
           <sphereGeometry args={[0.16]} />
           {pantsMaterial}
        </mesh>
        {/* Calf (Jeans) */}
        <mesh position={[0.05, -0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.9, 16]} />
          {pantsMaterial}
        </mesh>
        {/* Boot */}
        <mesh position={[0.05, -1.15, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.15, 0.45]} />
          {shoesMaterial}
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.28, 0.1, 0]}>
        {/* Thigh (Jeans) */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, -0.03]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.15, 0.9, 16]} />
          {pantsMaterial}
        </mesh>
        {/* Knee (Jeans) */}
        <mesh position={[-0.02, -0.1, 0]} castShadow receiveShadow>
           <sphereGeometry args={[0.16]} />
           {pantsMaterial}
        </mesh>
        {/* Calf (Jeans) */}
        <mesh position={[-0.05, -0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.9, 16]} />
          {pantsMaterial}
        </mesh>
        {/* Boot */}
        <mesh position={[-0.05, -1.15, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.15, 0.45]} />
          {shoesMaterial}
        </mesh>
      </group>

      {/* --- TORSO --- */}
      {/* Waist (Shirt) */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[0.28, 0.27, 0.6, 16]} />
         {shirtMaterial}
      </mesh>
      
      {/* Chest (Shirt) - Muscular */}
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[0.42, 0.32, 0.6, 16]} /> 
         {shirtMaterial}
      </mesh>
      
      {/* Neck (Skin) */}
      <mesh position={[0, 2.35, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[0.12, 0.14, 0.2, 16]} />
         {skinMaterial}
      </mesh>

      {/* --- HEAD --- */}
      <group position={[0, 2.65, 0]}>
         {/* Face */}
         <mesh castShadow receiveShadow>
           <boxGeometry args={[0.28, 0.35, 0.32]} />
           {skinMaterial}
         </mesh>
         {/* Hair Top */}
         <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
           <boxGeometry args={[0.3, 0.15, 0.34]} />
           {hairMaterial}
         </mesh>
         {/* Hair Back */}
         <mesh position={[0, 0.0, -0.18]} castShadow receiveShadow>
           <boxGeometry args={[0.3, 0.3, 0.05]} />
           {hairMaterial}
         </mesh>
      </group>

      {/* --- ARMS --- */}
      {/* Left Arm */}
      <group position={[-0.55, 2.15, 0]}>
         {/* Shoulder (Shirt) */}
         <mesh castShadow receiveShadow>
           <sphereGeometry args={[0.2]} />
           {shirtMaterial}
         </mesh>
         {/* Sleeve (Shirt) */}
         <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.18, 0.16, 0.3, 16]} />
            {shirtMaterial}
         </mesh>
         {/* Upper Arm (Skin) */}
         <mesh position={[0.02, -0.5, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.13, 0.5, 16]} />
            {skinMaterial}
         </mesh>
         {/* Forearm (Skin) */}
         <mesh position={[0.08, -1.0, 0.1]} rotation={[0.2, 0, 0.1]} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.11, 0.6, 16]} />
            {skinMaterial}
         </mesh>
         {/* Hand */}
         <mesh position={[0.12, -1.4, 0.15]} rotation={[0.2, 0, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.15, 0.15]} />
            {skinMaterial}
         </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.55, 2.15, 0]}>
         {/* Shoulder (Shirt) */}
         <mesh castShadow receiveShadow>
           <sphereGeometry args={[0.2]} />
           {shirtMaterial}
         </mesh>
         {/* Sleeve (Shirt) */}
         <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.18, 0.16, 0.3, 16]} />
            {shirtMaterial}
         </mesh>
         {/* Upper Arm (Skin) */}
         <mesh position={[-0.02, -0.5, 0]} rotation={[0, 0, -0.1]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.13, 0.5, 16]} />
            {skinMaterial}
         </mesh>
         {/* Forearm (Skin) */}
         <mesh position={[-0.08, -1.0, 0.1]} rotation={[0.2, 0, -0.1]} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.11, 0.6, 16]} />
            {skinMaterial}
         </mesh>
         {/* Hand */}
         <mesh position={[-0.12, -1.4, 0.15]} rotation={[0.2, 0, -0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.15, 0.15]} />
            {skinMaterial}
         </mesh>
      </group>

    </group>
  );
};

export { DynamicModel, DefaultMaleCharacter, DefaultCityEnvironment };

interface ModelProps {
  modelData: ModelData | null;
  type: 'character' | 'environment';
}

const DynamicModel: React.FC<ModelProps> = ({ modelData, type }) => {
  // Manual Error State to force Boundary fallback
  const [error, setError] = useState<string | null>(null);
  
  if (error) {
    throw new Error(error);
  }

  // If no URL, render default placeholders
  if (!modelData?.url) {
    if (type === 'environment') {
      // Position environment slightly below the character's feet.
      // Character is 4 units high, centered at 0.85 -> Feet at -1.15.
      // We put ground at -1.2 to be slightly below.
      return (
        <group position={[0, -1.2, 0]}>
           <DefaultCityEnvironment />
        </group>
      );
    }
    
    // Default Character Placeholder
    // Using custom Male Character Model
    return (
      <group position={[0, -1.15, 0]} scale={[1.2, 1.2, 1.2]}>
         <DefaultMaleCharacter />
      </group>
    );
  }

  // Load model based on extension
  let object: THREE.Group | THREE.Object3D | null = null;
  
  if (modelData.ext === 'fbx') {
    object = useLoader(FBXLoader, modelData.url);
  } else if (modelData.ext === 'obj') {
    object = useLoader(OBJLoader, modelData.url);
  } else {
    // Default to GLB/GLTF
    const gltf = useGLTF(modelData.url);
    object = gltf.scene;
  }
  
  const clone = React.useMemo(() => object ? object.clone() : null, [object]);
  const [scale, setScale] = useState<number>(0.00001); 
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (!clone) return;

    // 1. Check for Meshes & Config
    let meshCount = 0;
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        meshCount++;
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false; 
        
        // Ensure material is visible
        if (mesh.material instanceof THREE.Material) {
           mesh.material.side = THREE.DoubleSide;
        }
      }
    });

    if (meshCount === 0) {
      setError("Model contains no visible meshes.");
      return;
    }

    // 2. Reset transforms for accurate measurement
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    // 3. Max dimension calculation & Validation
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (!isFinite(maxDim) || maxDim <= 0.0001) {
       setError("Model has invalid dimensions (Zero or Infinite).");
       return;
    }
    
    // 4. Set Scale
    if (type === 'character') {
      const targetHeight = 4.0; // Matches visual height of default model
      setScale(targetHeight / maxDim);
    } else {
      const targetEnvSize = 30;
      setScale(targetEnvSize / maxDim);
    }
    setIsReady(true);
    
    return () => {
      // Cleanup
      if (clone) {
        clone.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            if (mesh.material instanceof THREE.Material) mesh.material.dispose();
            if (mesh.geometry) mesh.geometry.dispose();
          }
        });
      }
    };
  }, [clone, type]);

  // Prevent rendering before scale is calculated to ensure Center works correctly
  if (!isReady) return null;

  if (type === 'environment') {
     // Align imported environment ground (bottom) to slightly below character feet (-1.2)
     return (
       <Center bottom position={[0, -1.2, 0]}>
         <primitive object={clone} scale={scale} />
       </Center>
     );
  }

  // Center the character at [0, 0.85, 0] to match the default model's position perfectly
  return (
    <Center position={[0, 0.85, 0]} precise>
      <primitive object={clone} scale={scale} />
    </Center>
  );
};

// --- Main Scene Component ---

interface ThreeSceneProps {
  characterModel: ModelData | null;
  backgroundModel: ModelData | null;
  stats: CharacterStats;
  labels: Record<string, string> | Record<StatKey, string>;
  colors: Record<string, string> | Record<StatKey, string>;
  showStats: boolean;
  onSelectStat: (key: StatKey) => void;
  onModelError?: (msg: string) => void;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  characterModel, 
  backgroundModel, 
  stats, 
  labels, 
  colors, 
  showStats, 
  onSelectStat,
  onModelError
}) => {
  const statKeys = Object.keys(stats) as StatKey[];
  const radius = 2.2; 
  const height = 0.9; 

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black">
      <Canvas shadows camera={{ position: [0, 1.3, 5.5], fov: 42 }} dpr={[1, 2]}>
        {/* Lights - Optimized shadows - Increased intensity to compensate for removed Environment */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <spotLight 
          position={[5, 10, 5]} 
          angle={0.25} 
          penumbra={1} 
          intensity={2.0} 
          castShadow 
          shadow-mapSize={1024} 
          shadow-bias={-0.0001}
        />
        <pointLight position={[-5, 2, -5]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[5, 2, -5]} intensity={0.8} color="#8b5cf6" />

        {/* Environment / Background */}
        <ErrorBoundary 
          key={backgroundModel?.url ?? 'bg-default'} 
          fallback={<DynamicModel modelData={null} type="environment" />}
          onError={(e) => onModelError?.(`Failed to load scene: ${e.message}. Reverting to default.`)}
        >
          <Suspense fallback={<ProgressLoader />}>
            <DynamicModel modelData={backgroundModel} type="environment" />
          </Suspense>
        </ErrorBoundary>

        {/* Character */}
        <ErrorBoundary 
          key={characterModel?.url ?? 'char-default'} 
          fallback={<DynamicModel modelData={null} type="character" />}
          onError={(e) => onModelError?.(`Failed to load character: ${e.message}. Reverting to default.`)}
        >
          <Suspense fallback={<ProgressLoader />}>
            <DynamicModel modelData={characterModel} type="character" />
          </Suspense>
        </ErrorBoundary>
        
        {/* Ground Shadows - Optimized */}
        <ContactShadows resolution={512} scale={20} blur={2.5} opacity={0.5} far={10} color="#000000" />

        {/* 3D Stat Panels */}
        {showStats && statKeys.map((key, index) => {
          const angle = (index / statKeys.length) * Math.PI * 2;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          const rotY = angle; 
          
          const label = labels[key] || String(key);
          const color = colors[key] || 'text-gray-400';

          return (
            <StatPanel 
              key={key}
              index={index}
              statKey={key}
              label={label}
              value={stats[key]}
              colorClass={color}
              position={[x, height, z]}
              rotation={[0, rotY, 0]}
              onClick={() => onSelectStat(key)}
            />
          );
        })}

        {/* Controls */}
        <OrbitControls 
          target={[0, 0.9, 0]}
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2}
          minDistance={4}
          maxDistance={10}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
        
        {/* Environment removed to fix Vercel loading issue */}
      </Canvas>
    </div>
  );
};

export default ThreeScene;