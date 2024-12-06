class PCMPlayerProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.bufferQueue = [];
      this.port.onmessage = (event) => {
        const data = event.data;
        this.bufferQueue.push(data);
      };
    }
  
    process(inputs, outputs) {
      const output = outputs[0];
      const outChannel = output[0];
      let samplesNeeded = outChannel.length;
      let sampleIndex = 0;
  
      while (this.bufferQueue.length > 0 && sampleIndex < samplesNeeded) {
        const currentBuffer = this.bufferQueue[0];
        const samplesToCopy = Math.min(samplesNeeded - sampleIndex, currentBuffer.length);
        outChannel.set(currentBuffer.subarray(0, samplesToCopy), sampleIndex);
        sampleIndex += samplesToCopy;
  
        if (samplesToCopy < currentBuffer.length) {
          // Partially consumed this chunk
          this.bufferQueue[0] = currentBuffer.subarray(samplesToCopy);
        } else {
          // Fully consumed this chunk
          this.bufferQueue.shift();
        }
      }
  
      for (; sampleIndex < samplesNeeded; sampleIndex++) {
        outChannel[sampleIndex] = 0;
      }
  
      return true; // keep alive
    }
  }
  
  registerProcessor('pcm-player-processor', PCMPlayerProcessor);
  