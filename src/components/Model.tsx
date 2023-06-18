import { forwardRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
// import {  } from "@react-three/drei";

const Model = forwardRef<THREE.Mesh, { path: string; [key: string]: any }>(
  (props, ref) => {
    const model = useGLTF(props.path);
    let shadow = true;
    model.scene.traverse((node) => {
      if (/noShadow/.test(node.name)) shadow = false;
      if (/withShadow/.test(node.name)) shadow = true;

      node.receiveShadow = true;
      if (shadow) node.castShadow = true;
    });

    return (
      <group dispose={null}>
        <primitive ref={ref} object={model.scene} {...props} />
      </group>
    );
  }
);

useGLTF.preload("./rooms/rooms.glb");

export default Model;
