import React, { createContext, useContext, useState, ReactNode } from "react";

interface SceneState {
  bloomParams: {
    threshold: number;
    strength: number;
    radius: number;
  };
  colorParams: {
    red: number;
    green: number;
    blue: number;
  };
  geometryConfig: {
    radius: number;
    detail: number;
  };
  setBloomParams: (params: Partial<SceneState["bloomParams"]>) => void;
  setColorParams: (params: Partial<SceneState["colorParams"]>) => void;
  setGeometryConfig: (config: Partial<SceneState["geometryConfig"]>) => void;
}

const defaultState: SceneState = {
  bloomParams: { threshold: 0.5, strength: 0.5, radius: 0.8 },
  colorParams: { red: 0.2, green: 0.6, blue: 1.0 },
  geometryConfig: { radius: 4, detail: 30 },
  setBloomParams: () => {},
  setColorParams: () => {},
  setGeometryConfig: () => {},
};

const SceneContext = createContext<SceneState>(defaultState);

export const SceneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bloomParams, setBloomParams] = useState(defaultState.bloomParams);
  const [colorParams, setColorParams] = useState(defaultState.colorParams);
  const [geometryConfig, setGeometryConfig] = useState(defaultState.geometryConfig);

  const updateBloomParams = (params: Partial<SceneState["bloomParams"]>) =>
    setBloomParams((prev) => ({ ...prev, ...params }));

  const updateColorParams = (params: Partial<SceneState["colorParams"]>) =>
    setColorParams((prev) => ({ ...prev, ...params }));

  const updateGeometryConfig = (config: Partial<SceneState["geometryConfig"]>) =>
    setGeometryConfig((prev) => ({ ...prev, ...config }));

  return (
    <SceneContext.Provider
      value={{
        bloomParams,
        colorParams,
        geometryConfig,
        setBloomParams: updateBloomParams,
        setColorParams: updateColorParams,
        setGeometryConfig: updateGeometryConfig,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => useContext(SceneContext);
