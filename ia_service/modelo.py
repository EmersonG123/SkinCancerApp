# modelo.py – Carga del modelo DenseNet201 HAM10000
import os
# pyrefly: ignore [missing-import]
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

# ── Dispositivo ──────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[modelo.py] Usando dispositivo: {device}")

# ── Ruta del modelo ──────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "densenet201_ham10000_entrenado.pt")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Modelo no encontrado en: {MODEL_PATH}\n"
        "Coloque el archivo 'densenet201_ham10000_entrenado.pt' en la carpeta ia_service/"
    )

# ── Cargar modelo ────────────────────────────────────────────
print(f"[modelo.py] Cargando modelo desde: {MODEL_PATH}")
model = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False,
)
model = model.to(device)
model.eval()
print("[modelo.py] Modelo cargado y listo para inferencia.")

# ── Clases HAM10000 (orden del entrenamiento) ─────────────────
class_names = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# ── Transformaciones ImageNet ─────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])
