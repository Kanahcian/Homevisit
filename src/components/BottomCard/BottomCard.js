import React, { useEffect } from 'react';
import './BottomCard.css';
import LocationInfo from '../LocationInfo/LocationInfo';
import RecordDetails from '../RecordDetails/RecordDetails';

const BottomCard = ({ 
  location, 
  records, 
  isLoading, 
  showRecords, 
  toggleRecordsView, 
  currentRecordIndex, 
  navigateRecords,
  isActive
}) => {
  // 取得當前記錄
  const currentRecord = records && records.length > 0 ? records[currentRecordIndex] : null;
  
  // 調整按鈕位置
  useEffect(() => {
    const adjustButtonPositions = (isCardActive) => {
      const locateBtn = document.getElementById('locate-btn');
      const mapSwitchBtn = document.querySelector('.map-switch-button');
      
      if (isCardActive) {
        if (locateBtn) locateBtn.style.display = 'none';
        if (mapSwitchBtn) mapSwitchBtn.style.display = 'none';
      } else {
        if (locateBtn) locateBtn.style.display = 'flex';
        if (mapSwitchBtn) mapSwitchBtn.style.display = 'flex';
      }
    };
    
    adjustButtonPositions(isActive);
    
    return () => {
      // 清理時重置按鈕
      adjustButtonPositions(false);
    };
  }, [isActive]);
  
  // 處理滑動手勢
  useEffect(() => {
    if (!isActive || !showRecords) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;
    
    const handleTouchStart = (event) => {
      touchStartX = event.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (event) => {
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) < minSwipeDistance) return;
      
      if (swipeDistance > 0 && currentRecordIndex > 0) {
        // 向右滑動（上一條記錄）
        navigateRecords('prev');
        animateContent('right');
      } else if (swipeDistance < 0 && currentRecordIndex < records.length - 1) {
        // 向左滑動（下一條記錄）
        navigateRecords('next');
        animateContent('left');
      }
    };
    
    const animateContent = (direction) => {
      const contentElements = [
        document.getElementById('mobile-location-photos'),
        document.querySelector('#mobile-integrated-info'),
        document.getElementById('mobile-visit-notes')
      ];
      
      const translateValue = direction === 'left' ? '-15px' : '15px';
      
      contentElements.forEach(element => {
        if (element) {
          element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          element.style.opacity = '0.5';
          element.style.transform = `translateX(${translateValue})`;
          
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
          }, 250);
        }
      });
    };
    
    const recordsSection = document.getElementById('mobile-records-section');
    if (recordsSection) {
      recordsSection.addEventListener('touchstart', handleTouchStart);
      recordsSection.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      if (recordsSection) {
        recordsSection.removeEventListener('touchstart', handleTouchStart);
        recordsSection.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isActive, showRecords, currentRecordIndex, records, navigateRecords]);
  
  if (!isActive) {
    return null;
  }

  return (
    <div className={`bottom-card ${isActive ? 'active' : ''}`} id="bottom-card">
      <div className="drag-handle"></div>
      <div className="bottom-card-close" onClick={() => window.history.back()}>&times;</div>
      
      <div className="card-content">
        <h2 id="mobile-location-name">{location ? location.name : '地點名稱'}</h2>

        {/* 家訪紀錄按鈕 */}
        {records && records.length > 0 && (
          <button 
            id="mobile-show-records-btn" 
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
          <div id="mobile-records-loading-indicator" className="records-loading">
            <i className="fas fa-spinner"></i>
            <span className="records-loading-text">正在獲取家訪紀錄...</span>
          </div>
        )}
        
        {/* 地點基本信息區塊 */}
        {!showRecords && (
          <div id="mobile-location-info">
            <LocationInfo location={location} />
          </div>
        )}
        
        {/* 家訪紀錄區塊 */}
        {showRecords && records && records.length > 0 && (
          <div id="mobile-records-section" className="records-section">
            {/* 紀錄切換導覽列 */}
            <div className="records-nav">
              <button 
                id="mobile-prev-record" 
                className="nav-btn"
                onClick={() => navigateRecords('prev')}
                disabled={currentRecordIndex === 0}
              >
                &lt;
              </button>
              <span id="mobile-record-indicator">
                紀錄 {currentRecordIndex + 1}/{records.length}
              </span>
              <button 
                id="mobile-next-record" 
                className="nav-btn"
                onClick={() => navigateRecords('next')}
                disabled={currentRecordIndex === records.length - 1}
              >
                &gt;
              </button>
            </div>
            
            {/* 滑動指示點 */}
            <div className="swipe-indicators">
              {records.map((_, index) => (
                <div 
                  key={`indicator-${index}`} 
                  className={`swipe-indicator ${index === currentRecordIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            
            {/* 滑動提示 */}
            <div className="swipe-hint">← 左右滑動切換紀錄 →</div>
            
            {/* 家訪紀錄詳情 */}
            {currentRecord && (
              <div id="mobile-details-wrapper">
                {/* 使用和桌面版相同的RecordDetails組件，但為其添加特定id以便於滑動動畫 */}
                <div id="mobile-location-photos" className="photo-container">
                  {currentRecord.photo ? (
                    <img 
                      src={currentRecord.photo} 
                      alt="訪視照片" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/photo-error.png';
                      }}
                    />
                  ) : (
                    <p>暫無照片</p>
                  )}
                </div>
                
                <div id="mobile-integrated-info" className="visit-info-integrated">
                  {/* 這裡重複RecordDetails中的整合資訊區塊，但具有不同id */}
                  <RecordDetails record={currentRecord} />
                </div>
                
                <div id="mobile-visit-notes" className="visit-notes">
                  <h3><i className="fas fa-clipboard"></i> 訪視筆記</h3>
                  <p>{currentRecord.description || "無訪視筆記"}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomCard;