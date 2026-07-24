export interface QuickLink { label: string; url: string; icon: "list" | "portal" | "pdf" }
export interface Location { city: string; mapUrl: string; }
export interface VideoEntry { url: string; thumbnail: string; }
export interface Videos { form: VideoEntry; motivation: VideoEntry; itinerary: VideoEntry; }
export interface CountryData {
  id: string; name: string; flag: string; flagUrl: string;
  agency: string; agencyColor: string;
  quickLinks: QuickLink[];
  locations: Location[];
  videos: Videos;
  requiredDocs: string[];
  arrangement: string[];
}

export const COUNTRIES: CountryData[] = [
  {
    id: "spain", name: "Spain", flag: "🇪🇸", flagUrl: "https://flagcdn.com/es.svg",
    agency: "BLS International", agencyColor: "bg-red-100 text-red-700 border-red-200",
    quickLinks: [
      { label: "Official Checklist", url: "https://www.exteriores.gob.es/Consulados/cairo/en/ServiciosConsulares/Pages/index.aspx?ver=2", icon: "list" },
      { label: "BLS Application Portal", url: "https://egypt.blsspainvisa.com/tourist-visit.php", icon: "portal" },
      { label: "Download Application PDF", url: "https://www.exteriores.gob.es/DocumentosAuxiliaresSC/Egipto/MODELO%20SOLICITUD%20VISADO%20SCHENGEN%20EN.pdf", icon: "pdf" },
    ],
    locations: [
      { city: "Cairo", mapUrl: "https://www.google.com/maps/search/BLS+International+Spain+Visa+Cairo+Egypt" },
      { city: "Alexandria", mapUrl: "https://www.google.com/maps/search/BLS+International+Spain+Visa+Alexandria+Egypt" },
    ],
    videos: {
      form:       { url: "https://ljnobjopqfzalwuvjsub.supabase.co/storage/v1/object/public/training-video/aman.mp4", thumbnail: "" },
      motivation: { url: "", thumbnail: "" },
      itinerary:  { url: "", thumbnail: "" },
    },
    requiredDocs: [
      "Valid Passport (6+ months validity, 2 blank pages)",
      "Two recent passport photos (white background, 3.5 × 4.5 cm)",
      "Completed & signed Schengen Visa Application Form",
      "Travel Insurance (min. €30,000 coverage)",
      "Confirmed round-trip flight itinerary",
      "Proof of accommodation (hotel booking / invitation letter)",
      "Bank statements (last 3 months, bank-stamped)",
      "Employment letter or business registration proof",
      "Civil documents (family book / birth certificate if applicable)",
    ],
    arrangement: [
      "Visa Application Form (signed, printed)",
      "Passport Photos (2 pcs, attached)",
      "Original Passport",
      "Copy of all passport pages",
      "Travel Insurance Policy",
      "Round-trip Flight Itinerary",
      "Hotel Booking Confirmation",
      "Bank Statements (last 3 months)",
      "Employment / Business Letter",
      "Supporting civil documents",
    ],
  },
  {
    id: "france", name: "France", flag: "🇫🇷", flagUrl: "https://flagcdn.com/fr.svg",
    agency: "TLScontact", agencyColor: "bg-blue-100 text-blue-700 border-blue-200",
    quickLinks: [
      { label: "Official Checklist", url: "https://france-visas.gouv.fr/en/web/france-visas/short-stay-visa", icon: "list" },
      { label: "France-Visas Portal", url: "https://france-visas.gouv.fr/en_US/web/france-visas", icon: "portal" },
      { label: "Download Application PDF", url: "https://france-visas.gouv.fr/documents/10180/12635/formulaire_court_sejour_en.pdf", icon: "pdf" },
    ],
    locations: [
      { city: "Cairo", mapUrl: "https://www.google.com/maps/search/TLScontact+France+Visa+Cairo+Egypt" },
      { city: "Alexandria", mapUrl: "https://www.google.com/maps/search/TLScontact+France+Visa+Alexandria+Egypt" },
    ],
    videos: {
      form:       { url: "", thumbnail: "" },
      motivation: { url: "", thumbnail: "" },
      itinerary:  { url: "", thumbnail: "" },
    },
    requiredDocs: [
      "Valid Passport (3+ months beyond stay, 2 blank pages)",
      "Completed & signed visa application form",
      "Two recent photos (35 × 45 mm, white background)",
      "Travel Insurance (€30,000 minimum)",
      "Round-trip flight reservation",
      "Hotel confirmation or host invitation letter",
      "Bank statements (last 3 months)",
      "Proof of employment / payslips",
      "Civil status documents (if applicable)",
    ],
    arrangement: [
      "Visa Application Form",
      "Passport Photos (2 pcs)",
      "Original Passport + full copy",
      "Travel Insurance",
      "Flight Reservation",
      "Hotel Confirmation",
      "Bank Statements (3 months, stamped)",
      "Employer Certificate / Pay Slips",
      "Civil Status Documents",
    ],
  },
  {
    id: "germany", name: "Germany", flag: "🇩🇪", flagUrl: "https://flagcdn.com/de.svg",
    agency: "TLScontact", agencyColor: "bg-blue-100 text-blue-700 border-blue-200",
    quickLinks: [
      { label: "Official Checklist", url: "https://cairo.diplo.de/eg-en/service/visa-einreise/schengen-visa/2291040", icon: "list" },
      { label: "VIDEX Online Application", url: "https://videx.diplo.de/videx/visum-erfassung/de/videx-kurzfristiger-aufenthalt", icon: "portal" },
      { label: "Download Application PDF", url: "https://cairo.diplo.de/blob/2291040/d5a214c44a13da38fa47a4a95e87fd4d/antrag-schengenvisum-data.pdf", icon: "pdf" },
    ],
    locations: [
      { city: "Cairo", mapUrl: "https://www.google.com/maps/search/TLScontact+Germany+Visa+Cairo+Egypt" },
      { city: "Alexandria", mapUrl: "https://www.google.com/maps/search/TLScontact+Germany+Visa+Alexandria+Egypt" },
    ],
    videos: {
      form:       { url: "", thumbnail: "" },
      motivation: { url: "", thumbnail: "" },
      itinerary:  { url: "", thumbnail: "" },
    },
    requiredDocs: [
      "Valid Passport (6+ months validity, 2 blank pages)",
      "Completed Schengen Visa Application Form",
      "Two biometric passport photos",
      "Travel Insurance (€30,000 minimum)",
      "Confirmed flight itinerary",
      "Proof of accommodation",
      "Bank statements (last 3 months)",
      "Proof of employment / self-employment",
      "Travel itinerary / trip plan",
      "Cover letter explaining purpose of travel",
    ],
    arrangement: [
      "Visa Application Form (signed)",
      "Passport Photos (2 pcs)",
      "Original Passport + copies of all pages",
      "Cover Letter",
      "Travel Insurance",
      "Flight Itinerary",
      "Hotel / Accommodation Proof",
      "Bank Statements (stamped)",
      "Employer Letter / Business Registration",
      "Travel Itinerary / Plan",
    ],
  },
  {
    id: "italy", name: "Italy", flag: "🇮🇹", flagUrl: "https://flagcdn.com/it.svg",
    agency: "Almaviva / VFS Global", agencyColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    quickLinks: [
      { label: "Official Checklist", url: "https://vistoperitalia.esteri.it/home/en", icon: "list" },
      { label: "Almaviva Application Portal", url: "https://egy.almaviva-visa.it/", icon: "portal" },
      { label: "Download Application PDF", url: "https://vistoperitalia.esteri.it/content/pdf/Modulo%20Domanda%20Visto%20Schengen%20EN.pdf", icon: "pdf" },
    ],
    locations: [
      { city: "Cairo", mapUrl: "https://www.google.com/maps/search/Almaviva+Italy+Visa+Cairo+Egypt" },
      { city: "Alexandria", mapUrl: "https://www.google.com/maps/search/Almaviva+VFS+Italy+Visa+Alexandria+Egypt" },
    ],
    videos: {
      form:       { url: "", thumbnail: "" },
      motivation: { url: "", thumbnail: "" },
      itinerary:  { url: "", thumbnail: "" },
    },
    requiredDocs: [
      "Valid Passport (3+ months beyond return date)",
      "Completed and signed Schengen Visa application",
      "Two biometric photos (3.5 × 4.5 cm, light background)",
      "Travel Medical Insurance (€30,000 minimum)",
      "Confirmed round-trip flight itinerary",
      "Hotel reservations covering the full stay",
      "Bank statements (last 3 months, stamped)",
      "Proof of employment or enrollment",
      "Cover letter (purpose and plan of travel)",
      "Proof of accommodation in Egypt (utility bill or lease)",
    ],
    arrangement: [
      "Visa Application Form (signed, printed)",
      "Passport Photos (2 pcs)",
      "Original Passport",
      "Passport Copy (all pages)",
      "Cover Letter",
      "Travel Insurance",
      "Round-Trip Flight Itinerary",
      "Hotel Reservations",
      "Bank Statements (last 3 months)",
      "Employment / Enrollment Proof",
      "Proof of Accommodation in Egypt",
    ],
  },
  {
    id: "netherlands", name: "Netherlands", flag: "🇳🇱", flagUrl: "https://flagcdn.com/nl.svg",
    agency: "VFS Global", agencyColor: "bg-orange-100 text-orange-700 border-orange-200",
    quickLinks: [
      { label: "Official Checklist", url: "https://www.netherlandsworldwide.nl/visas-for-the-netherlands/schengen-visa", icon: "list" },
      { label: "Netherlands Apply Portal", url: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-egypt", icon: "portal" },
      { label: "Download Application PDF", url: "https://www.netherlandsworldwide.nl/binaries/netherlandsworldwide/documents/forms/2019/01/01/schengen-visa-application-form/schengen_application_form_english.pdf", icon: "pdf" },
    ],
    locations: [
      { city: "Cairo", mapUrl: "https://www.google.com/maps/search/VFS+Global+Netherlands+Visa+Cairo+Egypt" },
      { city: "Alexandria", mapUrl: "https://www.google.com/maps/search/VFS+Global+Netherlands+Visa+Alexandria+Egypt" },
    ],
    videos: {
      form:       { url: "", thumbnail: "" },
      motivation: { url: "", thumbnail: "" },
      itinerary:  { url: "", thumbnail: "" },
    },
    requiredDocs: [
      "Valid Passport (3+ months beyond departure date)",
      "Schengen Visa Application Form (fully completed)",
      "Two recent passport-size photos",
      "Travel Insurance (€30,000 for all Schengen countries)",
      "Return flight tickets",
      "Proof of accommodation (hotel, Airbnb, or invitation)",
      "Bank statements (last 3–6 months)",
      "Proof of income / employment contract",
      "Detailed travel plan / itinerary",
    ],
    arrangement: [
      "Visa Application Form (signed)",
      "Passport Photos (2 pcs)",
      "Original Passport + Passport Copy",
      "Travel Insurance Document",
      "Return Flight Tickets",
      "Accommodation Proof",
      "Bank Statements (stamped by bank)",
      "Employment Contract / Income Proof",
      "Detailed Travel Itinerary",
    ],
  },
];
