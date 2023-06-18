import { shaderMaterial } from "@react-three/drei";
import { forwardRef, useEffect, useRef } from "react";
import { Mesh } from "three";
import vertexShader from "../shaders/actionMark/vertex";
import fragmentShader from "../shaders/actionMark/fragment";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";

const ActionMarkMaterial = shaderMaterial(
  {
    transparent: true,
    opacity: 0,
    uR: 0.6,
    uG: 0.8,
    uB: 1,
  },
  vertexShader,
  fragmentShader
);

extend({ ActionMarkMaterial });

const ActionMark = forwardRef<Mesh, { path: string; [key: string]: any }>(
  (props, ref) => {
    const shader = useRef<any>(null);
    let options = {
      r: 0.6,
      g: 0.8,
      b: 1,
    };
    let levaOptions = useControls("ActionMark", {
      r: { value: options.r, min: 0, max: 1 },
      g: { value: options.g, min: 0, max: 1 },
      b: { value: options.b, min: 0, max: 1 },
    });
    if (window.location.hash === "#demo") {
      options = levaOptions;
    }

    useEffect(() => {
      // @ts-ignore
      shader.current.uR = options.r;
      // @ts-ignore
      shader.current.uG = options.g;
      // @ts-ignore
      shader.current.uB = options.b;
    }, [options]);

    return (
      <mesh ref={ref} visible={true} {...props}>
        <planeGeometry args={[1.5, 1.5]} />
        {/*  @ts-ignore */}
        <actionMarkMaterial ref={shader} />
      </mesh>
    );
  }
);

export default ActionMark;
