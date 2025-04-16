// controllers/urlController.js

const Url = require('../models/Url');
const { encode } = require('../utils/base62');
const { generateUniqueId } = require('../services/zookeeperService');
const redisClient = require('../config/redis'); // We'll integrate Redis later
const { getFromCache, setToCache } = require('../services/redisService');

// POST /api/url/shorten
const shortenUrl = async (req, res) => {
  const { longUrl } = req.body;
  
  if (!longUrl) return res.status(400).json({ message: 'Long URL is required' });

  try {
    const uniqueId = await generateUniqueId();
    const shortCode = encode(uniqueId);

    const newUrl = new Url({ 
      longUrl, 
      shortCode,
      createdAt: new Date(),
      clicks: 0
    });

    await newUrl.save();

    // Store raw URL string in cache
    await setToCache(shortCode, longUrl);

    return res.status(201).json({
      shortCode,
      shortUrl: `http://13.235.33.102:8080/api/${shortCode}`,
      longUrl,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/url/:shortCode
// controllers/urlController.js
const redirectToLongUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Check Redis Cache
    const cachedUrl = await getFromCache(shortCode);
    if (cachedUrl) {
      return res.redirect(cachedUrl); // Use direct URL string
    }

    // Check MongoDB if not in cache
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Update cache with raw URL string
    await setToCache(shortCode, url.longUrl);
    return res.redirect(url.longUrl);

  } catch (error) {
    console.error('❌ Error in redirectShortUrl:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


 


module.exports = {
  shortenUrl,
  redirectToLongUrl,
};
