import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { ColorRepresentation } from "three";
import Level from "./components/Level";
import Experience from "./Expirience";

const App = () => {
  let options = { background: "#201919" };
  const levaOptions = useControls({ background: options.background });

  if (window.location.hash === "#demo") {
    options = levaOptions;
  }
  return (
    <div className="app">
      <Leva collapsed hidden={!(window.location.hash === "#demo")} />
      <Canvas>
        <color
          args={[options.background as ColorRepresentation]}
          attach="background"
        />
        <Experience />
        <Level
          pathToCharacter="./character.glb"
          pathToLevel="./street/street.glb"
          pathToMesh="./street/street-nav-mesh.glb"
          zone="street"
        />
      </Canvas>
    </div>
  );
};

export default App;
