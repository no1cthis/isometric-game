export default /* glsl */ `
#define PI 3.1415926535897932384626433832795
uniform float uR;
uniform float uG;
uniform float uB;
varying vec2 vUv;

void main()
{
    float strength=distance(vUv,vec2(.5));
    strength*=2.;
    strength=1.-strength;
    
    vec3 blackColor=vec3(0.,0.,0.);
    vec3 uvColor=vec3(uR,uG,uB);
    vec3 mixedColor=mix(blackColor,uvColor,strength);

    gl_FragColor=vec4(mixedColor,strength);
}
`;