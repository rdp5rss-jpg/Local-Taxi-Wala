import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment, 
  orderBy, 
  limit 
} from 'firebase/firestore';

export interface Driver {
  id: string;
  cityId: string;
  name: string;
  vehicleName: string;
  vehicleType: string;
  experience: number;
  phone: string;
  plateNumber: string;
  images: string[]; // array of image URLs
  clicks: number;
  monthlyClicks: number;
  createdAt?: any;
}

export interface VehicleCategory {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  createdAt?: any;
}

export interface Inquiry {
  id: string;
  driverName: string;
  phone: string;
  city: string;
  experience: number;
  vehicleDetails: string;
  createdAt: string;
}

export const PREFERRED_CITY_ORDER: string[] = [
  'udaipur',
  'jaipur',
  'jaisalmer',
  'jodhpur',
  'goa',
  'shillong',
  'guwahati',
  'kerala'
];

export function sortCities(cities: City[]): City[] {
  const orderMap = new Map(PREFERRED_CITY_ORDER.map((name, idx) => [name, idx]));

  return [...cities].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase().trim();
    const nameB = (b.name || '').toLowerCase().trim();
    const idA = (a.id || '').toLowerCase().trim();
    const idB = (b.id || '').toLowerCase().trim();

    let indexA = orderMap.has(nameA) ? orderMap.get(nameA)! : (orderMap.has(idA) ? orderMap.get(idA)! : -1);
    let indexB = orderMap.has(nameB) ? orderMap.get(nameB)! : (orderMap.has(idB) ? orderMap.get(idB)! : -1);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return (a.name || '').localeCompare(b.name || '');
  });
}

// 1. Fetch Cities
export async function getCities(): Promise<City[]> {
  const querySnapshot = await getDocs(collection(db, 'cities'));
  const cities: City[] = [];
  querySnapshot.forEach((docSnap) => {
    cities.push({ id: docSnap.id, ...docSnap.data() } as City);
  });
  return sortCities(cities);
}

// 2. Add City
export async function addCity(city: Omit<City, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'cities', city.id.toLowerCase().trim()), {
    name: city.name,
    subtitle: city.subtitle || "Local drivers available",
    image: city.image,
    createdAt: new Date().toISOString()
  });
}

// 3. Delete City
export async function deleteCity(cityId: string): Promise<void> {
  await deleteDoc(doc(db, 'cities', cityId));
  // Delete all drivers under this city
  const driversSnapshot = await getDocs(query(collection(db, 'drivers'), where('cityId', '==', cityId)));
  const promises = driversSnapshot.docs.map((dDoc) => deleteDoc(doc(db, 'drivers', dDoc.id)));
  await Promise.all(promises);
}

// 4. Fetch Drivers for a City
export async function getDrivers(cityId: string): Promise<Driver[]> {
  const querySnapshot = await getDocs(
    query(collection(db, 'drivers'), where('cityId', '==', cityId))
  );
  const drivers: Driver[] = [];
  querySnapshot.forEach((docSnap) => {
    drivers.push({ id: docSnap.id, ...docSnap.data() } as Driver);
  });
  return drivers;
}

// 5. Fetch All Drivers (for Analytics)
export async function getAllDrivers(): Promise<Driver[]> {
  const querySnapshot = await getDocs(collection(db, 'drivers'));
  const drivers: Driver[] = [];
  querySnapshot.forEach((docSnap) => {
    drivers.push({ id: docSnap.id, ...docSnap.data() } as Driver);
  });
  return drivers;
}

// 6. Create Driver
export async function addDriver(driver: Omit<Driver, 'id' | 'clicks' | 'monthlyClicks'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'drivers'), {
    ...driver,
    clicks: 0,
    monthlyClicks: 0,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// 7. Delete Driver
export async function deleteDriver(driverId: string): Promise<void> {
  await deleteDoc(doc(db, 'drivers', driverId));
}

// 8. Record WhatsApp Click (Analytics)
export async function recordWhatsAppClick(driverId: string): Promise<void> {
  const driverRef = doc(db, 'drivers', driverId);
  await updateDoc(driverRef, {
    clicks: increment(1),
    monthlyClicks: increment(1)
  });
}

// 9. Fetch Inquiries
export async function getInquiries(): Promise<Inquiry[]> {
  const querySnapshot = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')));
  const inquiries: Inquiry[] = [];
  querySnapshot.forEach((docSnap) => {
    inquiries.push({ id: docSnap.id, ...docSnap.data() } as Inquiry);
  });
  return inquiries;
}

// 10. Add Inquiry
export async function addInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'inquiries'), {
    ...inquiry,
    createdAt: new Date().toISOString()
  });
}

