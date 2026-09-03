import time
import json
import random
import asyncio

async def run_inference(audio_path: str, send_log_callback=None) -> dict:
    """
    Mock inference function that simulates real-time processing logs
    and returns a payload matching the expected format.
    """
    
    logs = [
        "Loading audio buffer...",
        "Validating audio format and headers...",
        "Extracting Wav2Vec 2.0 768-D acoustic representations...",
        "Computing Mel-spectrogram transforms...",
        "Identifying speech segments and silences...",
        "Extracting spectral features...",
        "Feeding tensor to classification model...",
        "Computing confidence scores...",
        "Finalizing verdict..."
    ]
    
    start_time = time.time()
    
    for i, msg in enumerate(logs):
        if send_log_callback:
            timestamp = time.strftime("%M:%S", time.gmtime(time.time() - start_time))
            # Format: [00:02.341] Message
            ms = int((time.time() - start_time) * 1000) % 1000
            formatted_msg = f"[{timestamp}.{ms:03d}] {msg}"
            await send_log_callback(formatted_msg)
        
        # Simulate variable processing time (150-400ms stagger as requested)
        await asyncio.sleep(random.uniform(0.15, 0.4))
        
    # Generate mock result
    # Let's say 40% chance of human, 60% chance of spoof for variety
    is_spoof = random.choice([True, True, True, False, False])
    
    confidence = random.uniform(85.0, 99.9) if is_spoof else random.uniform(85.0, 99.9)
    verdict = "spoof" if is_spoof else "human"
    
    # Generate some mock segments (start, end, score)
    segments = [
        {"start": 0.5, "end": 1.2, "score": random.uniform(0.1, 0.9)},
        {"start": 2.1, "end": 3.4, "score": random.uniform(0.1, 0.9)}
    ]
    
    # Generate mock waveform peaks
    waveform_peaks = [random.uniform(-1.0, 1.0) for _ in range(100)]
    
    return {
        "verdict": verdict,
        "confidence": round(confidence, 2),
        "segments": segments,
        "waveform_peaks": waveform_peaks
    }
