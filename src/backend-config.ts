// src/backend-config.ts – Inicializador prioritario de variables de entorno para ESM
import dotenv from "dotenv";
import path from "path";

// Cargar el archivo .env de la carpeta backend de forma síncrona
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

console.log("⚙️ Variables de entorno del backend cargadas con éxito.");
