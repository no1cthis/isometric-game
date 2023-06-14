import React, { forwardRef, Ref, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { Group, SpotLightHelper } from "three";
import { SpotLight, useHelper } from "@react-three/drei";

const Character = forwardRef<Group, { path: string; [key: string]: any }>(
  (props, ref) => {
    const model = useLoader(GLTFLoader, props.path);

    return (
      <group name="character" ref={ref} {...props}>
        <SpotLight  distance={50} angle={0.25} attenuation={5} anglePower={10} />
        <primitive object={model.scene} />;
      </group>
    );
  }
);

export default Character;
