import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import compression from 'compression';

const router = express.Router();

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://hellolocaltaxiwala_db_user:L8qGrS5xD4fxQX3p@cluster0.raat06y.mongodb.net";
const dbName = "localtaxiwala";

let client: MongoClient | null = null;

async function ensureDefaultData(db: any) {
  try {
    const cityCount = await db.collection('cities').countDocuments();
    if (cityCount === 0) {
      console.log("Database is empty. Auto-seeding default cities and drivers...");
      const initialCities = [
        { _id: "udaipur", name: "Udaipur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&auto=format&fit=crop&q=80" },
        { _id: "jaipur", name: "Jaipur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80" },
        { _id: "jaisalmer", name: "Jaisalmer", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80" },
        { _id: "jodhpur", name: "Jodhpur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1588083949474-77b70e342b36?w=800&auto=format&fit=crop&q=80" },
        { _id: "goa", name: "Goa", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
        { _id: "shillong", name: "Shillong", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80" },
        { _id: "guwahati", name: "Guwahati", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=80" },
        { _id: "kerala", name: "Kerala", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80" }
      ];
      await db.collection('cities').insertMany(initialCities);

      await db.collection('vehicleCategories').insertMany([
        { _id: "sedan", name: "Sedan" },
        { _id: "suv", name: "SUV" },
        { _id: "tempo-traveller", name: "Tempo Traveller" }
      ]);

      const sampleDrivers = [
        {
          _id: "drv_udaipur_1",
          cityId: "udaipur",
          name: "Kalu Singh",
          vehicleName: "Toyota Innova Crysta",
          vehicleType: "SUV",
          experience: 8,
          phone: "+919829408822",
          plateNumber: "RJ 27 TA 1234",
          images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80"],
          clicks: 12,
          monthlyClicks: 5,
          createdAt: new Date().toISOString()
        },
        {
          _id: "drv_udaipur_2",
          cityId: "udaipur",
          name: "Ratan Lal",
          vehicleName: "Maruti Suzuki Dzire",
          vehicleType: "Sedan",
          experience: 6,
          phone: "+919783258984",
          plateNumber: "RJ 27 CA 5678",
          images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"],
          clicks: 8,
          monthlyClicks: 3,
          createdAt: new Date().toISOString()
        },
        {
          _id: "drv_udaipur_3",
          cityId: "udaipur",
          name: "Bheru Singh",
          vehicleName: "Tempo Traveller 12-Seater",
          vehicleType: "Tempo Traveller",
          experience: 10,
          phone: "+919829012345",
          plateNumber: "RJ 27 PB 9999",
          images: ["https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80"],
          clicks: 15,
          monthlyClicks: 7,
          createdAt: new Date().toISOString()
        },
        {
          _id: "drv_jaipur_1",
          cityId: "jaipur",
          name: "Rajendra Sharma",
          vehicleName: "Toyota Etios",
          vehicleType: "Sedan",
          experience: 7,
          phone: "+919414012345",
          plateNumber: "RJ 14 UA 1111",
          images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"],
          clicks: 10,
          monthlyClicks: 4,
          createdAt: new Date().toISOString()
        },
        {
          _id: "drv_jaipur_2",
          cityId: "jaipur",
          name: "Vikram Singh",
          vehicleName: "Toyota Fortuner",
          vehicleType: "SUV",
          experience: 9,
          phone: "+919829098765",
          plateNumber: "RJ 14 SC 2222",
          images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80"],
          clicks: 14,
          monthlyClicks: 6,
          createdAt: new Date().toISOString()
        },
        {
          _id: "drv_goa_1",
          cityId: "goa",
          name: "Santosh Naik",
          vehicleName: "Maruti Ertiga",
          vehicleType: "SUV",
          experience: 5,
          phone: "+919822011111",
          plateNumber: "GA 01 C 3456",
          images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80"],
          clicks: 20,
          monthlyClicks: 10,
          createdAt: new Date().toISOString()
        },
        {
          _id: "drv_jaisalmer_1",
          cityId: "jaisalmer",
          name: "Sumar Khan",
          vehicleName: "Mahindra Thar / Scorpio",
          vehicleType: "SUV",
          experience: 12,
          phone: "+919414987654",
          plateNumber: "RJ 15 CA 7890",
          images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80"],
          clicks: 18,
          monthlyClicks: 8,
          createdAt: new Date().toISOString()
        }
      ];
      await db.collection('drivers').insertMany(sampleDrivers);

      await db.collection('settings').updateOne(
        { _id: "global" as any },
        { $set: { instagramLink: "https://instagram.com/localtaxiwala", seeded: true } },
        { upsert: true }
      );
      console.log("Auto-seeding completed successfully.");
    }
  } catch (e) {
    console.error("Auto-seeding error:", e);
  }
}

async function getDb() {
  if (!client) {
    client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
  }
  const db = client.db(dbName);
  await ensureDefaultData(db);
  return db;
}

// 1. Status Connection check
router.get('/status', async (req, res) => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    res.json({
      status: "ok",
      database: "connected",
      message: "Successfully connected to MongoDB Cluster"
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message
    });
  }
});

// 2. Cities endpoints
router.get('/cities', async (req, res) => {
  try {
    const db = await getDb();
    const cities = await db.collection('cities').find().toArray();
    res.json(cities.map(c => ({
      id: (c._id || c.id || '').toString().trim().toLowerCase(),
      name: (c.name || '').toString().trim(),
      subtitle: (c.subtitle || 'Local drivers available').toString().trim(),
      image: c.image || ''
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cities', async (req, res) => {
  try {
    const db = await getDb();
    const city = req.body;
    const cleanId = (city.id || '').toString().toLowerCase().trim();
    const cleanName = (city.name || '').toString().trim();
    await db.collection('cities').updateOne(
      { _id: cleanId as any },
      {
        $set: {
          name: cleanName,
          subtitle: (city.subtitle || "Local drivers available").toString().trim(),
          image: city.image,
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );
    res.json({ success: true, id: cleanId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/cities/:id', async (req, res) => {
  try {
    const db = await getDb();
    const cityId = (req.params.id || '').toString().trim().toLowerCase();
    await db.collection('cities').deleteOne({ _id: cityId as any });
    await db.collection('drivers').deleteMany({ cityId: cityId });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Drivers endpoints
router.get('/drivers', async (req, res) => {
  try {
    const db = await getDb();
    const rawCityId = (req.query.cityId as string) || '';
    const cleanCityId = rawCityId.trim().toLowerCase();
    
    // Robust filter: match trimmed lowercase cityId case-insensitively
    const filter = cleanCityId
      ? {
          $or: [
            { cityId: cleanCityId },
            { cityId: { $regex: new RegExp(`^\\s*${cleanCityId}\\s*$`, 'i') } }
          ]
        }
      : {};

    const drivers = await db.collection('drivers').find(filter).toArray();
    
    // Map and normalize fields
    const mapped = drivers.map(d => ({
      ...d,
      id: (d._id || d.id || '').toString(),
      cityId: (d.cityId || '').toString().trim().toLowerCase(),
      name: (d.name || '').toString().trim(),
      vehicleType: (d.vehicleType || '').toString().trim(),
      vehicleName: (d.vehicleName || '').toString().trim(),
      _id: undefined
    }));
    
    // Shuffle drivers to give equal business lead chances
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
    
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/drivers/all', async (req, res) => {
  try {
    const db = await getDb();
    const drivers = await db.collection('drivers').find().toArray();
    res.json(drivers.map(d => ({
      ...d,
      id: (d._id || d.id || '').toString(),
      cityId: (d.cityId || '').toString().trim().toLowerCase(),
      name: (d.name || '').toString().trim(),
      vehicleType: (d.vehicleType || '').toString().trim(),
      vehicleName: (d.vehicleName || '').toString().trim(),
      _id: undefined
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/drivers', async (req, res) => {
  console.log("POST /api/drivers called with body size:", JSON.stringify(req.body).length);
  try {
    const db = await getDb();
    const driver = req.body;
    const driverId = driver.id || new ObjectId().toString();
    
    const docToSave = {
      cityId: driver.cityId,
      name: driver.name,
      vehicleName: driver.vehicleName,
      vehicleType: driver.vehicleType,
      experience: Number(driver.experience || 0),
      phone: driver.phone,
      plateNumber: driver.plateNumber || "",
      images: driver.images || [],
      clicks: Number(driver.clicks || 0),
      monthlyClicks: Number(driver.monthlyClicks || 0),
      createdAt: driver.createdAt || new Date().toISOString()
    };

    console.log("Saving driver to MongoDB:", driverId);
    const result = await db.collection('drivers').updateOne(
      { _id: driverId as any },
      { $set: docToSave },
      { upsert: true }
    );
    console.log("MongoDB update result:", JSON.stringify(result));

    res.json({ success: true, id: driverId });
  } catch (err: any) {
    console.error("Error in POST /api/drivers:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/drivers/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('drivers').deleteOne({ _id: req.params.id as any });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/drivers/:id/click', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('drivers').updateOne(
      { _id: req.params.id as any },
      {
        $inc: { clicks: 1, monthlyClicks: 1 }
      }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Inquiries endpoints
router.get('/inquiries', async (req, res) => {
  try {
    const db = await getDb();
    const inquiries = await db.collection('inquiries').find().sort({ createdAt: -1 }).toArray();
    res.json(inquiries.map(i => ({ id: i._id, ...i, _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inquiries', async (req, res) => {
  try {
    const db = await getDb();
    const inquiry = req.body;
    const inquiryId = new ObjectId().toString();
    await db.collection('inquiries').insertOne({
      _id: inquiryId as any,
      ...inquiry,
      createdAt: new Date().toISOString()
    });
    res.json({ success: true, id: inquiryId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/inquiries/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('inquiries').deleteOne({ _id: req.params.id as any });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Vehicle Categories endpoints
router.get('/categories', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.collection('vehicleCategories').find().toArray();
    res.json(categories.map(c => ({ id: c._id, ...c, _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const db = await getDb();
    const { name } = req.body;
    const cleanName = name.trim();
    const cleanId = cleanName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    await db.collection('vehicleCategories').updateOne(
      { _id: cleanId as any },
      { $set: { name: cleanName } },
      { upsert: true }
    );
    res.json({ success: true, id: cleanId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('vehicleCategories').deleteOne({ _id: req.params.id as any });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Settings endpoints
router.get('/settings/instagram', async (req, res) => {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: "global" as any });
    res.json({ instagramLink: doc?.instagramLink || 'https://instagram.com/localtaxiwala' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings/instagram', async (req, res) => {
  try {
    const db = await getDb();
    const { link } = req.body;
    await db.collection('settings').updateOne(
      { _id: "global" as any },
      {
        $set: {
          instagramLink: link,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Seed defaults endpoint
router.post('/settings/seed-default', async (req, res) => {
  try {
    const db = await getDb();
    
    // Clear and restore cities
    await db.collection('cities').deleteMany({});
    const initialCities = [
      { _id: "udaipur", name: "Udaipur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&auto=format&fit=crop&q=80" },
      { _id: "jaipur", name: "Jaipur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80" },
      { _id: "jaisalmer", name: "Jaisalmer", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80" },
      { _id: "jodhpur", name: "Jodhpur", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1588083949474-77b70e342b36?w=800&auto=format&fit=crop&q=80" },
      { _id: "goa", name: "Goa", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
      { _id: "shillong", name: "Shillong", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80" },
      { _id: "guwahati", name: "Guwahati", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=80" },
      { _id: "kerala", name: "Kerala", subtitle: "Local drivers available", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80" }
    ];
    await db.collection('cities').insertMany(initialCities as any[]);

    // Seed Categories
    await db.collection('vehicleCategories').deleteMany({});
    await db.collection('vehicleCategories').insertMany([
      { _id: "sedan" as any, name: "Sedan" },
      { _id: "suv" as any, name: "SUV" },
      { _id: "tempo-traveller" as any, name: "Tempo Traveller" }
    ]);

    // Seed global settings
    await db.collection('settings').updateOne(
      { _id: "global" as any },
      { $set: { instagramLink: "https://instagram.com/localtaxiwala", seeded: true } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// For Vercel, the handler is reached via /api/index.ts
// We mount the router so it handles requests with or without /api prefix
app.use('/api', router);
app.use(router);

export default app;
