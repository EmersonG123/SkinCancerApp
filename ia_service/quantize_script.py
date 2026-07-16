import torch
import os

model_path = "densenet201_ham10000_entrenado.pt"
print(f"Cargando {model_path}...")

# Cargar el modelo completo
model = torch.load(model_path, map_location="cpu", weights_only=False)
model.eval()

print("Convirtiendo modelo a Float16 (Mitad de precisión)...")
# Convertir todos los pesos a 16 bits
model_fp16 = model.half()

output_path = "densenet201_cuantizado.pt"
print(f"Guardando modelo más liviano en {output_path}...")
torch.save(model_fp16, output_path)

print(f"Original size: {os.path.getsize(model_path) / 1024 / 1024:.2f} MB")
print(f"New size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
print("Hecho.")
