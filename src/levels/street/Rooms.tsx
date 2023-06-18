import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Mesh, Vector3 } from "three";
// @ts-ignore
import { Pathfinding } from "three-pathfinding";
import ActionMark from "../../components/ActionMark";
import Level from "../../components/Level";
import { useCreateNavmesh } from "../../hooks/useCreateNavmesh";
import { IOptionsLevel } from "../../types";

const Rooms = ({
  levelOptions,
  pathToLevel,
  pathToCharacter,
  pathToMesh,
  zone,
}: {
  levelOptions: IOptionsLevel;
  pathToLevel: string;
  pathToMesh: string;
  pathToCharacter: string;
  zone: string;
}) => {
  let path = useRef<Vector3[]>([]);
  let framesCount = useRef(0);
  const gateActionMark = useRef<Mesh>(null);
  const { navmesh, pathfinder } = useCreateNavmesh(pathToMesh, zone);

  useFrame(({ camera }) => {
    framesCount.current++;
    if (framesCount.current % 30 === 0) {
      gateActionMark.current?.lookAt(camera.position);
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
      />
      <ActionMark
        position={[0, 3, 40]}
        ref={gateActionMark}
        onClick={() => {
          console.log("test");
        }}
      />
    </>
  );
};

export default Rooms;
