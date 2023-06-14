import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { ColorRepresentation } from "three";
import { options as streetLevelOptions } from "./level-options/street";
import { options as roomsLevelOptions } from "./level-options/rooms";
import Level from "./components/Level";
import Experience from "./Expirience";

const App = () => {
  let options = { background: "#201919", zone:"street" };
  const levaOptions = useControls({ background: options.background, zone:{
    value:options.zone,
    options:[
    "street",
    "rooms"]
  }
});
  if (window.location.hash === "#demo") {
    options = levaOptions;
  }

  return (
    <div className="app">
      <Leva collapsed hidden={!(window.location.hash === "#demo")} />
      <Canvas shadows>
        <color
          args={[options.background as ColorRepresentation]}
          attach="background"
        />
        <Experience />

        {options.zone === "street" && <Level
          levelOptions={streetLevelOptions}
          pathToCharacter="./character.glb"
          pathToLevel="./street/street.glb"
          pathToMesh="./street/street-nav-mesh.glb"
          zone={options.zone}
        />}

        {options.zone === "rooms" && <Level
          levelOptions={roomsLevelOptions}
          pathToCharacter="./character.glb"
          pathToLevel="./rooms/rooms.glb"
          pathToMesh="./rooms/rooms-nav-mesh.glb"
          zone={options.zone}
        />}
      </Canvas>
    </div>
  );
};

export default App;
