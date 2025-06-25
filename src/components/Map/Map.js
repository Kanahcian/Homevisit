import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import L from 'leaflet';
import AddLocationModal from './AddLocationModal';
import TagFilter from './TagFilter'; // 新增：導入標籤篩選器

// ===========================================
// 📍 ICON 配置區域 - 在這裡設定所有 icon 路徑
// ===========================================
const MARKER_ICONS = {
  default: `${process.env.PUBLIC_URL}/assets/images/pin.png`,        // 預設標記
  church: `${process.env.PUBLIC_URL}/assets/images/church.png`,      // 教會標記
  festival: `${process.env.PUBLIC_URL}/assets/images/home.png`,      // 射耳祭住宿標記
  
  // 村晚系列 - 各自獨立的 icon
  village_karaoke: `${process.env.PUBLIC_URL}/assets/images/karaoke.png`,  // 村晚卡拉ok機
  village_firewood: `${process.env.PUBLIC_URL}/assets/images/firewood.png`,     // 村晚木柴
  village_grill: `${process.env.PUBLIC_URL}/assets/images/barbeque.png`,      // 村晚烤爐
  village_evening: `${process.env.PUBLIC_URL}/assets/images/firewood.png`,      // 其他村晚系列
  
  clan: `${process.env.PUBLIC_URL}/assets/images/family.png`,        // 江氏宗親會標記
  farm: `${process.env.PUBLIC_URL}/assets/images/sprout.png`,        // 農訪標記
  defense: `${process.env.PUBLIC_URL}/assets/images/shield.png`      // 防身術標記
};

// ===========================================
// 🏷️ 標籤分類與優先級系統
// ===========================================

/**
 * 從地點標籤陣列中提取所有個別標籤
 */
const extractAllTags = (tagArray) => {
  if (!tagArray || !Array.isArray(tagArray)) return [];
  
  return tagArray
    .flatMap(tagString => 
      typeof tagString === 'string' 
        ? tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []
    )
    .filter((tag, index, array) => array.indexOf(tag) === index);
};

/**
 * 根據標籤確定 marker 類型（按優先級）
 */
const determineMarkerType = (tagArray) => {
  const allTags = extractAllTags(tagArray);
  
  // 優先級 1: 村晚系列（最高優先級）
  if (allTags.some(tag => 
    tag.includes('村晚卡拉ok機') || tag.includes('卡拉ok機') || tag.includes('卡拉OK機')
  )) {
    return 'village_karaoke';
  }
  
  if (allTags.some(tag => 
    tag.includes('村晚木柴') || (tag.includes('木柴') && tag.includes('村晚'))
  )) {
    return 'village_firewood';
  }
  
  if (allTags.some(tag => 
    tag.includes('村晚烤爐') || (tag.includes('烤爐') && tag.includes('村晚'))
  )) {
    return 'village_grill';
  }
  
  if (allTags.some(tag => tag.includes('村晚'))) {
    return 'village_evening';
  }
  
  // 優先級 2: 教會
  if (allTags.some(tag => 
    tag.includes('教會') || tag.includes('教堂') || tag.includes('長老教會')
  )) {
    return 'church';
  }
  
  // 優先級 3: 射耳祭住宿
  if (allTags.some(tag => 
    tag.includes('射耳祭住宿') || tag.includes('射耳祭')
  )) {
    return 'festival';
  }
  
  // 優先級 4: 其他特定標籤
  if (allTags.some(tag => 
    tag.includes('江氏宗親會') || tag.includes('宗親會')
  )) {
    return 'clan';
  }
  
  if (allTags.some(tag => 
    tag.includes('農訪') || tag.includes('農業')
  )) {
    return 'farm';
  }
  
  if (allTags.some(tag => 
    tag.includes('防身術') || tag.includes('防身')
  )) {
    return 'defense';
  }
  
  return 'default';
};

/**
 * 檢查地點是否符合篩選條件
 */
