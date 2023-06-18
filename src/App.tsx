import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { ColorRepresentation } from "three";

import Experience from "./Expirience";

import Street from "./levels/street/Street";
import Rooms from "./levels/rooms/Rooms";
import { useEffect, useState } from "react";
import { LevelName } from "./types";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";

const App = () => {
  const [zone, setZone] = useState("street");

  let options = { background: "#201919", zone: "street" };
  const levaOptions = useControls({
    background: options.background,
    zone: {
      value: options.zone,
      options: ["street", "rooms"],
    },
  });
  if (window.location.hash === "#demo") {
    options = levaOptions;
  }

  useEffect(() => {
    setZone(options.zone);
  }, [options.zone]);

  const changeLevel = (name: LevelName) => {
    setZone(name);
  };

  return (
    <div className="app">
      <Leva collapsed hidden={!(window.location.hash === "#demo")} />
      <Canvas shadows>
        <color
          args={[options.background as ColorRepresentation]}
          attach="background"
        />
        <Experience />

        {zone === "street" && (
          <Street
            pathToCharacter="./character.glb"
            pathToLevel="./street/street.glb"
            pathToMesh="./street/street-nav-mesh.glb"
            zone={zone}
            changeLevel={changeLevel}
          />
        )}

        {zone === "rooms" && (
          <Rooms
            pathToCharacter="./character.glb"
            pathToLevel="./rooms/rooms.glb"
            pathToMesh="./rooms/rooms-nav-mesh.glb"
            zone={zone}
            changeLevel={changeLevel}
          />
        )}
      </Canvas>
    </div>
  );
};

export default App;
