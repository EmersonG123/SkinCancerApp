import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, RefreshCw, ZoomIn, ZoomOut, Database, Layers, Eye, ShieldCheck, HeartPulse, Activity } from "lucide-react";

interface Node3D {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
  area: string;
  risk: "bajo" | "moderado" | "alto";
  telemetry: string;
  melanin: number;
  asymmetry: number;
  color: string;
}

export default function ThreeDTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Interaction & Projection Settings
  const [rotation, setRotation] = useState({ x: 0.5, y: -0.6 });
  const [zoom, setZoom] = useState<number>(1.2);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.005);
  const [viewMode, setViewMode] = useState<"visualizador" | "thermal" | "structural" | "wireframe">("visualizador");
  const [activeScannerLine, setActiveScannerLine] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-a");

  // Interaction State
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // 2. Mock Nodes definition within our 3D local coordinate space (centered at 0,0,0)
  const nodes: Node3D[] = [
    {
      id: "node-a",
      x: -40,
      y: -60,
      z: 35,
      label: "Zona Epidérmica Lateral",
      area: "Superficie de Contacto",
      risk: "bajo",
      telemetry: "Estructura celular homogénea, sin ramificaciones patológicas de bordes.",
      melanin: 12,
      asymmetry: 5,
      color: "#10b981", // Emerald
    },
    {
      id: "node-b",
      x: 35,
      y: -50,
      z: -20,
      label: "Nevus Hiperpigmentado",
      area: "Unión dermo-epidérmica",
      risk: "alto",
      telemetry: "Foco proliferativo asimétrico con policromías aberrantes e infiltración vertical.",
      melanin: 88,
      asymmetry: 79,
      color: "#ef4444", // Red
    },
    {
      id: "node-c",
      x: -20,
      y: 10,
      z: -50,
      label: "Vaso de Microcirculación",
      area: "Dermis Papilar",
      risk: "moderado",
      telemetry: "Eritema localizado con proliferación capilar atípica periférica.",
      melanin: 45,
      asymmetry: 52,
      color: "#f97316", // Orange
    },
    {
      id: "node-d",
      x: 50,
      y: 60,
      z: 45,
      label: "Red de Colágeno Sano",
      area: "Dermis Reticular",
      risk: "bajo",
      telemetry: "Densidad de elastina equilibrada, sin focos neoplásicos detectables.",
      melanin: 8,
      asymmetry: 2,
      color: "#00f0ff", // Neon blue
    }
  ];

  // 3. Mathematical generation of 3D Skin Block vertices
  // We represent a blocks of skin with 3 grids at different depths (Y values)
  const gridVertices = useRef<{ x: number; y: number; z: number; layer: number }[]>([]);
  const gridLines = useRef<{ from: number; to: number }[]>([]);

  if (gridVertices.current.length === 0) {
    const vertices: { x: number; y: number; z: number; layer: number }[] = [];
    const lines: { from: number; to: number }[] = [];

    // Make 3 structural layers
    // y = -60 (Epidermis), y = 0 (Dermis), y = 60 (Hypodermis)
    const layersY = [-60, 0, 60];
    const size = 120;
    const divisions = 5;

    // Generate grid vertices
    layersY.forEach((layerY, idx) => {
      const startIdx = vertices.length;
      for (let i = 0; i <= divisions; i++) {
        for (let j = 0; j <= divisions; j++) {
          const u = i / divisions;
          const v = j / divisions;
          const x = -size / 2 + u * size;
          const z = -size / 2 + v * size;

          // Introduce skin wavy texture forEpidermis
          let wavyY = layerY;
          if (idx === 0) {
            wavyY += Math.sin(u * Math.PI * 2) * 5 + Math.cos(v * Math.PI * 3) * 4;
          } else if (idx === 1) {
            wavyY += Math.sin(u * Math.PI) * 3;
          }

          vertices.push({ x, y: wavyY, z, layer: idx });
        }
      }

      // Generate horizontal grid lines
      const gridOffset = divisions + 1;
      for (let i = 0; i <= divisions; i++) {
        for (let j = 0; j <= divisions; j++) {
          const curr = startIdx + i * gridOffset + j;
          // Connect to next column
          if (j < divisions) {
            lines.push({ from: curr, to: curr + 1 });
          }
          // Connect to next row
          if (i < divisions) {
            lines.push({ from: curr, to: curr + gridOffset });
          }
        }
      }
    });

    // Vertical structural columns connecting layers
    const layerSize = (divisions + 1) * (divisions + 1);
    for (let i = 0; i < layerSize; i++) {
      // Connect layer 0 -> 1 -> 2 at matching indices (only at outer bounds to avoid clutter)
      const xIndex = Math.floor(i / (divisions + 1));
      const zIndex = i % (divisions + 1);
      const isOnBoundary = xIndex === 0 || xIndex === divisions || zIndex === 0 || zIndex === divisions;

      if (isOnBoundary) {
        lines.push({ from: i, to: i + layerSize });
        lines.push({ from: i + layerSize, to: i + layerSize * 2 });
      }
    }

    gridVertices.current = vertices;
    gridLines.current = lines;
  }

  // Active diagnostic record selection info
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // 4. Handle resize and drag operations
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = Math.max(rect.height, 480);
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 5. Automatic rotation update loop
  useEffect(() => {
    if (!isAutoRotating) return;

    let animFrame: number;
    const tick = () => {
      setRotation(prev => ({
        x: prev.x + rotationSpeed * 0.4,
        y: prev.y + rotationSpeed,
      }));
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isAutoRotating, rotationSpeed]);

  // Mouse / Touch handlers for 3D rotation dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    setRotation(prev => ({
      x: prev.x - deltaY * 0.015,
      y: prev.y + deltaX * 0.015,
    }));

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Node focus picker - pivots projection angles towards specified sample
  const focusOnNode = (node: Node3D) => {
    setSelectedNodeId(node.id);
    setIsAutoRotating(false);
    
    // Calculate custom angles to center this point
    // We target a projection where the chosen node faces towards the observer (positive Z)
    const targetYAngle = -Math.atan2(node.x, node.z);
    const targetXAngle = 0.3; // standard comfort pitch

    setRotation({ x: targetXAngle, y: targetYAngle });
  };

  // 6. Draw 3D Loop triggered upon state updates on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const focalLength = 320;

    // Trig values
    const sinX = Math.sin(rotation.x);
    const cosX = Math.cos(rotation.x);
    const sinY = Math.sin(rotation.y);
    const cosY = Math.cos(rotation.y);

    // 3D coordinate projection function
    const project = (x: number, y: number, z: number) => {
      // Rotation around Y key (horizontal)
      let rx1 = x * cosY - z * sinY;
      let rz1 = x * sinY + z * cosY;

      // Rotation around X key (vertical pitch)
      let ry2 = y * cosX - rz1 * sinX;
      let rz2 = y * sinX + rz1 * cosX;

      // Scale based on distance
      const projectFactor = focalLength / (focalLength + rz2 * 0.86);
      const screenX = cx + rx1 * projectFactor * zoom;
      const screenY = cy + ry2 * projectFactor * zoom;

      return {
        x: screenX,
        y: screenY,
        depth: rz2, // larger is deeper into screen
        scale: projectFactor * zoom,
      };
    };

    // Prepare Grid vertices projection
    const projectedVertices = gridVertices.current.map(v => project(v.x, v.y, v.z));

    // A. Draw Structural Skin layers background grids
    ctx.lineWidth = 0.8;
    gridLines.current.forEach(line => {
      const fromV = projectedVertices[line.from];
      const toV = projectedVertices[line.to];

      // Cull vertices behind critical depth bounds
      if (fromV.y < -50 || fromV.y > height + 50 || toV.y < -50 || toV.y > height + 50) return;

      // Determine layer of the line
      const layer = gridVertices.current[line.from].layer;
      
      // Select structural color themes
      let strokeColor = "rgba(0, 240, 255, 0.08)";
      if (viewMode === "thermal") {
        strokeColor = layer === 0 ? "rgba(239, 68, 68, 0.15)" : layer === 1 ? "rgba(249, 115, 22, 0.1)" : "rgba(59, 130, 246, 0.05)";
      } else if (viewMode === "structural") {
        strokeColor = layer === 0 ? "rgba(16, 185, 129, 0.18)" : layer === 1 ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)";
      } else if (viewMode === "wireframe") {
        strokeColor = "rgba(148, 163, 184, 0.12)";
      } else {
        // Hologram (Standard)
        strokeColor = layer === 0 ? "rgba(0, 240, 255, 0.18)" : layer === 1 ? "rgba(0, 240, 255, 0.1)" : "rgba(0, 240, 255, 0.04)";
      }

      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(fromV.x, fromV.y);
      ctx.lineTo(toV.x, toV.y);
      ctx.stroke();
    });

    // Draw solid layer partitions if Hologram or structural mode is enabled
    if (viewMode === "hologram" || viewMode === "structural") {
      ctx.fillStyle = viewMode === "hologram" ? "rgba(0, 240, 255, 0.003)" : "rgba(16, 185, 129, 0.003)";
      ctx.beginPath();
      const bounds = [0, 5, 35, 30]; // corners of Epidermis layer
      bounds.forEach((idx, i) => {
        const v = projectedVertices[idx];
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.fill();
    }

    // B. Draw Orbital Scanner target rings
    ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 140 * zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating perimeter outer scanner guide and ticks
    const scanTickCount = 24;
    const scannerAngle = (Date.now() / 3500) % (Math.PI * 2);
    for (let i = 0; i < scanTickCount; i++) {
      const angle = (i / scanTickCount) * Math.PI * 2 + scannerAngle;
      const rOuter = 160 * zoom;
      const rInner = (i % 6 === 0 ? 150 : 155) * zoom;
      const x1 = cx + Math.cos(angle) * rOuter;
      const y1 = cy + Math.sin(angle) * rOuter;
      const x2 = cx + Math.cos(angle) * rInner;
      const y2 = cy + Math.sin(angle) * rInner;

      ctx.strokeStyle = i % 6 === 0 ? "rgba(0, 240, 255, 0.35)" : "rgba(0, 240, 255, 0.1)";
      ctx.lineWidth = i % 6 === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // C. Draw dynamic laser sweep line
    if (activeScannerLine) {
      const sweepYPercent = Math.sin(Date.now() / 1500) * 0.5 + 0.5; // oscillate between 0 and 1
      const laserY = cy + (sweepYPercent - 0.5) * 200 * zoom;

      // Draw horizontal neon glow
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0, 240, 255, 0.8)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 130 * zoom, laserY);
      ctx.lineTo(cx + 130 * zoom, laserY);
      ctx.stroke();
      ctx.restore();

      // Subtle label
      ctx.fillStyle = "rgba(0, 240, 255, 0.3)";
      ctx.font = "8px monospace";
      ctx.fillText("SWEEP SCAN ACTIVE", cx - 125 * zoom, laserY - 4);
    }

    // D. Project and draw biometric diagnosis nodes
    const projectedNodes = nodes.map(n => {
      const p = project(n.x, n.y, n.z);
      return { ...n, p };
    });

    // Draw projection rays pointing from elements to base plate to enhance 3D feel
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 3]);
    projectedNodes.forEach(node => {
      const anchorY = 60; // anchor depth hypodermis layer limit
      const projectedAnchor = project(node.x, anchorY, node.z);

      ctx.strokeStyle = node.id === selectedNodeId ? "rgba(0, 240, 255, 0.45)" : "rgba(148, 163, 184, 0.15)";
      ctx.beginPath();
      ctx.moveTo(node.p.x, node.p.y);
      ctx.lineTo(projectedAnchor.x, projectedAnchor.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Sort nodes by depth from back to front to ensure correct painter's algorithm rendering order
    const sortedNodes = [...projectedNodes].sort((a, b) => b.p.depth - a.p.depth);

    sortedNodes.forEach(node => {
      const isSelected = node.id === selectedNodeId;
      const scaleFactor = Math.max(0.4, 1.2 - node.p.depth / 400); // depth scaling
      const radius = isSelected ? 8 * scaleFactor : 6 * scaleFactor;

      // Pulse circle expansion
      if (isSelected) {
        const pulseRadius = radius + Math.sin(Date.now() / 200) * 3;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(node.p.x, node.p.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 1. Draw glowing node boundary
      ctx.save();
      ctx.shadowBlur = isSelected ? 20 : 8;
      ctx.shadowColor = node.color;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.p.x, node.p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner white core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(node.p.x, node.p.y, radius * (isSelected ? 0.35 : 0.45), 0, Math.PI * 2);
      ctx.fill();

      // Node Label
      ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.6)";
      ctx.font = isSelected ? "bold 10px monospace" : "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        node.label,
        node.p.x + (radius + 6),
        node.p.y + 3
      );

      // Simple sublabel for active selected node
      if (isSelected) {
        ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
        ctx.font = "8px monospace";
        ctx.fillText(
          `[BIOMARCADOR ${node.risk.toUpperCase()}]`,
          node.p.x + (radius + 6),
          node.p.y + 13
        );
      }
    });

  }, [rotation, zoom, viewMode, activeScannerLine, selectedNodeId]);

  return (
    <div className="w-full h-full flex flex-col gap-8 font-sans">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        
        {/* Left Interactive 3D Viewer Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="glassmorphism rounded-2xl border border-primary/25 shadow-[0_0_20px_rgba(0,240,255,0.03)] overflow-hidden flex flex-col relative min-h-[550px] bg-slate-950/80">
            
            {/* Context status row bar */}
            <div className="p-4 border-b border-slate-900/80 flex flex-wrap justify-between items-center gap-3 bg-slate-950 z-20">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-text-main uppercase tracking-wider">
                  Muestreo Morfológico Cutáneo
                </span>
                <span className="text-[9px] bg-primary/10 border border-primary/30 text-primary font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  SIMULADO L01
                </span>
              </div>

              {/* View options selecting */}
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode("visualizador")}
                  className={`px-3 py-1 text-[10px] uppercase font-mono font-bold rounded-md transition-all ${
                    viewMode === "visualizador" ? "bg-primary text-slate-950 shadow-[0_0_8px_rgba(0,240,255,0.4)]" : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  Visualizador
                </button>
                <button
                  onClick={() => setViewMode("structural")}
                  className={`px-3 py-1 text-[10px] uppercase font-mono font-bold rounded-md transition-all ${
                    viewMode === "structural" ? "bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  Colágeno
                </button>
                <button
                  onClick={() => setViewMode("thermal")}
                  className={`px-3 py-1 text-[10px] uppercase font-mono font-bold rounded-md transition-all ${
                    viewMode === "thermal" ? "bg-red-500 text-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  Térmico
                </button>
                <button
                  onClick={() => setViewMode("wireframe")}
                  className={`px-3 py-1 text-[10px] uppercase font-mono font-bold rounded-md transition-all ${
                    viewMode === "wireframe" ? "bg-[#334155] text-white" : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  Malla
                </button>
              </div>
            </div>

            {/* Drag Instructions bar */}
            <div className="absolute top-16 left-4 z-15 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg font-mono text-[9px] text-text-secondary pointer-events-none uppercase tracking-wider backdrop-blur-md">
              <p>Arrastre el cursor para rotar libremente</p>
              <p className="mt-1">Ángulos: X: {rotation.x.toFixed(2)} rad • Y: {rotation.y.toFixed(2)} rad</p>
            </div>

            {/* Quick biopsy nodes selector */}
            <div className="absolute top-16 right-4 z-15 flex flex-col gap-2">
              {nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => focusOnNode(node)}
                  className={`px-3 py-1.5 border hover:bg-slate-900 text-right backdrop-blur-md font-mono text-[10px] font-bold rounded-md uppercase transition-all tracking-wider flex items-center justify-end gap-2 outline-none ${
                    selectedNodeId === node.id
                      ? "bg-slate-900 text-white border-primary shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                      : "bg-slate-950/80 border-slate-800 text-text-secondary"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: node.color }}></span>
                  <span>{node.label}</span>
                </button>
              ))}
            </div>

            {/* 3D Canvas element wrapper */}
            <div ref={containerRef} className="flex-grow w-full h-full relative cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Bottom Floating Control deck bar */}
            <div className="p-4 border-t border-slate-900/60 bg-slate-950/95 flex flex-wrap justify-between items-center gap-3 z-25">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`p-2 rounded-lg border transition-all ${
                    isAutoRotating
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-slate-900/80 border-slate-800 text-text-secondary"
                  }`}
                  title={isAutoRotating ? "Pausar Rotación Automática" : "Iniciar Rotación Automática"}
                >
                  {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setRotation({ x: 0.5, y: -0.6 });
                    setZoom(1.2);
                  }}
                  className="p-2 bg-slate-900/80 border border-slate-800 text-text-secondary hover:text-text-main rounded-lg transition-all"
                  title="Restablecer Proyección"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 border border-slate-800 bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary">
                  <span>Zoom</span>
                  <button onClick={() => setZoom(z => Math.max(0.6, z - 0.15))} className="p-0.5 hover:text-text-main"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="font-bold text-text-main text-center w-8">x{zoom.toFixed(1)}</span>
                  <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="p-0.5 hover:text-text-main"><ZoomIn className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 font-mono text-[10px] text-text-secondary min-w-[150px]">
                <span className="flex-shrink-0">Rotación:</span>
                <input
                  type="range"
                  min="0"
                  max="0.02"
                  step="0.001"
                  value={rotationSpeed}
                  onChange={(e) => {
                    setRotationSpeed(parseFloat(e.target.value));
                    if (!isAutoRotating) setIsAutoRotating(true);
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <span className="w-6 text-right">{(rotationSpeed * 1000).toFixed(0)}</span>
              </div>

              {/* Laser Toggles */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-secondary uppercase">Láser Holográfico</span>
                <button
                  onClick={() => setActiveScannerLine(!activeScannerLine)}
                  className={`w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full relative transition-all cursor-pointer ${
                    activeScannerLine ? "bg-primary/50" : ""
                  }`}
                >
                  <div className={`absolute top-[2px] left-[2px] bg-text-main border border-slate-800 rounded-full h-5 w-5 transition-all ${
                    activeScannerLine ? "translate-x-5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" : ""
                  }`}></div>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Diagnosis Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="glassmorphism rounded-2xl border border-primary/25 shadow-[0_0_25px_rgba(0,240,255,0.04)] p-6 flex flex-col gap-5 justify-between bg-slate-950/80">
            
            {/* Header Area */}
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block mb-1">
                Análisis Localizado de Biopsias
              </span>
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-text-main">
                Módulo Biomarcador Activo
              </h2>
            </div>

            {/* Targeted element details mockup */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                <div>
                  <h3 className="text-xs font-mono font-bold text-text-secondary uppercase">
                    Ángulo Relativo
                  </h3>
                  <h4 className="text-sm font-bold text-text-main mt-0.5">
                    {selectedNode.label}
                  </h4>
                </div>
                
                {/* Risk state badge */}
                <span className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-1 rounded-md border ${
                  selectedNode.risk === "alto"
                    ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] font-bold animate-pulse"
                    : selectedNode.risk === "moderado"
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}>
                  RIESGO {selectedNode.risk.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-mono text-text-secondary uppercase">
                  Nivel Tisular de Enfoque:
                </p>
                <p className="text-xs text-text-main font-semibold mt-0.5">
                  {selectedNode.area}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-mono text-text-secondary uppercase">
                  Telemetría Molecular Resumida:
                </p>
                <p className="text-xs text-text-secondary mt-1 text-justify leading-relaxed font-sans">
                  {selectedNode.telemetry}
                </p>
              </div>
            </div>

            {/* Graph Metrics representing melanin and asymmetry index */}
            <div className="flex flex-col gap-3 font-mono text-[10px] text-text-secondary mt-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Afluencia de Melanosomas</span>
                  <span className="font-bold text-primary font-mono">{selectedNode.melanin}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-850 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.7)]"
                    style={{ width: `${selectedNode.melanin}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Índice de Asimetría Radial</span>
                  <span className="font-bold text-primary font-mono">{selectedNode.asymmetry}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-850 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.7)]"
                    style={{ width: `${selectedNode.asymmetry}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Neural scan log outputs simulation */}
            <div className="border-t border-slate-900 pt-4 flex flex-col gap-2 font-mono">
              <span className="text-[9px] text-[#00f0ff] uppercase tracking-widest font-bold">
                PROCESO LOGÍSTICO RECURRENTE:
              </span>
              <div className="bg-slate-950/70 p-3 border border-slate-900 rounded-lg text-[9px] text-text-secondary h-[130px] overflow-y-auto flex flex-col gap-1.5 leading-relaxed">
                <span className="text-emerald-400">[0.00s] Inicializando haz láser dermo-espectral...</span>
                <span className="text-primary">[0.35s] Rotación de malla angular calibrada conformada.</span>
                <span>[1.20s] Biopsia molecular en nodo {selectedNode.id.toUpperCase()} completa.</span>
                {selectedNode.risk === "alto" ? (
                  <span className="text-red-400 font-bold animate-pulse">[ADVERTENCIA] Anomalía detectada en nevus. Se recomienda calibración de urgencia.</span>
                ) : (
                  <span className="text-emerald-400">[DATOS] Integridad de las fibras estructurales óptima.</span>
                )}
                <span className="text-text-secondary/60">[3.00s] Actualizando matriz de correlación holográfica...</span>
              </div>
            </div>

            {/* Legal prompt note */}
            <div className="bg-amber-500/5 text-amber-200 border border-amber-500/15 p-3 rounded-lg text-[10px] leading-relaxed flex gap-2 items-start font-mono">
              <span className="text-amber-500 text-xs font-bold flex-shrink-0 animate-pulse">⚠️</span>
              <p className="text-justify leading-normal uppercase">
                <strong>CALIBRACIÓN EXPERIMENTAL:</strong> ESTA VISTA ES UN PROTOTIPO DIGITAL DE PROPÓSITO ESTÉTICO-EDUCATIVO QUE MODELA COMPORTAMIENTOS TISULARES CUTÁNEOS. NO DEBE CONSIDERARSE BIOPSIA EX VIVO O EXAMEN DIRECTO.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
