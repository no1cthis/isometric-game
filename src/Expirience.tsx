import { useFrame, useThree } from "@react-three/fiber";
import { Stats, OrbitControls } from "@react-three/drei";

import { useControls } from "leva";
import { Vector3 } from "three";

export default function Experience() {
  let options = {
    camera: {
      x: 10,
      y: 14,
      z: 50,
      lookAtX: -10,
      lookAtY: -48,
      lookAtZ: -34,
      OrbitControls: false,
    },
  };
  const levaOptions = { camera: {} } as typeof options;

  levaOptions.camera = useControls("Camera", {
    x: { value: options.camera.x, min: -100, max: 100 },
    y: { value: options.camera.y, min: -100, max: 100 },
    z: { value: options.camera.z, min: -100, max: 100 },
    lookAtX: { value: options.camera.lookAtX, min: -100, max: 100 },
    lookAtY: { value: options.camera.lookAtY, min: -100, max: 100 },
    lookAtZ: { value: options.camera.lookAtZ, min: -100, max: 100 },
    OrbitControls: options.camera.OrbitControls,
  });
  if (window.location.hash === "#demo") {
    options = levaOptions;
  }
  const { camera } = useThree();
  camera.position.set(options.camera.x, options.camera.y, options.camera.z);
  useFrame(({ camera }) => {
    if (options.camera.OrbitControls) return;

    camera.lookAt(
      new Vector3(
        options.camera.lookAtX,
        options.camera.lookAtY,
        options.camera.lookAtZ
      )
    );
  });

  return (
    <>
      {window.location.hash === "#demo" && <Stats />}
      {options.camera.OrbitControls && <OrbitControls />}
    </>
  );
}
