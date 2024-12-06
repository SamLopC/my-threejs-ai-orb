import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { Shaders } from "../shaders/Shaders";
import { useScene } from "../context/SceneContext"; // Update this path based on your project structure

const mimeType = "audio/webm";

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { bloomParams, colorParams, geometryConfig } = useScene();

  // ***** AUDIO AND WEBSOCKET STATES *****
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording">("inactive");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  useEffect(() => {
    // THREE.js scene setup
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

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomParams.strength,
      bloomParams.radius,
      bloomParams.threshold
    );

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    bloomComposer.addPass(new OutputPass());

    const uniforms = {
      u_time: { value: 0.0 },
      u_frequency: { value: 0.0 },
      u_red: { value: colorParams.red },
      u_green: { value: colorParams.green },
      u_blue: { value: colorParams.blue },
    };

    const geo = new THREE.IcosahedronGeometry(
      geometryConfig.radius,
      geometryConfig.detail
    );

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: Shaders.vertexShader,
      fragmentShader: Shaders.fragmentShader,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const clock = new THREE.Clock();

    const animate = () => {
      uniforms.u_time.value = clock.getElapsedTime();
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
      window.removeEventListener("resize", handleResize);
    };
  }, [bloomParams, colorParams, geometryConfig]);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(mediaStream);

        // Setup AudioContext and AudioWorklet
        const audioContext = new window.AudioContext();
        audioContextRef.current = audioContext;

        await audioContext.audioWorklet.addModule('audio-worklet-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'pcm-player-processor');
        workletNode.connect(audioContext.destination);
        workletNodeRef.current = workletNode;

        // Initialize WebSocket
        websocketRef.current = new WebSocket("ws://localhost:3000/ws");

        websocketRef.current.onopen = () => {
          console.log("Connected to WebSocket server.");
        };

        websocketRef.current.onmessage = (event) => {
          handleServerMessage(event.data);
        };

        websocketRef.current.onerror = (err) => {
          console.error("WebSocket error:", err);
        };

        websocketRef.current.onclose = () => {
          console.log("WebSocket connection closed.");
        };
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = () => {
    if (!stream) return;
    setRecordingStatus("recording");
    const media = new MediaRecorder(stream, { mimeType });

    mediaRecorder.current = media;
    mediaRecorder.current.start();

    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (recordingStatus !== "recording") return;
    setRecordingStatus("inactive");
    mediaRecorder.current?.stop();

    mediaRecorder.current!.onstop = () => {
      const blob = new Blob(audioChunks, { type: mimeType });
      setAudioBlob(blob);
      setAudioChunks([]);
      sendAudio(blob);
    };
  };

  const sendAudio = async (blob: Blob) => {
    if (!blob) {
      console.error("No audio to send.");
      return;
    }

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const tempCtx = new window.AudioContext();
      const decodedAudio = await tempCtx.decodeAudioData(arrayBuffer);

      // Resample to 16 kHz mono PCM16
      const resampledBuffer = await resampleAudio(decodedAudio, 16000, 1);
      const pcmData = convertToPCM16(resampledBuffer);

      // Encode PCM data to Base64
      const base64Audio = arrayBufferToBase64(pcmData);

      // Send audio to WebSocket
      sendAudioToWebSocket(base64Audio);
    } catch (err) {
      console.error("Error processing audio:", err);
    }
  };

  const resampleAudio = async (audioBuffer: AudioBuffer, targetSampleRate: number, numChannels: number) => {
    const offlineContext = new OfflineAudioContext(
      numChannels,
      Math.ceil((audioBuffer.length * targetSampleRate) / audioBuffer.sampleRate),
      targetSampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  };

  const convertToPCM16 = (audioBuffer: AudioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const pcmData = new Int16Array(channelData.length);

    for (let i = 0; i < channelData.length; i++) {
      let s = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return pcmData.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const sendAudioToWebSocket = (base64Audio: string) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_audio",
              audio: base64Audio,
            },
          ],
        },
      };

      websocketRef.current.send(JSON.stringify(message));
      console.log("Audio sent to WebSocket server.");

      // Request a response from the assistant
      const responseCreateMessage = { type: "response.create" };
      websocketRef.current.send(JSON.stringify(responseCreateMessage));
      console.log("Sent response.create.");
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  const handleServerMessage = (message: string) => {
    console.log("Received message from server:", message);
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === "error") {
        console.error("Error from server:", parsedMessage.error);
        return;
      }

      if (parsedMessage.type === "output_audio") {
        const audioBase64 = parsedMessage.audio;

        const int16Data = base64ToInt16(audioBase64);
        const float32Data = int16ToFloat32(int16Data);
        // Resample from 16kHz to audioContext.sampleRate for correct playback speed
        if (audioContextRef.current) {
          const resampledData = resampleFloat32(float32Data, 24000, audioContextRef.current.sampleRate);

          // Send resampled float32 data to the processor
          if (workletNodeRef.current) {
            workletNodeRef.current.port.postMessage(resampledData);
          }
        }
      }

    } catch (err) {
      console.error("Error handling server message:", err);
    }
  };

  const base64ToInt16 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = (binaryString.charCodeAt(i)) | (binaryString.charCodeAt(i+1) << 8);
    }
    return bytes;
  };

  const int16ToFloat32 = (int16Data: Int16Array) => {
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768;
    }
    return float32Data;
  };

  const resampleFloat32 = (inputSamples: Float32Array, inputRate: number, outputRate: number) => {
    if (inputRate === outputRate) {
      return inputSamples;
    }
    const ratio = outputRate / inputRate;
    const outputLength = Math.floor(inputSamples.length * ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const index = i / ratio;
      const low = Math.floor(index);
      const high = Math.min(low + 1, inputSamples.length - 1);
      const t = index - low;
      output[i] = inputSamples[low] * (1 - t) + inputSamples[high] * t;
    }
    return output;
  };

  return (
    <div ref={mountRef} style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 20, left: 20, color: "#fff", zIndex: 999 }}>
        {!permission && (
          <button onClick={getMicrophonePermission}>Get Microphone</button>
        )}
        {permission && recordingStatus === "inactive" && (
          <button onClick={startRecording}>Start Recording</button>
        )}
        {recordingStatus === "recording" && (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
    </div>
  );
};

export default Scene;
