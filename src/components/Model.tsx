import React, { forwardRef, Ref, useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
// import {  } from "@react-three/drei";

const Model = forwardRef<THREE.Mesh, { path: string, [key: string]: any }>(
  (props, ref) => {
    const otherRef = useRef(null)
    const model = useGLTF(props.path);

    const {actions, mixer} = useAnimations(model.animations, otherRef)

    useEffect(() => {
      console.log(model.animations)
     const animation = actions["opening"];
     if(animation){
       animation.clampWhenFinished = true;
       animation.loop = THREE.LoopOnce;
      animation.play()
    }
    }, [mixer]);
    
    // console.log(model.animations[0])

    return <group dispose={null} ref={otherRef}>
        <primitive ref={ref}  object={model.scene} {...props} /> 
      </group>;
  }
);

useGLTF.preload("./rooms/rooms.glb")

export default Model;
