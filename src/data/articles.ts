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

import implant3 from "@/assets/implant-3.jpg";
import implant4 from "@/assets/implant-4.jpg";
import imgBabyRCT from "@/assets/Baby Root Canal Treatment.jpeg";
import imgFluoride from "@/assets/Fluoride Treatment for Kids.jpg";
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type GalleryImg = { src: string; alt: string; caption: string };

export type Article = {
  slug: string;
  title: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  hero: string;
  lead: string;
  body: Block[];
  gallery?: GalleryImg[];
  ctaService: string;
};

const p = (text: string): Block => ({ type: "p", text });
const h = (text: string): Block => ({ type: "h2", text });
const ul = (items: string[]): Block => ({ type: "ul", items });

export const articles: Article[] = [
  {
    slug: "scaling-and-polishing",
    title: "Scaling & Polishing (Teeth Cleaning)",
    category: "General & Preventive Care",
    metaTitle: "Scaling & Polishing (Teeth Cleaning) — Awasthi Dental Clinic",
    metaDescription: "Professional ultrasonic scaling and polishing for healthy gums, fresh breath and brighter teeth. Painless, safe, every 6 months.",
    hero: imgScaling,
    lead: "Scaling and polishing is one of the most important preventive dental treatments that helps maintain healthy teeth and gums. Even if you brush regularly, plaque and tartar can still build up in hard-to-reach areas — leading to gum infection, bad breath, decay and bleeding gums. Professional cleaning keeps your smile fresh and healthy.",
    ctaService: "General & Preventive Care",
    body: [
      p("Scaling is the process of removing plaque, tartar, and bacteria from the surface of the teeth and below the gum line using specialised dental instruments. Polishing is done after scaling to smooth the tooth surface and remove stains, making the teeth cleaner and shinier."),
      p("At our dental clinic, we use modern ultrasonic scaling technology that provides gentle and effective cleaning. Before beginning the procedure, our dentist carefully examines your oral condition and checks for plaque buildup, gum inflammation, and any signs of dental problems."),
      p("During the treatment, ultrasonic instruments are used to remove hardened tartar deposits safely and comfortably. Once the scaling is complete, polishing is done using a special paste that helps remove stains caused by tea, coffee, smoking, or certain foods."),
      p("Many patients worry that teeth cleaning may damage their teeth, but professional scaling and polishing are completely safe when performed by trained dental professionals. The procedure is generally painless, although patients with sensitive gums may feel slight discomfort for a short time."),
      h("Benefits of scaling & polishing"),
      ul([
        "Fresher breath and a cleaner mouth feel",
        "Healthier, pink gums with reduced bleeding",
        "Reduced risk of cavities and gum disease",
        "Brighter, stain-free teeth",
        "Better overall oral hygiene",
      ]),
      p("We usually recommend professional teeth cleaning every 6 months, depending on the patient's oral condition. Patients with gum disease or heavy tartar buildup may require more frequent cleanings."),
      p("Our goal is to provide comfortable and stress-free dental care while helping patients maintain healthy smiles for life. We focus on hygiene, advanced treatment methods, and patient education so you can enjoy strong teeth and healthy gums for years to come."),
    ],
  },
  {
    slug: "dental-fillings",
    title: "Dental Fillings",
    category: "General & Preventive Care",
    metaTitle: "Dental Fillings — Tooth-Coloured Composite | Awasthi Dental",
    metaDescription: "Painless tooth-coloured composite fillings to repair cavities and restore tooth strength. Single-visit treatment with natural appearance.",
    hero: imgFillings,
    lead: "Dental fillings are a common restorative treatment used to repair teeth damaged by cavities, minor fractures, or wear. Tooth decay is one of the most common dental problems and, if left untreated, can lead to severe pain, infection and even tooth loss. Fillings restore strength, shape and function while preventing further decay.",
    ctaService: "General & Preventive Care",
    body: [
      p("A cavity forms when bacteria in the mouth produce acids that damage the tooth enamel. Early treatment with fillings prevents the decay from spreading deeper into the tooth."),
      h("Signs you may need a filling"),
      ul([
        "Tooth sensitivity to hot, cold or sweet foods",
        "Pain while chewing",
        "Visible holes or dark spots on teeth",
        "Food regularly getting stuck in certain areas",
      ]),
      p("At our dental clinic, we begin the treatment with a detailed examination of the affected tooth. In some cases, digital X-rays are taken to determine the extent of decay."),
      p("The dentist first removes the decayed portion of the tooth using modern dental instruments. Once the cavity is cleaned properly, a filling material is placed into the tooth to restore its original shape and strength."),
      p("We mainly use tooth-coloured composite fillings that match the natural shade of your teeth. These fillings provide excellent aesthetics and durability while maintaining a natural appearance."),
      p("After placing the filling, the dentist shapes and polishes it carefully to ensure a comfortable bite and smooth finish. The procedure is generally painless because local anaesthesia is used when necessary, and most patients return to their normal routine immediately after treatment."),
      h("Benefits of dental fillings"),
      ul([
        "Stops tooth decay from spreading",
        "Protects and preserves the natural tooth",
        "Restores comfortable chewing ability",
        "Improves appearance with tooth-coloured material",
        "Prevents future damage and infection",
      ]),
      p("Good oral hygiene, regular brushing, flossing, and routine dental checkups help increase the lifespan of dental fillings. Our clinic focuses on painless treatment, patient comfort and long-lasting restorations using high-quality materials and advanced techniques."),
    ],
  },
  {
    slug: "oral-exam-and-x-rays",
    title: "Oral Exam & X-rays",
    category: "General & Preventive Care",
    metaTitle: "Oral Examination & Digital X-rays — Awasthi Dental Clinic",
    metaDescription: "Comprehensive oral exam with low-radiation digital X-rays for early detection of cavities, gum disease and hidden dental problems.",
    hero: imgExam,
    lead: "Regular oral examinations and dental X-rays are essential for maintaining healthy teeth and gums. Many dental problems begin silently without noticeable symptoms — early detection is the key to preventing major complications in the future.",
    ctaService: "General & Preventive Care",
    body: [
      p("An oral examination allows the dentist to evaluate your overall oral health and identify problems such as cavities, gum disease, infections, tooth wear, alignment issues and oral hygiene concerns."),
      p("During a routine dental checkup, our dentist carefully examines your teeth, gums, tongue, jaw and surrounding oral tissues. We also check for signs of decay, gum inflammation, plaque buildup and any hidden dental concerns."),
      p("In many cases, dental X-rays are recommended because some problems cannot be seen with the naked eye. X-rays help detect hidden cavities, root infections, impacted teeth, bone loss and wisdom tooth problems."),
      p("At our clinic, we use advanced digital X-ray technology that provides clear images with minimal radiation exposure. Digital X-rays are safe, quick, and highly effective in diagnosing dental conditions accurately. The process is simple and comfortable — the patient bites gently on a small sensor while images are captured within seconds."),
      h("Why preventive checkups matter"),
      ul([
        "Detect problems at their earliest, most treatable stage",
        "Significantly reduce future treatment costs",
        "Prevent severe infections and tooth loss",
        "Maintain long-term oral and overall health",
      ]),
      p("Many patients visit the dentist only when they feel pain, but preventive dental care is always better than emergency treatment. Early diagnosis can help save teeth and avoid complex procedures later. We generally recommend oral examinations every 6 months, even if there are no symptoms."),
      p("Our clinic believes in preventive dentistry and patient education. We focus on creating a comfortable environment where patients feel relaxed while receiving complete dental care and guidance for maintaining healthy smiles."),
    ],
  },
  {
    slug: "root-canal-treatment",
    title: "Root Canal Treatment (RCT)",
    category: "Restorative Treatments",
    metaTitle: "Root Canal Treatment (RCT) — Painless Single-Sitting | Awasthi Dental",
    metaDescription: "Modern, painless root canal treatment to save infected teeth. Advanced rotary endodontics, completed in single or multiple sittings.",
    hero: imgRCT,
    lead: "Root Canal Treatment, commonly called RCT, is a dental procedure used to save a severely infected or damaged tooth. Many people fear root canal treatment because they believe it is painful, but modern dental technology has made the procedure comfortable, safe and highly effective.",
    ctaService: "Restorative Treatments",
    body: [
      p("Inside every tooth is a soft tissue called pulp, which contains nerves and blood vessels. When this pulp becomes infected due to deep cavities, cracks, trauma or repeated dental procedures, it can cause severe pain and swelling."),
      h("Symptoms that may indicate the need for an RCT"),
      ul([
        "Severe, lingering toothache",
        "Sharp sensitivity to hot or cold foods",
        "Swelling or tenderness in the gums",
        "Pain while chewing or biting down",
        "Discoloration or darkening of the tooth",
      ]),
      p("At our clinic, treatment begins with a detailed examination and digital X-rays to determine the extent of infection. The procedure is performed under local anaesthesia to ensure patient comfort. The dentist creates a small opening in the tooth and carefully removes the infected pulp tissue."),
      p("After removing the infection, the root canals are cleaned, disinfected and shaped using advanced rotary instruments. Once cleaned properly, the canals are sealed with a special filling material to prevent future infection. In most cases, a dental crown is recommended after RCT because the treated tooth may become weak over time."),
      p("The main advantage of root canal treatment is that it saves the natural tooth instead of removing it. Preserving natural teeth helps maintain proper chewing function and jaw alignment."),
      p("Patients usually experience relief from pain after the treatment. Mild discomfort for a few days is normal and can be managed with medications. Our clinic uses modern equipment and advanced techniques to make root canal procedures comfortable and successful."),
    ],
  },
  {
    slug: "crowns-and-bridges",
    title: "Crowns & Bridges (Caps)",
    category: "Restorative Treatments",
    metaTitle: "Dental Crowns & Bridges (Caps) — Zirconia & Ceramic | Awasthi Dental",
    metaDescription: "Custom-made zirconia, ceramic and metal-ceramic crowns and bridges to restore damaged or missing teeth with natural-looking results.",
    hero: imgCrowns,
    lead: "Dental crowns and bridges are restorative treatments used to repair damaged teeth and replace missing teeth. They restore chewing ability, improve appearance and protect weakened teeth.",
    ctaService: "Restorative Treatments",
    body: [
      p("A dental crown, commonly known as a cap, is placed over a damaged or weak tooth to restore its strength, shape and function. Crowns are often recommended after root canal treatment, large cavities, fractures or worn-down teeth."),
      p("A dental bridge is used to replace one or more missing teeth. It fills the gap by using nearby teeth as support."),
      p("At our clinic, the process begins with a complete oral examination. The dentist evaluates the condition of the teeth and recommends the most suitable type of crown or bridge."),
      p("For crown placement, the tooth is prepared by reshaping it slightly to ensure a proper fit. Impressions or digital scans are then taken to create a custom-made crown. Once the permanent crown or bridge is ready, it is fixed securely using dental cement."),
      h("Types of crowns we offer"),
      ul([
        "Zirconia crowns — extremely strong and natural-looking",
        "Full ceramic (E-max) crowns — best aesthetics for front teeth",
        "Metal-ceramic crowns — durable and budget-friendly",
      ]),
      h("Benefits of crowns & bridges"),
      ul([
        "Restore damaged or broken teeth",
        "Improve smile appearance",
        "Support natural chewing function",
        "Prevent neighbouring teeth from shifting",
        "Protect weak teeth from further damage",
      ]),
      p("With proper care and regular dental visits, crowns and bridges can last for many years. Our clinic focuses on precision, comfort and natural-looking results using high-quality materials and modern dental technology."),
    ],
  },
  {
    slug: "dentures",
    title: "Dentures",
    category: "Restorative Treatments",
    metaTitle: "Complete & Partial Dentures — Comfortable Custom Fit | Awasthi Dental",
    metaDescription: "Natural-looking complete and partial dentures custom-made for comfort, clear speech and confident chewing. Modern materials, perfect fit.",
    hero: imgDentures,
    lead: "Dentures are removable dental appliances used to replace missing teeth and surrounding tissues. They help patients regain their ability to eat, speak and smile confidently.",
    ctaService: "Restorative Treatments",
    body: [
      p("Missing teeth can affect appearance, chewing ability, speech and overall confidence. Dentures provide an affordable and effective solution for restoring oral function."),
      h("Two main types of dentures"),
      ul([
        "Complete Dentures — used when all teeth are missing",
        "Partial Dentures — used when some natural teeth are still present",
      ]),
      p("At our clinic, denture treatment begins with a detailed oral examination. The dentist evaluates the condition of the gums, jawbone and remaining teeth. Precise impressions of the mouth are taken to create custom-made dentures that fit comfortably and look natural."),
      p("In many cases, trial dentures are tested first to check appearance, bite alignment and comfort before final placement. Modern dentures are designed to look more natural and provide better comfort than traditional dentures."),
      p("Patients may need a short adjustment period while getting used to wearing dentures. Our team provides complete guidance on how to use, clean and maintain dentures properly."),
      h("Benefits of dentures"),
      ul([
        "Improved chewing ability",
        "Clearer speech",
        "Enhanced facial appearance",
        "Support for facial muscles",
        "Restored confidence",
      ]),
      p("Proper cleaning and regular dental checkups are important to maintain denture hygiene and durability. Our clinic focuses on patient comfort and personalised care so you can enjoy daily life with confidence."),
    ],
  },
  {
    slug: "braces",
    title: "Braces",
    category: "Orthodontics",
    metaTitle: "Dental Braces — Metal, Ceramic & Self-Ligating | Awasthi Dental",
    metaDescription: "Affordable metal, ceramic and self-ligating braces for kids, teens and adults. Straighten crooked teeth and fix bite issues in 12–24 months.",
    hero: imgBraces,
    lead: "Braces are orthodontic appliances used to correct crooked teeth, spacing issues, bite problems and jaw alignment. Properly aligned teeth not only improve appearance but also help maintain better oral health.",
    ctaService: "Orthodontics",
    body: [
      p("Many people experience dental alignment issues such as crowded teeth, gaps between teeth, overbite, underbite or crossbite. Braces gradually move the teeth into the correct position using controlled pressure."),
      p("At our clinic, orthodontic treatment begins with a detailed consultation and examination. Digital X-rays, photographs and scans may be taken to understand the alignment problem and create a customised treatment plan."),
      p("Braces consist of brackets attached to the teeth and wires that guide the teeth into proper alignment over time."),
      h("Types of braces available"),
      ul([
        "Metal Braces — most affordable and effective",
        "Ceramic Braces — tooth-coloured, less visible",
        "Self-Ligating Braces — fewer adjustments, faster results",
      ]),
      p("The treatment duration varies depending on the complexity of the case, but most treatments take between 12 to 24 months. Patients usually visit the clinic regularly for adjustments and progress monitoring."),
      h("Benefits of braces"),
      ul([
        "Improved smile appearance",
        "Better chewing ability",
        "Easier cleaning of teeth",
        "Improved jaw alignment and bite",
      ]),
      p("Mild discomfort is normal after adjustments, but it usually disappears within a few days. Maintaining good oral hygiene during orthodontic treatment is very important — patients should brush carefully, avoid sticky foods and attend regular checkups."),
      p("Our clinic focuses on personalised orthodontic care using modern techniques to provide comfortable treatment and beautiful smile transformations."),
    ],
  },
  {
    slug: "invisalign-aligners",
    title: "Invisalign / Aligners",
    category: "Orthodontics",
    metaTitle: "Invisalign & Clear Aligners — Invisible Teeth Straightening | Awasthi Dental",
    metaDescription: "Nearly invisible clear aligners (Invisalign) straighten teeth comfortably without metal braces. Removable, easy to clean, perfect for adults.",
    hero: imgInvisalign,
    lead: "Clear aligners, commonly known as Invisalign or transparent aligners, are modern orthodontic treatments used to straighten teeth without traditional braces. Aligners are clear, removable trays custom-made to gradually move teeth into proper alignment.",
    ctaService: "Orthodontics",
    body: [
      p("This treatment is popular among teenagers and adults because the aligners are nearly invisible and more comfortable than traditional braces."),
      p("At our clinic, treatment begins with digital scans and detailed smile analysis. Using advanced technology, we create a customised treatment plan that shows the expected movement of teeth."),
      p("Patients receive a series of aligners that are changed every few weeks as the teeth gradually shift into position. Unlike braces, aligners can be removed while eating, brushing and flossing."),
      p("Clear aligners can treat many orthodontic issues, including crowded teeth, gaps, overbite, underbite and mild to moderate alignment problems."),
      h("Benefits of clear aligners"),
      ul([
        "Nearly invisible appearance",
        "Comfortable, smooth-edged fit",
        "Easy oral hygiene maintenance",
        "Fewer clinic visits required",
        "No food restrictions — remove while eating",
      ]),
      p("Patients must wear aligners for 20–22 hours daily for effective results. Treatment duration depends on the complexity of the case."),
      p("Our clinic uses advanced digital orthodontic planning and patient-focused care to provide safe, effective and aesthetically pleasing smile correction."),
    ],
  },
  {
    slug: "teeth-whitening",
    title: "Teeth Whitening",
    category: "Cosmetic Dentistry",
    metaTitle: "Professional Teeth Whitening — Laser & In-Clinic | Awasthi Dental",
    metaDescription: "Safe, professional teeth whitening to remove stains from coffee, tea and smoking. Brighter shade in a single visit, lasting results.",
    hero: imgWhitening,
    lead: "Teeth whitening is a cosmetic dental treatment used to brighten stained or discoloured teeth and improve smile appearance. Teeth can become yellow or stained due to ageing, tea, coffee, smoking, poor oral hygiene or certain medications.",
    ctaService: "Cosmetic Dentistry",
    body: [
      p("Professional teeth whitening helps remove deep stains safely and effectively."),
      p("At our clinic, the process begins with an oral examination to ensure the teeth and gums are healthy for whitening treatment. A protective layer is applied to protect the gums, and a professional whitening gel is placed on the teeth."),
      p("Advanced whitening technology may be used to activate the whitening gel and enhance results. The treatment is quick, comfortable and usually completed within one or two visits."),
      p("Professional whitening provides faster and safer results compared to home remedies or over-the-counter products."),
      h("Benefits of professional whitening"),
      ul([
        "Visibly brighter, whiter teeth",
        "Improved confidence and youthful smile",
        "Safe for enamel under expert supervision",
        "Quick results in a single visit",
      ]),
      p("Patients are advised to avoid tea, coffee, smoking and colored foods for a short period after treatment. Our clinic focuses on safe cosmetic dentistry using high-quality whitening systems for natural-looking and long-lasting results."),
    ],
  },
  {
    slug: "veneers",
    title: "Veneers",
    category: "Cosmetic Dentistry",
    metaTitle: "Porcelain Veneers — Bollywood-Perfect Smile | Awasthi Dental",
    metaDescription: "Ultra-thin porcelain veneers to fix chipped, stained or uneven teeth. Custom-designed for a flawless, natural-looking smile makeover.",
    hero: imgVeneers,
    lead: "Dental veneers are thin custom-made shells placed on the front surface of teeth to improve their appearance. They are commonly used to correct chipped teeth, stained teeth, gaps, uneven teeth and minor alignment issues.",
    ctaService: "Cosmetic Dentistry",
    body: [
      p("Porcelain veneers are highly popular because they provide a natural appearance and excellent durability."),
      p("At our clinic, treatment begins with a smile consultation where the dentist evaluates the patient's teeth and discusses desired results."),
      p("A small amount of enamel may be removed from the front surface of the teeth to prepare them for veneers. Impressions or digital scans are taken to create customised veneers that match the patient's smile. Once ready, the veneers are bonded securely to the teeth."),
      h("Benefits of veneers"),
      ul([
        "Dramatically improved smile appearance",
        "Excellent stain resistance",
        "Natural translucent aesthetics",
        "Long-lasting and durable results",
      ]),
      p("With proper oral hygiene and regular dental visits, veneers can last for many years. Our clinic focuses on artistic smile design and personalised cosmetic treatment to create beautiful, confident smiles."),
    ],
  },
  {
    slug: "gum-contouring",
    title: "Gum Contouring",
    category: "Cosmetic Dentistry",
    metaTitle: "Laser Gum Contouring — Fix Gummy Smile | Awasthi Dental",
    metaDescription: "Painless laser gum contouring to reshape uneven gum lines and fix gummy smiles. Quick procedure with fast healing and beautiful results.",
    hero: imgGum,
    lead: "Gum contouring is a cosmetic dental procedure used to reshape uneven or excessive gum tissue to improve smile appearance. Some patients have a 'gummy smile' where too much gum is visible, while others have uneven gum lines that affect tooth proportions.",
    ctaService: "Cosmetic Dentistry",
    body: [
      p("Gum contouring helps create a balanced and symmetrical smile."),
      p("At our clinic, treatment begins with smile analysis and gum evaluation. Using advanced laser technology or specialised instruments, excess gum tissue is carefully reshaped to expose more of the tooth surface."),
      p("Laser gum contouring is highly precise and provides faster healing with minimal discomfort."),
      h("Benefits of gum contouring"),
      ul([
        "Improved smile aesthetics",
        "Balanced, symmetrical gum line",
        "Better tooth proportions",
        "Increased confidence",
      ]),
      p("The procedure is generally comfortable and performed under local anaesthesia. Patients may experience mild sensitivity for a few days after treatment."),
      p("Our clinic combines cosmetic expertise with advanced technology to provide safe and natural-looking smile enhancement treatments."),
    ],
  },
  {
    slug: "tooth-extraction",
    title: "Tooth Extraction",
    category: "Surgical Procedures",
    metaTitle: "Painless Tooth Extraction — Wisdom Teeth & More | Awasthi Dental",
    metaDescription: "Safe, painless tooth extraction including impacted wisdom teeth surgery under local anaesthesia. Gentle techniques for fast recovery.",
    hero: imgExtraction,
    lead: "Tooth extraction is a dental procedure performed to remove severely damaged, decayed, infected or impacted teeth. Although dentists always try to save natural teeth whenever possible, extraction may become necessary in certain situations.",
    ctaService: "Surgical Procedures",
    body: [
      h("Common reasons for tooth extraction"),
      ul([
        "Severe tooth decay beyond restoration",
        "Advanced gum disease causing tooth mobility",
        "Impacted wisdom teeth",
        "Broken teeth beyond repair",
        "Overcrowding before orthodontic treatment",
      ]),
      p("At our clinic, the procedure begins with a detailed examination and digital X-rays to understand the tooth position and surrounding structures."),
      p("Local anaesthesia is used to ensure a painless and comfortable procedure. The dentist gently loosens the tooth and removes it carefully. In some complex cases, minor surgical procedures may be required."),
      p("After extraction, patients receive detailed aftercare instructions to support proper healing. It is normal to experience mild swelling or discomfort for a short time after the procedure."),
      p("Following post-treatment instructions such as avoiding smoking, using prescribed medications and maintaining oral hygiene helps ensure faster recovery."),
      p("Our clinic prioritises patient comfort and uses gentle techniques to make tooth extraction procedures safe and stress-free."),
    ],
  },
  {
    slug: "dental-implants",
    title: "Dental Implants",
    category: "Surgical Procedures",
    metaTitle: "Dental Implants — Permanent Tooth Replacement | Awasthi Dental",
    metaDescription: "Premium titanium dental implants that look, feel and function like natural teeth. Advanced 3D planning, lifetime durability, EMI options.",
    hero: imgImplants,
    lead: "Dental implants are one of the most advanced and permanent solutions for replacing missing teeth. An implant is a titanium post placed into the jawbone that acts like an artificial tooth root. Once healed, a crown is attached to restore the appearance and function of the missing tooth.",
    ctaService: "Surgical Procedures",
    gallery: [

      { src: implant4, alt: "Dentist reviewing dental X-ray for implant planning", caption: "Digital planning — 3D CBCT scan ensures precise, safe positioning" },
      { src: implant3, alt: "Happy patient smiling after dental implant treatment", caption: "Result — A confident, natural-looking smile that lasts a lifetime" },
    ],
    body: [
      p("Dental implants look, feel and function very similar to natural teeth."),
      p("At our clinic, treatment begins with a complete oral examination, digital scans and X-rays to evaluate bone condition and treatment suitability."),
      p("The implant is surgically placed into the jawbone under local anaesthesia. Over the next few months, the implant integrates naturally with the bone through a process called osseointegration. After healing is complete, a custom-made crown is attached to the implant."),
      h("Benefits of dental implants"),
      ul([
        "Natural appearance and feel",
        "Improved chewing ability — eat anything you love",
        "Long-lasting, often lifetime solution",
        "Prevention of jawbone loss",
        "Better speech and overall comfort",
      ]),
      p("Unlike removable dentures, implants remain fixed and stable. Good oral hygiene and regular dental checkups are important for maintaining implant health."),
      p("Our clinic uses advanced implant technology, precise planning and patient-focused care to provide durable and successful tooth replacement solutions with natural-looking results."),
    ],
  },
  {
    slug: "pit-and-fissure-sealants",
    title: "Pit & Fissure Sealants for Children",
    category: "Pediatric Dentistry",
    metaTitle: "Pit & Fissure Sealants for Children — Awasthi Dental Clinic",
    metaDescription: "Protective fissure sealants for kids' teeth. Safe, painless cavity prevention coating for chewing surfaces of molars.",
    hero: imgBabyRCT,
    lead: "Pit and fissure sealants are a simple and highly effective preventive dental treatment designed to protect children's teeth from cavities. By sealing the deep grooves and pits on the chewing surfaces of back teeth, sealants act as a protective barrier against food particles and decay-causing bacteria.",
    ctaService: "Pediatric Dentistry",
    body: [
      p("The chewing surfaces of children's molars and premolars have deep pits and fissures that are hard to clean with regular toothbrushing. Food particles and plaque collect in these grooves, making them highly susceptible to decay."),
      p("Dental sealants are thin, safe plastic coatings applied to these chewing surfaces. The procedure is completely painless, quick, and requires no drilling or removal of tooth structure, making it ideal for young children."),
      p("During the visit, our dentist cleans the tooth surface thoroughly, applies a mild conditioning solution to help the sealant bond, and then paints the sealant onto the tooth enamel. A special curing light is used to harden the sealant within seconds."),
      h("Benefits of pit & fissure sealants"),
      ul([
        "Forms a protective shield over vulnerable tooth grooves",
        "Prevents up to 80% of cavities in back teeth",
        "Painless and fast application in a single visit",
        "Durable protection that lasts for several years",
        "Saves children from future dental pain and fillings",
      ]),
      p("We recommend applying sealants as soon as the child's permanent molars erupt, usually around age 6 for the first molars and age 12 for the second molars. Regular checkups ensure the sealants remain intact and continue providing optimal protection."),
    ],
  },
  {
    slug: "baby-root-canal-treatment",
    title: "Baby Root Canal (Pulpotomy)",
    category: "Pediatric Dentistry",
    metaTitle: "Baby Root Canal Treatment (Pulpotomy) for Kids — Awasthi Dental Clinic",
    metaDescription: "Painless baby root canal treatment (pulpotomy) to save infected primary teeth. Protects natural spacing and permanent teeth development.",
    hero: imgBabyRCT,
    lead: "Baby root canal treatment, also known as a pulpotomy, is a specialised pediatric dental procedure used to save a severely decayed or infected baby tooth. Preserving primary teeth is crucial for proper chewing, speech development, and guiding permanent teeth into their correct positions.",
    ctaService: "Pediatric Dentistry",
    body: [
      p("When decay reaches the inner pulp of a baby tooth, it can cause severe pain, swelling, and infection. A pulpotomy removes the infected portion of the pulp while keeping the healthy root pulp alive, preventing the need for extraction."),
      h("Signs your child may need a pulpotomy"),
      ul([
        "Persistent toothache or pain, especially at night",
        "Extreme sensitivity to hot or cold food and drinks",
        "Swelling or redness in the gums surrounding the tooth",
        "Unexplained tooth sensitivity or pain while chewing",
      ]),
      p("At our clinic, we focus on making the treatment comfortable and stress-free for children. We use gentle local anaesthesia to ensure the child feels no pain. The dentist carefully accesses the tooth, removes the decayed structure and infected coronal pulp, applies a therapeutic medication to protect the remaining pulp, and seals the tooth."),
      p("After the pulpotomy, a pediatric crown (often a durable stainless steel or white zirconia crown) is placed over the tooth to restore its strength and protect it from future fractures. The treated baby tooth remains functional until it naturally falls out to make way for the permanent tooth."),
      h("Why saving baby teeth matters"),
      ul([
        "Maintains proper spacing for permanent teeth",
        "Prevents speech difficulties and chewing problems",
        "Avoids alignment issues and the need for complex braces later",
        "Ensures healthy bone and gum development",
      ]),
      p("Our team is highly experienced in gentle child dentistry, focusing on positive, reassuring communication to keep your child relaxed and happy throughout the visit."),
    ],
  },
  {
    slug: "fluoride-treatment-for-kids",
    title: "Fluoride Treatment for Kids",
    category: "Pediatric Dentistry",
    metaTitle: "Fluoride Treatment for Kids — Enamel Strengthening | Awasthi Dental Clinic",
    metaDescription: "Safe and effective professional fluoride varnish treatments for children. Strengthens tooth enamel and prevents cavities in a single quick visit.",
    hero: imgFluoride,
    lead: "Fluoride treatment is a safe, painless, and highly effective preventive procedure that strengthens children's teeth and protects them against decay. By replenishing essential minerals in the tooth enamel, fluoride helps make teeth highly resistant to acid attacks from plaque and sugars.",
    ctaService: "Pediatric Dentistry",
    body: [
      p("As children's teeth develop, the enamel is still maturing and is more susceptible to acid wear and cavities. Professional fluoride applications provide a concentrated boost of minerals that actively rebuilds weakened enamel and stops early-stage decay."),
      p("Our clinic uses a child-friendly fluoride varnish that is gently painted onto the teeth using a tiny brush. The varnish sets quickly upon contact with saliva, forming a sticky layer that slowly releases fluoride into the enamel over several hours."),
      p("The entire application takes only a couple of minutes and is completely tasteless and comfortable for the child. Children can eat and drink soft foods immediately after the appointment, though they should avoid brushing or flossing until the next morning to allow maximum absorption."),
      h("Benefits of fluoride treatment for kids"),
      ul([
        "Actively hardens and strengthens developing enamel",
        "Prevents new cavities and reverses early micro-decay",
        "Completely painless, quick, and non-invasive application",
        "Provides long-lasting protection between dental checkups",
        "Safe and recommended by pediatric dental associations worldwide",
      ]),
      p("We generally recommend professional fluoride treatments every 6 months during routine cleaning visits. For children with a high risk of cavities, more frequent applications may be advised to ensure their smiles remain strong and healthy."),
    ],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);