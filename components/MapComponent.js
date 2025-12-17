import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent({ serverData, serverStatus, lastUpdate, className = '' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const territoriesRef = useRef({});
  const [layersVisible, setLayersVisible] = useState({
    countries: true,
    players: true,
    territories: true,
    wars: true
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [coordinates, setCoordinates] = useState({ x: 0, z: 0 });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 6,
      zoomControl: false
    });

    // Set initial view (will be adjusted based on server data)
    map.setView([0, 0], 2);

    // Add real Minecraft world tiles from cloud backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://countrymap-backend-fixed-production.up.railway.app';
    
    // Try to load real tiles first, fallback to grid if not available
    const tileLayer = L.tileLayer(`${apiUrl}/api/tiles/{serverId}/{z}/{x}/{y}.png`, {
      attribution: 'CountryProtect WebMap - Real Minecraft World',
      tileSize: 256,
      noWrap: true,
      maxZoom: 6,
      minZoom: 0,
      errorTileUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#2d3748"/>
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#4a5568" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
          <text x="50%" y="50%" text-anchor="middle" fill="#718096" font-size="14" dy="0.3em">
            Waiting for world tiles...
          </text>
        </svg>
      `)
    });
    
    // Replace {serverId} with actual serverId from props
    const serverId = serverData?.serverInfo?.serverId || 'fa67664bd3534e8d41c4f0c9409798bf';
    tileLayer.setUrl(`${apiUrl}/api/tiles/${serverId}/{z}/{x}/{y}.png`);
    tileLayer.addTo(map);

    // Add zoom controls in custom position
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Track mouse coordinates
    map.on('mousemove', (e) => {
      const { lat, lng } = e.latlng;
      setCoordinates({ x: Math.round(lng), z: Math.round(-lat) });
    });

    // Handle map clicks
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Clicked at coordinates: X=${Math.round(lng)}, Z=${Math.round(-lat)}`);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map bounds based on server data
  useEffect(() => {
    if (!mapInstanceRef.current || !serverData) return;

    const map = mapInstanceRef.current;
    
    // Calculate bounds from countries and players
    let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
    let hasData = false;

    // Check country territories
    if (serverData.countries && serverData.countries.length > 0) {
      serverData.countries.forEach(country => {
        if (country.territory) {
          minX = Math.min(minX, country.territory.minX);
          maxX = Math.max(maxX, country.territory.maxX);
          minZ = Math.min(minZ, country.territory.minZ);
          maxZ = Math.max(maxZ, country.territory.maxZ);
          hasData = true;
        }
      });
    }

    // Check player positions
    if (serverData.players && serverData.players.length > 0) {
      serverData.players.forEach(player => {
        if (player.location && player.online) {
          minX = Math.min(minX, player.location.x - 100);
          maxX = Math.max(maxX, player.location.x + 100);
          minZ = Math.min(minZ, player.location.z - 100);
          maxZ = Math.max(maxZ, player.location.z + 100);
          hasData = true;
        }
      });
    }

    // Set map bounds if we have data
    if (hasData) {
      const bounds = [
        [-maxZ, minX], // Southwest
        [-minZ, maxX]  // Northeast
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [serverData]);

  // Update territories
  useEffect(() => {
    if (!mapInstanceRef.current || !serverData?.countries || !layersVisible.territories) {
      // Clear existing territories
      Object.values(territoriesRef.current).forEach(territory => {
        mapInstanceRef.current?.removeLayer(territory);
      });
      territoriesRef.current = {};
      return;
    }

    const map = mapInstanceRef.current;

    // Clear existing territories
    Object.values(territoriesRef.current).forEach(territory => {
      map.removeLayer(territory);
    });
    territoriesRef.current = {};

    // Add country territories
    serverData.countries.forEach(country => {
      if (!country.territory) return;

      const { minX, minZ, maxX, maxZ } = country.territory;
      const bounds = [
        [-maxZ, minX], // Southwest
        [-minZ, maxX]  // Northeast
      ];

      const territory = L.rectangle(bounds, {
        color: country.color || '#4CAF50',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3,
        className: 'country-territory'
      });

      // Add popup with country info
      territory.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold text-lg mb-2">${country.name}</h3>
          <p><strong>Президент:</strong> ${country.president}</p>
          <p><strong>Участники:</strong> ${country.members?.length || 0}</p>
          ${country.atWar?.length > 0 ? `<p class="text-red-500"><strong>В войне с:</strong> ${country.atWar.join(', ')}</p>` : ''}
        </div>
      `);

      territory.addTo(map);
      territoriesRef.current[country.name] = territory;
    });
  }, [serverData?.countries, layersVisible.territories]);

  // Update player markers
  useEffect(() => {
    if (!mapInstanceRef.current || !serverData?.players || !layersVisible.players) {
      // Clear existing markers
      Object.values(markersRef.current).forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      markersRef.current = {};
      return;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Add player markers
    serverData.players.forEach(player => {
      if (!player.location || !player.online) return;

      const { x, z } = player.location;
      const position = [-z, x]; // Convert Minecraft coords to Leaflet coords

      // Create custom icon - голова Стива
      const iconHtml = `
        <div class="player-marker pixelated" style="
          width: 32px; 
          height: 32px; 
          background-image: url('https://mc-heads.net/avatar/steve/32');
          background-size: cover; 
          border-radius: 4px; 
          border: 2px solid #fff; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        className: 'custom-player-icon'
      });

      const marker = L.marker(position, { icon: customIcon });

      // Add popup with player info
      const popupContent = `
        <div class="p-4 text-center" style="min-width: 200px;">
          <div class="mx-auto mb-3" style="width: 64px; height: 64px; background-image: url('https://mc-heads.net/avatar/steve/64'); background-size: cover; border-radius: 8px; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>
          <h3 class="font-bold text-xl mb-2" style="color: #2d3748;">${player.name}</h3>
          ${player.country ? `<p class="mb-1" style="color: #4a5568;"><strong>🏰 Страна:</strong> ${player.country}</p>` : ''}
          ${player.isPresident ? `<p class="text-yellow-600 font-semibold mb-2">👑 Президент</p>` : ''}
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-sm" style="color: #718096;">
              📍 X: ${Math.round(player.location.x)}, Z: ${Math.round(player.location.z)}
            </p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        setSelectedPlayer(player);
      });

      marker.addTo(map);
      markersRef.current[player.name] = marker;
    });
  }, [serverData?.players, layersVisible.players]);

  // Toggle layer visibility
  const toggleLayer = (layerName) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Server Info */}
        <div className="map-control-panel">
          <h3 className="font-bold text-lg mb-2">{serverData?.serverInfo?.serverName}</h3>
          <div className="text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{serverStatus === 'online' ? 'Онлайн' : 'Офлайн'}</span>
            </div>
            <p>Игроков: {serverData?.players?.filter(p => p.online).length || 0}</p>
            <p>Стран: {serverData?.countries?.length || 0}</p>
            <p className="text-xs text-gray-500">
              Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
            </p>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="map-control-panel">
          <h4 className="font-semibold mb-2">Слои</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={layersVisible.territories}
                onChange={() => toggleLayer('territories')}
                className="rounded"
              />
              <span className="text-sm">Территории</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={layersVisible.players}
                onChange={() => toggleLayer('players')}
                className="rounded"
              />
              <span className="text-sm">Игроки</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={layersVisible.wars}
                onChange={() => toggleLayer('wars')}
                className="rounded"
              />
              <span className="text-sm">Войны</span>
            </label>
          </div>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="map-control-panel">
          <div className="text-sm">
            <p>X: {coordinates.x}, Z: {coordinates.z}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="map-control-panel">
          <h4 className="font-semibold mb-2 text-sm">Легенда</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 opacity-30 border border-primary-500"></div>
              <span>Территория страны</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-700 rounded border-2 border-white"></div>
              <span>Игрок</span>
            </div>
            {serverData?.wars?.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 opacity-20 border border-red-500 border-dashed"></div>
                <span>Зона войны</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}