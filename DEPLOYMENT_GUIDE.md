# 🚀 Deployment Guide - Frontend v2

## Что изменилось:
- ✅ **MapComponent.js** - теперь использует реальные тайлы мира
- ✅ **Backend API** - обновлен с поддержкой GridFS тайлов
- ✅ **Tile Loading** - оптимизированная загрузка с error handling

## Шаги деплоя:

### 1. Создать новый репозиторий на GitHub
```bash
# Создать репозиторий: countrymap-frontend-v2
```

### 2. Загрузить код в репозиторий
```bash
cd frontend-deploy-v2
git init
git add .
git commit -m "Initial commit - Frontend v2 with real world tiles"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/countrymap-frontend-v2.git
git push -u origin main
```

### 3. Подключить к Vercel
1. Зайти на vercel.com
2. Import Project
3. Выбрать новый репозиторий
4. Deploy

### 4. Настроить переменные окружения в Vercel
```
NEXT_PUBLIC_API_URL=https://countrymap-backend-fixed-production.up.railway.app
```

### 5. Проверить работу
- Frontend: https://YOUR_PROJECT.vercel.app
- Tiles API: https://countrymap-backend-fixed-production.up.railway.app/api/tiles/

## Результат:
✅ Карта будет показывать реальный мир Minecraft сервера
✅ Тайлы будут загружаться из GridFS
✅ Live обновления при изменении блоков