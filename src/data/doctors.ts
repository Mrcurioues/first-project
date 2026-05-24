import doc1 from "@/assets/doctor-1.jpg";
import doc2 from "@/assets/doctor-2.jpg";
import doc3 from "@/assets/doctor-3.jpg";

export const doctors = [
  {
    name: "Dr. Arjun Sharma",
    role: "Founder & Chief Dental Surgeon",
    qualifications: "BDS, MDS — Prosthodontics",
    experience: "15+ years",
    image: doc1,
    bio: "Specialist in dental implants and full-mouth rehabilitation. Trained in Mumbai and London.",
    specialties: ["Implants", "Crowns & Bridges", "Smile Design"],
  },
  {
    name: "Dr. Priya Iyer",
    role: "Senior Cosmetic Dentist",
    qualifications: "BDS, MDS — Cosmetic Dentistry",
    experience: "10+ years",
    image: doc2,
    bio: "Known for natural-looking veneers and gentle care for anxious patients.",
    specialties: ["Veneers", "Whitening", "Gum Contouring"],
  },
  {
    name: "Dr. Rohan Mehta",
    role: "Orthodontist",
    qualifications: "BDS, MDS — Orthodontics",
    experience: "8+ years",
    image: doc3,
    bio: "Certified Invisalign provider. Loves making teens & adults smile confidently.",
    specialties: ["Invisalign", "Braces", "Aligners"],
  },
];

import p1 from "@/assets/patient-1.jpg";
import p2 from "@/assets/patient-2.jpg";
import p3 from "@/assets/patient-3.jpg";
import p4 from "@/assets/patient-4.jpg";

export const testimonials = [
  {
    name: "Anjali Verma",
    city: "Delhi",
    image: p1,
    treatment: "Smile Makeover with Veneers",
    quote: "Mujhe apni muskaan pe pehli baar itna confidence aaya hai! The team made me feel like family.",
    rating: 5,
  },
  {
    name: "Sunita Desai",
    city: "Mumbai",
    image: p2,
    treatment: "Teeth Whitening",
    quote: "Single sitting mein dramatic results. Bahut hi clean clinic and humble doctors.",
    rating: 5,
  },
  {
    name: "Ramesh Bhai Patel",
    city: "Ahmedabad",
    image: p3,
    treatment: "Full Dentures",
    quote: "60 ki umar mein phir se khulkar hasna seekha. Bilkul natural lagta hai!",
    rating: 5,
  },
  {
    name: "Aarav Kumar",
    city: "Bengaluru",
    image: p4,
    treatment: "Braces",
    quote: "Doctor sahab ne har step explain kiya. School mein dost bhi impressed hain.",
    rating: 5,
  },
];