const matchesFilter = (location, filterType) => {
  if (filterType === 'all') return true;
  
  const allTags = extractAllTags(location.tag);
  
  switch (filterType) {
    case 'village_evening':
      return allTags.some(tag => tag.includes('村晚'));
    case 'church':
      return allTags.some(tag => 
        tag.includes('教會') || tag.includes('教堂') || tag.includes('長老教會')
      );
    case 'festival':
      return allTags.some(tag => 
        tag.includes('射耳祭住宿') || tag.includes('射耳祭')
      );
    case 'clan':
      return allTags.some(tag => 
        tag.includes('江氏宗親會') || tag.includes('宗親會')
      );
    case 'farm':
      return allTags.some(tag => 
        tag.includes('農訪') || tag.includes('農業')
      );
    case 'defense':
      return allTags.some(tag => 
        tag.includes('防身術') || tag.includes('防身')
      );
    default:
      return true;
  }
};

/**
 * 創建自定義 Leaflet icon
 */
const createCustomIcon = (iconType) => {
  const iconUrl = MARKER_ICONS[iconType] || MARKER_ICONS.default;
  
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  });
};

// ===========================================
// 🗺️ Map 組件主體
// ===========================================

const Map = ({ 
  locations, 
  onLocationSelect, 
  selectedLocation, 
  isAdmin, 
  onLocationAdded, 
  mapInstanceRef,
  isFullScreen // 新增：是否為全屏模式
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef_internal = useRef(null);
  const markersRef = useRef([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const layersRef = useRef([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  
  // 新增：標籤篩選狀態
  const [activeFilter, setActiveFilter] = useState('all');

  // 初始化地圖
  useEffect(() => {
    if (!mapRef.current) return;
    
    // 設置地圖
    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView([23.00116, 121.1308733], 20);
    
    // 定義不同的底圖
    const layers = [
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CartoDB'
      }),
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
      }),
    ];
    
    // 設定初始底圖
    layers[0].addTo(map); // 總是從第一個圖層開始
    layersRef.current = layers;
    
    // 保存地圖實例
    mapInstanceRef_internal.current = map;
    if (mapInstanceRef) {
      mapInstanceRef.current = map;
    }
    
    return () => {
      if (mapInstanceRef_internal.current) {
        mapInstanceRef_internal.current.remove();
      }
    };
  }, [mapInstanceRef]); // 移除 currentLayerIndex 依賴，避免重新初始化
  
  // 當地點數據或篩選條件更新時添加/更新標記
  useEffect(() => {
    if (!mapInstanceRef.current || !locations.length) return;
    
    // 清除現有標記
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];
    
    // 根據篩選條件過濾地點
    const filteredLocations = locations.filter(loc => 
      activeFilter === 'all' || matchesFilter(loc, activeFilter)
    );
    
    // 只添加符合篩選條件的標記
    filteredLocations.forEach(loc => {
      const lat = parseFloat(loc.latitude);
      const lon = parseFloat(loc.longitude);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        // 根據篩選狀態決定 marker 類型
        let markerType;
        
        if (activeFilter === 'all') {
          // 顯示全部時，根據標籤確定具體的 marker 類型
          markerType = determineMarkerType(loc.tag);
        } else if (activeFilter === 'village_evening') {
          // 村晚篩選時，保持細分的 marker 類型
          markerType = determineMarkerType(loc.tag);
        } else {
          // 其他篩選時，根據篩選類型統一顯示對應的 marker
          switch (activeFilter) {
            case 'church':
              markerType = 'church';
              break;
            case 'festival':
              markerType = 'festival';
              break;
            case 'clan':
              markerType = 'clan';
              break;
            case 'farm':
              markerType = 'farm';
              break;
            case 'defense':
              markerType = 'defense';
              break;
            default:
              markerType = 'default';
          }
        }
        
        // 創建對應的 icon
        const customIcon = createCustomIcon(markerType);
        
        // 建立標記
        const marker = L.marker([lat, lon], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            onLocationSelect(loc);
          });
        
        // 添加彈出窗口（無論是否篩選都可以看到基本信息）
        const allTags = extractAllTags(loc.tag);
        const popupContent = `
          <div style="text-align: center;">
            <strong>${loc.name}</strong>
            ${allTags.length > 0 ? `<br><small style="color: #666;">${allTags.slice(0, 3).join(', ')}${allTags.length > 3 ? '...' : ''}</small>` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);
        
        markersRef.current.push(marker);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, onLocationSelect, activeFilter]);
  
  // 當選中的地點變化時，將地圖居中到該地點
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    
    const lat = parseFloat(selectedLocation.latitude);
    const lon = parseFloat(selectedLocation.longitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      mapInstanceRef.current.setView([lat, lon], 19);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);
  
  // 處理標籤篩選變化
  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    // 移除自動調整地圖視角的功能，只進行篩選
  };
  
  // 處理用戶定位
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("你的瀏覽器不支援 GPS 定位功能");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        if (mapInstanceRef.current) {
          // 如果之前有標記，先移除
          if (window.userMarker) {
            mapInstanceRef.current.removeLayer(window.userMarker);
            mapInstanceRef.current.removeLayer(window.userCircle);
          }
          
          // 標記使用者位置
          window.userMarker = L.marker([lat, lon]).addTo(mapInstanceRef.current)
            .bindPopup("<b>您的位置</b><br>緯度: " + lat + "<br>經度: " + lon)
            .openPopup();
          
          // 用圓形顯示誤差範圍
          window.userCircle = L.circle([lat, lon], { 
            radius: accuracy, 
            color: "blue", 
            fillOpacity: 0.3 
          }).addTo(mapInstanceRef.current);
          
          // 自動將地圖縮放到使用者位置
          mapInstanceRef.current.setView([lat, lon], 17);
        }
      },
      function () {
        alert("無法獲取您的位置，請確認已開啟 GPS");
      }
    );
  };

  // 處理地圖圖層切換
  const handleLayerSwitch = () => {
    if (mapInstanceRef.current && layersRef.current.length > 0) {
      // 移除當前圖層
      mapInstanceRef.current.removeLayer(layersRef.current[currentLayerIndex]);
      
      // 計算下一個圖層索引
      const nextIndex = (currentLayerIndex + 1) % layersRef.current.length;
      
      // 添加新圖層
      mapInstanceRef.current.addLayer(layersRef.current[nextIndex]);
      
      // 更新狀態
      setCurrentLayerIndex(nextIndex);
    }
  };

  // 處理新增地點相關功能
  const handleAddLocationClick = () => {
    setShowAddLocationModal(true);
  };

  const handleLocationAdded = (newLocation) => {
    setShowAddLocationModal(false);
    if (onLocationAdded) {
      onLocationAdded(newLocation);
    }
  };

  const handleCloseModal = () => {
    setShowAddLocationModal(false);
  };

  return (
    <>
      <div id="map" ref={mapRef} className="map-container"></div>
      
      {/* 新增：標籤篩選器 */}
      <TagFilter
        locations={locations}
        onFilterChange={handleFilterChange}
        selectedFilter={activeFilter}
        isFullScreen={isFullScreen}
      />
      
      {/* 右下角按鈕群組 */}
      <div className="map-controls-container">
        {/* 管理員專用：新增地點按鈕 */}
        {isAdmin && (
          <button 
            className="map-control-btn add-location-button"
            onClick={handleAddLocationClick}
            title="新增地點"
          >
            <i className="fas fa-plus"></i>
          </button>
        )}

        {/* 地圖圖層切換按鈕 */}
        <button 
          className="map-control-btn map-switch-button"
          onClick={handleLayerSwitch}
          title="切換地圖圖層"
        >
          <img src={`${process.env.PUBLIC_URL}/assets/images/layers.png`} className="map-switch-icon" alt="切換圖層" />
        </button>

        {/* 定位按鈕 */}
        <button 
          className="map-control-btn locate-button"
          onClick={handleLocateUser}
          title="定位到我的位置"
        >
          📍
        </button>
      </div>

      {/* 新增地點模態框 */}
      {showAddLocationModal && (
        <AddLocationModal
          onLocationAdded={handleLocationAdded}
          onClose={handleCloseModal}
          mapInstance={mapInstanceRef_internal.current}
        />
      )}
    </>
  );
};

export default Map;