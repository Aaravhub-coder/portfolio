export default function Lighting() {
  return (
    <>
      {/* Balanced low-cost rig: ambient + directional key + 2 themed point accents (no heavy shadow maps) */}
      <ambientLight intensity={0.45} color="#c9bddb" />
      <directionalLight
        position={[3.5, 4.5, 5]}
        intensity={1.35}
        color="#f6e3be"
      />
      <pointLight
        position={[-3.2, -1.8, 3.2]}
        intensity={1.6}
        distance={14}
        decay={2}
        color="#83d9dc"
      />
      <pointLight
        position={[2.8, 1.5, -2.5]}
        intensity={1.5}
        distance={14}
        decay={2}
        color="#8c4c83"
      />
    </>
  );
}
