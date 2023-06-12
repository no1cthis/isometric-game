import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import Level from "./components/Level";
import Experience from "./Expirience";

const App = () => {
  let options = { background: "#201919" };

  if (window.location.hash === "#demo") {
    options = useControls({ background: options.background });
  }
  return (
    <div className="app">
      <Leva collapsed />
      <Canvas>
        <color args={[options.background]} attach="background" />
        <Experience />
        <Level
          pathToLevel="./street/street.glb"
          pathToMesh="./street/street-nav-mesh.glb"
          zone="street"
        />
      </Canvas>
    </div>
  );
};

export default App;
