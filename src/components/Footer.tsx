import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Mail, Instagram, Facebook } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground mt-20">
      <div className="mx-auto max-w-7xl px-6 py-14 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src={logoImg} alt="Awasthi Dental Clinic Logo" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" />
            <div className="font-display text-xl font-bold">Awasthi Dental</div>
          </div>
          <p className="text-sm opacity-80 mt-2 font-indic">सुंदर मुस्कान, स्वस्थ जीवन</p>
          <p className="text-sm opacity-70 mt-3">Lucknow's most trusted family dental care — blending modern technology with warm Indian hospitality.</p>
        </div>
        <div>
          <div className="font-semibold mb-3">Quick Links</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/doctors">Our Doctors</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Contact</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li className="flex gap-2"><Phone className="w-4 h-4" /><span>+91 99999 99999</span></li>
            <li className="flex gap-2"><Mail className="w-4 h-4" /><span>care@awasthidentalclinic.com</span></li>
            <li className="flex gap-2"><MapPin className="w-4 h-4" /><span>12, MG Road, New Delhi</span></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Follow Us</div>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/awasthi_dental_clinic" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center"><Instagram className="w-4 h-4" /></a>
            <a href="https://www.facebook.com/dr.pnkjAwasthi" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center"><Facebook className="w-4 h-4" /></a>
          </div>
          <p className="text-xs opacity-60 mt-4">Mon–Sat: 9 AM – 9 PM<br/>Sunday: 10 AM – 2 PM</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Awasthi Dental Clinic. Made with ❤️ in India.
      </div>
    </footer>
  );
}