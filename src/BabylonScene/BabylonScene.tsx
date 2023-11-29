// import React, { useEffect, useRef } from "react";
// import { Engine } from "@babylonjs/core";
// import { createScene } from "../utils/create-scene";

// const BabylonScene: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (canvasRef.current) {
//       const engine = new Engine(canvasRef.current, true);
//       const scene = createScene(canvasRef.current, engine);

//       engine.runRenderLoop(() => {
//         scene.render();
//       });

//       return () => {
//         engine.dispose();
//       };
//     }
//   }, []);

//   return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas>;
// };

// export default BabylonScene;

import React, { useEffect, useRef } from "react";
import { createGame } from "../utils/createGame";

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      createGame(canvasRef.current);
    }
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas>;
};

export default BabylonScene;
