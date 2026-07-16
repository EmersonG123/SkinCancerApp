# main.py – Servidor FastAPI para clasificación de lesiones de piel (ONNX)
import os
import gc
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import onnxruntime as ort
# ── Clases HAM10000 ──────────────────────────────────────────
class_names = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# ── Cargar Modelo ONNX ───────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "modelo.onnx")
ort_session = None

if not os.path.exists(MODEL_PATH):
    print("ADVERTENCIA: modelo.onnx no encontrado en el servidor.")
else:
    ort_session = ort.InferenceSession(MODEL_PATH)

# ── Utilidades de Preprocesamiento ───────────────────────────
def preprocess_image(img: Image.Image) -> np.ndarray:
    # Resize a 224x224
    img = img.resize((224, 224), Image.Resampling.BILINEAR)
    # Convertir a arreglo numpy y escalar a [0, 1]
    img_array = np.array(img).astype(np.float32) / 255.0
    
    # Normalización de ImageNet: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std
    
    # Cambiar forma de (H, W, C) a (C, H, W)
    img_array = np.transpose(img_array, (2, 0, 1))
    # Añadir dimensión de batch: (1, C, H, W)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=1, keepdims=True)

# ── Aplicación FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Skin Lesion Classifier – HAM10000",
    description="Microservicio usando ONNX Runtime",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "OK", "servicio": "SkinCancerApp IA Service (ONNX)"}

@app.get("/health")
def health():
    return {"status": "OK", "modelo": "ONNX HAM10000", "clases": class_names}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    tipos_permitidos = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
    if file.content_type not in tipos_permitidos:
        raise HTTPException(status_code=400, detail="Tipo de archivo no soportado.")

    try:
        if ort_session is None:
            raise HTTPException(status_code=500, detail="El modelo ONNX no se encontró en el servidor.")
            
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Preprocesar
        input_array = preprocess_image(img)
        
        # Inferencia con ONNX
        ort_inputs = {ort_session.get_inputs()[0].name: input_array}
        ort_outs = ort_session.run(None, ort_inputs)
        
        # Postprocesamiento
        logits = ort_outs[0]
        probs = softmax(logits)[0]
        pred_idx = np.argmax(probs)
        confidence = float(probs[pred_idx] * 100)
        
        clase = class_names[pred_idx]
        
        gc.collect()
        return {"clase": clase, "confianza": round(confidence, 2)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en inferencia: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
