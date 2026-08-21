import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://hellolocaltaxiwala_db_user:L8qGrS5xD4fxQX3p@cluster0.raat06y.mongodb.net";
const dbName = "localtaxiwala";

let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
  }
  return client.db(dbName);
}

// 1. Status Connection check
app.get('/api/status', async (req, res) => {
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
app.get('/api/cities', async (req, res) => {
  try {
    const db = await getDb();
    const cities = await db.collection('cities').find().toArray();
    res.json(cities.map(c => ({ id: c._id, ...c, _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cities', async (req, res) => {
  try {
    const db = await getDb();
    const city = req.body;
    const cleanId = city.id.toLowerCase().trim();
    await db.collection('cities').updateOne(
      { _id: cleanId as any },
      {
        $set: {
          name: city.name,
          subtitle: city.subtitle || "Local drivers available",
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

app.delete('/api/cities/:id', async (req, res) => {
  try {
    const db = await getDb();
    const cityId = req.params.id;
    await db.collection('cities').deleteOne({ _id: cityId as any });
    await db.collection('drivers').deleteMany({ cityId: cityId });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Drivers endpoints
app.get('/api/drivers', async (req, res) => {
  try {
    const db = await getDb();
    const cityId = req.query.cityId as string;
    const filter = cityId ? { cityId } : {};
    const drivers = await db.collection('drivers').find(filter).toArray();
    
    // Map _id to id
    const mapped = drivers.map(d => ({ id: d._id, ...d, _id: undefined }));
    
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

app.get('/api/drivers/all', async (req, res) => {
  try {
    const db = await getDb();
    const drivers = await db.collection('drivers').find().toArray();
    res.json(drivers.map(d => ({ id: d._id, ...d, _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers', async (req, res) => {
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

    await db.collection('drivers').updateOne(
      { _id: driverId as any },
      { $set: docToSave },
      { upsert: true }
    );

    res.json({ success: true, id: driverId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('drivers').deleteOne({ _id: req.params.id as any });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers/:id/click', async (req, res) => {
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
app.get('/api/inquiries', async (req, res) => {
  try {
    const db = await getDb();
    const inquiries = await db.collection('inquiries').find().sort({ createdAt: -1 }).toArray();
    res.json(inquiries.map(i => ({ id: i._id, ...i, _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
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

app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('inquiries').deleteOne({ _id: req.params.id as any });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Vehicle Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.collection('vehicleCategories').find().toArray();
    res.json(categories.map(c => ({ id: c._id, ...c, _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
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

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('vehicleCategories').deleteOne({ _id: req.params.id as any });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Settings endpoints
app.get('/api/settings/instagram', async (req, res) => {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: "global" as any });
    res.json({ instagramLink: doc?.instagramLink || 'https://instagram.com/localtaxiwala' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/instagram', async (req, res) => {
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
app.post('/api/settings/seed-default', async (req, res) => {
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

export default app;
