import React, { useState } from "react";
import { SceneProvider } from "./context/SceneContext";
import Scene from "./components/Scene";
import "./styles/global.css";
import StepForm from "./components/StepForm";
import theme from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";






const steps = [
  { questions: ["What is your name?", "What is your age?", "What is your email?", "What is your phone number?", "What is your address?"] },
];


function App() {
  const [isSceneActive, setIsSceneActive] = useState<boolean>(false);


  return (
  <ThemeProvider theme={theme}>
    <SceneProvider>
      {isSceneActive ? (
        <Scene />
      ) : (
        <StepForm steps={steps} onComplete={() => setIsSceneActive(true)} />
      )}
    </SceneProvider>
  </ThemeProvider> 
  );
}

export default App;
