import os
import uuid
import shutil
import asyncio
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_service import run_inference

app = FastAPI(title="Sonara Audio Forensics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

# Store job info in memory (not for prod)
jobs = {}

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac", ".webm", ".wma"}

@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    filename_lower = file.filename.lower()
    ext = os.path.splitext(filename_lower)[1]
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format '{ext}'. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
        
    job_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jobs[job_id] = {
        "status": "pending",
        "file_path": file_path,
        "filename": file.filename,
        "format": ext.replace(".", "").upper()
    }
    
    return {"job_id": job_id, "filename": file.filename, "format": ext.replace(".", "").upper()}


@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    
    if job_id not in jobs:
        await websocket.send_json({"type": "error", "message": "Job ID not found"})
        await websocket.close()
        return
        
    job_info = jobs[job_id]
    file_path = job_info["file_path"]
    
    async def send_log(msg: str):
        await websocket.send_json({"type": "log", "message": msg})
        
    try:
        # Run inference
        result = await run_inference(file_path, send_log_callback=send_log)
        
        # Send final result
        await websocket.send_json({"type": "result", "data": result})
        
    except WebSocketDisconnect:
        print(f"Client disconnected for job {job_id}")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                print(f"Error cleaning up file: {cleanup_error}")
                
        if job_id in jobs:
            del jobs[job_id]
            
        try:
            await websocket.close()
        except RuntimeError:
            pass # Already closed

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
