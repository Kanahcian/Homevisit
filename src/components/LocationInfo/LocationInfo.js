import React from 'react';
import './LocationInfo.css';
import { convertGoogleDriveLink } from '../../utils/helpers';

const LocationInfo = ({ location, hideCoordinates }) => {
  if (!location) return null;

  return (
    <div id="location-info" className="location-info">
      {/* 地點照片 */}
      {location.photo && (
        <div className="location-photo-container">
          <img 
            src={convertGoogleDriveLink(location.photo)}
            alt={`${location.name} 的照片`}
            className="location-photo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${process.env.PUBLIC_URL}/assets/images/photo-error.png`;
              console.error("地點照片載入失敗:", location.photo);
            }}
          />
        </div>
      )}
      
      {/* 地點簡介 */}
      {location.brief_description && (
        <div className="location-brief" id="location-brief">
          <p>
            <i className="fas fa-bookmark"></i> 
            <span id="brief-description">{location.brief_description}</span>
          </p>
        </div>
      )}
      
      {/* 地點標籤 */}
      {location.tag && location.tag.length > 0 && (() => {
        // 處理標籤：將陣列中的每個元素以逗號分割，然後去重
        const allTags = location.tag
          .flatMap(tagString => 
            typeof tagString === 'string' 
              ? tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
              : []
          )
          .filter((tag, index, array) => array.indexOf(tag) === index); // 去除重複標籤
        
        return allTags.length > 0 ? (
          <div className="location-additional-info">
            <div className="info-item">
              <div className="info-item-title">
                <i className="fas fa-tags"></i>
                <span>標籤</span>
              </div>
              <div className="info-item-content">
                <div className="location-tags">
                  {allTags.map((tag, index) => (
                    <span key={index} className="location-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}
      
      {/* 地址信息 */}
      {location.address && (
        <div className="location-additional-info">
          <div className="info-item">
            <div className="info-item-title">
              <i className="fas fa-map-pin"></i>
              <span>地址</span>
            </div>
            <div className="info-item-content">
              {location.address}
            </div>
          </div>
        </div>
      )}
      
      {/* 座標信息 - 根據 hideCoordinates 參數決定是否顯示 */}
      {!hideCoordinates && location.latitude && location.longitude && (
        <div className="location-additional-info">
          <div className="info-item">
            <div className="info-item-title">
              <i className="fas fa-map-marker-alt"></i>
              <span>位置座標</span>
            </div>
            <div className="info-item-content">
              <div className="coordinates">
                <span>緯度: {location.latitude}</span>
                <span>經度: {location.longitude}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;