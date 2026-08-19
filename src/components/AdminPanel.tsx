import React, { useState, useEffect } from 'react';
import { 
  City, 
  Driver, 
  Inquiry, 
  getCities, 
  addCity, 
  deleteCity, 
  getAllDrivers, 
  addDriver, 
  deleteDriver, 
  getInquiries, 
  deleteInquiry,
  getInstagramLink, 
  updateInstagramLink,
  getVehicleCategories,
  addVehicleCategory,
  deleteVehicleCategory,
  VehicleCategory,
  forceSeedDefaultData
} from '../lib/db';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Plus, 
  Trash2, 
  LogOut, 
  Lock, 
  Compass, 
  ExternalLink,
  Instagram
} from 'lucide-react';
import { motion } from 'motion/react';

const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // Optimal size for database storage
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.75); // 75% quality JPEG
          resolve(base64);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(reader.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const uploadToImgBB = async (base64Image: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    console.warn("VITE_IMGBB_API_KEY is not set. Falling back to base64 storage (Not recommended for Firestore!).");
    return base64Image;
  }

  try {
    // Remove the data:image/jpeg;base64, prefix if it exists
    const base64Data = base64Image.split(',')[1] || base64Image;
    
    const formData = new FormData();
    formData.append('image', base64Data);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      console.error("ImgBB upload failed:", data);
      return base64Image; // Fallback
    }
  } catch (error) {
    console.error("Error uploading to ImgBB:", error);
    return base64Image; // Fallback
  }
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin tabs: dashboard, places, drivers, analytics, inquiries, settings
  const [activeTab, setActiveTab] = useState<'dashboard' | 'places' | 'drivers' | 'analytics' | 'inquiries' | 'settings'>('dashboard');

  // Firestore Data State
  const [cities, setCities] = useState<City[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [instagramLink, setInstagramLink] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCityId, setNewCityId] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newCitySubtitle, setNewCitySubtitle] = useState('');
  const [uploadedCityImage, setUploadedCityImage] = useState<string>('');
  const [cityImageUploadLoading, setCityImageUploadLoading] = useState(false);

  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverCityId, setNewDriverCityId] = useState('');
  const [newDriverVehicleType, setNewDriverVehicleType] = useState('');
  const [newDriverExperience, setNewDriverExperience] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverPlate, setNewDriverPlate] = useState('');
  const [newDriverImagesText, setNewDriverImagesText] = useState(''); // comma-separated URLs
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: 'city' | 'driver' | 'inquiry';
    label: string;
  } | null>(null);

  // Check Local Auth Session
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Firestore Data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const fetchedCities = await getCities();
      const fetchedDrivers = await getAllDrivers();
      const fetchedInquiries = await getInquiries();
      const fetchedCats = await getVehicleCategories();
      const ig = await getInstagramLink();

      setCities(fetchedCities);
      setDrivers(fetchedDrivers);
      setInquiries(fetchedInquiries);
      setCategories(fetchedCats);
      setInstagramLink(ig);

      if (fetchedCats.length > 0 && !newDriverVehicleType) {
        setNewDriverVehicleType(fetchedCats[0].name);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'localtaxiwala@admin.com' && password === 'localtaxiwala-92727898') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid admin email or password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  // Handle City Image Upload
  const handleCityImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setCityImageUploadLoading(true);
    
    const file = e.target.files[0];
    try {
      const base64 = await compressAndGetBase64(file);
      const finalImageUrl = await uploadToImgBB(base64);
      setUploadedCityImage(finalImageUrl);
    } catch (err) {
      console.error("Failed to upload city image:", err);
      alert("Failed to upload image. Check console for details.");
    } finally {
      setCityImageUploadLoading(false);
      e.target.value = '';
    }
  };

  // Add a New City
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityId || !newCityName || !uploadedCityImage) return;

    setFormSubmitting(true);
    try {
      await addCity({
        id: newCityId.toLowerCase().trim(),
        name: newCityName,
        subtitle: newCitySubtitle || "Local drivers available",
        image: uploadedCityImage
      });
      // Reset
      setNewCityId('');
      setNewCityName('');
      setNewCitySubtitle('');
      setUploadedCityImage('');
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete City Trigger
  const handleDeleteCity = (cityId: string, cityName: string) => {
    setDeleteTarget({
      id: cityId,
      type: 'city',
      label: cityName
    });
  };

  const handleImageFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImageUploadLoading(true);
    
    const processedImages: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files.item(i);
      if (file) {
        try {
          const base64 = await compressAndGetBase64(file);
          const finalImageUrl = await uploadToImgBB(base64);
          processedImages.push(finalImageUrl);
        } catch (err) {
          console.error("Failed to compress and convert file:", err);
        }
      }
    }
    
    setUploadedImages(prev => [...prev, ...processedImages]);
    setImageUploadLoading(false);
    e.target.value = '';
  };

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add a New Driver Listing
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverCityId || !newDriverVehicleType || !newDriverExperience || !newDriverPhone) {
      alert("Please fill all required fields.");
      return;
    }

    setFormSubmitting(true);
    try {
      // Parse unlimited comma separated URLs
      const parsedImages = newDriverImagesText
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const combinedImages = [...uploadedImages, ...parsedImages];

      // Default placeholder if none provided
      if (combinedImages.length === 0) {
        combinedImages.push("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80");
      }

      await addDriver({
        cityId: newDriverCityId,
        name: newDriverName,
        vehicleName: newDriverVehicleType,
        vehicleType: newDriverVehicleType,
        experience: Number(newDriverExperience),
        phone: newDriverPhone,
        plateNumber: newDriverPlate,
        images: combinedImages
      });

      // Reset Form
      setNewDriverName('');
      setNewDriverCityId('');
      setNewDriverVehicleType(categories[0]?.name || '');
      setNewDriverExperience('');
      setNewDriverPhone('');
      setNewDriverPlate('');
      setNewDriverImagesText('');
      setUploadedImages([]);

      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Add a New Vehicle Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setFormSubmitting(true);
    try {
      await addVehicleCategory(newCategoryName);
      setNewCategoryName('');
      setShowCategoryModal(false);
      await fetchAdminData();
    } catch (err) {
      console.error("Failed to add category:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string) => {
    setFormSubmitting(true);
    try {
      await deleteVehicleCategory(catId);
      await fetchAdminData();
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Driver Trigger
  const handleDeleteDriver = (driverId: string, driverName: string) => {
    setDeleteTarget({
      id: driverId,
      type: 'driver',
      label: driverName
    });
  };

  // Delete Inquiry Trigger
  const handleDeleteInquiry = (inquiryId: string, driverName: string) => {
    setDeleteTarget({
      id: inquiryId,
      type: 'inquiry',
      label: `Registration Inquiry from ${driverName}`
    });
  };

  // Confirm and Execute Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setFormSubmitting(true);
    try {
      if (deleteTarget.type === 'city') {
        await deleteCity(deleteTarget.id);
      } else if (deleteTarget.type === 'driver') {
        await deleteDriver(deleteTarget.id);
      } else if (deleteTarget.type === 'inquiry') {
        await deleteInquiry(deleteTarget.id);
      }
      setDeleteTarget(null);
      await fetchAdminData();
    } catch (err) {
      console.error("Failed to delete target:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Update Settings (Instagram Link)
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await updateInstagramLink(instagramLink);
      alert("Instagram Link updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Restore Default Seeding Data
  const handleRestoreDefaults = async () => {
    if (!window.confirm("Are you sure you want to restore all 8 default cities? This will clear any cities you currently have and overwrite them with the default set.")) {
      return;
    }
    setFormSubmitting(true);
    try {
      await forceSeedDefaultData();
      alert("Default cities and categories restored successfully!");
      await fetchAdminData();
    } catch (err) {
      console.error("Failed to restore defaults:", err);
      alert("Failed to restore default cities. Check console for details.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // 1. Auth Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 font-sans text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Admin Control Panel</h2>
            <p className="text-xs text-slate-400 mt-1">Authorized access only for Local Taxi Wala management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                placeholder="localtaxiwala@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-500 font-semibold">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all active:scale-95 cursor-pointer"
            >
              Authenticate & Open Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Find Driver with maximum WhatsApp clicks for Dashboard top slot
  const topDriver = [...drivers].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0] || null;

  // Render Core Admin Panel
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Admin Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-slate-950 text-base font-black">🛠️</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
              Local Taxi Wala Admin
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Management Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 font-sans"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">View Website</span>
          </a>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 hover:border-rose-900 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1 font-sans"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Workspace Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0 bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-1.5 h-fit font-sans shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('places')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'places' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <MapPin className="w-4.5 h-4.5 shrink-0" />
            <span>Places (Cities)</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'drivers' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Users className="w-4.5 h-4.5 shrink-0" />
            <span>Driver Listings</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5 shrink-0" />
            <span>Clicks Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'inquiries' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5 shrink-0" />
            <span>Partner Inquiries</span>
            {inquiries.length > 0 && (
              <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Settings className="w-4.5 h-4.5 shrink-0" />
            <span>Settings</span>
          </button>
        </aside>

        {/* Content Workspace */}
        <main className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg min-h-[450px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-sans">
              <span className="text-3xl animate-bounce">🚕</span>
              <p className="text-sm font-semibold mt-4">Loading Live Database Content...</p>
            </div>
          ) : (
            <div className="font-sans">
              
              {/* --- TAB 1: DASHBOARD --- */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-xl font-black mb-1 font-sans">Overview Dashboard</h2>
                  <p className="text-xs text-slate-400 mb-6">Database metrics tracked directly from real visitor operations.</p>

                  {/* Core Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-950 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cities</span>
                      <h3 className="text-3xl font-black text-amber-500 mt-2">{cities.length}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Available operational hubs</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Drivers</span>
                      <h3 className="text-3xl font-black text-amber-500 mt-2">{drivers.length}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Listed direct partners</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiries Received</span>
                      <h3 className="text-3xl font-black text-amber-500 mt-2">{inquiries.length}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">From landing-page driver lead form</p>
                    </div>
                  </div>

                  {/* Top Driver Analytics Section */}
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">🏆 Top Performing Driver Partner</h3>
                    {topDriver ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800">
                            <img
                              src={topDriver.images?.[0]}
                              alt={topDriver.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-amber-400">{topDriver.name}</h4>
                            <p className="text-xs text-slate-400">{topDriver.vehicleName} · City: {topDriver.cityId.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-400">Lifetime WhatsApp Contacts</span>
                          <h4 className="text-2xl font-black text-emerald-400 mt-0.5">{topDriver.clicks || 0} clicks</h4>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No driver listings have received any clicks yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB 2: PLACES (CITIES) --- */}
              {activeTab === 'places' && (
                <div>
                  <h2 className="text-xl font-black mb-1">Destination Cities Manager</h2>
                  <p className="text-xs text-slate-400 mb-6">Create destinations with single images, or manage existing ones.</p>

                  {/* Add City Form */}
                  <form onSubmit={handleAddCity} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl mb-8 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Create New Place</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unique City ID (Lowercase slug)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. goa, srinagar, jaipur"
                          value={newCityId}
                          onChange={(e) => setNewCityId(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">City Name (Display)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Goa, Srinagar, Jaipur"
                          value={newCityName}
                          onChange={(e) => setNewCityName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subtitle / Tagline</label>
                        <input
                          type="text"
                          placeholder="e.g. Local drivers available"
                          value={newCitySubtitle}
                          onChange={(e) => setNewCitySubtitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                          Cover Image URL or Upload
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. https://images.unsplash.com..."
                            value={uploadedCityImage}
                            onChange={(e) => setUploadedCityImage(e.target.value)}
                            required={!uploadedCityImage}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/jpeg, image/png, image/webp"
                              onChange={handleCityImageSelection}
                              disabled={cityImageUploadLoading}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              title="Upload Image"
                            />
                            <button
                              type="button"
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold border border-slate-700 transition-colors pointer-events-none whitespace-nowrap"
                            >
                              {cityImageUploadLoading ? 'Uploading...' : 'Upload Image'}
                            </button>
                          </div>
                        </div>
                        {uploadedCityImage && !cityImageUploadLoading && (
                          <div className="mt-2 w-16 h-16 rounded-md overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={uploadedCityImage} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {formSubmitting ? 'Creating...' : 'Create Destination Hub'}
                    </button>
                  </form>

                  {/* List Cities */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Existing Destinations ({cities.length})</h3>
                    {cities.map((city) => (
                      <div key={city.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800">
                            <img
                              src={city.image}
                              alt={city.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{city.name}</h4>
                            <p className="text-[11px] text-slate-400">ID: <span className="font-mono">{city.id}</span> · {city.subtitle}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteCity(city.id, city.name)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete City"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB 3: DRIVERS --- */}
              {activeTab === 'drivers' && (
                <div>
                  <h2 className="text-xl font-black mb-1">Driver Listings Manager</h2>
                  <p className="text-xs text-slate-400 mb-6">Create or delete verified local cab operator listings on the platform.</p>

                  {/* Add Driver Form */}
                  <form onSubmit={handleAddDriver} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl mb-8 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Create New Driver Listing</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Place (Hub)</label>
                        <select
                          required
                          value={newDriverCityId}
                          onChange={(e) => setNewDriverCityId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="">-- Choose destination city --</option>
                          {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Agency / Driver Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Gateway Taxi Srinagar"
                          value={newDriverName}
                          onChange={(e) => setNewDriverName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Vehicle Category</label>
                          <select
                            required
                            value={newDriverVehicleType}
                            onChange={(e) => setNewDriverVehicleType(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="">-- Choose Category --</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(true)}
                          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors cursor-pointer flex items-center justify-center font-sans font-bold text-xs h-[38px] w-[38px] shrink-0"
                          title="Create New Category"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Years Experience</label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="e.g. 7"
                          value={newDriverExperience}
                          onChange={(e) => setNewDriverExperience(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">WhatsApp Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +919928237445"
                          value={newDriverPhone}
                          onChange={(e) => setNewDriverPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">License Plate Number</label>
                        <input
                          type="text"
                          placeholder="e.g. JK-01-TA-4321"
                          value={newDriverPlate}
                          onChange={(e) => setNewDriverPlate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                        Vehicle Images
                      </label>
                      
                      <div className="mt-1 flex flex-col gap-4">
                        {/* Direct Image Select Box */}
                        <div className="border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-5 text-center transition-all bg-slate-900/40 relative group cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageFileSelection}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                            <span className="text-xl">📸</span>
                            <span className="text-xs font-bold text-slate-200">
                              {imageUploadLoading ? 'Processing Selected Image...' : 'Click or Drag to Select Local Image Files'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Choose multiple images directly from your computer or phone gallery
                            </span>
                          </div>
                        </div>

                        {/* Image Previews Grid */}
                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {uploadedImages.map((imgBase64, idx) => (
                              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                                <img
                                  src={imgBase64}
                                  alt="preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUploadedImage(idx)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
                                  title="Remove image"
                                >
                                  ✕
                                </button>
                                <span className="absolute bottom-1 left-1 px-1 bg-slate-950/70 backdrop-blur-md rounded text-[8px] font-bold text-slate-300">
                                  #{idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Compatibility Input for image URL */}
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            Or input Web Image URLs (comma-separated, optional)
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                            value={newDriverImagesText}
                            onChange={(e) => setNewDriverImagesText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {formSubmitting ? 'Creating...' : 'Create Listing'}
                    </button>
                  </form>

                  {/* List Drivers */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Existing Drivers ({drivers.length})</h3>
                    {drivers.map((driver) => (
                      <div key={driver.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800">
                            <img
                              src={driver.images?.[0] || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80"}
                              alt={driver.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{driver.name}</h4>
                            <p className="text-[11px] text-slate-400">
                              {driver.vehicleName} ({driver.vehicleType}) · City: <span className="font-bold uppercase text-amber-500">{driver.cityId}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDriver(driver.id, driver.name)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB 4: ANALYTICS --- */}
              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-xl font-black mb-1 font-sans">Clicks Analytics</h2>
                  <p className="text-xs text-slate-400 mb-6">Total WhatsApp redirects generated for each driver listed.</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-2">Driver Name</th>
                          <th className="py-3 px-2">Vehicle Details</th>
                          <th className="py-3 px-2">Hub (City)</th>
                          <th className="py-3 px-2 text-right">Monthly Clicks</th>
                          <th className="py-3 px-2 text-right">Lifetime Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map((drv) => (
                          <tr key={drv.id} className="border-b border-slate-800/60 hover:bg-slate-800/25">
                            <td className="py-3 px-2 font-bold text-white">{drv.name}</td>
                            <td className="py-3 px-2 text-slate-300">{drv.vehicleName}</td>
                            <td className="py-3 px-2 font-mono uppercase text-amber-400">{drv.cityId}</td>
                            <td className="py-3 px-2 text-right font-bold text-slate-300">{drv.monthlyClicks || 0}</td>
                            <td className="py-3 px-2 text-right font-black text-emerald-400">{drv.clicks || 0}</td>
                          </tr>
                        ))}
                        {drivers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-500">No driver listings in the database yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- TAB 5: PARTNER INQUIRIES --- */}
              {activeTab === 'inquiries' && (
                <div>
                  <h2 className="text-xl font-black mb-1 font-sans">Partner Inquiries</h2>
                  <p className="text-xs text-slate-400 mb-6 font-sans">Inquiries received from the driver registration landing page.</p>

                  <div className="space-y-4 font-sans">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                              City: {inq.city}
                            </span>
                            <h4 className="font-extrabold text-base text-white mt-1.5">{inq.driverName}</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-semibold">{new Date(inq.createdAt).toLocaleString()}</span>
                            <button
                              onClick={() => handleDeleteInquiry(inq.id, inq.driverName)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs py-3 border-t border-b border-slate-800/60 text-slate-300">
                          <div>
                            <span className="text-slate-500 uppercase font-semibold block text-[10px]">WhatsApp Phone</span>
                            <a href={`https://wa.me/${inq.phone.replace('+', '').trim()}`} target="_blank" className="font-mono text-emerald-400 font-bold hover:underline">
                              {inq.phone}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase font-semibold block text-[10px]">Years Experience</span>
                            <span className="font-bold">{inq.experience} Years</span>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase font-semibold block text-[10px]">Vehicle Model</span>
                            <span className="font-bold">{inq.vehicleDetails}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {inquiries.length === 0 && (
                      <div className="py-16 text-center text-slate-500 font-sans border border-dashed border-slate-800 rounded-2xl">
                        No partner registration inquiries found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB 6: SETTINGS --- */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-black mb-1 font-sans">Global Platform Settings</h2>
                  <p className="text-xs text-slate-400 mb-6 font-sans">Manage URLs and social accounts.</p>

                  <form onSubmit={handleUpdateSettings} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                        <Instagram className="w-4.5 h-4.5 text-pink-500" />
                        <span>Instagram Floating Link URL</span>
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://instagram.com/localtaxiwala"
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">Enter the full social media link for the landing and home page floating bars.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {formSubmitting ? 'Updating...' : 'Save Settings'}
                    </button>
                  </form>

                  {/* Danger Zone: Restore Defaults */}
                  <div className="mt-8 bg-slate-950 border border-red-950 p-5 rounded-2xl">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1 font-sans">Danger Zone</h3>
                    <p className="text-xs text-slate-400 mb-4 font-sans">
                      Need to restore the initial content? Use this action to clean-slate the destinations back to the original 8 beautiful Indian cities (Udaipur, Jaipur, Goa, etc.). This will overwrite current cities.
                    </p>
                    <button
                      type="button"
                      onClick={handleRestoreDefaults}
                      disabled={formSubmitting}
                      className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 font-bold border border-red-900/50 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      {formSubmitting ? 'Restoring...' : 'Restore 8 Default Cities'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Custom Deletion Confirmation Modal Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">Confirm Permanent Deletion</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="text-amber-400 font-bold">"{deleteTarget.label}"</span>? 
              {deleteTarget.type === 'city' && " This will also permanently delete all listed local drivers under this destination!"} 
              This operation is final and cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={formSubmitting}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800/50 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {formSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Category Creation Modal Overlay */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-black text-white mb-2">Manage Vehicle Categories</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Add new vehicle categories or remove existing ones. These categories immediately update filters on the home page and listing forms.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hatchback, Luxury SUV, Cruiser"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-700 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {formSubmitting ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Existing Categories ({categories.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-950 border border-slate-800/80 px-3 py-2 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      disabled={formSubmitting}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
