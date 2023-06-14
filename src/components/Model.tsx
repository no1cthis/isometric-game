import React, { forwardRef, Ref } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { Mesh } from "three";
// import {  } from "@react-three/drei";

const Model = forwardRef<Mesh, { path: string; [key: string]: any }>(
  (props, ref) => {
    const model = useLoader(GLTFLoader, props.path);

    return <group dispose={null}><primitive ref={ref} object={model.scene} wireframe {...props}  /> </group>;
  }
);

export default Model;
