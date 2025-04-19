import React, { useState, useEffect } from 'react';
import './VillagerModal.css';
import { fetchVillagerDetails } from '../../services/api';
import { convertGoogleDriveLink } from '../../utils/helpers';

const VillagerModal = ({ isOpen, onClose, villagerId, villagerName }) => {
  const [villagerInfo, setVillagerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 只有當彈窗開啟且有村民ID時才獲取資料
    if (isOpen && villagerId) {
      loadVillagerInfo();
    }
  }, [isOpen, villagerId]);

  const loadVillagerInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const villagerData = await fetchVillagerDetails(villagerId);
      
      // 檢查返回的名稱是否與傳入的名稱匹配
      if (villagerData && villagerName && villagerData.name !== villagerName) {
        console.warn(`API 返回的村民 (${villagerData.name}) 與點擊的村民 (${villagerName}) 不符`);
        // 可以在這裡實現更復雜的錯誤處理或糾正邏輯
      }
      
      setVillagerInfo(villagerData);
    } catch (error) {
      console.error("加載村民資訊失敗:", error);
      setError(`發生錯誤: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化性別顯示
  const formatGender = (gender) => {
    if (gender === "M") return "男";
    if (gender === "F") return "女";
    return gender;
  };

  // 如果彈窗未開啟，不渲染任何內容
  if (!isOpen) return null;

  return (
    <div className="villager-modal-overlay active">
      <div className="villager-modal">
        <div className="villager-modal-header">
          <h3>{isLoading ? "加載中..." : (villagerInfo ? villagerInfo.name : villagerName || "村民資訊")}</h3>
          <span className="villager-modal-close" onClick={onClose}>&times;</span>
        </div>
        
        <div className="villager-modal-content">
          {isLoading ? (
            <div className="villager-photo-container">
              <p>資料加載中...</p>
            </div>
          ) : error ? (
            <div className="villager-error">
              <p>{error}</p>
              <p>無法載入 "{villagerName}" 的資料</p>
            </div>
          ) : villagerInfo ? (
            <>
              <div className="villager-photo-container">
                {villagerInfo.photo ? (
                  <img 
                    src={villagerInfo.photo} 
                    alt={`${villagerInfo.name} 的照片`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/photo-error.png';
                    }}
                  />
                ) : (
                  <p>暫無照片</p>
                )}
              </div>
              
              <div className="villager-info">
                <div className="info-row">
                  <span className="info-label">性別:</span>
                  <span className="info-value">{formatGender(villagerInfo.gender)}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">職業:</span>
                  <span className="info-value">{villagerInfo.job || "無資料"}</span>
                </div>
                
                {villagerInfo.url && (
                  <div className="info-row">
                    <span className="info-label">相關連結:</span>
                    <a 
                      className="info-value" 
                      href={villagerInfo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt"></i> 開啟連結
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="villager-not-found">
              <p>無法找到村民資料</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VillagerModal;