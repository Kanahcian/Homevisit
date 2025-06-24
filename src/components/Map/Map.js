import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import L from 'leaflet';
import AddLocationModal from './AddLocationModal';

// ===========================================
// 📍 ICON 配置區域 - 在這裡設定所有 icon 路徑
// ===========================================
const MARKER_ICONS = {
  default: '/assets/images/pin.png',        // 預設標記 (請替換為實際路徑)
  church: '/assets/images/church.png', // 教會標記 (請替換為實際路徑)
  festival: '/assets/images/home.png', // 射耳祭住宿標記 (請替換為實際路徑)
  village_evening: '/assets/images/firewood.png', // 村晚系列標記 (請替換為實際路徑)
  clan: '/assets/images/family.png',     // 江氏宗親會標記 (請替換為實際路徑)
  farm: '/assets/images/sprout.png',     // 農訪標記 (請替換為實際路徑)
  defense: '/assets/images/shield.png' // 防身術標記 (請替換為實際路徑)
};

// ===========================================
// 🏷️ 標籤分類與優先級系統
// ===========================================

/**
 * 從地點標籤陣列中提取所有個別標籤
 * @param {Array} tagArray - 標籤陣列，可能包含逗號分隔的字串
 * @returns {Array} 所有個別標籤的陣列
 */
const extractAllTags = (tagArray) => {
  if (!tagArray || !Array.isArray(tagArray)) return [];
  
  return tagArray
    .flatMap(tagString => 
      typeof tagString === 'string' 
        ? tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []
    )
    .filter((tag, index, array) => array.indexOf(tag) === index); // 去除重複
};

/**
 * 根據標籤確定 marker 類型（按優先級）
 * @param {Array} tagArray - 地點的標籤陣列
 * @returns {string} marker 類型
 */
const determineMarkerType = (tagArray) => {
  const allTags = extractAllTags(tagArray);
  
  // 優先級 1: 村晚系列（最高優先級）
  const villageEveningTags = ['村晚卡拉ok機', '村晚木柴', '村晚烤爐'];
  if (allTags.some(tag => 
    villageEveningTags.includes(tag) || tag.includes('村晚')
  )) {
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
  
  // 預設
  return 'default';
};

/**
 * 創建自定義 Leaflet icon
 * @param {string} iconType - icon 類型
 * @returns {L.Icon} Leaflet icon 實例
 */
const createCustomIcon = (iconType) => {
  return L.icon({
    iconUrl: MARKER_ICONS[iconType] || MARKER_ICONS.default,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  });
};

// ===========================================
// 🗺️ Map 組件主體
// ===========================================

const Map = ({ locations, onLocationSelect, selectedLocation, isAdmin, onLocationAdded, mapInstanceRef }) => {
  const mapRef = useRef(null);
  const mapInstanceRef_internal = useRef(null);
  const markersRef = useRef([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const layersRef = useRef([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

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
    layers[currentLayerIndex].addTo(map);
    layersRef.current = layers;
    
    // 保存地圖實例
    mapInstanceRef_internal.current = map;

    // 如果父組件傳遞了 mapInstanceRef，也設置它
    if (mapInstanceRef) {
      mapInstanceRef.current = map;
    }
    
    // 清理函數
    return () => {
      if (mapInstanceRef_internal.current) {
        mapInstanceRef_internal.current.remove();
      }
    };
  }, [currentLayerIndex, mapInstanceRef]);
  
  // 當地點數據更新時添加標記
  useEffect(() => {
    if (!mapInstanceRef.current || !locations.length) return;
    
    // 清除現有標記
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];
    
    // 添加新標記
    locations.forEach(loc => {
      const lat = parseFloat(loc.latitude);
      const lon = parseFloat(loc.longitude);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        // 根據標籤確定 marker 類型
        const markerType = determineMarkerType(loc.tag);
        
        // 創建對應的 icon
        const customIcon = createCustomIcon(markerType);
        
        // 建立標記
        const marker = L.marker([lat, lon], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            onLocationSelect(loc);
          });
        
        // 添加彈出窗口（顯示地點名稱和主要標籤）
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
  }, [locations, onLocationSelect, mapInstanceRef]);
  
  // 當選中的地點變化時，將地圖居中到該地點
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    
    const lat = parseFloat(selectedLocation.latitude);
    const lon = parseFloat(selectedLocation.longitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      mapInstanceRef.current.setView([lat, lon], 19);
    }
  }, [selectedLocation, mapInstanceRef]);
  
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
    if (mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(layersRef.current[currentLayerIndex]);
      const nextIndex = (currentLayerIndex + 1) % layersRef.current.length;
      setCurrentLayerIndex(nextIndex);
      mapInstanceRef.current.addLayer(layersRef.current[nextIndex]);
    }
  };

  // 處理新增地點按鈕點擊
  const handleAddLocationClick = () => {
    setShowAddLocationModal(true);
  };

  // 處理新增地點成功
  const handleLocationAdded = (newLocation) => {
    setShowAddLocationModal(false);
    // 通知父組件重新載入地點資料
    if (onLocationAdded) {
      onLocationAdded(newLocation);
    }
  };

  // 處理模態框關閉
  const handleCloseModal = () => {
    setShowAddLocationModal(false);
  };

  return (
    <>
      <div id="map" ref={mapRef} className="map-container"></div>
      
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
          <img src="/assets/images/layers.png" className="map-switch-icon" alt="切換圖層" />
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