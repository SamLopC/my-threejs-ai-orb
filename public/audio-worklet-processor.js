// public/audio-worklet-processor.js

class PcmPlayerProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.bufferQueue = [];
      this.currentBuffer = new Float32Array(0);
      this.bufferOffset = 0;
  
      // For smoothing frequency transitions
      this.prevFrequency = 0;
      this.smoothFactor = 0.2; // Adjust between 0 (no smoothing) and 1 (no delay)
  
      // Minimal frequency to display during pauses
      this.minFrequency = 10; // Adjust as needed for visual effect
  
      // Threshold below which audio is considered silence
      this.silenceThreshold = 0.01; // Adjust based on audio input characteristics
  
      // Listen for messages from the main thread
      this.port.onmessage = (event) => {
        const audioData = event.data;
        // Append new audio data to the buffer queue
        this.bufferQueue.push(audioData);
      };
    }
  
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const channel = output[0];
      const sampleCount = channel.length;
  
      // If there's data in the queue, append it to the current buffer
      if (this.bufferQueue.length > 0) {
        const newData = this.bufferQueue.shift();
        const combined = new Float32Array(this.currentBuffer.length + newData.length);
        combined.set(this.currentBuffer);
        combined.set(newData, this.currentBuffer.length);
        this.currentBuffer = combined;
      }
  
      // If there's enough data to fill the output buffer
      if (this.currentBuffer.length - this.bufferOffset >= sampleCount) {
        const slice = this.currentBuffer.subarray(
          this.bufferOffset,
          this.bufferOffset + sampleCount
        );
        channel.set(slice);
  
        // Calculate RMS (Root Mean Square) to determine amplitude
        let sumSquares = 0;
        for (let i = 0; i < slice.length; i++) {
          sumSquares += slice[i] * slice[i];
        }
        const rms = Math.sqrt(sumSquares / slice.length);
  
        // Determine if the current slice is silence
        const isSilence = rms < this.silenceThreshold;
  
        // Calculate frequency based on RMS, ensuring a minimum value during silence
        let targetFrequency = isSilence ? this.minFrequency : rms * 450; // Scale as needed
  
        // Optional: Clamp frequency to a maximum value to prevent excessive scaling
        const maxFrequency = 1000; // Adjust as needed
        targetFrequency = Math.min(targetFrequency, maxFrequency);
  
        // Smooth frequency transitions using linear interpolation
        this.prevFrequency += (targetFrequency - this.prevFrequency) * this.smoothFactor;
  
        // Send the smoothed frequency data back to the main thread
        this.port.postMessage({ frequency: this.prevFrequency });
  
        this.bufferOffset += sampleCount;
      } else {
        // Not enough data, output silence
        for (let i = 0; i < sampleCount; i++) {
          channel[i] = 0;
        }
  
        // During pauses, smoothly transition frequency towards minFrequency
        this.prevFrequency += (this.minFrequency - this.prevFrequency) * this.smoothFactor;
  
        // Send the smoothed frequency data back to the main thread
        this.port.postMessage({ frequency: this.prevFrequency });
      }
  
      // Remove processed data from the buffer
      if (this.bufferOffset >= this.currentBuffer.length) {
        this.currentBuffer = new Float32Array(0);
        this.bufferOffset = 0;
      }
  
      return true; // Keep processor alive
    }
  }
  
  registerProcessor('pcm-player-processor', PcmPlayerProcessor);
  