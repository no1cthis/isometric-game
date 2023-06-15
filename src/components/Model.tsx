import React, { forwardRef, Ref } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { Mesh } from "three";
import { useGLTF } from "@react-three/drei";
// import {  } from "@react-three/drei";

const Model = forwardRef<Mesh, { path: string; [key: string]: any }>(
  (props, ref) => {
    const model = useGLTF(props.path);
    model.scene.traverse(mesh =>{
      mesh.castShadow = true
      mesh.receiveShadow = true
    })
    model.scene.castShadow = true
    model.scene.receiveShadow = true
    

    return <group dispose={null}>
        <primitive ref={ref} object={model.scene} {...props} /> 
      </group>;
  }
);

useGLTF.preload("./rooms/rooms.glb")

export default Model;
