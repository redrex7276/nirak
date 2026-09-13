import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDsypqSLY7FfJTFc-dcuN9k7IKX36YvXWE",
  authDomain: "shramik-quote.firebaseapp.com",
  projectId: "shramik-quote",
  storageBucket: "shramik-quote.firebasestorage.app",
  messagingSenderId: "216325345229",
  appId: "1:216325345229:web:ec0ba45114afe5823dfe84"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const SEED_CUSTOMERS = [
  {
    id: 'SQ-C-201',
    role: 'customer',
    name: 'Rajesh Sharma',
    mobile: '+91 98221 55432',
    email: 'rajesh.sharma@goabuild.com',
    location: 'Mapusa Industrial Area, Goa',
    createdAt: '2026-08-10T09:00:00.000Z',
    customerProfile: {
      customerType: 'contractor',
      businessName: 'Goa Civil & Infra Projects Ltd',
      cityArea: 'Mapusa Industrial Area',
      description: 'Commercial contractor executing multi-storey residential and commercial developments across North Goa.',
      frequentGigsNeeded: [
        'Exterior Weather Coating',
        'Scaffold Erection & Safety',
        'Concrete Slab Pouring',
        'Structural Waterproofing',
        'Masonry Plastering'
      ],
      budgetRange: '₹800 - ₹1,200 / day',
      typicalWorkerCount: '5 - 20 workers per project'
    }
  },
  {
    id: 'SQ-C-202',
    role: 'customer',
    name: 'Anita Desai',
    mobile: '+91 98200 22334',
    email: 'anita@desaiinteriors.com',
    location: 'Porvorim, Goa',
    createdAt: '2026-08-15T11:30:00.000Z',
    customerProfile: {
      customerType: 'interior_designer',
      businessName: 'Desai Interiors & Luxury Living',
      cityArea: 'Porvorim Coastal Belt',
      description: 'High-end interior design studio renovating luxury seaside apartments, penthouses, and heritage villas.',
      frequentGigsNeeded: [
        'Modular Kitchen Cabinet Assembly',
        'Teak Wood Door Frame Alignment',
        'Concealed PPR Sanitary Plumbing',
        'Designer Wall Putty & Texture Finish',
        'Italian Marble Polishing'
      ],
      budgetRange: '₹850 - ₹1,500 / day',
      typicalWorkerCount: '1 - 4 skilled craftsmen'
    }
  },
  {
    id: 'SQ-C-203',
    role: 'customer',
    name: 'Vikram Singhania',
    mobile: '+91 98111 77654',
    email: 'vikram.s@coastalhubs.in',
    location: 'Panjim Coastal Highway, Goa',
    createdAt: '2026-08-20T14:15:00.000Z',
    customerProfile: {
      customerType: 'facility_manager',
      businessName: 'Coastal Hubs & Retail Plazas',
      cityArea: 'Panjim Commercial District',
      description: 'Commercial facility manager overseeing shopping plazas, corporate complexes, and food courts.',
      frequentGigsNeeded: [
        '3-Phase Commercial Electrical Rewiring',
        'Diesel Generator (DG) Engine Overhaul',
        'Central HVAC Duct Cleaning & Filter Swap',
        'Emergency Pipe Burst & Pressure Leak Repair',
        'Post-Construction Deep Cleaning'
      ],
      budgetRange: '₹900 - ₹1,800 / day',
      typicalWorkerCount: '2 - 8 technicians'
    }
  },
  {
    id: 'SQ-C-204',
    role: 'customer',
    name: 'Dr. Sneha Patil',
    mobile: '+91 98450 88219',
    email: 'sneha.patil@heritagevilla.org',
    location: 'Assagao, Goa',
    createdAt: '2026-08-25T16:45:00.000Z',
    customerProfile: {
      customerType: 'homeowner',
      businessName: 'Assagao Heritage Villa Estates',
      cityArea: 'Assagao Village',
      description: 'Private homeowner maintaining and restoring a 120-year-old Portuguese heritage villa.',
      frequentGigsNeeded: [
        'Red Laterite Stone Masonry & Compound Wall',
        'Mangalore Roof Tile Alignment & Waterproofing',
        'Vintage Wooden Lintel & Shutter Restoration',
        'Exterior Lime Wash & Damp Protection',
        'Landscape Garden Stone Pathways'
      ],
      budgetRange: '₹800 - ₹1,100 / day',
      typicalWorkerCount: '1 - 3 traditional artisans'
    }
  },
  {
    id: 'SQ-C-205',
    role: 'customer',
    name: 'Karan Malhotra',
    mobile: '+91 98332 66541',
    email: 'karan.m@sunandsandgoa.com',
    location: 'Calangute Beach Road, Goa',
    createdAt: '2026-09-01T10:00:00.000Z',
    customerProfile: {
      customerType: 'resort_manager',
      businessName: 'Sun & Sand Beachfront Resorts',
      cityArea: 'Calangute - Candolim Strip',
      description: 'Hospitality operations manager maintaining 40 beachfront cottages, dining decks, and pool pavilions.',
      frequentGigsNeeded: [
        'Beachfront Wooden Deck Polishing & Sealing',
        'Swimming Pool Circulation Pump Repair',
        'Cottage Touch-up Weatherproof Painting',
        'Split AC Servicing & Refrigerant Recharge',
        'Outdoor Pathway Solar Light Fitting'
      ],
      budgetRange: '₹850 - ₹1,400 / day',
      typicalWorkerCount: '2 - 6 multi-trade workers'
    }
  }
];

