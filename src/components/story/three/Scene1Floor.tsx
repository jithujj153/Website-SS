"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { HallShell } from "./floor/Hall";
import { Forklift, Production, QCZone, Racks } from "./floor/Factory";
import { GlassOffice } from "./floor/Office";
import { Manager, QCLead, Tablet } from "./floor/Manager";

/**
 * SCENE 1 (FACTORY VARIANT): THE FLOOR  (scroll 0 - 20%)
 * A huge dark-navy industrial hall with cool white and blue light shafts through haze. Everything is running:
 * a forklift in inventory, CNC machines, a press, robot arms and a conveyor in production, an inspection
 * table in QC, welding sparks (white-cyan). The floor manager stands still in the middle and cannot see which
 * order is where. The thought bubbles and zone tags are real DOM text (see FloorTags.tsx).
 *
 *   0.00-0.04  gantry view down the hall              (copy: "A factory runs on a thousand moving parts.")
 *   0.04-0.10  low dolly through inventory, production, QC; zone tags with "?" and the first three bubbles
 *   0.10-0.16  radio crackles, QC lead arrives, a machine light turns red, job cards scatter, bubbles pile up
 *   0.16-0.20  everything collapses into one; he types on a tablet; the camera dives through its screen
 *
 * Camera: story/camera-path.ts (FACTORY_KEYS). Layout constants: story/floor-layout.ts.
 * The pale "office" variant (Scene1Chaos) is untouched and is selected with scene1Variant in config/site.ts.
 */
export function Scene1Floor() {
  const root = useRef<THREE.Group>(null!);
  const a = useRef<THREE.PointLight>(null!);
  const b = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    const on = story.smooth < 0.2008;
    if (root.current.visible !== on) root.current.visible = on;
    // lights stay mounted (so the shader light count never changes); only their intensity follows the scene
    a.current.intensity = on ? 90 : 0;
    b.current.intensity = on ? 55 : 0;
  });

  return (
    <>
      <pointLight ref={a} position={[0, 11, -5]} color="#d6e8ff" intensity={90} distance={32} decay={2} />
      <pointLight ref={b} position={[7, 8, -16]} color="#7fb4ff" intensity={55} distance={28} decay={2} />
      <group ref={root} name="scene-1-floor">
        <HallShell />
        <Racks />
        <Forklift />
        <Production />
        <QCZone />
        <GlassOffice />
        <Manager />
        <QCLead />
      </group>
      <Tablet />
    </>
  );
}
