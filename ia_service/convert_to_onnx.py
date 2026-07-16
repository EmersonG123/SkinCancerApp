import torch
import os

model_path = "densenet201_cuantizado.pt"  # O el original densenet201_ham10000_entrenado.pt
print(f"Cargando {model_path}...")

# Cargar el modelo (asegúrate de cargar el que tengas disponible)
try:
    model = torch.load(model_path, map_location="cpu", weights_only=False)
except:
    model = torch.load("densenet201_ham10000_entrenado.pt", map_location="cpu", weights_only=False)
    
model.eval()

# Si el modelo está en float16, lo regresamos a float32 para la exportación ONNX básica
model = model.float()

print("Convirtiendo a formato ONNX...")
# Crear un tensor de entrada ficticio con el tamaño que espera el modelo (1 imagen, 3 canales RGB, 224x224)
dummy_input = torch.randn(1, 3, 224, 224, device="cpu")

output_path = "modelo.onnx"
torch.onnx.export(
    model, 
    dummy_input, 
    output_path,
    export_params=True,
    opset_version=14,          # Versión estándar de operaciones
    do_constant_folding=True,  # Optimiza el modelo internamente
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)

print(f"Original size: {os.path.getsize('densenet201_ham10000_entrenado.pt') / 1024 / 1024:.2f} MB")
print(f"ONNX size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
print("Hecho. Ahora puedes usar ONNX Runtime.")