export const SEED_GIGS = [
  {
    id: 'SQ-J-3001',
    customerId: 'SQ-C-201',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98221 55432',
    title: '4-Storey Exterior Weather Coating & Waterproofing Project',
    category: 'Painter',
    description: 'Bulk residential painting project in Mapusa Industrial Area. Requires exterior scaffolding setup, primer roll application, and two coats of weather-shield emulsion with waterproofing membrane.',
    location: 'Mapusa Industrial Area, Goa',
    startDate: '18 Sept 2026',
    durationDays: 5,
    reportingTime: '8:00 AM',
    workersRequired: 10,
    skills: ['Exterior Weather Coating', 'Scaffold Work', 'Waterproofing'],
    experienceRequired: 3,
    preferredLanguage: 'mr',
    paymentType: 'daily',
    paymentAmount: 800,
    paymentNotes: 'Daily allowance provided on site, final payment on completion.',
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: ['SQ-F-1042', 'SQ-F-1043', 'SQ-F-1044'],
    interestedWorkerIds: ['SQ-F-1042'],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: '2026-09-12T08:00:00.000Z'
  },
  {
    id: 'SQ-J-3002',
    customerId: 'SQ-C-202',
    customerName: 'Anita Desai',
    customerPhone: '+91 98200 22334',
    title: 'Luxury Apartment Modular Kitchen & Custom Teak Shutter Alignment',
    category: 'Carpenter',
    description: 'High-precision teak wood door frame alignment, hydraulic soft-close hinge fitting, and modular kitchen cabinet shutter installation in a sea-facing apartment.',
    location: 'Porvorim, Goa',
    startDate: '20 Sept 2026',
    durationDays: 3,
    reportingTime: '9:00 AM',
    workersRequired: 2,
    skills: ['Door Frame Fitting', 'Furniture Assembly', 'Modular Kitchens'],
    experienceRequired: 4,
    preferredLanguage: 'en',
    paymentType: 'daily',
    paymentAmount: 900,
    paymentNotes: 'Precision tools and safety gear required. Lunch provided on site.',
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: ['SQ-F-1045'],
    interestedWorkerIds: [],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: '2026-09-12T10:30:00.000Z'
  },
  {
    id: 'SQ-J-3003',
    customerId: 'SQ-C-202',
    customerName: 'Anita Desai',
    customerPhone: '+91 98200 22334',
    title: 'Concealed Bathroom PPR Pipe Leak Repair & Pressure Testing',
    category: 'Plumber',
    description: 'Concealed PPR pipe welded joint burst causing seepage into living room. Requires acoustic leak detection, tile opening, pipe welded replacement, and hydro-pressure testing.',
    location: 'Porvorim, Goa',
    startDate: '19 Sept 2026',
    durationDays: 1,
    reportingTime: '8:30 AM',
    workersRequired: 1,
    skills: ['PPR Pipe Welded Joint', 'Drain Unclogging', 'Pressure Testing'],
    experienceRequired: 3,
    preferredLanguage: 'hi',
    paymentType: 'daily',
    paymentAmount: 850,
    paymentNotes: 'Immediate payout upon pressure test validation.',
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: ['SQ-F-1052'],
    interestedWorkerIds: [],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: '2026-09-12T11:00:00.000Z'
  },
  {
    id: 'SQ-J-3004',
    customerId: 'SQ-C-203',
    customerName: 'Vikram Singhania',
    customerPhone: '+91 98111 77654',
    title: 'Commercial Plaza 3-Phase Electrical Rewiring & DG Backup Overhaul',
    category: 'Mechanic',
    description: 'Main distribution board overhaul, 3-phase balancing, circuit breaker testing, and 125kVA diesel generator engine oil/filter servicing for commercial retail mall.',
    location: 'Panjim Coastal Highway, Goa',
    startDate: '22 Sept 2026',
    durationDays: 2,
    reportingTime: '7:30 AM',
    workersRequired: 3,
    skills: ['Diesel Generator Repair', 'Concrete Mixer Engine', 'Power Tools'],
    experienceRequired: 5,
    preferredLanguage: 'mr',
    paymentType: 'daily',
    paymentAmount: 950,
    paymentNotes: 'Night-shift clearance allowance included.',
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: ['SQ-F-1049'],
    interestedWorkerIds: [],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: '2026-09-12T14:20:00.000Z'
  },
  {
    id: 'SQ-J-3005',
    customerId: 'SQ-C-204',
    customerName: 'Dr. Sneha Patil',
    customerPhone: '+91 98450 88219',
    title: 'Portuguese Villa Red Laterite Stone Boundary Wall & Plastering',
    category: 'Mason',
    description: 'Chiseling and laying red laterite stone blocks with lime mortar mix, leveling compound wall, and applying weather-resistant exterior plaster.',
    location: 'Assagao, Goa',
    startDate: '21 Sept 2026',
    durationDays: 4,
    reportingTime: '8:00 AM',
    workersRequired: 2,
    skills: ['Red Laterite Masonry', 'Level Plastering', 'Stone Chisel'],
    experienceRequired: 5,
    preferredLanguage: 'mr',
    paymentType: 'daily',
    paymentAmount: 850,
    paymentNotes: 'Traditional craftsmanship required. Tea and snacks provided.',
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: ['SQ-F-1047'],
    interestedWorkerIds: [],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: '2026-09-12T15:45:00.000Z'
  },
  {
    id: 'SQ-J-3006',
    customerId: 'SQ-C-205',
    customerName: 'Karan Malhotra',
    customerPhone: '+91 98332 66541',
    title: 'Beachfront Wooden Deck Polishing & Anti-Moisture Sealing',
    category: 'Carpenter',
    description: 'Sanding 2,400 sq ft exterior teak deck, replacing rusted brass screws, and applying 2 coats of marine-grade polyurethane anti-moisture sealant ahead of tourist season.',
    location: 'Calangute Beach Road, Goa',
    startDate: '23 Sept 2026',
    durationDays: 3,
    reportingTime: '8:00 AM',
    workersRequired: 2,
    skills: ['Wood Polishing', 'Deck Sealing', 'Furniture Assembly'],
    experienceRequired: 3,
    preferredLanguage: 'hi',
    paymentType: 'daily',
    paymentAmount: 850,
    paymentNotes: 'All safety equipment provided by resort management.',
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: [],
    interestedWorkerIds: [],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: '2026-09-12T16:30:00.000Z'
  }
];

export async function seedFirestore() {
  console.log('🚀 Starting Cloud Firestore seeding for Shramik-Quote...');

  // 1. Seed Customers
  for (const customer of SEED_CUSTOMERS) {
    const userRef = doc(db, 'users', customer.id);
    await setDoc(userRef, customer, { merge: true });
    console.log(`✓ Seeded Customer Profile: ${customer.name} (${customer.customerProfile.businessName}) -> users/${customer.id}`);
  }

  // 2. Seed Gigs / Jobs
  for (const gig of SEED_GIGS) {
    const jobRef = doc(db, 'jobs', gig.id);
    await setDoc(jobRef, gig, { merge: true });
    console.log(`✓ Seeded Gig: "${gig.title}" (Customer: ${gig.customerName}) -> jobs/${gig.id}`);
  }

  console.log('🎉 Cloud Firestore seeding completed successfully!');
}

seedFirestore().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('❌ Cloud Firestore seeding error:', err);
  process.exit(1);
});
