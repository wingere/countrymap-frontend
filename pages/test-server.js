import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TestServerPage() {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://countrymap-backend-fixed-production.up.railway.app/api/servers/fa67664bd3534e8d41c4f0c9409798bf/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServerData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка данных сервера...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>Test Server Page</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Тест страницы сервера</h1>
        
        {serverData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Информация о сервере</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <strong>ID сервера:</strong> {serverData.serverInfo.serverId}
              </div>
              <div>
                <strong>Название:</strong> {serverData.serverInfo.serverName}
              </div>
              <div>
                <strong>Мир:</strong> {serverData.serverInfo.worldName}
              </div>
              <div>
                <strong>Статус:</strong> {serverData.serverInfo.status}
              </div>
              <div>
                <strong>Игроков:</strong> {serverData.serverInfo.playerCount}
              </div>
              <div>
                <strong>Стран:</strong> {serverData.serverInfo.countryCount}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Страны ({serverData.countries.length})</h3>
                <div className="bg-gray-100 p-3 rounded">
                  {serverData.countries.length > 0 ? (
                    serverData.countries.map((country, i) => (
                      <div key={i} className="mb-1">{country.name}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">Нет стран</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Игроки ({serverData.players.length})</h3>
                <div className="bg-gray-100 p-3 rounded">
                  {serverData.players.length > 0 ? (
                    serverData.players.map((player, i) => (
                      <div key={i} className="mb-1">
                        {player.name} {player.online ? '🟢' : '🔴'}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Нет игроков</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Войны ({serverData.wars.length})</h3>
                <div className="bg-gray-100 p-3 rounded">
                  {serverData.wars.length > 0 ? (
                    serverData.wars.map((war, i) => (
                      <div key={i} className="mb-1">
                        {war.country1} vs {war.country2}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Нет войн</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}