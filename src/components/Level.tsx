import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { MutableRefObject, useMemo, useRef } from "react";
import { Clock, Group, Mesh, Vector3, Raycaster } from "three";
import { GLTFLoader } from "three-stdlib";
// @ts-ignore
import { Pathfinding } from "three-pathfinding";
import Model from "./Model";
import { SpotLight } from "@react-three/drei";
import { IOptionsLevel } from "../types";

const Level = ({
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

  const levaOptions = {
    character: {},
    light: {},
    navigation: {},
    spotLight: {},
  } as IOptionsLevel;
  levaOptions.character = useControls("Character", {
    x: { value: levelOptions.character.x, min: -100, max: 100 },
    y: { value: levelOptions.character.y, min: -100, max: 100 },
    z: { value: levelOptions.character.z, min: -100, max: 100 },
    speed: { value: levelOptions.character.speed, min: 0, max: 10 },
    rotationSpeed: { value: levelOptions.character.rotationSpeed, min: 0, max: 1 },
    watchOnCursorWhileMove: levelOptions.character.watchOnCursorWhileMove,
  });
  levaOptions.light = useControls("Light", {
    intensity: { value: levelOptions.light.intensity, min: 0, max: 1 },
  });
  levaOptions.navigation = useControls("Navigation", {
    showNavigationMesh: levelOptions.navigation.showNavigationMesh,
  });
  levaOptions.spotLight = useControls("SpotLight", {
    color: levelOptions.spotLight.color,
    x: { value: levelOptions.spotLight.x, min: -5, max: 5 },
    y: { value: levelOptions.spotLight.y, min: -5, max: 5 },
    z: { value: levelOptions.spotLight.z, min: -5, max: 5 },

    distance: { value: levelOptions.spotLight.distance, min: 0, max: 100 },
    angle: { value: levelOptions.spotLight.angle, min: 0, max: Math.PI },
    attenuation: { value: levelOptions.spotLight.attenuation, min: 0, max: 10 },
    anglePower: { value: levelOptions.spotLight.anglePower, min: 0, max: 100 },
  });

  if (window.location.hash === "#demo") {
    levelOptions = levaOptions;
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
    // console.log(path.current)
    path.current = pathfinder.findPath(
      closestCharacter.centroid,
      closestTarget.centroid,
      zone,
      groupId
    );
    console.log( closestCharacter.centroid,
      closestTarget.centroid,
      zone,
      groupId)

      console.log(path.current)
  }

  function characterMove(speed: number) {
    // console.log(path.current)
    if (!path.current || path.current.length <= 0 || !character.current) return;

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

  function moveSpotLight(clock:Clock, raycaster: Raycaster){
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
          levelOptions.character.rotationSpeed
        );
      } else {
        lookAtVector.current = lookAtVector.current.lerp(
          path.current.length > 0 && !levelOptions.character.watchOnCursorWhileMove
            ? path.current[0]
            : mousePoint.point,
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

  useFrame(({ raycaster, clock }, delta) => {
   
    moveSpotLight(clock, raycaster)

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
      <Model path={pathToLevel} ref={map}/>

        <group
          name="character"
          ref={character}
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
          />
          <Model path={pathToCharacter} />
        </group>


      <ambientLight intensity={levelOptions.light.intensity} />
      <primitive
        object={navmesh.scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={onClickMesh}
        visible={levelOptions.navigation.showNavigationMesh}
        style={{ cursor: "pointer" }}
      />
    </>
  );
};

export default Level;
