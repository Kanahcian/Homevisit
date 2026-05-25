# 加拿家訪資料庫

加拿部落家訪紀錄與村民資訊的互動地圖應用，部署於 GitHub Pages。

**線上網址：** https://kanahcian.github.io/Homevisit/

---

## 專案簡介

以互動地圖為核心，整合加平、加和、加樂三個社區的村民資料、家訪紀錄、學生名單與重要聯絡資訊，供服務隊成員在家訪前後查閱使用。

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | React 18、Leaflet（地圖）|
| 後端 API | Node.js，部署於 Render |
| 部署 | GitHub Pages（`gh-pages` branch）|

## 本地開發

> **注意：** 需使用 Node 18，Node 20+ 與 `react-scripts` 有相容性問題。
> 可使用 nvm 切換版本：`nvm use 18`

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start
```

## 部署

```bash
npm run deploy
```

此指令會自動 build 並推送至 `gh-pages` branch，約 1-2 分鐘後線上更新。

## 專案結構

```
src/
├── components/
│   ├── Map/            # 互動地圖主體
│   ├── SidePanel/      # 桌面版側邊欄
│   ├── BottomCard/     # 手機版底部卡片
│   ├── LocationInfo/   # 地點與家庭資訊
│   ├── RecordDetails/  # 家訪紀錄詳情
│   ├── VillagerModal/  # 村民資訊彈窗
│   ├── MainMenu/       # 選單（名單、通訊錄、大哉問）
│   └── Search/         # 搜尋功能
└── services/
    └── api.js          # 後端 API 串接
```
