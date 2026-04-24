"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { type ComponentProps, useEffect, useRef } from "react";
import * as THREE from "three";

type DottedSurfaceProps = Omit<ComponentProps<"div">, "ref">;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const isLight = resolvedTheme === "light";

    const SEPARATION = 120;
    const AMOUNTX = 36;
    const AMOUNTY = 46;

    const scene = new THREE.Scene();
    const bgHex = isLight ? 0xffffff : 0x0a0a0a;
    scene.fog = new THREE.Fog(bgHex, 4200, 15000);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / Math.max(window.innerHeight, 1),
      1,
      20000
    );
    camera.position.set(0, 280, 980);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(bgHex, 0);
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        positions.push(x, y, z);
        if (isLight) {
          colors.push(0.1, 0.12, 0.18);
        } else {
          colors.push(0.32, 0.46, 0.72);
        }
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let wave = 0;
    const rafRef = { id: 0 };

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = () => {
      rafRef.id = requestAnimationFrame(animate);
      const positionAttribute = geometry.attributes.position;
      const arr = positionAttribute.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;
          arr[index + 1] =
            Math.sin((ix + wave) * 0.28) * 42 + Math.sin((iy + wave) * 0.45) * 36;
          i++;
        }
      }
      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
      wave += 0.065;
    };

    if (reduceMotion) {
      const positionAttribute = geometry.attributes.position;
      const arr = positionAttribute.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;
          arr[index + 1] =
            Math.sin(ix * 0.28) * 42 + Math.sin(iy * 0.45) * 36;
          i++;
        }
      }
      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
    } else {
      rafRef.id = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / Math.max(window.innerHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.id);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      scene.remove(points);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none fixed inset-0 z-0 h-full w-full", className)}
      aria-hidden
      {...props}
    />
  );
}
