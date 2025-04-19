Homevisit/
├── public/                       # 靜態資源目錄
│   ├── assets/                   # 資源文件
│   │   ├── images/               # 圖片資源
│   │   │   ├── logo.png          # 網站 logo
│   │   │   ├── pin.png           # 地圖標記圖標
│   │   │   └── layers.png        # 地圖圖層按鈕圖標
│   │   └── ...                   # 其他資源
│   ├── index.html                # HTML 主文件
│   └── manifest.json             # PWA 配置文件
│
├── src/                          # 源代碼目錄
│   ├── components/               # React 組件
│   │   ├── Map/                  # 地圖組件
│   │   │   ├── Map.js            # 地圖功能實現
│   │   │   └── Map.css           # 地圖樣式
│   │   ├── Search/               # 搜索組件
│   │   │   ├── Search.js         # 搜索功能實現
│   │   │   └── Search.css        # 搜索樣式
│   │   ├── LocationInfo/         # 地點信息組件
│   │   │   ├── LocationInfo.js   # 地點基本信息
│   │   │   └── LocationInfo.css  # 地點樣式
│   │   ├── RecordDetails/        # 記錄詳情組件
│   │   │   ├── RecordDetails.js  # 家訪記錄詳情
│   │   │   └── RecordDetails.css # 記錄樣式
│   │   ├── SidePanel/            # 側邊欄組件 (桌面版)
│   │   │   ├── SidePanel.js      # 側邊欄功能
│   │   │   └── SidePanel.css     # 側邊欄樣式
│   │   ├── BottomCard/           # 底部卡片組件 (手機版)
│   │   │   ├── BottomCard.js     # 底部卡片功能
│   │   │   └── BottomCard.css    # 底部卡片樣式
│   │   └── VillagerModal/        # 村民彈窗組件
│   │       ├── VillagerModal.js  # 村民彈窗功能
│   │       └── VillagerModal.css # 村民彈窗樣式
│   │
│   ├── services/                 # 服務層
│   │   └── api.js                # API 請求封裝
│   │
│   ├── utils/                    # 工具函數
│   │   └── helpers.js            # 通用工具函數
│   │
│   ├── App.js                    # 主應用組件
│   ├── App.css                   # 主應用樣式
│   ├── index.js                  # 應用入口文件
│   └── index.css                 # 全局樣式
│
├── package.json                  # 項目依賴配置
└── README.md                     # 項目說明文檔