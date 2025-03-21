# 🚀 Scalable URL Shortener System

A high-performance, scalable, and highly available URL shortener service built using **Node.js, Express, MongoDB, Redis, and Zookeeper**.

## 📌 Tech Stack

- **Node.js + Express** – API Server
- **MongoDB** – Persistent storage for original and shortened URLs
- **Redis** – Caching layer with LRU eviction
- **Zookeeper** – Unique short code generation using sequential IDs
- **Base62 Encoding** – Generates compact 7-character short codes
- **Rate Limiting** – Token Bucket Algorithm via Redis

## 🔧 Features

- ✨ Unique 7-character short URL generation
- ⚡ Fast redirection using Redis cache
- 📦 Write-through and read-through caching strategy
- 🔐 Rate limiting per user/IP (5 links/hour)
- 📈 Click tracking
- 🧠 Zookeeper-based distributed ID generation
- 🗃 MongoDB with index on `shortCode` for fast lookups
- 🧹 LRU cache eviction in Redis when full
- 🛡 Spam protection and URL validation

## 📂 Project Structure

```
url-shortener/
├── controllers/
│   └── urlsController.js
├── services/
│   ├── redisService.js
│   ├── zookeeperService.js
│   └── rateLimiter.js
├── models/
│   └── Url.js
├── routes/
│   └── urlRoutes.js
├── utils/
│   └── base62.js
├── config/
│   └── db.js
│   └── redis.js
├── app.js
├── server.js
└── .env
```

## 📜 API Endpoints

### `POST /api/shorten`
- Request Body:
  ```json
  {
    "originalUrl": "https://example.com"
  }
  ```
- Response:
  ```json
  {
    "shortUrl": "https://yourdomain.com/abc123X"
  }
  ```

### `GET /:shortCode`
- Redirects to the original long URL.

## ⚙️ Environment Variables (`.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urlshortener
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
BASE_URL=http://localhost:5000
RATE_LIMIT=5
RATE_LIMIT_WINDOW=3600
```

## 🏁 Running the Project

### 1. Clone the repo
```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

### 2. Install dependencies
```bash
npm install
```



### 3. Start the server
```bash
npm run dev
```

## 📈 Scalability & Performance

- Horizontal scaling with Load Balancer
- MongoDB sharding support
- Redis replication/failover
- Stateless API servers
- Rate limiting to prevent abuse
- LRU-based cache eviction

## 📚 System Design Highlights

- Zookeeper ensures **globally unique IDs** even in a distributed setup.
- Redis caching improves **read performance** drastically.
- Token Bucket Rate Limiting ensures **fair usage**.
- All short codes are **7-character Base62 encoded** for URL friendliness.

## 🔐 Security Considerations

- URL validation using regex
- IP-based rate limiting
- Blacklisting malicious domains

## ✅ Future Enhancements

- User authentication and analytics dashboard
- Expiry handling and scheduled cleanup
- QR code generation
- Custom short code support

## 🧠 Learn More

- Zookeeper Coordination & Sequential Nodes  
- Redis Caching Patterns  
- Token Bucket vs Sliding Window  
- Base62 Encoding Algorithm  
- LRU Cache Strategy  

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

## 👨‍💻 Author
**Rohit Kumar** — [rohit.kumpan01@gmail.com](mailto:rohit.kumpan01@gmail.com)
