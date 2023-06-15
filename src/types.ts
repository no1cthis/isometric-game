export type IOptionsLevel = {
    character: {
        x: number;
        y: number;
        z: number;
        speed: number;
        rotationSpeed: number;
        watchOnCursorWhileMove: boolean;
    };
    light: {
        intensity: number;
    };
    navigation: {
        showNavigationMesh: boolean;
    };
    spotLight: {
        color: string,
        x: number,
        y: number,
        z: number,
        distance: number,
        angle:number,
        attenuation: number,
        anglePower: number,
        shadowBias:number,
    };
}