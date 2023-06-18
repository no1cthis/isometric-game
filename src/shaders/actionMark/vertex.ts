export default /* glsl */ `
varying vec2 vUv;
uniform float uTime;

void main()
{

    vec4 modelPosition=modelMatrix*vec4(position,1.);
    // modelPosition.y=sin(uTime)/10. + 3.;

    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
}
`;
