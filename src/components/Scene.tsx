import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { Shaders } from "../shaders/Shaders";
// import audio from "../assets/Beats.mp3";
import conquer from "../assets/Conquer.mp3";

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, -2, 14);
    camera.lookAt(0, 0, 0);

    const params = {
        red: 0.2, 
        green: 0.6, 
        blue: 1.0, 
        threshold: 0.5,
        strength: 0.5,
        radius: 0.8,
      };

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      params.strength,
      params.radius,
      params.threshold
    );

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    bloomComposer.addPass(new OutputPass());

    const uniforms = {
      u_time: { value: 0.0 },
      u_frequency: { value: 0.0 },
      u_red: { value: params.red },
      u_green: { value: params.green },
      u_blue: { value: params.blue },
    };

    const geo = new THREE.IcosahedronGeometry(4, 30);
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: Shaders.vertexShader,
      fragmentShader: Shaders.fragmentShader,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Sound output: Load and play audio file
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(conquer, (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.5);
      window.addEventListener("click", () => sound.play());
    });
    const outputAnalyser = new THREE.AudioAnalyser(sound, 32);

    // Sound input: Capture microphone audio
    let inputAnalyser: THREE.AudioAnalyser | null = null;

    const getMicrophoneInput = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const micAudio = new THREE.Audio(listener);
      
          // Handle delayed initialization for stability
          setTimeout(() => {
            micAudio.setMediaStreamSource(stream);
            inputAnalyser = new THREE.AudioAnalyser(micAudio, 32);
            console.log("Microphone input initialized in Chrome.");
          }, 100);
        } catch (error) {
          console.error("Microphone access error:", error);
          alert("Please allow microphone access for this feature to work.");
        }
      };
      
      // Resume AudioContext for Chrome
      window.addEventListener("click", () => {
        const audioContext = listener.context;
        if (audioContext.state === "suspended") {
          audioContext.resume().then(() => {
            console.log("Audio context resumed.");
          });
        }
      });
      
      
      
      

    getMicrophoneInput();

    // GUI controls
    const gui = new GUI();
    const colorsFolder = gui.addFolder("Colors");
    colorsFolder.add(params, "red", 0, 1).onChange((value) => {
      uniforms.u_red.value = Number(value);
      mat.needsUpdate = true;
    });
    colorsFolder.add(params, "green", 0, 1).onChange((value) => {
      uniforms.u_green.value = Number(value);
      mat.needsUpdate = true;
    });
    colorsFolder.add(params, "blue", 0, 1).onChange((value) => {
      uniforms.u_blue.value = Number(value);
      mat.needsUpdate = true;
    });

    const bloomFolder = gui.addFolder("Bloom");
    bloomFolder.add(params, "threshold", 0, 1).onChange((value) => {
      bloomPass.threshold = Number(value);
      mat.needsUpdate = true;
    });
    bloomFolder.add(params, "strength", 0, 3).onChange((value) => {
      bloomPass.strength = Number(value);
      mat.needsUpdate = true;
    });
    bloomFolder.add(params, "radius", 0, 1).onChange((value) => {
      bloomPass.radius = Number(value);
      mat.needsUpdate = true;
    });

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / 100;
      mouseY = (e.clientY - window.innerHeight / 2) / 100;
    };

    document.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();

    
    const animate = () => {
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.5;
        camera.lookAt(scene.position);
        uniforms.u_time.value = clock.getElapsedTime();
      
        const outputFrequency = outputAnalyser.getAverageFrequency();
        const inputFrequency = inputAnalyser ? inputAnalyser.getAverageFrequency() : 0;
        
        // Log frequencies for debugging
        console.log("Output Frequency:", outputFrequency);
        console.log("Input Frequency:", inputFrequency);
      
        uniforms.u_frequency.value = (outputFrequency + inputFrequency) / 2;
      
        bloomComposer.render();
        requestAnimationFrame(animate);
      };
      
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      bloomComposer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    return () => {
      gui.destroy();
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default Scene;