// 10.5. Delete Inquiry
export async function deleteInquiry(inquiryId: string): Promise<void> {
  await deleteDoc(doc(db, 'inquiries', inquiryId));
}

// 10.6. Fetch Vehicle Categories
export async function getVehicleCategories(): Promise<VehicleCategory[]> {
  const querySnapshot = await getDocs(collection(db, 'vehicleCategories'));
  const categories: VehicleCategory[] = [];
  querySnapshot.forEach((docSnap) => {
    categories.push({ id: docSnap.id, ...docSnap.data() } as VehicleCategory);
  });
  // Sort alphabetically
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// 10.7. Add Vehicle Category
export async function addVehicleCategory(name: string): Promise<void> {
  const cleanName = name.trim();
  const id = cleanName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  await setDoc(doc(db, 'vehicleCategories', id), {
    name: cleanName
  });
}

// 10.8. Delete Vehicle Category
export async function deleteVehicleCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'vehicleCategories', id));
}

// 11. Settings (Instagram link)
export async function getInstagramLink(): Promise<string> {
  const docRef = doc(db, 'settings', 'global');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().instagramLink || 'https://instagram.com/localtaxiwala';
  }
  return 'https://instagram.com/localtaxiwala';
}

export async function updateInstagramLink(link: string): Promise<void> {
  await setDoc(doc(db, 'settings', 'global'), {
    instagramLink: link,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// Seeding function if database is empty to ensure gorgeous initial experience
export async function seedInitialDataIfEmpty(): Promise<void> {
  const citiesSnap = await getDocs(collection(db, 'cities'));
  if (citiesSnap.empty) {
    console.log("Seeding initial clean destinations...");
    
    // Seed Cities
    const initialCities = [
      {
        id: "udaipur",
        name: "Udaipur",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "jaipur",
        name: "Jaipur",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "jaisalmer",
        name: "Jaisalmer",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "jodhpur",
        name: "Jodhpur",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1588083949474-77b70e342b36?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "goa",
        name: "Goa",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "shillong",
        name: "Shillong",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "guwahati",
        name: "Guwahati",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "kerala",
        name: "Kerala",
        subtitle: "Local drivers available",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80"
      }
    ];

    for (const city of initialCities) {
      await addCity(city);
    }

    // Seed Drivers for Goa
    await addDoc(collection(db, 'drivers'), {
      cityId: "goa",
      name: "Sunil Yadav Travels",
      vehicleName: "Force Traveller 12+1",
      vehicleType: "Tempo Traveller",
      experience: 10,
      phone: "+919928237000",
      plateNumber: "GA-03-TA-8445",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80"
      ],
      clicks: 124,
      monthlyClicks: 42,
      createdAt: new Date().toISOString()
    });

    await addDoc(collection(db, 'drivers'), {
      cityId: "goa",
      name: "Deepak Verma Cabs",
      vehicleName: "Skoda Slavia",
      vehicleType: "Sedan",
      experience: 4,
      phone: "+919928237004",
      plateNumber: "GA-03-TA-1223",
      images: [
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80"
      ],
      clicks: 89,
      monthlyClicks: 31,
      createdAt: new Date().toISOString()
    });

    // Seed Drivers for Kashmir
    await addDoc(collection(db, 'drivers'), {
      cityId: "kashmir",
      name: "Gateway Taxi Srinagar",
      vehicleName: "Maruti Dzire",
      vehicleType: "Sedan",
      experience: 3,
      phone: "+919928237445",
      plateNumber: "JK-01-TA-4321",
      images: [
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80"
      ],
      clicks: 156,
      monthlyClicks: 54,
      createdAt: new Date().toISOString()
    });

    // Set Default settings
    await setDoc(doc(db, 'settings', 'global'), {
      instagramLink: 'https://instagram.com/localtaxiwala'
    });

    // Seed default vehicle categories
    const defaultCategories = ['Sedan', 'SUV', 'Tempo Traveller'];
    for (const cat of defaultCategories) {
      await addVehicleCategory(cat);
    }
  } else {
    // If not empty, still ensure basic categories are seeded so existing setups don't have empty options
    const categoriesSnap = await getDocs(collection(db, 'vehicleCategories'));
    if (categoriesSnap.empty) {
      const defaultCategories = ['Sedan', 'SUV', 'Tempo Traveller'];
      for (const cat of defaultCategories) {
        await addVehicleCategory(cat);
      }
    }
  }
}
