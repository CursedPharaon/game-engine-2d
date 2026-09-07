# 2D Конструктор Игр — без программирования

Веб-приложение в стиле Scratch / Pocket Code для создания 2D-игр прямо в браузере. Один репозиторий, без сервера — всё на GitHub Pages + GitHub API.

[![Deploy to GitHub Pages](https://github.com/CursedPharaon/game-engine-2d/actions/workflows/pages.yml/badge.svg)](https://github.com/CursedPharaon/game-engine-2d/actions/workflows/pages.yml)

## ✨ Возможности

### 1. Редактор сцены
- Drag-and-drop объектов на поле 480×360 (настраивается)
- Загрузка `PNG/JPG/WEBP` (спрайты) и `MP3/WAV` (звуки) → хранятся как `base64` внутри JSON
- Объекты: прямоугольник, круг, спрайт, текст, кнопка
- Свойства: X/Y, ширина/высота, поворот, прозрачность, цвет, видимость, шрифт, спрайт
- Слои: кнопки ↑/↓ (zIndex)

### 2. Визуальное программирование (блоки)
Блоки-кирпичики как в Scratch, сгруппированы по цветам:
- **События**: `когда клик по объекту`, `когда нажата клавиша`, `каждый кадр`
- **Движение**: `идти к`, `изменить X/Y на`, `повернуть на`, `установить позицию`
- **Внешность**: `сменить спрайт`, `изменить размер`, `задать размер`, `показать/скрыть`, `прозрачность`
- **Звук**: `воспроизвести звук`
- **Управление**: `создать клон`, `удалить клон`, `ждать`

### 3. Переменные и списки (ключевое)
- Создание переменных (числовые/строковые) и списков в редакторе
- Блоки: `задать переменной`, `изменить переменную на`, `сохранить переменную`, `загрузить переменную`
- `Сохранить` → `localStorage.setItem('gv_'+имя)` — данные не теряются после перезапуска
- `Загрузить` → `localStorage.getItem(...)`
- Списки: `добавить`, `удалить`, `случайный элемент → в переменную`, `очистить`
- Поддержка плейсхолдеров в тексте: `"Очки: {очки}"` автоматически обновляется

### 4. Компиляция в один HTML
Кнопка **Опубликовать → Скачать HTML** генерирует самостоятельный файл:
- Весь движок + логика блоков
- Все спрайты и звуки встроены как `base64`
- Работает без интернета — можно открыть как `file://`

### 5. Лента сообщества
- Главная показывает все игры из `/games/games.json` (карточки: название, автор, описание)
- Кнопка **Создать новую игру**

### 6. Публикация через GitHub API
При нажатии **Опубликовать в сообщество**:
1. HTML сохраняется в `/games/название_игры/index.html` через `PUT /repos/{owner}/{repo}/contents/...`
2. Обновляется `/games/games.json` (slug, title, author, date, description, path)
3. Всё коммитится автоматически — без сервера

### 7. Уникальные ссылки
`https://логин.github.io/репозиторий/games/название_игры/` — можно делиться.

### 8. Профиль
- Сохранение GitHub логина + токена в `localStorage`
- Список своих игр (фильтр по автору)

---

## 🚀 Развертывание на GitHub Pages

### Вариант A — автоматически (рекомендуется)
1. Форкни репозиторий.
2. Включи Pages: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Запушь в `main` — workflow `.github/workflows/pages.yml` соберёт `vite build` и задеплоит `dist/` (вместе с `games/`).
4. Открой `https://<логин>.github.io/<репозиторий>/`.

### Вариант B — вручную
```bash
npm install
npm run build        # → dist/
# скопируй games/ внутрь dist/ если нужно:
cp -r games dist/games
cp dist/index.html dist/404.html  # для SPA-роутинга
```

### Публикация игры
1. В редакторе нажми **Опубликовать** → введи `owner` / `repo` / `token` (scope `repo`) → **Опубликовать через API**.
2. Или скачай HTML и вручную создай `games/моя-игра/index.html` + добавь запись в `games/games.json`, закоммить.

Токен: **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)** → `Generate new token` с `repo` доступом.

### Локальная разработка
```bash
npm install
npm run dev    # http://localhost:5173
```

## 📁 Структура

```
/
├── index.html              # Vite entry
├── src/
│   ├── main.js             # SPA: лента, редактор, профиль, drag-n-drop, блоки
│   ├── styles.css          # тёмная тема
│   ├── compiler.js         # generateStandaloneHTML(gameData) → один HTML
│   └── github.js           # publishToGitHub() + fetchGamesList()
├── public/games/
│   ├── games.json          # лента (копируется в dist)
│   └── demo-game/index.html
├── games/                  # то же, что public/games, для GitHub API
│   ├── games.json
│   └── demo-game/index.html
└── .github/workflows/pages.yml
```

### JSON-схема игры
```json
{
  "meta": { "title": "...", "author": "...", "description": "...", "width": 480, "height": 360, "bgColor": "#0f172a" },
  "assets": { "sprites": [{ "id": "spr_…", "name": "hero.png", "dataUrl": "data:image/png;base64,…" }], "sounds": [{ "id": "snd_…", "dataUrl": "data:audio/mp3;base64,…" }] },
  "variables": [{ "name": "очки", "value": 0 }],
  "lists": [{ "name": "инвентарь", "items": ["меч"] }],
  "objects": [{ "id": "obj_…", "type": "rect|circle|sprite|text|button", "x": 0, "y": 0, "width": 80, "height": 60, "rotation": 0, "opacity": 1, "color": "#4f7cff", "text": "", "fontSize": 14, "visible": true, "spriteId": null, "zIndex": 0 }],
  "scripts": { "obj_…": [{ "op": "event_click", "params": {}, "cat": "events", "label": "когда клик" }] }
}
```

## ✅ Критерии готовности

1. Можно создать игру из 5+ объектов с логикой — да.
2. Переменные сохраняются в `localStorage` через блок **Сохранить** — да.
3. При **Опубликовать** создаётся `/games/название/index.html` — да (скачать или через API).
4. На главной игра видна в ленте — читается из `games/games.json`.
5. Всё в одном репозитории без внешних БД — да.

---

Сделано для GitHub Pages. Тёмная тема, Vite, чистый JS, без зависимостей кроме Vite.
