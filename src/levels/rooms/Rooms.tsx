import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AnimationAction,
  BufferGeometry,
  Group,
  LoopOnce,
  LoopRepeat,
  Material,
  Mesh,
  Vector3,
} from "three";

import { options as levelOptions } from "./levelOptions";

import * as THREE from "three";
import ActionMark from "../../components/ActionMark";
import Level from "../../components/Level";
import { useCreateNavmesh } from "../../hooks/useCreateNavmesh";
import { IOptionsLevel, LevelName } from "../../types";
import { handlePointerOut, handlePointerOver } from "../../utils/pointer";
import { useControls } from "leva";
import { findPath } from "../../utils/findPath";

const Rooms = ({
  pathToLevel,
  pathToCharacter,
  pathToMesh,
  changeLevel,
  zone,
}: {
  pathToLevel: string;
  pathToMesh: string;
  pathToCharacter: string;
  changeLevel: (name: LevelName) => void;
  zone: LevelName;
}) => {
  let options = {
    prevLevel: { x: 6, y: 3.7, z: 32.7 },
    navigation: { showNavigationMesh: false },
  };
  let levaOptions = { prevLevel: {}, navigation: {} } as typeof options;
  levaOptions.prevLevel = useControls("Prev Level", {
    ...options.prevLevel,
  });
  levaOptions.navigation = useControls("Navigation", {
    showNavigationMesh: levelOptions.navigation.showNavigationMesh,
  });
  if (window.location.hash === "#demo") {
    options = levaOptions;
  }

  const door = useGLTF("rooms/door.glb");
  const doorRef = useRef<Mesh>(null);

  let path = useRef<Vector3[]>([]);
  let framesCount = useRef(0);
  const character = useRef<Group>(null);
  const prevLevelMark = useRef<Mesh>(null);

  const { actions } = useAnimations(door.animations, doorRef);

  function goToAnotherLevel(
    actionMark: React.RefObject<Mesh<BufferGeometry, Material | Material[]>>,
    zoneName: LevelName,
    action: AnimationAction | null
  ) {
    if (!actionMark.current) return;

    path.current = findPath(
      pathfinder,
      actionMark.current.position,
      zone,
      character
    );

    const helper = () => {
      if (path.current.length === 0) {
        if (!action) return;
        action.play();
        action.loop = LoopOnce;

        setTimeout(() => {
          changeLevel(zoneName);
        }, 2000);
        return;
      }
      requestAnimationFrame(helper);
    };

    helper();
  }

  useEffect(() => {
    if (!character.current) return;
    character.current?.position.set(
      levelOptions.character.x,
      levelOptions.character.y,
      levelOptions.character.z
    );
  }, []);
  const { navmesh, pathfinder } = useCreateNavmesh(pathToMesh, zone);

  function onClickMesh(event: any) {
    const target = event.intersections[0].point;
    path.current = findPath(pathfinder, target, zone, character);
  }

  useFrame(({ camera }) => {
    framesCount.current++;
    if (framesCount.current % 30 === 0) {
      prevLevelMark.current?.lookAt(camera.position);
    }
  });
  return (
    <>
      <Level
        levelOptions={levelOptions}
        pathToLevel={pathToLevel}
        pathToCharacter={pathToCharacter}
        zone={zone}
        path={path}
        //   @ts-ignore
        navmesh={navmesh}
        pathfinder={pathfinder}
        ref={character}
        character={character}
        followCamera={true}
      />

      <primitive
        object={navmesh.scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={onClickMesh}
        visible={options.navigation.showNavigationMesh}
        style={{ cursor: "pointer" }}
      />

      <ActionMark
        position={[
          options.prevLevel.x,
          options.prevLevel.y,
          options.prevLevel.z,
        ]}
        ref={prevLevelMark}
        onClick={() => {
          goToAnotherLevel(prevLevelMark, "street", actions["opening"]);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <group dispose={null}>
        <primitive ref={doorRef} object={door.scene} />
      </group>
    </>
  );
};

export default Rooms;
