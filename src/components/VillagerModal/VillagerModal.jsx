import React, { useState, useEffect, useCallback } from 'react';
import './VillagerModal.css';
import { fetchVillagerDetails } from '../../services/api';

const VillagerModal = ({ isOpen, onClose, villagerId, villagerName }) => {
  const [villagerInfo, setVillagerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 使用 useCallback 包裝 loadVillagerInfo 函數
  const loadVillagerInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`正在載入村民資訊，ID: ${villagerId}`);
      const data = await fetchVillagerDetails(villagerId);
      setVillagerInfo(data);
    } catch (error) {
      console.error("載入村民資訊失敗:", error);
      setError(`無法載入資料: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [villagerId]); // villagerId 是依賴項

  useEffect(() => {
    // 只有當彈窗開啟且有村民ID時才獲取資料
    if (isOpen && villagerId) {
      loadVillagerInfo();
    }
  }, [isOpen, villagerId, loadVillagerInfo]); // 現在包含所有依賴項

  // 如果彈窗未開啟，不渲染任何內容
  if (!isOpen) return null;

  return (
    <div className="villager-modal-overlay active">
      <div className="villager-modal">
        <div className="villager-modal-header">
          <h3>{isLoading ? "載入中..." : (villagerInfo ? villagerInfo.name : villagerName || "村民資訊")}</h3>
          <span className="villager-modal-close" onClick={onClose}>&times;</span>
        </div>
        
        <div className="villager-modal-content">
          {isLoading ? (
            <div className="villager-photo-container">
              <p>資料載入中...</p>
            </div>
          ) : error ? (
            <div className="villager-error">
              <p>{error}</p>
              <p>無法載入村民資料 (ID: {villagerId})</p>
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
                  <span className="info-value">{villagerInfo.gender}</span>
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