import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import L from 'leaflet';
import AddLocationModal from './AddLocationModal';

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
    const zoomLevel = window.innerWidth < 768 ? 22 : 22;
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);
  
  // 當地點數據更新時添加標記
  useEffect(() => {
    if (!mapInstanceRef.current || !locations.length) return;
    
    // 清除現有標記
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];
    
    // 創建自定義圖標
    const customIcon = L.icon({
      iconUrl: '/assets/images/pin.png',
      iconSize: [35, 35],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40]
    });
    
    // 添加新標記
    locations.forEach(loc => {
      const lat = parseFloat(loc.latitude);
      const lon = parseFloat(loc.longitude);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = L.marker([lat, lon], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            onLocationSelect(loc);
          });
        
        markersRef.current.push(marker);
      }
    });
  }, [locations, onLocationSelect]);
  
  // 當選中的地點變化時，將地圖居中到該地點
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    
    const lat = parseFloat(selectedLocation.latitude);
    const lon = parseFloat(selectedLocation.longitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      mapInstanceRef.current.setView([lat, lon], 19);
    }
  }, [selectedLocation]);
  
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