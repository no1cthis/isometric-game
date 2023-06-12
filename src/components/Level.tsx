import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { MutableRefObject, useMemo, useRef } from "react";
import { Group, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";
// @ts-ignore
import { Pathfinding } from "three-pathfinding";
import { Suspense } from "react";
import Model from "./Model";
import { SpotLight } from "@react-three/drei";

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
      watchOnCursorWhileMove: true,
    },
    light: {
      intensity: 0.13,
    },
    navigation: { showNavigationMesh: false },
    spotLight: {
      color: "#837f70",
      x: 0,
      y: 0.75,
      z: 0.35,
      distance: 25,
      angle: 0.5,
      attenuation: 0,
      anglePower: 1,
    },
  };
  const levaOptions = {
    character: {},
    light: {},
    navigation: {},
    spotLight: {},
  } as typeof options;
  levaOptions.character = useControls("Character", {
    x: { value: options.character.x, min: -100, max: 100 },
    y: { value: options.character.y, min: -100, max: 100 },
    z: { value: options.character.z, min: -100, max: 100 },
    speed: { value: options.character.speed, min: 0, max: 10 },
    rotationSpeed: { value: options.character.rotationSpeed, min: 0, max: 1 },
    watchOnCursorWhileMove: options.character.watchOnCursorWhileMove,
  });
  levaOptions.light = useControls("Light", {
    intensity: { value: options.light.intensity, min: 0, max: 1 },
  });
  levaOptions.navigation = useControls("Navigation", {
    showNavigationMesh: options.navigation.showNavigationMesh,
  });
  levaOptions.spotLight = useControls("SpotLight", {
    color: options.spotLight.color,
    x: { value: options.spotLight.x, min: -5, max: 5 },
    y: { value: options.spotLight.y, min: -5, max: 5 },
    z: { value: options.spotLight.z, min: -5, max: 5 },

    distance: { value: options.spotLight.distance, min: 0, max: 100 },
    angle: { value: options.spotLight.angle, min: 0, max: Math.PI },
    attenuation: { value: options.spotLight.attenuation, min: 0, max: 10 },
    anglePower: { value: options.spotLight.anglePower, min: 0, max: 100 },
  });

  if (window.location.hash === "#demo") {
    options = levaOptions;
  }

  const character = useRef<Group>(null);
  const spotLight = useRef(null);
  const map = useRef<Mesh>(null);

  let path = useRef<Vector3[]>([]);

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

    path.current = pathfinder.findPath(
      closestCharacter.centroid,
      closestTarget.centroid,
      zone,
      groupId
    );
  }

  function characterMove(speed: number) {
    if (path.current.length <= 0 || !character.current) return;

    let target = path.current[0];

    const distance = target.clone().sub(character.current?.position);

    if (distance.lengthSq() > 0.5) {
      distance.normalize();

      character.current.position.add(
        distance.multiplyScalar(speed * options.character.speed * 10)
      );
    } else {
      path.current.shift();
    }
  }

  useFrame(({ raycaster, clock }, delta) => {
    if (!map.current || map.current?.children.length <= 0 || !character.current)
      return;

    const mousePoint = raycaster.intersectObjects(map.current.children)[0];

    if (mousePoint && spotLight.current) {
      const distance = mousePoint.point
        .clone()
        .sub(character.current?.position)
        .lengthSq();

      if (distance < 4) {
        lookAtVector.current = lookAtVector.current.lerp(
          lookAtVector.current.add(
            new Vector3(0, Math.sin(clock.elapsedTime * 3) / 100, 0)
          ),
          options.character.rotationSpeed
        );
      } else {
        lookAtVector.current = lookAtVector.current.lerp(
          path.current.length > 0 && !options.character.watchOnCursorWhileMove
            ? path.current[0]
            : mousePoint.point,
          options.character.rotationSpeed
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
      <Model path={pathToLevel} ref={map} />
      <Suspense fallback={null}>
        <group
          name="character"
          ref={character}
          position={[
            options.character.x,
            options.character.y,
            options.character.z,
          ]}
          scale={1}
        >
          <SpotLight
            color={options.spotLight.color}
            position={[
              options.spotLight.x,
              options.spotLight.y,
              options.spotLight.z,
            ]}
            ref={spotLight}
            distance={options.spotLight.distance}
            angle={options.spotLight.angle}
            attenuation={options.spotLight.attenuation}
            anglePower={options.spotLight.anglePower}
          />
          <Model path={pathToCharacter} />
        </group>
      </Suspense>

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
