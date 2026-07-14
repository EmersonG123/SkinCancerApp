# Referencias Médicas y Tecnológicas - SkinCancerApp

Este documento recopila las principales fuentes de datos, artículos académicos y guías de referencia médica que respaldan el funcionamiento clínico de SkinCancerApp.

---

## 🔬 1. Investigaciones de Visión por Computadora (AI/ML)

- **DenseNet-201 (Densely Connected Convolutional Networks):**
  - *Referencia:* Huang, G., Liu, Z., Van Der Maaten, L., & Weinberger, K. Q. (2017). *Densely connected convolutional networks*. IEEE Conference on Computer Vision and Pattern Recognition (CVPR).
  - *Aplicación:* Red neuronal profunda cargada en el microservicio Python de inferencia para procesar y clasificar imágenes dermatoscópicas en 7 clases.

---

## 📊 2. Datasets de Entrenamiento Dermatológico

- **HAM10000 Dataset:**
  - *Referencia:* Tschandl, P., Rosendahl, C., & Kittler, H. (2018). *The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions*. Scientific Data, 5(1), 1-9.
  - *Aplicación:* Dataset oficial de entrenamiento del modelo `densenet201_ham10000_entrenado.pt` que comprende 10,015 imágenes de dermatoscopia digital para clasificación de lesiones cutáneas pigmentadas.

---

## 🩺 3. Consensos Clínicos de Referencia (Soporte de Decisiones)

El chatbot local y la base relacional de recomendaciones se sustentan en los siguientes consensos:

- **Regla diagnóstica ABCDE (Autoexamen de Melanoma):**
  - *Referencia:* Tsao, H., et al. (2015). *Early detection of melanoma: review of the literature*. Journal of the American Academy of Dermatology.
  - *Uso:* Implementado en las reglas de consulta del chatbot para instruir a los médicos e internos a evaluar asimetría, bordes, color, diámetro y evolución.
- **Directrices de la AAD (American Academy of Dermatology):**
  - *Guía:* *Guidelines of care for the management of primary cutaneous melanoma*.
  - *Uso:* Definición de los tiempos sugeridos de derivación (atención en 24-48h ante sospecha de melanoma alto riesgo) e instrucciones de autoexamen preventivo.
