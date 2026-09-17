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

// Local cache helpers to ensure app works even when Firestore quota is exceeded
function getLocalCache<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (e) {
    console.error("Local storage read error:", e);
  }
  return defaultValue;
}

function setLocalCache<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    // Avoid exceeding browser localStorage 5MB quota on mobile
    if (serialized.length > 1000000) {
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.warn("Local storage write skipped:", e);
  }
}

function getFallbackDriversForCity(cityId: string): Driver[] {
  const cleanId = (cityId || '').trim().toLowerCase();
  return [
    {
      id: `default_${cleanId}_1`,
      cityId: cleanId,
      name: "Verified Local Driver",
      vehicleName: "Swift Dzire / Etios",
      vehicleType: "Sedan",
      experience: 6,
      phone: "+919829408822",
      plateNumber: "Verified Cab",
      images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"],
      clicks: 14,
      monthlyClicks: 5
    },
    {
      id: `default_${cleanId}_2`,
      cityId: cleanId,
      name: "Highway & City Tours",
      vehicleName: "Toyota Innova Crysta",
      vehicleType: "SUV",
      experience: 8,
      phone: "+919829408822",
      plateNumber: "Verified Cab",
      images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80"],
      clicks: 21,
      monthlyClicks: 8
    },
    {
      id: `default_${cleanId}_3`,
      cityId: cleanId,
      name: "Royal Group Holidays",
      vehicleName: "Force Tempo Traveller",
      vehicleType: "Tempo Traveller",
      experience: 10,
      phone: "+919829408822",
      plateNumber: "Verified Cab",
      images: ["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80"],
      clicks: 11,
      monthlyClicks: 4
    }
  ];
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

export const DEFAULT_CITIES: City[] = [
  { id: "udaipur", name: "Udaipur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&auto=format&fit=crop&q=80" },
  { id: "jaipur", name: "Jaipur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80" },
  { id: "jaisalmer", name: "Jaisalmer", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80" },
  { id: "jodhpur", name: "Jodhpur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1588083949474-77b70e342b36?w=800&auto=format&fit=crop&q=80" },
  { id: "goa", name: "Goa", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
  { id: "shillong", name: "Shillong", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80" },
  { id: "guwahati", name: "Guwahati", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=80" },
  { id: "kerala", name: "Kerala", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80" }
];

// 1. Fetch Cities
export async function getCities(): Promise<City[]> {
  try {
    const res = await fetch('/api/cities');
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const cities = await res.json() as City[];
    if (cities.length > 0) {
      setLocalCache('cached_cities', cities);
      return sortCities(cities);
    }
    const cached = getLocalCache<City[]>('cached_cities', []);
    if (cached.length > 0) return sortCities(cached);
    return sortCities(DEFAULT_CITIES);
  } catch (err) {
    console.warn("API error in getCities, loading from cache/defaults...", err);
    const cached = getLocalCache<City[]>('cached_cities', []);
    if (cached.length > 0) return sortCities(cached);
    return sortCities(DEFAULT_CITIES);
  }
}

// 2. Add City
export async function addCity(city: Omit<City, 'createdAt'>): Promise<void> {
  const res = await fetch('/api/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(city)
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
  
  // Update local cache
  try {
    const cached = getLocalCache<City[]>('cached_cities', []);
    const updated = [
      ...cached.filter(c => c.id !== city.id.toLowerCase().trim()),
      { id: city.id.toLowerCase().trim(), name: city.name, subtitle: city.subtitle || "Local drivers available", image: city.image }
    ];
    setLocalCache('cached_cities', sortCities(updated));
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 3. Delete City
export async function deleteCity(cityId: string): Promise<void> {
  const res = await fetch(`/api/cities/${cityId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
  
  // Update local cache
  try {
    const cached = getLocalCache<City[]>('cached_cities', []);
    setLocalCache('cached_cities', cached.filter(c => c.id !== cityId));
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 4. Fetch Drivers for a City
export async function getDrivers(cityId: string): Promise<Driver[]> {
  const cleanId = (cityId || '').trim().toLowerCase();
  try {
    const res = await fetch(`/api/drivers?cityId=${encodeURIComponent(cleanId)}`);
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const drivers = await res.json() as Driver[];
    if (drivers && drivers.length > 0) {
      setLocalCache(`cached_drivers_${cleanId}`, drivers);
      return drivers;
    }
    const cached = getLocalCache<Driver[]>(`cached_drivers_${cleanId}`, []);
    if (cached && cached.length > 0) return cached;
    return getFallbackDriversForCity(cleanId);
  } catch (err) {
    console.warn(`API error in getDrivers for ${cleanId}, loading from cache/defaults...`, err);
    const cached = getLocalCache<Driver[]>(`cached_drivers_${cleanId}`, []);
    if (cached && cached.length > 0) return cached;
    return getFallbackDriversForCity(cleanId);
  }
}

// 5. Fetch All Drivers (for Analytics)
export async function getAllDrivers(): Promise<Driver[]> {
  try {
    const res = await fetch('/api/drivers/all');
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const drivers = await res.json() as Driver[];
    setLocalCache('cached_all_drivers', drivers);
    return drivers;
  } catch (err) {
    console.warn("API error in getAllDrivers, loading from cache...", err);
    return getLocalCache<Driver[]>('cached_all_drivers', []);
  }
}

// 6. Create Driver
export async function addDriver(driver: Omit<Driver, 'id' | 'clicks' | 'monthlyClicks'>): Promise<string> {
  const res = await fetch('/api/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driver)
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
  const data = await res.json();
  const driverId = data.id;

  // Update cache
  try {
    const cityId = driver.cityId;
    const cached = getLocalCache<Driver[]>(`cached_drivers_${cityId}`, []);
    const newDriverObj = {
      id: driverId,
      ...driver,
      clicks: 0,
      monthlyClicks: 0,
      createdAt: new Date().toISOString()
    } as Driver;
    setLocalCache(`cached_drivers_${cityId}`, [...cached, newDriverObj]);
    
    const allCached = getLocalCache<Driver[]>('cached_all_drivers', []);
    setLocalCache('cached_all_drivers', [...allCached, newDriverObj]);
  } catch (e) {
    console.error("Cache update failed:", e);
  }

  return driverId;
}

// 7. Delete Driver
export async function deleteDriver(driverId: string): Promise<void> {
  const res = await fetch(`/api/drivers/${driverId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);

  // Update cache
  try {
    const allCached = getLocalCache<Driver[]>('cached_all_drivers', []);
    const driverToDelete = allCached.find(d => d.id === driverId);
    if (driverToDelete) {
      const cityId = driverToDelete.cityId;
      const cityCached = getLocalCache<Driver[]>(`cached_drivers_${cityId}`, []);
      setLocalCache(`cached_drivers_${cityId}`, cityCached.filter(d => d.id !== driverId));
    }
    setLocalCache('cached_all_drivers', allCached.filter(d => d.id !== driverId));
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 8. Record WhatsApp Click (Analytics)
export async function recordWhatsAppClick(driverId: string): Promise<void> {
  try {
    const res = await fetch(`/api/drivers/${driverId}/click`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
  } catch (e) {
    console.error("Failed to record click on backend:", e);
  }
}

// 9. Fetch Inquiries
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const res = await fetch('/api/inquiries');
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const inquiries = await res.json() as Inquiry[];
    setLocalCache('cached_inquiries', inquiries);
    return inquiries;
  } catch (err) {
    console.warn("API error in getInquiries, loading from cache...", err);
    return getLocalCache<Inquiry[]>('cached_inquiries', []);
  }
}

// 10. Add Inquiry
export async function addInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<void> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiry)
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
  const data = await res.json();
  const inquiryId = data.id;

  try {
    const cached = getLocalCache<Inquiry[]>('cached_inquiries', []);
    const newInquiry = { id: inquiryId, ...inquiry, createdAt: new Date().toISOString() };
    setLocalCache('cached_inquiries', [newInquiry, ...cached]);
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 10.5. Delete Inquiry
export async function deleteInquiry(inquiryId: string): Promise<void> {
  const res = await fetch(`/api/inquiries/${inquiryId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);

  try {
    const cached = getLocalCache<Inquiry[]>('cached_inquiries', []);
    setLocalCache('cached_inquiries', cached.filter(i => i.id !== inquiryId));
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 10.6. Fetch Vehicle Categories
export async function getVehicleCategories(): Promise<VehicleCategory[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const categories = await res.json() as VehicleCategory[];
    const sorted = categories.sort((a, b) => a.name.localeCompare(b.name));
    setLocalCache('cached_vehicle_categories', sorted);
    return sorted;
  } catch (err) {
    console.warn("API error in getVehicleCategories, loading from cache...", err);
    return getLocalCache<VehicleCategory[]>('cached_vehicle_categories', [
      { id: 'sedan', name: 'Sedan' },
      { id: 'suv', name: 'SUV' },
      { id: 'tempo-traveller', name: 'Tempo Traveller' }
    ]);
  }
}

// 10.7. Add Vehicle Category
export async function addVehicleCategory(name: string): Promise<void> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
  const data = await res.json();
  const id = data.id;

  try {
    const cached = getLocalCache<VehicleCategory[]>('cached_vehicle_categories', []);
    if (!cached.some(c => c.id === id)) {
      const updated = [...cached, { id, name: name.trim() }].sort((a, b) => a.name.localeCompare(b.name));
      setLocalCache('cached_vehicle_categories', updated);
    }
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 10.8. Delete Vehicle Category
export async function deleteVehicleCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);

  try {
    const cached = getLocalCache<VehicleCategory[]>('cached_vehicle_categories', []);
    setLocalCache('cached_vehicle_categories', cached.filter(c => c.id !== id));
  } catch (e) {
    console.error("Cache update failed:", e);
  }
}

// 11. Settings (Instagram link)
export async function getInstagramLink(): Promise<string> {
  try {
    const res = await fetch('/api/settings/instagram');
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    const link = data.instagramLink || 'https://instagram.com/localtaxiwala';
    setLocalCache('cached_instagram_link', link);
    return link;
  } catch (err) {
    console.warn("API error in getInstagramLink, loading from cache...", err);
    return getLocalCache<string>('cached_instagram_link', 'https://instagram.com/localtaxiwala');
  }
}

export async function updateInstagramLink(link: string): Promise<void> {
  const res = await fetch('/api/settings/instagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link })
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
  
  setLocalCache('cached_instagram_link', link);
}

// Seeding function (no-op client-side since database auto-seeds or seeded endpoint handles it)
export async function seedInitialDataIfEmpty(): Promise<void> {
  // Database runs on full-stack server now, seeding is handled automatically or by backend.
}

// Force restore default cities
export async function forceSeedDefaultData(): Promise<void> {
  const res = await fetch('/api/settings/seed-default', {
    method: 'POST'
  });
  if (!res.ok) throw new Error("HTTP error " + res.status);
}
