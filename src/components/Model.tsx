import React, { forwardRef, Ref } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { Mesh } from "three";

const Model = forwardRef<Mesh, { path: string }>(({ path }, ref) => {
  const model = useLoader(GLTFLoader, path);

  return <primitive ref={ref} object={model.scene} />;
});

export default Model;
