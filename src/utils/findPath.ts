import { Group, Vector3 } from "three";

export function findPath(pathfinder:any, target: Vector3, zone: string, character:React.RefObject<Group>){
    const groupId = pathfinder.getGroup(zone, character.current?.position);
    const closestTarget = pathfinder.getClosestNode(target, zone, groupId);
    const closestCharacter = pathfinder.getClosestNode(
      character.current?.position,
      zone,
      groupId
    );

    return pathfinder.findPath(
      closestCharacter.centroid,
      closestTarget.centroid,
      zone,
      groupId
    );
}