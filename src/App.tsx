'use client';

import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import Lottie from "react-lottie";
import Player from "react-lottie-player";



import { SceneProvider } from "./context/SceneContext";
import Scene from "./components/Scene";
import StepForm from "./components/StepForm";

import theme from "./styles/theme";
import "./styles/global.css";
import unicornAnimation from "./assets/lottie/unicorn.json";

function App() {
  const [currentView, setCurrentView] = useState<"form" | "loading" | "scene">("form");

  const [finalAnswers, setFinalAnswers] = useState<Record<number, string>>({});
  const [finalNotes, setFinalNotes] = useState<Record<number, string>>({});

  const handleComplete = (answers: Record<number, string>, notes: Record<number, string>) => {
    setFinalAnswers(answers);
    setFinalNotes(notes);

    setCurrentView("loading");
    setTimeout(() => {
      setCurrentView("scene");
    }, 2000);
  };

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
            <Scene answers={finalAnswers} notes={finalNotes} />
          </div>
        )}
        {currentView === "loading" && (
          <div className="loading-screen fade-in-out">
            <Player
              loop
              play
              animationData={unicornAnimation}
              style={{ height: 200, width: 200 }}
            />
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
