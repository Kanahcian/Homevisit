import React, { useState } from 'react';
import './DeleteConfirmModal.css';
import { deleteLocation } from '../../services/api';

const DeleteConfirmModal = ({ location, onLocationDeleted, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 處理刪除確認
  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    try {
      await deleteLocation(location.id);
      
      // 通知父組件刪除成功
      onLocationDeleted(location.id);
      
    } catch (err) {
      setError(err.message || '刪除地點失敗，請稍後再試');
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-confirm-modal-overlay">
      <div className="delete-confirm-modal">
        <div className="modal-header">
          <h3>
            <i className="fas fa-exclamation-triangle warning-icon"></i>
            確認刪除地點
          </h3>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <div className="warning-content">
            <div className="location-info">
              <h4>您即將刪除以下地點：</h4>
              <div className="location-details">
                <strong>{location.name}</strong>
                {location.address && (
                  <div className="location-address">{location.address}</div>
                )}
                <div className="location-coordinates">
                  緯度: {location.latitude}, 經度: {location.longitude}
                </div>
              </div>
            </div>
            
            <div className="warning-text">
              <p><strong>注意：此操作無法復原！</strong></p>
              <p>刪除地點後，相關的家訪紀錄可能會受到影響。請確認您真的要刪除此地點。</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            <i className="fas fa-times"></i>
            取消
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                刪除中...
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i>
                確認刪除
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;