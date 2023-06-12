import { Box } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { MutableRefObject, useMemo, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";
// @ts-ignore
import { Pathfinding } from "three-pathfinding";
import Model from "./Model";

const Level = ({
  pathToLevel,
  pathToMesh,
  zone,
}: {
  pathToLevel: string;
  pathToMesh: string;
  zone: string;
}) => {
  let options = {
    character: {
      x: 0,
      y: 1,
      z: 40,
      speed: 1.3,
    },
    light: {
      intensity: 0.13,
    },
    navigation: { showNavigationMesh: false },
  };

  if (window.location.hash === "#demo") {
    options.character = useControls("Character", {
      x: { value: options.character.x, min: -100, max: 100 },
      y: { value: options.character.y, min: -100, max: 100 },
      z: { value: options.character.z, min: -100, max: 100 },
      speed: { value: options.character.speed, min: 0, max: 10 },
    });
    options.light = useControls("Light", {
      intensity: { value: 0.3, min: 0, max: 1 },
    });
    options.navigation = useControls("Navigation", {
      showNavigationMesh: options.navigation.showNavigationMesh,
    });
  }

  const character = useRef<Mesh>(null);
  let path: Vector3[] | MutableRefObject<null> = useRef(null);

  const pathfinder = useMemo(() => new Pathfinding(), []);

  const navmesh = useLoader(GLTFLoader, pathToMesh);
  navmesh.scene.traverse((node) => {
    if (node.children.length <= 0) return;
    const mesh = node.children[0] as Mesh;
    if (mesh.isMesh) {
      pathfinder.setZoneData(zone, Pathfinding.createZone(mesh.geometry));
    }
  });

  function onClickMesh(event: any) {
    const target = event.intersections[0].point;
    const groupId = pathfinder.getGroup(zone, character.current?.position);
    const closestTarget = pathfinder.getClosestNode(target, zone, groupId);
    const closestCharacter = pathfinder.getClosestNode(
      character.current?.position,
      zone,
      groupId
    );

    path = pathfinder.findPath(
      closestCharacter.centroid,
      closestTarget.centroid,
      zone,
      groupId
    );
  }

  function characterMove(speed: number) {
    if (!Array.isArray(path) || !path || path.length <= 0 || !character.current)
      return;

    let target = path[0];
    // target.add(new Vector3(0, 1, 0));
    const distance = target.clone().sub(character.current?.position);
    if (distance.lengthSq() > 0.5) {
      distance.normalize();
      character.current.position.add(
        distance.multiplyScalar(speed * options.character.speed * 10)
      );
    } else {
      path.shift();
    }
  }

  useFrame((_, delta) => {
    characterMove(delta);
  });

  function handlePointerOver() {
    document.body.style.cursor = "pointer";
  }

  function handlePointerOut() {
    document.body.style.cursor = "default";
  }

  return (
    <>
      <Model path={pathToLevel} />
      <Box
        position={[
          options.character.x,
          options.character.y,
          options.character.z,
        ]}
        ref={character}
      />
      <ambientLight intensity={options.light.intensity} />
      <primitive
        object={navmesh.scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={onClickMesh}
        visible={options.navigation.showNavigationMesh}
        style={{ cursor: "pointer" }}
      />
    </>
  );
};

export default Level;
