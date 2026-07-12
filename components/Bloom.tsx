'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';

function isSoftwareRenderer(gl: THREE.WebGLRenderer): boolean {
  try {
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    const rendererName = ext
      ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : '';
    return /swiftshader|llvmpipe|software|basic render/i.test(rendererName);
  } catch {
    return false;
  }
}

interface BloomProps {
  strength?: number;
  radius?: number;
  threshold?: number;
}

/**
 * UnrealBloom post-processing for the whole scene. Skipped automatically on
 * software (CPU) WebGL renderers where it would tank the frame rate — those
 * fall back to the plain render, which the additive materials already carry.
 */
export default function Bloom({ strength = 0.85, radius = 0.7, threshold = 0.15 }: BloomProps) {
  const { gl, scene, camera, size } = useThree();
  const [enabled] = useState(() => !isSoftwareRenderer(gl));

  const composer = useMemo(() => {
    if (!enabled) return null;
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        strength,
        radius,
        threshold
      )
    );
    return c;
    // strength/radius/threshold are per-scene constants; rebuilding on camera
    // swap matters because RenderPass captures the camera reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gl, scene, camera]);

  useEffect(() => {
    if (!composer) return;
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => {
    return () => composer?.dispose();
  }, [composer]);

  // Priority 1 takes over R3F's render loop, so always render something
  useFrame(() => {
    if (composer) {
      composer.render();
    } else {
      gl.render(scene, camera);
    }
  }, 1);

  return null;
}
