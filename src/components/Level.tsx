import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { MutableRefObject, useMemo, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";
// @ts-ignore
import { Pathfinding } from "three-pathfinding";
import { Suspense } from "react";
import Model from "./Model";

const Level = ({
  pathToLevel,
  pathToCharacter,
  pathToMesh,
  zone,
}: {
  pathToLevel: string;
  pathToMesh: string;
  pathToCharacter: string;
  zone: string;
}) => {
  let options = {
    character: {
      x: 0,
      y: 1,
      z: 40,
      speed: 1.3,
      rotationSpeed: 0.05,
    },
    light: {
      intensity: 0.13,
    },
    navigation: { showNavigationMesh: false },
  };
  const levaOptions = {
    character: {},
    light: {},
    navigation: {},
  } as typeof options;
  levaOptions.character = useControls("Character", {
    x: { value: options.character.x, min: -100, max: 100 },
    y: { value: options.character.y, min: -100, max: 100 },
    z: { value: options.character.z, min: -100, max: 100 },
    speed: { value: options.character.speed, min: 0, max: 10 },
    rotationSpeed: { value: options.character.rotationSpeed, min: 0, max: 1 },
  });
  levaOptions.light = useControls("Light", {
    intensity: { value: 0.3, min: 0, max: 1 },
  });
  levaOptions.navigation = useControls("Navigation", {
    showNavigationMesh: options.navigation.showNavigationMesh,
  });

  if (window.location.hash === "#demo") {
    options = levaOptions;
  }

  const character = useRef<Mesh>(null);
  const map = useRef<Mesh>(null);

  let path: Vector3[] | MutableRefObject<null> = useRef(null);

  let lookAtVector: MutableRefObject<Vector3> = useRef(new Vector3(0, 0, 0));

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

  useFrame(({ raycaster }, delta) => {
    if (!map.current || map.current?.children.length <= 0) return;

    const mousePoint = raycaster.intersectObjects(map.current.children)[0];

    if (mousePoint) {
      lookAtVector.current = lookAtVector.current.lerp(
        mousePoint.point,
        options.character.rotationSpeed
      );
      character.current?.lookAt(lookAtVector.current);
    }

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
      <Model path={pathToLevel} wireframe={true} ref={map} />
      <Suspense fallback={null}>
        <Model
          path={pathToCharacter}
          position={[
            options.character.x,
            options.character.y,
            options.character.z,
          ]}
          scale={1}
          ref={character}
        />
      </Suspense>
      {/* <Box
        position={[
          options.character.x,
          options.character.y,
          options.character.z,
        ]}
        ref={character}
      /> */}
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
