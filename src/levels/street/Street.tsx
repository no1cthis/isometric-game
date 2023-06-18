import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { Group, Mesh, Vector3 } from "three";

import { options as levelOptions } from "./levelOptions";
import ActionMark from "../../components/ActionMark";
import Level from "../../components/Level";
import { useCreateNavmesh } from "../../hooks/useCreateNavmesh";
import { LevelName } from "../../types";

import { findPath } from "../../utils/findPath";
import { handlePointerOut, handlePointerOver } from "../../utils/pointer";

const Street = ({
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
  zone: string;
}) => {
  let options = {
    nextLevel: { x: -2, y: 8, z: 13 },
    navigation: { showNavigationMesh: false },
  };
  let levaOptions = { nextLevel: {}, navigation: {} } as typeof options;
  levaOptions.nextLevel = useControls("Next Level", {
    ...options.nextLevel,
  });
  levaOptions.navigation = useControls("Navigation", {
    showNavigationMesh: levelOptions.navigation.showNavigationMesh,
  });
  if (window.location.hash === "#demo") {
    options = levaOptions;
  }

  const character = useRef<Group>(null);
  const NextLevelMark = useRef<Mesh>(null);
  let path = useRef<Vector3[]>([]);
  let framesCount = useRef(0);

  const { navmesh, pathfinder } = useCreateNavmesh(pathToMesh, zone);

  function nextLevel() {
    if (!NextLevelMark.current) return;

    path.current = findPath(
      pathfinder,
      NextLevelMark.current.position,
      zone,
      character
    );

    const helper = () => {
      if (path.current.length === 0) {
        changeLevel("rooms");
        return;
      }
      requestAnimationFrame(helper);
    };

    helper();
  }

  function onClickMesh(event: any) {
    const target = event.intersections[0].point;
    path.current = findPath(pathfinder, target, zone, character);
  }

  useFrame(({ camera }) => {
    framesCount.current++;
    if (framesCount.current % 30 === 0) {
      NextLevelMark.current?.lookAt(camera.position);
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
          options.nextLevel.x,
          options.nextLevel.y,
          options.nextLevel.z,
        ]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        ref={NextLevelMark}
        onClick={nextLevel}
      />
    </>
  );
};

export default Street;
