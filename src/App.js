import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './components/Map/Map';
import Search from './components/Search/Search';
import SidePanel from './components/SidePanel/SidePanel';
import BottomCard from './components/BottomCard/BottomCard';
import { fetchLocations, fetchRecords } from './services/api';

function App() {
  // 主要狀態管理
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationRecords, setLocationRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [showRecords, setShowRecords] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);

  // 處理響應式設計
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 初始加載所有地點
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        console.error('無法加載地點資料:', error);
      }
    };

    loadLocations();
  }, []);

  // 選擇地點時加載相關記錄
  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setShowRecords(false); // 重置為顯示基本資訊
    setCurrentRecordIndex(0); // 重置為第一條記錄
    
    if (location) {
      setIsLoading(true);
      try {
        const records = await fetchRecords(location.id);
        setLocationRecords(records);
      } catch (error) {
        console.error('無法加載家訪記錄:', error);
        setLocationRecords([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 搜索並選擇地點
  const handleSearch = (query) => {
    // 搜索邏輯保留，但整合到React組件中
    const foundLocation = locations.find(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (foundLocation) {
      handleLocationSelect(foundLocation);
    }
  };

  // 切換顯示記錄/基本資訊
  const toggleRecordsView = () => {
    setShowRecords(!showRecords);
  };

  // 導航記錄
  const navigateRecords = (direction) => {
    if (direction === 'prev' && currentRecordIndex > 0) {
      setCurrentRecordIndex(currentRecordIndex - 1);
    } else if (direction === 'next' && currentRecordIndex < locationRecords.length - 1) {
      setCurrentRecordIndex(currentRecordIndex + 1);
    }
  };

  return (
    <div className="app-container">
      {/* 搜索欄 */}
      <Search onSearch={handleSearch} locations={locations} />
      
      {/* 地圖 */}
      <Map 
        locations={locations} 
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />
      
      {/* 定位按鈕 */}
      <button id="locate-btn" className="locate-button">📍</button>
      
      {/* 根據裝置顯示側邊欄(桌面版)或底部卡片(手機版) */}
      {!isMobile ? (
        <SidePanel 
          location={selectedLocation}
          records={locationRecords}
          isLoading={isLoading}
          showRecords={showRecords}
          toggleRecordsView={toggleRecordsView}
          currentRecordIndex={currentRecordIndex}
          navigateRecords={navigateRecords}
          isActive={!!selectedLocation}
        />
      ) : (
        <BottomCard 
          location={selectedLocation}
          records={locationRecords}
          isLoading={isLoading}
          showRecords={showRecords}
          toggleRecordsView={toggleRecordsView}
          currentRecordIndex={currentRecordIndex}
          navigateRecords={navigateRecords}
          isActive={!!selectedLocation}
        />
      )}
    </div>
  );
}

export default App;