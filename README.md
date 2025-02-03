# Front-End 3D Scene with Three.js

This repository contains a **React** front-end that renders an interactive 3D scene using **Three.js**. It also includes a simple chat interface that uses **WebSockets** to send and receive text and audio.

---

## Features

1. **3D Scene Rendering**  
   - Built directly with Three.js (`three` and `three/examples/jsm`) to create geometry, materials, and post-processing effects (bloom).
   - Custom vertex and fragment shaders for added visual dynamics (`shaders.ts`).

2. **Chat & Audio Recording**  
   - Real-time chat using WebSockets.
   - Record and send audio to the server (WebSocket) for processing.
   - Play back AI-generated audio via an AudioWorklet.

3. **Form & Scene Context**  
   - A multi-step form (`StepForm`) collects user inputs and notes.  
   - When the form completes, data is passed to the 3D scene for further interaction.

---

## Getting Started

### Prerequisites
- **Node.js** (v14+ recommended)
- **npm** or **yarn**

### Installation

1. **Clone this repository**  
   ```bash
   git clone
   ```

2. **Navigate to the project folder**  
   ```bash
   cd YourRepo
   ```

3. **Install dependencies**  
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

### Running Locally

1. **Start the development server**  
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```
2. **Open your browser**  
   Visit [http://localhost:3000](http://localhost:3000) to see the 3D scene and chat interface.

---

## Project Structure

- **`components/Scene.tsx`**  
  Main 3D scene code, manages Three.js objects, rendering loop, and WebSocket events.

- **`shaders/Shaders.ts`**  
  Custom vertex and fragment shaders used in the 3D rendering.

- **`components/StepForm.tsx`**  
  Multi-step form collecting user input before loading the 3D scene.

- **`context/SceneContext.tsx`**  
  Provides Bloom and color parameters to the scene.

- **`styles/`**  
  Global CSS and theme settings.

---