import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './components/Map/Map';
import Search from './components/Search/Search';
import SidePanel from './components/SidePanel/SidePanel';
import BottomCard from './components/BottomCard/BottomCard';
import MainMenu from './components/MainMenu/MainMenu';
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
  const [isFullScreenContent, setIsFullScreenContent] = useState(false);
  const [activeMenuSection, setActiveMenuSection] = useState('home');

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
    // 如果全屏內容正在顯示，不進行地點選擇操作
    if (isFullScreenContent) return;
    
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
    // 如果全屏內容正在顯示，不進行搜索操作
    if (isFullScreenContent) return;
    
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

  // 關閉側邊欄
  const handleCloseSidePanel = () => {
    setSelectedLocation(null);
  };
  
  // 從選單中選擇內容
  const handleMenuSelect = (sectionId) => {
    setActiveMenuSection(sectionId);
    setIsFullScreenContent(true);
  };
  
  // 返回地圖視圖
  const handleBackToMap = () => {
    setIsFullScreenContent(false);
    setActiveMenuSection('home');
  };

  return (
    <div className="app-container">
      {/* 搜索欄 - 全屏模式下隱藏 */}
      {!isFullScreenContent && (
        <Search onSearch={handleSearch} locations={locations} />
      )}
      
      {/* 地圖 - 全屏模式下隱藏 */}
      {!isFullScreenContent && (
        <Map 
          locations={locations} 
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      )}
      
      {/* 定位按鈕 - 全屏模式下隱藏 */}
      {!isFullScreenContent && (
        <button id="locate-btn" className="locate-button">📍</button>
      )}
      
      {/* 主選單 */}
      <MainMenu 
        onSectionSelect={handleMenuSelect} 
        onBackToMap={handleBackToMap}
        activeSection={activeMenuSection}
        isFullScreen={isFullScreenContent}
      />
      
      {/* 根據裝置顯示側邊欄(桌面版)或底部卡片(手機版) - 全屏模式下和沒有選擇地點時隱藏 */}
      {!isFullScreenContent && !isMobile && selectedLocation && (
        <SidePanel 
          location={selectedLocation}
          records={locationRecords}
          isLoading={isLoading}
          showRecords={showRecords}
          toggleRecordsView={toggleRecordsView}
          currentRecordIndex={currentRecordIndex}
          navigateRecords={navigateRecords}
          isActive={!!selectedLocation}
          onClose={handleCloseSidePanel}
        />
      )}
      
      {!isFullScreenContent && isMobile && selectedLocation && (
        <BottomCard 
          location={selectedLocation}
          records={locationRecords}
          isLoading={isLoading}
          showRecords={showRecords}
          toggleRecordsView={toggleRecordsView}
          currentRecordIndex={currentRecordIndex}
          navigateRecords={navigateRecords}
          isActive={!!selectedLocation}
          onClose={handleCloseSidePanel}
        />
      )}
    </div>
  );
}

export default App;