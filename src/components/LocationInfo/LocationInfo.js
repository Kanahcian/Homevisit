import React from 'react';
import './LocationInfo.css';

const LocationInfo = ({ location }) => {
  if (!location) return null;

  return (
    <div id="location-info" className="location-info">
      {/* 地點簡介 */}
      {location.brief_description && (
        <div className="location-brief" id="location-brief">
          <p>
            <i className="fas fa-bookmark"></i> 
            <span id="brief-description">{location.brief_description}</span>
          </p>
        </div>
      )}
      
      {/* 這裡可以添加更多地點相關資訊 */}
      <div className="location-additional-info">
        <div className="info-item">
          <div className="info-item-title">
            <i className="fas fa-map-marker-alt"></i>
            <span>位置座標</span>
          </div>
          <div className="info-item-content">
            {location.latitude}, {location.longitude}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;