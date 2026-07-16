# modelo.py – Carga del modelo DenseNet201 HAM10000
import os
import gc
import torch
import torch.nn.functional as F
from torchvision import transforms

# ── Optimización de memoria para Render (plan gratuito: 512MB RAM) ────────
torch.set_num_threads(1)
torch.set_num_interop_threads(1)
torch.set_grad_enabled(False)

# ── Dispositivo ──────────────────────────────────────────────────────────
device = torch.device("cpu")  # Render free tier no tiene GPU
print(f"[modelo.py] Usando dispositivo: {device}")

# ── Ruta del modelo ──────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "densenet201_cuantizado.pt")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Modelo no encontrado en: {MODEL_PATH}\n"
        "Asegúrate de ejecutar el script 'quantize_script.py' primero."
    )

# ── Cargar modelo ────────────────────────────────────────────────────────
print(f"[modelo.py] Cargando modelo desde: {MODEL_PATH}")
with torch.no_grad():
    model = torch.load(MODEL_PATH, map_location=device, weights_only=False)

model = model.to(device)
model.eval()

print("[modelo.py] Modelo cuantizado listo para inferencia.")

# ── Clases HAM10000 (orden del entrenamiento) ─────────────────────────────
class_names = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# ── Transformaciones ImageNet ─────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])
