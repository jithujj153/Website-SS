"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { cityActive } from "@/story/store";
import { QualityContext, byTier } from "./three/quality";
import { Atmosphere, Dust } from "./three/Atmosphere";
import { CameraRig } from "./three/CameraRig";
import { Scene1Chaos } from "./three/Scene1Chaos";
import { Scene1Floor } from "./three/Scene1Floor";
import { scene1Variant } from "@/config/site";
import { Scene2Forge } from "./three/Scene2Forge";
import { Scene3Build } from "./three/Scene3Build";
import { Scene4City } from "./three/Scene4City";
import { Scene5Live } from "./three/Scene5Live";
import { Sparks } from "./three/Sparks";

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface Props {
  tier: 0 | 1 | 2;
  mobile: boolean;
  panelInScene: boolean;
  active: boolean;
  onFail: () => void;
}

/**
 * The single R3F canvas that holds the whole story world (one continuous camera move, no page cuts).
 * Scenes: 1 Chaos, 2 Forge, 3 Build output, 4 Product City, 5 Live. Quality adapts at runtime.
 */
export default function StoryCanvas({ tier: startTier, mobile, panelInScene, active, onFail }: Props) {
  const [tier, setTier] = useState<0 | 1 | 2>(startTier);
  const [aspect, setAspect] = useState(1.78);

  useEffect(() => {
    const on = () => setAspect(window.innerWidth / window.innerHeight);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  return (
    <Boundary onError={onFail}>
      <Canvas
        style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
        frameloop={active ? "always" : "never"}
        dpr={[1, byTier(tier, 1.25, 1.5, 2)]}
        camera={{ fov: 46, near: 0.1, far: 420, position: [0, 0.6, 11] }}
        gl={{ antialias: tier === 0, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#060b1a");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onFail();
          });
        }}
        onPointerMissed={() => cityActive.set(null)}
        aria-hidden
      >
        <QualityContext.Provider value={{ tier, mobile, aspect }}>
          <PerformanceMonitor
            onDecline={() => setTier((t) => (Math.max(0, t - 1) as 0 | 1 | 2))}
            onIncline={() => setTier((t) => (Math.min(startTier, t + 1) as 0 | 1 | 2))}
            flipflops={4}
          />
          <Atmosphere />
          <CameraRig />
          <Dust />
          {scene1Variant === "factory" ? <Scene1Floor /> : <Scene1Chaos />}
          <Scene2Forge panelInScene={panelInScene} />
          <Scene3Build panelInScene={panelInScene} />
          <Scene4City />
          <Scene5Live />
          <Sparks />
          {tier > 0 && (
            <EffectComposer multisampling={tier === 2 ? 4 : 0} enableNormalPass={false}>
              <Bloom intensity={0.85} luminanceThreshold={0.82} luminanceSmoothing={0.25} mipmapBlur radius={0.72} />
              <Vignette offset={0.28} darkness={0.72} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          )}
        </QualityContext.Provider>
      </Canvas>
    </Boundary>
  );
}
