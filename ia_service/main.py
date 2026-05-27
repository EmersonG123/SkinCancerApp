# main.py – Servidor FastAPI para clasificación de lesiones de piel
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn.functional as F
from PIL import Image
import io

from modelo import model, device, transform, class_names

# ── Aplicación FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Skin Lesion Classifier – HAM10000",
    description="Microservicio de clasificación de lesiones cutáneas usando DenseNet201 entrenado con HAM10000",
    version="1.0.0",
)

# ── CORS (para desarrollo) ───────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check ─────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "OK",
        "modelo": "DenseNet201 HAM10000",
        "device": str(device),
        "clases": class_names,
    }

# ── Endpoint de predicción ───────────────────────────────────
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Recibe una imagen de una lesión cutánea y devuelve la clase predicha y confianza.

    Returns:
        { "clase": "mel", "confianza": 84.73 }
    """
    # Validar tipo de archivo
    tipos_permitidos = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
    if file.content_type not in tipos_permitidos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no soportado: {file.content_type}. Use JPEG, PNG, WEBP o BMP."
        )

    try:
        # Leer imagen
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        # Aplicar transformaciones
        x = transform(img).unsqueeze(0).to(device)

        # Inferencia
        with torch.no_grad():
            output = model(x)
            probs  = F.softmax(output, dim=1)
            pred   = torch.argmax(probs, dim=1).item()
            confidence = probs[0][pred].item() * 100

        clase = class_names[pred]

        return {
            "clase":     clase,
            "confianza": round(confidence, 2),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la inferencia: {str(e)}")


# ── Inicio del servidor ──────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🤖 Iniciando microservicio de IA – SkinCancerApp")
    print(f"📊 Clases: {class_names}")
    print("🌐 Escuchando en http://0.0.0.0:8001\n")
    uvicorn.run(app, host="0.0.0.0", port=8001)
