# Crypto Analyzer

A cryptocurrency analysis web application powered by CoinGecko API.

## Features

- Search and view detailed information about any cryptocurrency
- Global market statistics
- Trending cryptocurrencies
- Top exchanges list
- Developer statistics for crypto projects

## Tech Stack

- Node.js (ES Modules)
- Express.js
- CoinGecko API (Free Tier)

## Railway Deployment

### Quick Deploy

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository

2. **Automatic Detection**
   - Railway will automatically detect:
     - Node.js runtime
     - `package.json` start script
     - Port from `process.env.PORT`

3. **Deploy**
   - Railway will automatically:
     - Install dependencies (`npm install`)
     - Run `npm start`
     - Expose the app on a public URL

### Manual Configuration (if needed)

- **Build Command**: (leave empty, not needed)
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher (specified in `package.json`)

### Environment Variables

No environment variables required. The app uses CoinGecko's free tier API (no API key needed).

## Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:9090
```

## API Endpoints

- `GET /api/coin?coin=<name>` - Get coin details
- `GET /api/global` - Get global market data
- `GET /api/trending` - Get trending coins
- `GET /api/exchanges` - Get top exchanges
- `GET /api/health` - Health check

## License

MIT

