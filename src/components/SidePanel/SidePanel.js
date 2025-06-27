import React, { useState, useMemo, useEffect } from 'react'; // 確保導入 useEffect
import './SidePanel.css';
import '../LoadingAnimation.css'; 
import LocationInfo from '../LocationInfo/LocationInfo';
import RecordDetails from '../RecordDetails/RecordDetails';
import EditLocationModal from '../Map/EditLocationModal';
import DeleteConfirmModal from '../Map/DeleteConfirmModal';

const SidePanel = ({ 
  location, 
  records, 
  isLoading, 
  showRecords, 
  toggleRecordsView,
  isActive,
  onClose,
  isAdmin,
  onLocationUpdated,
  onLocationDeleted,
  mapInstance
}) => {
  // 管理每個年份的展開/收起狀態
  const [expandedYears, setExpandedYears] = useState(new Set());
  // 管理員模態框狀態
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 【新增】調整按鈕位置 - 桌面版側邊欄
  useEffect(() => {
    const adjustButtonPositions = (isActive) => {
      // 移除未使用的 controlsContainer 變數
      const appContainer = document.querySelector('.app-container');
      
      if (isActive) {
        // 側邊欄打開時，按鈕向右移動避免被遮蓋
        if (appContainer) {
          appContainer.classList.add('sidebar-open');
        }
      } else {
        // 側邊欄關閉時，恢復按鈕位置
        if (appContainer) {
          appContainer.classList.remove('sidebar-open');
        }
      }
    };
    
    adjustButtonPositions(isActive);
    
    return () => {
      // 清理時重置
      adjustButtonPositions(false);
    };
  }, [isActive]);

  // 按年份分組記錄
  const recordsByYear = useMemo(() => {
    if (!records || records.length === 0) return {};
    
    const grouped = {};
    records.forEach(record => {
      // 從原始日期中提取年份
      let year = '未知年份';
      
      // 優先使用 rawDate，如果沒有則使用 date
      const dateToUse = record.rawDate || record.date;
      
      if (dateToUse) {
        // 嘗試不同的日期解析方法
        
        // 方法1: 如果是 YYYYMMDD 格式
        if (/^\d{8}$/.test(dateToUse)) {
          year = dateToUse.substring(0, 4);
        }
        // 方法2: 如果包含 - 分隔符 (YYYY-MM-DD)
        else if (dateToUse.includes('-')) {
          const parts = dateToUse.split('-');
          if (parts[0] && /^\d{4}$/.test(parts[0])) {
            year = parts[0];
          }
        }
        // 方法3: 如果是中文格式，嘗試提取年份
        else {
          const yearMatch = dateToUse.match(/(\d{4})/);
          if (yearMatch) {
            year = yearMatch[1];
          }
        }
      }
      
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(record);
    });
    
    // 按年份排序（最新的在前）
    const sortedYears = Object.keys(grouped).sort((a, b) => {
      if (a === '未知年份') return 1;
      if (b === '未知年份') return -1;
      return parseInt(b) - parseInt(a);
    });
    
    const sortedGrouped = {};
    sortedYears.forEach(year => {
      // 每年內的記錄也按日期排序（最新的在前）
      sortedGrouped[year] = grouped[year].sort((a, b) => {
        const dateA = a.rawDate || a.date || '';
        const dateB = b.rawDate || b.date || '';
        return dateB.localeCompare(dateA);
      });
    });
    
    return sortedGrouped;
  }, [records]);
  
  // 切換年份展開/收起狀態
  const toggleYear = (year) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };
  
  // 如果側邊欄未激活，則不顯示
  if (!isActive) {
    return null;
  }

  return (
    <div className={`sidebar ${isActive ? 'active' : ''}`} id="sidebar">
      <div className="sidebar-close" onClick={onClose || (() => window.history.back())}>&times;</div>
      <div className="location-details">
        <h2 id="location-name">{location ? location.name : '地點名稱'}</h2>
        {/* 管理員按鈕區域 */}
        {isAdmin && location && !isLoading && (
          <div className="admin-buttons">
            <button 
              className="admin-btn edit-btn"
              onClick={() => setShowEditModal(true)}
              title="編輯地點"
            >
              <i className="fas fa-edit"></i>
              編輯地點
            </button>
            <button 
              className="admin-btn delete-btn"
              onClick={() => setShowDeleteModal(true)}
              title="刪除地點"
            >
              <i className="fas fa-trash"></i>
              刪除地點
            </button>
          </div>
        )}
        
        {/* 紀錄加載指示器 - 在加載狀態下顯示 */}
        {isLoading && (
          <div id="records-loading-indicator" className="records-loading">
            {/* <div className="loading-text">加載家訪紀錄中...</div> */}
          </div>
        )}

        {/* 家訪紀錄按鈕 - 只在非加載狀態下顯示 */}
        {records && records.length > 0 && !isLoading && (
          <button 
            id="show-records-btn" 
            className="records-toggle-btn"
            onClick={toggleRecordsView}
          >
            {showRecords ? 
              <><i className="fas fa-map-marker-alt"></i> 返回地點資訊</> : 
              <><i className="fas fa-clipboard-list"></i> 顯示家訪紀錄</>
            }
          </button>
        )}
        
        {/* 地點基本信息區塊 - 只有在非加載狀態時才顯示 */}
        {!showRecords && !isLoading && (
          <LocationInfo location={location} hideCoordinates={true} />
        )}
        
        {/* 家訪紀錄區塊 - 改版後的年份分組顯示 */}
        {showRecords && records && records.length > 0 && (
          <div id="records-section" className="records-section">
            <div className="records-summary">
              <span>共 {records.length} 筆記錄</span>
            </div>
            
            {/* 按年份分組的記錄 */}
            <div className="records-by-year">
              {Object.entries(recordsByYear).map(([year, yearRecords]) => (
                <div key={year} className="year-group">
                  {/* 年份標題和展開/收起按鈕 */}
                  <div 
                    className="year-header"
                    onClick={() => toggleYear(year)}
                  >
                    <div className="year-info">
                      <span className="year-title">{year}</span>
                      <span className="year-count">({yearRecords.length}筆)</span>
                    </div>
                    <button className="year-toggle-btn">
                      {expandedYears.has(year) ? 
                        <i className="fas fa-minus"></i> : 
                        <i className="fas fa-plus"></i>
                      }
                    </button>
                  </div>
                  
                  {/* 該年份的記錄列表 */}
                  {expandedYears.has(year) && (
                    <div className="year-records">
                      {yearRecords.map((record, index) => (
                        <div key={`${year}-${index}`} className="record-item">
                          <RecordDetails record={record} compactLayout={true} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 編輯地點模態框 */}
        {showEditModal && location && (
          <EditLocationModal
            location={location}
            onLocationUpdated={(updatedLocation) => {
              setShowEditModal(false);
              if (onLocationUpdated) onLocationUpdated(updatedLocation);
            }}
            onClose={() => setShowEditModal(false)}
            mapInstance={mapInstance}
          />
        )}

        {/* 刪除確認模態框 */}
        {showDeleteModal && location && (
          <DeleteConfirmModal
            location={location}
            onLocationDeleted={(locationId) => {
              setShowDeleteModal(false);
              if (onLocationDeleted) onLocationDeleted(locationId);
            }}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
    </div>
  );
};

export default SidePanel;