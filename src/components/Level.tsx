import { Camera, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { forwardRef, MutableRefObject, Suspense, useRef } from "react";
import { Clock, Group, Mesh, Vector3, Intersection, Object3D } from "three";
import Model from "./Model";
import { SpotLight } from "@react-three/drei";
import { IOptionsLevel } from "../types";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

interface ILevel {
  levelOptions: IOptionsLevel;
  pathToLevel: string;
  pathToCharacter: string;
  navmesh: GLTF;
  zone: string;
  pathfinder: any;
  path: React.MutableRefObject<Vector3[]>;
  character: React.RefObject<Group>;
  followCamera: boolean;
}

const Level = forwardRef<Group, ILevel>(
  (
    {
      levelOptions,
      pathToLevel,
      pathToCharacter,
      path,
      character,
      followCamera,
    },
    ref
  ) => {
    const levaOptions = {
      character: {},
      light: {},
      navigation: {},
      spotLight: {},
      camera: {},
    } as IOptionsLevel;
    levaOptions.character = useControls("Character", {
      x: { value: levelOptions.character.x, min: -100, max: 100 },
      y: { value: levelOptions.character.y, min: -100, max: 100 },
      z: { value: levelOptions.character.z, min: -100, max: 100 },
      speed: { value: levelOptions.character.speed, min: 0, max: 10 },
      rotationSpeed: {
        value: levelOptions.character.rotationSpeed,
        min: 0,
        max: 1,
      },
      watchOnCursorWhileMove: levelOptions.character.watchOnCursorWhileMove,
    });
    levaOptions.light = useControls("Light", {
      intensity: { value: levelOptions.light.intensity, min: 0, max: 1 },
    });
    levaOptions.spotLight = useControls("SpotLight", {
      color: levelOptions.spotLight.color,
      x: { value: levelOptions.spotLight.x, min: -5, max: 5 },
      y: { value: levelOptions.spotLight.y, min: -5, max: 5 },
      z: { value: levelOptions.spotLight.z, min: -5, max: 5 },

      distance: { value: levelOptions.spotLight.distance, min: 0, max: 100 },
      angle: { value: levelOptions.spotLight.angle, min: 0, max: Math.PI },
      attenuation: {
        value: levelOptions.spotLight.attenuation,
        min: 0,
        max: 10,
      },
      anglePower: {
        value: levelOptions.spotLight.anglePower,
        min: 0,
        max: 100,
      },
      shadowBias: { value: levelOptions.spotLight.shadowBias, step: 0.000001 },
    });
    levaOptions.camera = useControls("Camera", {
      x: { value: levelOptions.camera.x, min: -100, max: 100 },
      y: { value: levelOptions.camera.y, min: -100, max: 100 },
      z: { value: levelOptions.camera.z, min: -100, max: 100 },
      speed: {
        value: levelOptions.camera.speed,
        min: 0,
        max: 0.3,
        step: 0.001,
      },
    });

    if (window.location.hash === "#demo") {
      levelOptions = levaOptions;
    }

    const spotLight = useRef(null);
    const map = useRef<Mesh>(null);

    let mouse = useRef<Intersection<Object3D<Event>>>(null);
    let framesCount = useRef(0);
    let lookAtVector: MutableRefObject<Vector3> = useRef(new Vector3(0, 0, 0));

    function characterMove(speed: number) {
      if (!path.current || path.current.length <= 0 || !character.current)
        return;

      let target = path.current[0];
      const distance = target.clone().sub(character.current?.position);

      if (distance.lengthSq() > 0.5) {
        distance.normalize();

        character.current.position.add(
          distance.multiplyScalar(speed * levelOptions.character.speed * 10)
        );
      } else {
        path.current.shift();
      }
    }

    function moveSpotLight(clock: Clock) {
      if (
        !map.current ||
        map.current?.children.length <= 0 ||
        !character.current ||
        !path.current
      )
        return;

      if (mouse.current && spotLight.current) {
        const distance = mouse.current.point
          .clone()
          .sub(character.current?.position)
          .lengthSq();
        // ||( character.current.position.y - mouse.current.point.y > 2 && path.current.length <=0)
        if (distance < 4) {
          lookAtVector.current = lookAtVector.current.lerp(
            lookAtVector.current.add(
              new Vector3(0, Math.sin(clock.elapsedTime * 3) / 100, 0)
            ),
            levelOptions.character.rotationSpeed
          );
        } else {
          lookAtVector.current = lookAtVector.current.lerp(
            path.current.length > 0 &&
              !levelOptions.character.watchOnCursorWhileMove
              ? path.current[0]
              : mouse.current.point,
            levelOptions.character.rotationSpeed
          );
        }
        // @ts-ignore
        spotLight.current.target.position.set(
          lookAtVector.current.x,
          lookAtVector.current.y,
          lookAtVector.current.z
        );
        // @ts-ignore
        spotLight.current.target.updateMatrixWorld();
        character.current?.lookAt(lookAtVector.current);
      }
    }

    function cameraMove(camera: Camera) {
      if (!character.current || !followCamera) return;
      camera.position.lerp(
        new Vector3(
          character.current.position.x + levelOptions.camera.x,
          character.current.position.y + levelOptions.camera.y,
          character.current.position.z + levelOptions.camera.z
        ),
        levelOptions.camera.speed
      );
      camera.lookAt(character.current.position);
    }

    useFrame(({ raycaster, clock, camera }, delta) => {
      if (!map.current || !map.current.children || !character.current) return;

      framesCount.current++;
      if (framesCount.current % 10 === 0)
        //  @ts-ignore
        mouse.current = raycaster.intersectObjects(map.current.children)[0];

      if (framesCount.current % 2 === 0) moveSpotLight(clock);

      characterMove(delta);
      cameraMove(camera);
    });

    return (
      <>
        <Suspense fallback={null}>
          <Model path={pathToLevel} ref={map} />
        </Suspense>

        <group
          name="character"
          ref={ref}
          position={[
            levelOptions.character.x,
            levelOptions.character.y,
            levelOptions.character.z,
          ]}
          scale={1}
        >
          <SpotLight
            color={levelOptions.spotLight.color}
            position={[
              levelOptions.spotLight.x,
              levelOptions.spotLight.y,
              levelOptions.spotLight.z,
            ]}
            ref={spotLight}
            distance={levelOptions.spotLight.distance}
            angle={levelOptions.spotLight.angle}
            attenuation={levelOptions.spotLight.attenuation}
            anglePower={levelOptions.spotLight.anglePower}
            shadow-bias={levelOptions.spotLight.shadowBias}
          />
          <Model path={pathToCharacter} position={[0, 0.5, 0]} />
        </group>

        <ambientLight intensity={levelOptions.light.intensity} />
      </>
    );
  }
);

export default Level;
