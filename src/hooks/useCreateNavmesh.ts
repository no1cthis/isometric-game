import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh } from "three";
// @ts-ignore
import { Pathfinding } from "three-pathfinding";

export const useCreateNavmesh = (pathToMesh: string, zone:string) => {
    const pathfinder = useMemo(() => new Pathfinding(), []);

    const navmesh = useGLTF(pathToMesh);
    const mesh = useMemo(() => navmesh.scene.children[0] as Mesh, [navmesh]);
    if (mesh.isMesh) {
      pathfinder.setZoneData(zone, Pathfinding.createZone(mesh.geometry));
    }


    return {navmesh, pathfinder}
}