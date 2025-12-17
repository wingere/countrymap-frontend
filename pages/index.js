import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [serverId, setServerId] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
      <Head>
        <title>CountryProtect WebMap</title>
        <meta name="description" content="Interactive web map for CountryProtect Minecraft servers" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
              CountryProtect
            </h1>
            <h2 className="text-3xl font-semibold text-dark-700 dark:text-dark-200 mb-6">
              WebMap
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
              Интерактивная веб-карта для серверов Minecraft с отображением стран, 
              территорий, игроков и военных действий в реальном времени
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-lg">
              <div className="text-primary-500 text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Интерактивная карта</h3>
              <p className="text-dark-600 dark:text-dark-300">
                Полноценная карта мира с возможностью масштабирования и навигации
              </p>
            </div>
            
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-lg">
              <div className="text-secondary-500 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Игроки и скины</h3>
              <p className="text-dark-600 dark:text-dark-300">
                Отображение игроков на карте с их скинами и детальной информацией
              </p>
            </div>
            
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-lg">
              <div className="text-accent-500 text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold mb-2">Страны и войны</h3>
              <p className="text-dark-600 dark:text-dark-300">
                Визуализация территорий стран и активных военных конфликтов
              </p>
            </div>
          </div>

          {/* Server Access */}
          <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Доступ к серверу</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Введите ID сервера"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                className="w-full px-4 py-3 border border-dark-300 dark:border-dark-600 rounded-lg 
                         bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder-dark-500 dark:placeholder-dark-400"
              />
            </div>
            
            <Link 
              href={serverId ? `/server/${serverId}` : '#'}
              className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors
                ${serverId 
                  ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                  : 'bg-dark-300 text-dark-500 cursor-not-allowed'
                }`}
            >
              Открыть карту
            </Link>
            
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-4">
              ID сервера предоставляется администратором сервера
            </p>
          </div>

          {/* Info */}
          <div className="mt-12 text-center">
            <p className="text-dark-600 dark:text-dark-300">
              Для администраторов серверов: установите плагин CountryProtect с поддержкой WebMap
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-800 border-t border-dark-200 dark:border-dark-700 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-dark-600 dark:text-dark-300">
            © 2024 CountryProtect WebMap. Создано для сообщества Minecraft.
          </p>
        </div>
      </footer>
    </div>
  );
}