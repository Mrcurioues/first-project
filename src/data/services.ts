import { Sparkles, Stethoscope, Smile, Crown, Wrench, Baby } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import imgGeneral from "@/assets/Scaling & Polishing.jpg";
import imgRestorative from "@/assets/Root Canal Treatment (RCT).jpg";
import imgOrtho from "@/assets/Braces.jpg";
import imgCosmetic from "@/assets/Teeth Whitening.jpg";
import imgSurgical from "@/assets/Dental Implants.jpg";
import imgPediatric from "@/assets/Baby Root Canal Treatment.jpeg";

export type ServiceItem = { name: string; description: string; slug: string };
export type ServiceCategory = {
  category: string;
  icon: LucideIcon;
  tagline: string;
  image: string;
  summary: string;
  doctorName: string;
  items: ServiceItem[];
};

export const services: ServiceCategory[] = [
  {
    category: "General & Preventive Care",
    icon: Stethoscope,
    tagline: "Healthy smiles start here",
    image: imgGeneral,
    summary:
      "Routine check-ups, professional cleanings and digital X-rays form the foundation of lifelong oral health. We catch cavities, gum issues and decay early — long before they become painful or expensive. Ideal for the whole family, every six months.",
    doctorName: "Dr. Arjun Sharma",
    items: [
      { slug: "scaling-and-polishing", name: "Scaling & Polishing (Teeth Cleaning)", description: "Ultrasonic teeth cleaning to remove plaque, tartar and stains for fresh breath and pink, healthy gums." },
      { slug: "dental-fillings", name: "Dental Fillings", description: "Tooth-coloured composite fillings restore cavities seamlessly and painlessly in a single visit." },
      { slug: "oral-exam-and-x-rays", name: "Oral Exam & X-rays", description: "Full-mouth checkup with low-radiation digital X-rays for accurate, early problem detection." },
    ],
  },
  {
    category: "Restorative Treatments",
    icon: Wrench,
    tagline: "Bring back your natural bite",
    image: imgRestorative,
    summary:
      "Damaged, decayed or missing teeth are rebuilt using painless, modern techniques. From single-sitting root canals to ceramic crowns and lifelike dentures, we restore both function and appearance. Eat, smile and speak with full confidence again.",
    doctorName: "Dr. Arjun Sharma",
    items: [
      { slug: "root-canal-treatment", name: "Root Canal Treatment (RCT)", description: "Painless single-sitting RCT with rotary endodontics to save your natural tooth from extraction." },
      { slug: "crowns-and-bridges", name: "Crowns & Bridges (Caps)", description: "Durable zirconia and E-max ceramic crowns crafted in-house to perfectly match your smile." },
      { slug: "dentures", name: "Dentures", description: "Custom-fit removable, fixed and implant-supported dentures for total chewing comfort." },
    ],
  },
  {
    category: "Orthodontics",
    icon: Smile,
    tagline: "Straighten with confidence",
    image: imgOrtho,
    summary:
      "Crooked, gapped or crowded teeth are gently guided into perfect alignment. We offer everything from traditional metal braces to nearly invisible clear aligners for kids, teens and working adults. Most cases finish in 12–18 months.",
    doctorName: "Dr. Rohan Mehta",
    items: [
      { slug: "braces", name: "Braces", description: "Metal, ceramic and self-ligating braces for kids, teens and adults at affordable EMI." },
      { slug: "invisalign-aligners", name: "Invisalign / Aligners", description: "Nearly invisible clear aligners — straighten teeth discreetly without anyone noticing." },
    ],
  },
  {
    category: "Cosmetic Dentistry",
    icon: Sparkles,
    tagline: "Designer smiles, made for you",
    image: imgCosmetic,
    summary:
      "Transform your smile for that wedding, interview or special moment. Our smile makeovers combine whitening, veneers and gum reshaping to deliver a balanced, photo-ready look. Results you can see — and feel — in just one or two visits.",
    doctorName: "Dr. Priya Iyer",
    items: [
      { slug: "teeth-whitening", name: "Teeth Whitening", description: "In-clinic laser whitening and take-home kits for a brighter shade in under one hour." },
      { slug: "veneers", name: "Veneers", description: "Ultra-thin porcelain veneers for a flawless, Bollywood-perfect smile." },
      { slug: "gum-contouring", name: "Gum Contouring", description: "Painless laser reshaping of uneven gum lines for a balanced, confident smile." },
    ],
  },
  {
    category: "Surgical Procedures",
    icon: Crown,
    tagline: "Expert hands, gentle care",
    image: imgSurgical,
    summary:
      "From simple extractions to advanced implant placement, our oral surgeons use sterile, minimally-invasive techniques. Most procedures are completed under local anaesthesia with same-day recovery. Sedation options are available for anxious patients.",
    doctorName: "Dr. Arjun Sharma",
    items: [
      { slug: "tooth-extraction", name: "Tooth Extraction", description: "Safe, painless removal — including impacted wisdom teeth surgery under local anaesthesia." },
      { slug: "dental-implants", name: "Dental Implants", description: "Premium titanium implants that look, feel and function exactly like natural teeth." },
    ],
  },
  {
    category: "Pediatric Dentistry",
    icon: Baby,
    tagline: "Gentle care for little smiles",
    image: imgPediatric,
    summary:
      "Specialized dental care for children, focusing on preventive treatments and a stress-free environment. We make sure your child's first visits are positive, laying the foundation for a lifetime of healthy teeth.",
    doctorName: "Dr. Priya Iyer",
    items: [
      { slug: "pit-and-fissure-sealants", name: "Pit & Fissure Sealants for Children", description: "Protective coatings applied to the chewing surfaces of back teeth to prevent cavities." },
      { slug: "baby-root-canal-treatment", name: "Baby Root Canal (Pulpotomy)", description: "Painless treatment to save infected baby teeth, preventing space loss and future alignment issues." },
      { slug: "fluoride-treatment-for-kids", name: "Fluoride Treatment for Kids", description: "Strengthening enamel to make teeth more resistant to decay and early stage cavities." },
    ],
  },
];

export const SERVICE_PRICES: Record<string, string> = {
  // General & Preventive
  "scaling-and-polishing": "₹1,000 onwards",
  "dental-fillings": "₹1,200 onwards",
  "oral-exam-and-x-rays": "₹300 onwards",

  // Restorative
  "root-canal-treatment": "₹3,500 onwards",
  "crowns-and-bridges": "₹4,500 onwards",
  "dentures": "₹10,000 onwards",

  // Orthodontics
  "braces": "₹25,000 onwards",
  "invisalign-aligners": "₹60,000 onwards",

  // Cosmetic
  "teeth-whitening": "₹5,000 onwards",
  "veneers": "₹8,000 onwards",
  "gum-contouring": "₹3,000 onwards",

  // Surgical
  "tooth-extraction": "₹1,000 onwards",
  "dental-implants": "₹20,000 onwards",

  // Pediatric
  "pit-and-fissure-sealants": "₹1,200 onwards",
  "baby-root-canal-treatment": "₹2,500 onwards",
  "fluoride-treatment-for-kids": "₹1,000 onwards",
};

export function getServicePrice(slug: string): string {
  return SERVICE_PRICES[slug] || "₹500 onwards";
}

