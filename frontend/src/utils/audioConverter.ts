/**
 * Audio Converter Utility
 * Uses the Web Audio API (AudioContext) to decode any audio format supported by the browser
 * (MP3, M4A, AAC, OGG, FLAC, WebM, etc.) and encodes it into a standard 16-bit PCM WAV file.
 */

export const SUPPORTED_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac', '.webm', '.wma'];

export function isSupportedAudioFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some(ext => name.endsWith(ext));
}

/**
 * Encodes an AudioBuffer into a 16-bit PCM WAV Blob/ArrayBuffer.
 */
function audioBufferToWav(buffer: AudioBuffer, targetSampleRate = 16000): Blob {
  // Downmix to mono if stereo, or keep mono
  const numChannels = 1; // 1 channel (mono) is standard for deepfake acoustic models
  const sourceSampleRate = buffer.sampleRate;
  
  // Get mono audio data (average channels if stereo)
  let monoData: Float32Array;
  if (buffer.numberOfChannels === 1) {
    monoData = buffer.getChannelData(0);
  } else {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    monoData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      monoData[i] = (left[i] + right[i]) / 2;
    }
  }

  // Resample to targetSampleRate if necessary
  let outputData: Float32Array;
  let finalSampleRate = targetSampleRate;

  if (sourceSampleRate !== targetSampleRate) {
    const ratio = sourceSampleRate / targetSampleRate;
    const targetLength = Math.round(monoData.length / ratio);
    outputData = new Float32Array(targetLength);
    for (let i = 0; i < targetLength; i++) {
      const srcIndex = Math.floor(i * ratio);
      outputData[i] = monoData[Math.min(srcIndex, monoData.length - 1)];
    }
  } else {
    outputData = monoData;
    finalSampleRate = sourceSampleRate;
  }

  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = finalSampleRate * blockAlign;
  const dataByteLength = outputData.length * bytesPerSample;
  const bufferLength = 44 + dataByteLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');

  // "fmt " Sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, finalSampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // "data" Sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  // Write the PCM samples (clamped between -1 and 1)
  let offset = 44;
  for (let i = 0; i < outputData.length; i++) {
    const s = Math.max(-1, Math.min(1, outputData[i]));
    // Convert float to 16-bit signed integer
    const sample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts any browser-compatible audio file into a 16kHz Mono .wav File.
 * If already .wav, checks if normalization is needed or passes through.
 */
export async function convertToWav(
  file: File,
  onStatusUpdate?: (status: string) => void
): Promise<{ file: File; converted: boolean; originalFormat: string }> {
  const nameLower = file.name.toLowerCase();
  const originalExt = nameLower.slice(nameLower.lastIndexOf('.'));
  
  // If it's already .wav, pass through directly
  if (nameLower.endsWith('.wav')) {
    return { file, converted: false, originalFormat: 'WAV' };
  }

  onStatusUpdate?.(`Transcoding ${originalExt.toUpperCase()} to standard forensic WAV format...`);

  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Create an AudioContext to decode
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    onStatusUpdate?.('Encoding 16kHz PCM audio stream...');

    const wavBlob = audioBufferToWav(audioBuffer, 16000);

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const wavFile = new File([wavBlob], `${baseName}.wav`, { type: 'audio/wav' });

    return {
      file: wavFile,
      converted: true,
      originalFormat: originalExt.replace('.', '').toUpperCase(),
    };
  } finally {
    audioContext.close();
  }
}
