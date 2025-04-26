import React from 'react';
import './SidePanel.css';
import '../LoadingAnimation.css'; 
import LocationInfo from '../LocationInfo/LocationInfo';
import RecordDetails from '../RecordDetails/RecordDetails';

const SidePanel = ({ 
  location, 
  records, 
  isLoading, 
  showRecords, 
  toggleRecordsView, 
  currentRecordIndex, 
  navigateRecords,
  isActive,
  onClose
}) => {
  // 取得當前記錄
  const currentRecord = records && records.length > 0 ? records[currentRecordIndex] : null;
  
  // 如果側邊欄未激活，則不顯示
  if (!isActive) {
    return null;
  }

  return (
    <div className={`sidebar ${isActive ? 'active' : ''}`} id="sidebar">
      {/* 添加有效的關閉處理函數 */}
      <div className="sidebar-close" onClick={onClose || (() => window.history.back())}>&times;</div>
      <div className="location-details">
        <h2 id="location-name">{location ? location.name : '地點名稱'}</h2>

        {/* 家訪紀錄按鈕 */}
        {records && records.length > 0 && (
          <button 
            id="show-records-btn" 
            className={`records-toggle-btn ${isLoading ? 'loading' : ''}`}
            onClick={toggleRecordsView}
            disabled={isLoading}
          >
            {isLoading ? (
              <><i className="fas fa-spinner"></i> 獲取家訪紀錄中...</>
            ) : (
              showRecords ? (
                <><i className="fas fa-map-marker-alt"></i> 返回地點資訊</>
              ) : (
                <><i className="fas fa-clipboard-list"></i> 顯示家訪紀錄</>
              )
            )}
          </button>
        )}
        
        {/* 紀錄加載指示器 */}
        {isLoading && (
          <div id="records-loading-indicator" className="records-loading">
            {/* 用新的動畫替換原來的加載指示器 */}
            <div className="section-center">
              <div className="section-path">
                <div className="globe">
                  <div className="wrapper">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 地點基本信息區塊 - 隱藏座標信息 */}
        {!showRecords && (
          <LocationInfo location={location} hideCoordinates={true} />
        )}
        
        {/* 家訪紀錄區塊 */}
        {showRecords && records && records.length > 0 && (
          <div id="records-section" className="records-section">
            {/* 紀錄切換導覽列 */}
            <div className="records-nav">
              <button 
                id="prev-record" 
                className="nav-btn"
                onClick={() => navigateRecords('prev')}
                disabled={currentRecordIndex === 0}
              >
                &lt;
              </button>
              <span id="record-indicator">
                紀錄 {currentRecordIndex + 1}/{records.length}
              </span>
              <button 
                id="next-record" 
                className="nav-btn"
                onClick={() => navigateRecords('next')}
                disabled={currentRecordIndex === records.length - 1}
              >
                &gt;
              </button>
            </div>
            
            {/* 家訪紀錄詳情 */}
            {currentRecord && (
              <RecordDetails record={currentRecord} compactLayout={true} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;