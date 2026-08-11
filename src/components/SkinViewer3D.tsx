import React, { useEffect, useRef, useState } from 'react';
import * as skinview3d from 'skinview3d';
import { Play, Pause, RotateCw, ZoomIn, ZoomOut, Eye, Shield, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface SkinViewer3DProps {
  username: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function SkinViewer3D({ username, width = 280, height = 360, className }: SkinViewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<skinview3d.SkinViewer | null>(null);

  const [animation, setAnimation] = useState<'walk' | 'run' | 'fly' | 'idle' | 'none'>('walk');
  const [isRotating, setIsRotating] = useState(true);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'isometric'>('interactive');

  useEffect(() => {
    if (!canvasRef.current) return;

    setLoading(true);

    try {
      // Initialize SkinViewer canvas
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width,
        height,
        skin: `https://mc-heads.net/skin/${encodeURIComponent(username)}`
      });

      viewerRef.current = viewer;

      // Enable controls
      viewer.controls.enableRotate = true;
      viewer.controls.enableZoom = true;
      viewer.controls.enablePan = false;

      // Auto rotation speed
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.8;

      // Lighting
      viewer.fov = 70;
      viewer.camera.position.set(0, 10, 50);

      // Animation setup
      viewer.animation = new skinview3d.WalkingAnimation();
      viewer.animation.speed = 0.8;

      // Load skin image directly
      viewer.loadSkin(`https://mc-heads.net/skin/${encodeURIComponent(username)}`)
        .then(() => setLoading(false))
        .catch(() => {
          // Fallback skin if fails
          viewer.loadSkin(`https://crafatar.com/skins/c06f890642f04a9292c15a503da9f680`)
            .catch(() => {})
            .finally(() => setLoading(false));
        });

      return () => {
        viewer.dispose();
      };
    } catch (err) {
      console.error("SkinViewer3D init error:", err);
      setLoading(false);
    }
  }, [username, width, height]);

  // Handle animation changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (animation === 'walk') {
      viewer.animation = new skinview3d.WalkingAnimation();
      viewer.animation.speed = 0.8;
    } else if (animation === 'run') {
      viewer.animation = new skinview3d.RunningAnimation();
      viewer.animation.speed = 1.2;
    } else if (animation === 'fly') {
      viewer.animation = new skinview3d.FlyingAnimation();
      viewer.animation.speed = 0.9;
    } else {
      viewer.animation = null;
    }
  }, [animation]);

  // Handle auto rotation toggle
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.autoRotate = isRotating;
  }, [isRotating]);

  const resetCamera = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.position.set(0, 10, 50);
    viewer.controls.reset();
  };

  return (
    <div className={cn("flex flex-col items-center justify-center relative select-none", className)}>
      
      {/* View Mode Toggle Switch */}
      <div className="flex items-center space-x-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl mb-3 text-xs font-semibold">
        <button
          onClick={() => setViewMode('interactive')}
          className={cn(
            "px-3 py-1 rounded-lg transition-all",
            viewMode === 'interactive' ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          )}
        >
          3D Canvas
        </button>
        <button
          onClick={() => setViewMode('isometric')}
          className={cn(
            "px-3 py-1 rounded-lg transition-all",
            viewMode === 'isometric' ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          )}
        >
          3D Render
        </button>
      </div>

      {/* Render Canvas / Image Box */}
      <div className="relative group rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/80 shadow-2xl flex items-center justify-center min-h-[320px]">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-blue-600/5 to-transparent blur-xl pointer-events-none" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
            <span className="text-xs text-slate-400 font-mono">Loading 3D Skin...</span>
          </div>
        )}

        {viewMode === 'interactive' ? (
          <canvas
            ref={canvasRef}
            className="cursor-grab active:cursor-grabbing relative z-10 touch-none"
          />
        ) : (
          <div className="p-4 flex flex-col items-center justify-center relative z-10">
            <img
              src={`https://mc-heads.net/body/${encodeURIComponent(username)}/260`}
              alt={username}
              className="h-64 w-auto drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://minotar.net/body/${encodeURIComponent(username)}/260`;
              }}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {viewMode === 'interactive' && (
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur border border-slate-800/80 px-2 py-1 rounded-lg text-[10px] text-slate-400 font-mono z-10 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
            Drag to Rotate • Scroll to Zoom
          </div>
        )}
      </div>

      {/* Interactive 3D Controls */}
      {viewMode === 'interactive' && (
        <div className="mt-3 space-y-2 w-full max-w-[280px]">
          {/* Animation Selectors */}
          <div className="flex items-center justify-between gap-1 bg-slate-900/80 border border-slate-800/80 p-1 rounded-xl text-[11px]">
            <button
              onClick={() => setAnimation('walk')}
              className={cn(
                "flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center",
                animation === 'walk' ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white"
              )}
            >
              Walk
            </button>
            <button
              onClick={() => setAnimation('run')}
              className={cn(
                "flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center",
                animation === 'run' ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white"
              )}
            >
              Run
            </button>
            <button
              onClick={() => setAnimation('fly')}
              className={cn(
                "flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center",
                animation === 'fly' ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white"
              )}
            >
              Fly
            </button>
            <button
              onClick={() => setAnimation('none')}
              className={cn(
                "flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center",
                animation === 'none' ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white"
              )}
            >
              Pose
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl text-slate-400 text-xs">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={cn("flex items-center space-x-1 hover:text-white transition-colors", isRotating && "text-purple-400")}
              title="Toggle Auto Rotation"
            >
              <RotateCw className={cn("w-3.5 h-3.5", isRotating && "animate-spin")} />
              <span className="text-[10px]">{isRotating ? 'Spin On' : 'Spin Off'}</span>
            </button>

            <button
              onClick={resetCamera}
              className="flex items-center space-x-1 hover:text-white transition-colors"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px]">Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
