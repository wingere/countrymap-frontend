import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
import io from 'socket.io-client';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-primary-50 dark:bg-dark-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-dark-600 dark:text-dark-300">Загрузка карты...</p>
      </div>
    </div>
  )
});

export default function ServerPage({ initialData, serverId }) {
  const router = useRouter();
  const [serverData, setServerData] = useState(initialData);
  const [serverStatus, setServerStatus] = useState(initialData?.serverInfo?.status || 'offline');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!initialData);

  // WebSocket connection
  useEffect(() => {
    if (!serverId) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'wss://countrymap.herokuapp.com', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      socketInstance.emit('join-server', serverId);
    });

    socketInstance.on('data-update', (data) => {
      console.log('Received data update:', data);
      setServerData(prevData => ({
        ...prevData,
        countries: data.countries,
        players: data.players,
        wars: data.wars
      }));
      setLastUpdate(new Date(data.timestamp));
      setServerStatus('online');
    });

    socketInstance.on('real-time-update', (update) => {
      console.log('Received real-time update:', update);
      handleRealTimeUpdate(update);
      setLastUpdate(new Date(update.timestamp));
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [serverId]);

  // Handle real-time updates
  const handleRealTimeUpdate = (update) => {
    setServerData(prevData => {
      if (!prevData) return prevData;

      const newData = { ...prevData };

      switch (update.type) {
        case 'player_move':
          newData.players = newData.players.map(player =>
            player.name === update.data.player
              ? { ...player, location: update.data.location }
              : player
          );
          break;

        case 'player_join':
          const existingPlayerIndex = newData.players.findIndex(p => p.name === update.data.player.name);
          if (existingPlayerIndex >= 0) {
            newData.players[existingPlayerIndex] = { ...update.data.player, online: true };
          } else {
            newData.players.push({ ...update.data.player, online: true });
          }
          break;

        case 'player_leave':
          newData.players = newData.players.map(player =>
            player.name === update.data.player
              ? { ...player, online: false }
              : player
          );
          break;

        case 'country_created':
          newData.countries.push(update.data.country);
          break;

        case 'country_updated':
          newData.countries = newData.countries.map(country =>
            country.name === update.data.country.name
              ? update.data.country
              : country
          );
          break;

        case 'war_started':
          newData.wars.push(update.data.war);
          break;

        case 'war_ended':
          newData.wars = newData.wars.filter(war =>
            !(war.country1 === update.data.country1 && war.country2 === update.data.country2)
          );
          break;

        default:
          console.log('Unknown update type:', update.type);
      }

      return newData;
    });
  };

  // Fetch server data if not available
  useEffect(() => {
    if (!serverId || initialData) return;

    const fetchServerData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/servers/${serverId}/data`);
        setServerData(response.data);
        setServerStatus(response.data.serverInfo.status);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch server data:', err);
        setError('Сервер не найден или недоступен');
      } finally {
        setLoading(false);
      }
    };

    fetchServerData();
  }, [serverId, initialData]);

  // Server status monitoring
  useEffect(() => {
    if (!serverId) return;

    const checkServerStatus = setInterval(async () => {
      try {
        const response = await axios.get(`/api/servers/${serverId}/data`);
        const newStatus = response.data.serverInfo.status;
        
        if (newStatus !== serverStatus) {
          setServerStatus(newStatus);
          
          if (newStatus === 'offline') {
            // Server went offline, show cached data
            console.log('Server went offline, showing cached data');
          } else if (newStatus === 'online' && serverStatus === 'offline') {
            // Server came back online, refresh data
            setServerData(response.data);
            setLastUpdate(new Date());
          }
        }
      } catch (error) {
        console.error('Status check failed:', error);
        setServerStatus('offline');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkServerStatus);
  }, [serverId, serverStatus]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-primary-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-600 dark:text-dark-300">Загрузка данных сервера...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-primary-50 dark:bg-dark-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-200 mb-4">
            Сервер недоступен
          </h1>
          <p className="text-dark-600 dark:text-dark-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (!serverData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-primary-50 dark:bg-dark-900">
        <div className="text-center">
          <p className="text-dark-600 dark:text-dark-300">Нет данных сервера</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <Head>
        <title>{serverData.serverInfo.serverName} - CountryProtect WebMap</title>
        <meta name="description" content={`Интерактивная карта сервера ${serverData.serverInfo.serverName}`} />
      </Head>

      {/* Server Status Banner */}
      {serverStatus === 'offline' && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center z-[1000]">
          <span className="font-medium">Сервер офлайн</span>
          <span className="ml-2 text-sm opacity-90">
            Показаны последние данные от {lastUpdate.toLocaleString('ru-RU')}
          </span>
        </div>
      )}

      {/* Map Component */}
      <MapComponent
        serverData={serverData}
        serverStatus={serverStatus}
        lastUpdate={lastUpdate}
        className={serverStatus === 'offline' ? 'mt-12' : ''}
      />
    </div>
  );
}

// Server-side rendering for initial data
export async function getServerSideProps({ params }) {
  const { serverId } = params;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://countrymap.herokuapp.com'}/api/servers/${serverId}/data`
    );

    return {
      props: {
        initialData: response.data,
        serverId
      }
    };
  } catch (error) {
    console.error('Failed to fetch initial server data:', error);
    
    return {
      props: {
        initialData: null,
        serverId
      }
    };
  }
}