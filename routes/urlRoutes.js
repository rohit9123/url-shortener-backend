// routes/url.routes.js
const express = require('express');
const router = express.Router();

const tokenBucketRateLimiter = require('../middlewares/tokenBucketRateLimiter');
const { createShortUrl, getLongUrl } = require('../controllers/urls.controller');

router.post('/create', tokenBucketRateLimiter, createShortUrl);
router.get('/:shortCode', getLongUrl);

module.exports = router;
