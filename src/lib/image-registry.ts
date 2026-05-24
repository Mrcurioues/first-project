import implant3 from "@/assets/implant-3.jpg";
import implant4 from "@/assets/implant-4.jpg";
import patient1 from "@/assets/patient-1.jpg";
import patient2 from "@/assets/patient-2.jpg";
import patient3 from "@/assets/patient-3.jpg";
import patient4 from "@/assets/patient-4.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import heroClinic from "@/assets/hero-clinic.jpg";

import imgScaling from "@/assets/Scaling & Polishing.jpg";
import imgFillings from "@/assets/Dental Fillings.jpg";
import imgExam from "@/assets/Oral Exam & X-rays.jpg";
import imgRCT from "@/assets/Root Canal Treatment (RCT).jpg";
import imgCrowns from "@/assets/Crowns & Bridges (Caps).jpg";
import imgDentures from "@/assets/Dentures.jpg";
import imgBraces from "@/assets/Braces.jpg";
import imgInvisalign from "@/assets/Invisalign : Aligners.jpg";
import imgWhitening from "@/assets/Teeth Whitening.jpg";
import imgVeneers from "@/assets/Veneers.jpg";
import imgGum from "@/assets/Gum Contouring.jpg";
import imgExtraction from "@/assets/Tooth Extraction.jpg";
import imgImplants from "@/assets/Dental Implants.jpg";
import imgSealants from "@/assets/Baby Root Canal Treatment.jpeg"; // wait pit and fissure? Let me check list_dir output!
import imgBabyRCT from "@/assets/Baby Root Canal Treatment.jpeg";
import imgFluoride from "@/assets/Fluoride Treatment for Kids.jpg";

// Map content-image keys (stored in DB) → bundled asset URLs.
// Falls back to a transparent placeholder if a key is missing or null.
const PLACEHOLDER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23f1f1f1'/%3E%3C/svg%3E";

const REGISTRY: Record<string, string> = {
  "implant-3": implant3,
  "implant-4": implant4,
  "patient-1": patient1,
  "patient-2": patient2,
  "patient-3": patient3,
  "patient-4": patient4,
  "doctor-1": doctor1,
  "doctor-2": doctor2,
  "doctor-3": doctor3,
  "hero-clinic": heroClinic,

  "Scaling & Polishing": imgScaling,
  "Scaling & Polishing (Teeth Cleaning)": imgScaling,
  "Dental Fillings": imgFillings,
  "Oral Exam & X-rays": imgExam,
  "Root Canal Treatment (RCT)": imgRCT,
  "Crowns & Bridges (Caps)": imgCrowns,
  "Dentures": imgDentures,
  "Braces": imgBraces,
  "Invisalign / Aligners": imgInvisalign,
  "Teeth Whitening": imgWhitening,
  "Veneers": imgVeneers,
  "Gum Contouring": imgGum,
  "Tooth Extraction": imgExtraction,
  "Dental Implants": imgImplants,
  "Pit & Fissure Sealants": imgSealants,
  "Pit & Fissure Sealants for Children": imgSealants,
  "Baby Root Canal Treatment": imgBabyRCT,
  "Baby Root Canal (Pulpotomy)": imgBabyRCT,
  "Fluoride Treatment for Kids": imgFluoride,
};

export function resolveImage(key: string | null | undefined): string {
  if (!key) return PLACEHOLDER;
  // Allow raw URLs to pass through (so staff can later paste a hosted URL).
  if (/^(https?:|data:|\/)/.test(key)) return key;
  return REGISTRY[key] ?? PLACEHOLDER;
}

export const IMAGE_KEYS = Object.keys(REGISTRY);
