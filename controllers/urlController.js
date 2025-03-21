// controllers/urlController.js

const Url = require('../models/Url');
const { encode } = require('../utils/base62');
const { generateUniqueId } = require('../config/zookeeper');
const redisClient = require('../config/redis'); // We'll integrate Redis later

// POST /api/url/shorten
const shortenUrl = async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) return res.status(400).json({ message: 'Long URL is required' });

  try {
    // Step 1: Generate Unique ID from Zookeeper
    const uniqueId = await generateUniqueId();

    // Step 2: Encode to Base62 7-char string
    const shortCode = encode(uniqueId);

    // Step 3: Save in MongoDB
    const newUrl = new Url({ longUrl, shortCode });
    await newUrl.save();

    // Optional: Save in Redis cache
    // await redisClient.set(shortCode, longUrl);

    return res.status(201).json({
      shortCode,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      longUrl,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/url/:shortCode
const redirectShortUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Step 1: Check Redis Cache
    const cachedLongUrl = await redisClient.get(shortCode);

    if (cachedLongUrl) {
      console.log('🔁 Redis Cache HIT');
      return res.redirect(cachedLongUrl);
    }

    // Step 2: Check MongoDB if not in cache
    const urlDoc = await Url.findOne({ shortCode });

    if (!urlDoc) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Step 3: Cache the long URL in Redis
    await redisClient.set(shortCode, urlDoc.longUrl);
    console.log('💾 Redis Cache MISS — Data fetched from DB and cached');

    return res.redirect(urlDoc.longUrl);

  } catch (error) {
    console.error('❌ Error in redirectShortUrl:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  shortenUrl,
  redirectToLongUrl,
};
