# CountryProtect WebMap - Frontend

Cloud frontend for CountryProtect WebMap system, deployed on Vercel.

## Features

- Interactive map with Leaflet.js
- Real-time updates via WebSocket
- Player skin display with head markers
- Country territory visualization
- Responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-friendly interface

## Pages

- `/` - Home page with server ID input
- `/server/[serverId]` - Interactive map for specific server

## Components

- `MapComponent` - Main interactive map with Leaflet.js
- Player markers with skin heads
- Country territory overlays
- Layer toggle controls
- Real-time coordinate display

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://countrymap-backend-fixed-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://countrymap-backend-fixed-production.up.railway.app
```

## Deployment to Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Features

### Interactive Map
- Zoom and pan controls
- Mouse coordinate tracking
- Click to show coordinates
- Responsive design for mobile

### Player System
- Real-time player positions
- Player skin head markers (32x32)
- Player detail popup with front skin view (64x64)
- Online/offline status

### Country System
- Territory boundary display
- Unique colors per country
- Country information popups
- War status visualization

### Layer Management
- Toggle territories on/off
- Toggle players on/off
- Toggle wars on/off
- Settings persistence in localStorage

### Real-time Updates
- WebSocket connection to backend
- Live player movement
- Country changes
- War status updates
- Automatic reconnection

## Technology Stack

- **Next.js 14** - React framework with SSR
- **Leaflet.js** - Interactive map library
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - WebSocket client
- **Axios** - HTTP client

## Map Coordinate System

The map uses Minecraft coordinate system:
- X axis: East/West
- Z axis: North/South
- Y axis: Up/Down (not used in 2D map)

Conversion to Leaflet coordinates:
- Leaflet Lat = -Minecraft Z
- Leaflet Lng = Minecraft X