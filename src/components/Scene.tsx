'use client'

import React, { useEffect, useRef, useState, FormEvent } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { Shaders } from "../shaders/Shaders";
import { useScene } from "../context/SceneContext";
import { FaPaperPlane, FaMicrophone, FaStop } from "react-icons/fa";
import "../styles/global.css";

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { bloomParams, colorParams, geometryConfig } = useScene();
  const [isChatActive, setIsChatActive] = useState(false);




  // --- Audio Recording and WebSocket Logic ---
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording">("inactive");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  // --- Text Messaging States ---
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "assistant"; content: string }[]
  >([]);

  const handleInputFocus = () => {
    setIsChatActive(true);
  };


  const closeChat = () => {
    setIsChatActive(false);
  };
  

  // Buffer for accumulating assistant text before response.done
  const [assistantTextBuffer, setAssistantTextBuffer] = useState("");

  // Define uniforms using useRef to allow updates from outside useEffect
  const uniformsRef = useRef({
    u_time: { value: 0.0 },
    u_frequency: { value: 0.0 },
    u_red: { value: colorParams.red },
    u_green: { value: colorParams.green },
    u_blue: { value: colorParams.blue },
  });

  // --- Define Target Color for Smooth Transition ---
  const targetColorRef = useRef({
    red: colorParams.red,
    green: colorParams.green,
    blue: colorParams.blue,
  });

  const canvas = document.getElementsByTagName("canvas")[0]

  useEffect(() => {

    
    const renderer = new THREE.WebGLRenderer({ 	canvas: canvas,
      antialias: true,
      alpha: true});

    
    renderer.setSize(window.innerWidth, window.innerHeight);
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

    // Initialize uniforms
    uniformsRef.current = {
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
      uniforms: uniformsRef.current,
      vertexShader: Shaders.vertexShader,
      fragmentShader: Shaders.fragmentShader,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Initialize AudioContext and AudioWorklet for streaming AI audio
    const initializeAudioContext = async () => {
      const audioContext = new window.AudioContext();
      audioContextRef.current = audioContext;

      try {
        // Ensure the path to the worklet processor is correct
        await audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'pcm-player-processor');
        workletNode.connect(audioContext.destination);
        workletNodeRef.current = workletNode;

        // Listen for frequency messages from the worklet
        workletNode.port.onmessage = (event) => {
          const { frequency } = event.data;
          uniformsRef.current.u_frequency.value = frequency;
        };
      } catch (err) {
        console.error("Failed to load AudioWorkletProcessor:", err);
      }
    };

    initializeAudioContext();

    // Setup WebSocket
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

    // Handle mouse movement for camera
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / 100;
      mouseY = (e.clientY - window.innerHeight / 2) / 100;
    };
    document.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      // Update camera position based on mouse
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      uniformsRef.current.u_time.value = clock.getElapsedTime();

      // --- Smooth Color Transition ---
      const lerpFactor = 0.03; // Adjust for transition speed (0 < lerpFactor < 1)

      // Interpolate red component
      uniformsRef.current.u_red.value += (targetColorRef.current.red - uniformsRef.current.u_red.value) * lerpFactor;
      // Interpolate green component
      uniformsRef.current.u_green.value += (targetColorRef.current.green - uniformsRef.current.u_green.value) * lerpFactor;
      // Interpolate blue component
      uniformsRef.current.u_blue.value += (targetColorRef.current.blue - uniformsRef.current.u_blue.value) * lerpFactor;

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

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [bloomParams, colorParams, geometryConfig]);

  // --- Recording Functions ---
  const startRecording = async () => {
    if (!permission) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission(true);
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const media = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };

    setAudioChunks(localAudioChunks);
    setRecordingStatus("recording");

    // --- Change THREE.js Scene Color to White (Set Target Color) ---
    targetColorRef.current = { red: 1.0, green: 1.0, blue: 1.0 };
  };

  const stopRecording = () => {
    if (recordingStatus !== "recording") return;
    setRecordingStatus("inactive");
    mediaRecorder.current?.stop();

    // --- Revert THREE.js Scene Color to Original (Set Target Color) ---
    targetColorRef.current = { red: colorParams.red, green: colorParams.green, blue: colorParams.blue };

    mediaRecorder.current!.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioChunks([]);
      // Once we have the audioBlob, send to the backend
      await processAndSendAudio(blob);
    };
  };

  const processAndSendAudio = async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();

      // Decode the audio data at whatever rate the blob is
      const tempAudioContext = new window.AudioContext();
      const decodedAudio = await tempAudioContext.decodeAudioData(arrayBuffer);

      // Resample to 24kHz, mono PCM16
      const resampledBuffer = await resampleAudio(decodedAudio, 24000, 1);
      const pcmData = convertToPCM16(resampledBuffer);

      const base64Audio = arrayBufferToBase64(pcmData);

      sendAudioToWebSocket(base64Audio);
    } catch (err) {
      console.error("Error processing audio:", err);
    }
  };

  // --- WebSocket Sending ---
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

      const responseCreateMessage = { type: "response.create" };
      websocketRef.current.send(JSON.stringify(responseCreateMessage));
      console.log("Sent response.create to request a response from the assistant.");
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  // --- Text Messaging Functions ---
  const sendTextMessage = () => {
    const trimmedMessage = textInput.trim();
    if (trimmedMessage === "") return;

    // Add user message to the messages state
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", content: trimmedMessage },
    ]);

    // Send the message to the WebSocket
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: trimmedMessage,
            },
          ],
        },
      };

      websocketRef.current.send(JSON.stringify(message));
      console.log("Text message sent to WebSocket server.");

      const responseCreateMessage = { type: "response.create" };
      websocketRef.current.send(JSON.stringify(responseCreateMessage));
      console.log("Sent response.create to request a response from the assistant.");
    } else {
      console.error("WebSocket is not connected.");
    }

    // Clear the input field
    setTextInput("");
  };

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendTextMessage();
  };

  // --- Handling incoming AI Audio and Text ---
  const handleServerMessage = async (message: string) => {
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === "error") {
        console.error("Error from server:", parsedMessage.message);
        return;
      }

      if (parsedMessage.type === "output_audio") {
        const audioBase64 = parsedMessage.audio;
        // Decode base64 PCM16 @24kHz
        const pcmData = base64ToInt16(audioBase64);
        const float32Data = convertInt16ToFloat32(pcmData);
        // Resample to match AudioContext sample rate
        if (audioContextRef.current) {
          const toSampleRate = audioContextRef.current.sampleRate;
          const resampledData = resampleFloat32(float32Data, 24000, toSampleRate);
          // Post to AudioWorklet
          if (workletNodeRef.current) {
            workletNodeRef.current.port.postMessage(resampledData);
          }
        }
      }

      if (parsedMessage.type === "output_text") {
        const textChunk = parsedMessage.text ?? "";
        setMessages((prevMessages) => {
          // If the last message is from the assistant, append to it
          const lastIndex = prevMessages.length - 1;
          if (lastIndex >= 0 && prevMessages[lastIndex].sender === "assistant") {
            const updatedMessage = {
              ...prevMessages[lastIndex],
              content: prevMessages[lastIndex].content + textChunk,
            };
            return [...prevMessages.slice(0, lastIndex), updatedMessage];
          } else {
            // Otherwise, create a new assistant message
            return [...prevMessages, { sender: "assistant", content: textChunk }];
          }
        });
      }

      // Once we receive response.done, we finalize the assistant's message
      if (parsedMessage.type === "response.done") {
        // Add the accumulated assistant text as a single message
        if (assistantTextBuffer.trim() !== "") {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "assistant", content: assistantTextBuffer.trim() },
          ]);
          setAssistantTextBuffer(""); // Clear the buffer
        }

        // Reset or stop the animation after a 2 second delay
        setTimeout(() => {
          uniformsRef.current.u_frequency.value = 0.2;
        }, 2000);

        console.log("AI response completed. Animation stopped.");
      }
    } catch (err) {
      console.error("Error handling server message:", err);
    }
  };

  // --- Utility Functions for Resampling and Conversion ---
  const resampleAudio = async (
    audioBuffer: AudioBuffer,
    targetSampleRate: number,
    numChannels: number
  ) => {
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
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
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

  const base64ToInt16 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = (binaryString.charCodeAt(i)) | (binaryString.charCodeAt(i + 1) << 8);
    }
    return bytes;
  };

  const convertInt16ToFloat32 = (int16Array: Int16Array) => {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    return float32Array;
  };

  const resampleFloat32 = (buffer: Float32Array, fromSampleRate: number, toSampleRate: number) => {
    const sampleRateRatio = fromSampleRate / toSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;

      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }

      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  };

  return (
    <div className={`scene-container ${isChatActive ? "chat-active" : ""}`}>
    <div ref={mountRef} className="scene-mount">
    </div>

    {/* --- Sidebar for Text Messaging --- */}
    <div className="sidebar">
      {/* Close Chat Button */}
      {isChatActive && (
        <button
          type="button"
          onClick={closeChat}
          className="close-chat-button"
          aria-label="Close Chat"
        >
          &times;
        </button>
      )}

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
          >
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleTextSubmit} className="message-form">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          onFocus={handleInputFocus}
        />

        <button type="submit" className="send-button" aria-label="Send Message">
          <FaPaperPlane />
        </button>

        <button
          type="button"
          onClick={recordingStatus === "inactive" ? startRecording : stopRecording}
          className={`record-button ${recordingStatus === "inactive" ? "" : "recording"}`}
          aria-label={recordingStatus === "inactive" ? "Start Recording" : "Stop Recording"}
        >
          {recordingStatus === "inactive" ? <FaMicrophone /> : <FaStop />}
        </button>
      </form>
    </div>
  </div>
  );
};

export default Scene;
