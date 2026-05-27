import { DiagnosticRecord } from "./types";

export const DOCTOR_PORTRAIT_URL = 
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDHSOU-i0_TTn6AZnSowrgFgUQhntCXBqtBMRHbPxVVilvECZFlaEIv3CZ1m_5thasB-Is7fzUs4AdTOunJEFGjbCHI6Rt9R_RCvCGxScYusLtygBCu6osG4VOiXYu5E-TwcEtLOXJn7dLJaR_I-tqJKxj7sft_Iy8Cm2ZhdYLPKCERdhgczvVMlxY4es8u18HHra2mf1depQvhtTko7CTdEVPLZWpGRc7rGKvJZyfynOuByY2OGLghRMgJumeVq9KBcF8d2Evcj_ns";

export const PREVIEW_IMAGE_URL = 
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDguhnVn_l7VFbJtVukO7YHAPjTfIgslJNAiFR9IjRcxz-_LvpXoxC7nZymDJ8IebS9o6UPTrDDaEf8cacguTLqps3VGJJbHHpETp3sNmmJvridNAXpPChGVzMA5_ppLc4hPWU_cT73PsFA7nTYgaTbnX-UHOpOkvVY6FNkOnqqYscSb07hVfyMEQ_SPLTvt_ygld5UM7j0LBcCeD-ds9mZXGp9cFmV3xJLnGxtpIye-fSaSwbRm9LN5gxJIqzYsM--owUcOswNb9ut";

export const INITIAL_RECORDS: DiagnosticRecord[] = [
  {
    id: "8921",
    nombre_amigable: "Melanoma Sospechoso",
    clave: "mel",
    codigo_icd10: "C43.9",
    nivel_riesgo: "alto",
    confianza: 94.2,
    explicacion: "La imagen presenta bordes irregulares, asimetría marcada y policromía (variación de tonos marrones y negros), patrones altamente asociados con lesiones melanocíticas malignas según el protocolo ABCDE.",
    recomendacion: [
      "Remisión urgente a dermatología para biopsia escisional primaria.",
      "Realizar dermatoscopia digital integral de control.",
      "Evitar exposición solar directa en la zona e instruir autoexploración."
    ],
    aviso_legal: "AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado antes de proceder con cualquier tratamiento.",
    fecha: "24 de Oct, 2024",
    imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJdhfAXnuVUbxjqbU2WDXYWAXKNFbwjMYOsu3rm34JlhnqQfrhowQurcJVXSxzieshBnA0sish6o59-M3_K34-nro77bvYKMcL6nNfPvAFPx2b7CvY_3ftKDH2bQyB-c-geualz7bU0PvRu9n5qTB0EpPnB5okfoFhZQK7VvlZNCLRSZyfPLlkNmKmlN7t2Km0v-2l8KOf2UD_FNSWvLe2X3l7d7xhZ_Ahre13_4AIqIUWPnzwmJmVI_gSBmJVZRGmbGEIeb1vnRqh"
  },
  {
    id: "8845",
    nombre_amigable: "Nevus Benigno",
    clave: "nv",
    codigo_icd10: "D22.9",
    nivel_riesgo: "bajo",
    confianza: 98.4,
    explicacion: "Mácula simétrica circular, uniforme de contornos nítidos y coloración homogénea marrón clara. Sin signos observables de atipia estructural ni desorganización reticular.",
    recomendacion: [
      "Monitoreo clínico regular de carácter anual por dermatólogo.",
      "Instruir al paciente sobre autoexploración periódica preventiva.",
      "Emplear fotoprotectores con factor de protección solar (FPS) adecuado."
    ],
    aviso_legal: "AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado antes de proceder con cualquier tratamiento.",
    fecha: "18 de Oct, 2024",
    imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsw1WYWTqgORdTJIQu7rHgmNTZeVrmPJuyDgnlw_H42CUtQzmuOur3FPDqlOggRrT0lkBlJ-ryFL6ptX4VEIWBoGTGbimpoZ-krUHW9Mi9KcyltlVi9EmXmrH1Il2nZBXobMDp6tW-nVo6jlfdurYEicD4JfT6gi60QcYpdeVrc_-_OOCp5FSoIg32ah_YVMSjQY1meb10cX43ncB0F8kpgUTboIy0deagsYmIKUkbevmdyqYakTuWt0r2R_looPGBRXQ8oWtcboPw"
  },
  {
    id: "8701",
    nombre_amigable: "Queratosis Seborreica",
    clave: "bkl",
    codigo_icd10: "L82.0",
    nivel_riesgo: "moderado",
    confianza: 87.5,
    explicacion: "Lesión benigna no malignizante de aspecto 'adherido' o verrugoso, con tapones queratósicos cobrizos uniformes evidentes. Presenta bajo riesgo pero puede irritarse con el roce de prendas.",
    recomendacion: [
      "Revisión dermatológica opcional para reconfirmación histológica.",
      "Extirpación selectiva por crioterapia si causa prurito o sangrado accidental por roce.",
      "Monitorear asiduamente la aparición de dolor o ulceración localizada."
    ],
    aviso_legal: "AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado antes de proceder con cualquier tratamiento.",
    fecha: "12 de Oct, 2024",
    imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmI4q5DsWRKkGVruRPKCml9xReRgEN6Zp2FOnNNzZxifQGztI7u6m46FQ3rJjnrzap1lIQKuz-Mj3YJ9fhmhjyFsa0kY9RTRLXWf-wvT68ETk2AaR9gptrl_HW7xWVvccoMnIhxr-VYFzjnHEETM7rjQSmyzzM3tca8GK7h3T6G9zQufe8T7gykx5TpWSZxf7CJpztNDz30PUTrFlHtJo4IJXd1K8Z4tH8TBDT9XIKr_dUTdfO2tiMIsQsFU8Q3wHfD8myf4RgPFuU"
  }
];
