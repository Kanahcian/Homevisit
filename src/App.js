import React, { useState, useEffect, useRef } from 'react';
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
  
  // 管理員狀態
  const [isAdmin, setIsAdmin] = useState(false);
  // 地圖實例的 ref
  const mapInstanceRef = useRef(null);

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
    loadLocations();
  }, []);

  // 載入地點的函數
  const loadLocations = async () => {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (error) {
      console.error('無法加載地點資料:', error);
    }
  };

  // 處理地點相關事件
  const handleLocationAdded = (newLocation) => {
    console.log('新地點已新增:', newLocation);
    loadLocations();
  };

  const handleLocationUpdated = (updatedLocation) => {
    console.log('地點已更新:', updatedLocation);
    setLocations(prevLocations => 
      prevLocations.map(loc => 
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
    if (selectedLocation && selectedLocation.id === updatedLocation.id) {
      setSelectedLocation(updatedLocation);
    }
  };

  const handleLocationDeleted = (deletedLocationId) => {
    console.log('地點已刪除, ID:', deletedLocationId);
    setLocations(prevLocations => 
      prevLocations.filter(loc => loc.id !== deletedLocationId)
    );
    if (selectedLocation && selectedLocation.id === deletedLocationId) {
      setSelectedLocation(null);
      setLocationRecords([]);
      setShowRecords(false);
    }
  };

  // 選擇地點時加載相關記錄
  const handleLocationSelect = async (location) => {
    if (isFullScreenContent) return;
    
    setSelectedLocation(location);
    setShowRecords(false);
    setCurrentRecordIndex(0);
    
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
    if (isFullScreenContent) return;
    
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
  
  // 選單相關處理
  const handleMenuSelect = (sectionId) => {
    setActiveMenuSection(sectionId);
    setIsFullScreenContent(true);
  };
  
  const handleBackToMap = () => {
    setIsFullScreenContent(false);
    setActiveMenuSection('home');
  };

  // 管理員相關處理
  const handleAdminLogin = (success) => {
    setIsAdmin(success);
    if (success) {
      console.log('管理員登入成功');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    console.log('管理員已登出');
  };

  return (
    <div className="app-container">
      {/* 搜索欄 - 全屏模式下隱藏 */}
      {!isFullScreenContent && (
        <Search onSearch={handleSearch} locations={locations} />
      )}
      
      {/* 地圖 - 全屏模式下隱藏，並傳遞 isFullScreen 屬性 */}
      {!isFullScreenContent && (
        <Map 
          locations={locations} 
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          isAdmin={isAdmin}
          onLocationAdded={handleLocationAdded}
          mapInstanceRef={mapInstanceRef}
          isFullScreen={isFullScreenContent} // 新增：傳遞全屏狀態
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
        isAdmin={isAdmin}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
      />
      
      {/* 側邊欄(桌面版) */}
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
          isAdmin={isAdmin}
          onLocationUpdated={handleLocationUpdated}
          onLocationDeleted={handleLocationDeleted}
          mapInstance={mapInstanceRef.current}
        />
      )}
      
      {/* 底部卡片(手機版) */}
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
          isAdmin={isAdmin}
          onLocationUpdated={handleLocationUpdated}
          onLocationDeleted={handleLocationDeleted}
          mapInstance={mapInstanceRef.current}
        />
      )}
    </div>
  );
}

export default App;