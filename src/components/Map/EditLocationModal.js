import React, { useState, useEffect } from 'react';
import './AddLocationModal.css'; // 重用相同的樣式
import { updateLocation } from '../../services/api';

const EditLocationModal = ({ location, onLocationUpdated, onClose, mapInstance }) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    brief_description: '',
    photo: '',
    tag: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMapClickMode, setIsMapClickMode] = useState(false);

  // 初始化表單數據
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        address: location.address || '',
        brief_description: location.brief_description || '',
        photo: location.photo || '',
        tag: location.tag || []
      });
    }
  }, [location]);

  // 處理表單輸入變化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理標籤輸入
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // 添加標籤
  const addTag = () => {
    if (tagInput.trim() && !formData.tag.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tag: [...prev.tag, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 移除標籤
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tag: prev.tag.filter(tag => tag !== tagToRemove)
    }));
  };

  // 處理標籤輸入的 Enter 鍵
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 啟用地圖點擊模式來選擇坐標
  const enableMapClickMode = () => {
    setIsMapClickMode(true);
    if (mapInstance) {
      mapInstance.getContainer().style.cursor = 'crosshair';
      
      const onMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }));
        
        // 清理事件監聽器
        mapInstance.off('click', onMapClick);
        mapInstance.getContainer().style.cursor = '';
        setIsMapClickMode(false);
      };
      
      mapInstance.on('click', onMapClick);
    }
  };

  // 取消地圖點擊模式
  const cancelMapClickMode = () => {
    setIsMapClickMode(false);
    if (mapInstance) {
      mapInstance.off('click');
      mapInstance.getContainer().style.cursor = '';
    }
  };

  // 獲取當前位置
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('瀏覽器不支援地理定位功能');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
      },
      (error) => {
        setError('無法獲取當前位置：' + error.message);
      }
    );
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 驗證必填字段
      if (!formData.name || !formData.latitude || !formData.longitude) {
        throw new Error('名稱、緯度和經度為必填項目');
      }

      // 驗證坐標格式
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('緯度和經度必須為有效數字');
      }

      // 準備 API 數據
      const locationData = {
        name: formData.name,
        latitude: lat,
        longitude: lng,
        address: formData.address || '',
        brief_description: formData.brief_description || '',
        photo: formData.photo || '',
        tag: formData.tag
      };

      // 調用 API
      const updatedLocation = await updateLocation(location.id, locationData);
      
      // 通知父組件
      onLocationUpdated(updatedLocation);
      
    } catch (err) {
      setError(err.message || '更新地點失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 清理效果
  useEffect(() => {
    return () => {
      if (mapInstance) {
        mapInstance.off('click');
        mapInstance.getContainer().style.cursor = '';
      }
    };
  }, [mapInstance]);

  return (
    <div className="add-location-modal-overlay">
      <div className="add-location-modal">
        <div className="modal-header">
          <h3>編輯地點</h3>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">地點名稱 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="請輸入地點名稱"
              required
            />
          </div>

          <div className="coordinate-section">
            <div className="coordinate-header">
              <h4>坐標資訊 *</h4>
              <div className="coordinate-buttons">
                <button
                  type="button"
                  className={`coordinate-btn ${isMapClickMode ? 'active' : ''}`}
                  onClick={isMapClickMode ? cancelMapClickMode : enableMapClickMode}
                  disabled={isLoading}
                >
                  <i className="fas fa-map-marker-alt"></i>
                  {isMapClickMode ? '取消選擇' : '地圖選點'}
                </button>
                <button
                  type="button"
                  className="coordinate-btn"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                >
                  <i className="fas fa-location-arrow"></i>
                  目前位置
                </button>
              </div>
            </div>
            
            {isMapClickMode && (
              <div className="map-click-hint">
                <i className="fas fa-info-circle"></i>
                請在地圖上點擊選擇新的位置
              </div>
            )}

            <div className="coordinate-inputs">
              <div className="form-group">
                <label htmlFor="latitude">緯度</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="23.001234"
                  step="any"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">經度</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="121.123456"
                  step="any"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">地址</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="請輸入詳細地址（選填）"
            />
          </div>

          <div className="form-group">
            <label htmlFor="brief_description">簡短描述</label>
            <textarea
              id="brief_description"
              name="brief_description"
              value={formData.brief_description}
              onChange={handleInputChange}
              placeholder="請輸入地點的簡短描述（選填）"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo">照片連結</label>
            <input
              type="url"
              id="photo"
              name="photo"
              value={formData.photo}
              onChange={handleInputChange}
              placeholder="請輸入照片的 GOOGLE 檔案連結（記得開權限）（選填）"
            />
          </div>

          <div className="form-group">
            <label>標籤</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagKeyPress}
                placeholder="輸入標籤後按 Enter 或點擊添加，一次輸入一個標籤"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="add-tag-btn"
              >
                添加
              </button>
            </div>
            {formData.tag.length > 0 && (
              <div className="tags-display">
                {formData.tag.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  更新中...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  更新地點
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocationModal;