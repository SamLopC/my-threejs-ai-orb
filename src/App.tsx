'use client';

import React, { useState } from "react";
import { SceneProvider } from "./context/SceneContext";
import Scene from "./components/Scene";
import "./styles/global.css";
import theme from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import Lottie from "react-lottie";
import unicornAnimation from "./assets/lottie/unicorn.json";
import StepForm from "./components/StepForm";

function App() {
  const [currentView, setCurrentView] = useState<"form" | "loading" | "scene">(
    "form"
  );

  const handleComplete = () => {
    // Once the user finishes the step form, show loading, then show the scene
    setCurrentView("loading");
    setTimeout(() => {
      setCurrentView("scene");
    }, 2000);
  };

  // Lottie animation options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: unicornAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <SceneProvider>
        {currentView === "scene" && (
          <div className="fade-in">
            <Scene />
          </div>
        )}
        {currentView === "loading" && (
          <div className="loading-screen fade-in-out">
            <Lottie options={defaultOptions} height={200} width={200} />
          </div>
        )}
        {currentView === "form" && (
          <div className="fade-out">
            <StepForm onComplete={handleComplete} />
          </div>
        )}
      </SceneProvider>
    </ThemeProvider>
  );
}

export default App;
