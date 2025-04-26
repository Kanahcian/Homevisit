import React, { useState } from 'react';
import './RecordDetails.css';
import VillagerModal from '../VillagerModal/VillagerModal';

// 參與者標籤組件
const ParticipantTags = ({ participants, type, onVillagerClick }) => {
  if (!participants || participants.length === 0) {
    return <span className="empty-info">無{type === 'student' ? '學生' : '村民'}參與</span>;
  }

  // 為不同類型的參與者設置不同的樣式和行為
  return (
    <>
      {participants.map((person, index) => {
        const name = typeof person === 'object' ? person.name : person;
        const id = person.id || index + 1;
        
        return (
          <span 
            key={`${type}-${id}-${index}`}
            className={`participant-tag ${type}`}
            data-id={id}
            title={type === 'villager' ? "點擊查看詳細資訊" : ""}
            onClick={type === 'villager' ? () => onVillagerClick(name, id) : undefined}
          >
            {name}
          </span>
        );
      })}
      
      {type === 'villager' && (
        <span className="participant-hint">
          <i className="fas fa-info-circle"></i> 點擊村民名稱查看詳情
        </span>
      )}
    </>
  );
};

const RecordDetails = ({ record, compactLayout = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVillager, setSelectedVillager] = useState(null);

  if (!record) return null;

  // 處理村民點擊事件
  const handleVillagerClick = (name, id) => {
    setSelectedVillager({ name, id });
    setModalOpen(true);
  };

  // 使用緊湊布局時的組件排序
  if (compactLayout) {
    return (
      <>
        {/* 整合的資訊區塊 - 先顯示訪視紀錄 */}
        <div className="visit-info-integrated" id="integrated-info">
          <div className="record-title">
            <h3>訪視紀錄</h3>
            <span className="record-date">{record.date}</span>
          </div>
          
          <div className="info-section">
            {/* 學期 */}
            <div className="info-item semester">
              <div className="info-item-title">
                <i className="fas fa-book"></i>
                <span>學期</span>
              </div>
              <div className="info-item-content">
                {record.semester}
              </div>
            </div>
            
            {/* 參與學生 */}
            <div className="info-item students">
              <div className="info-item-title">
                <i className="fas fa-users"></i>
                <span>參與學生</span>
              </div>
              <div className="info-item-content">
                <ParticipantTags participants={record.students} type="student" />
              </div>
            </div>
            
            {/* 村民 */}
            <div className="info-item villagers">
              <div className="info-item-title">
                <i className="fas fa-home"></i>
                <span>村民</span>
              </div>
              <div className="info-item-content">
                <ParticipantTags 
                  participants={record.villagers} 
                  type="villager" 
                  onVillagerClick={handleVillagerClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 訪視筆記 - 第二顯示 */}
        <div className="visit-notes">
          <h3><i className="fas fa-clipboard"></i> 訪視筆記</h3>
          <p id="visit-notes">{record.description || "無訪視筆記"}</p>
        </div>
        
        {/* 照片區塊 - 最後顯示 */}
        <div className="photo-container" id="location-photos">
          {record.photo ? (
            <img 
              src={record.photo} 
              alt="訪視照片" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/photo-error.png';
                console.error("照片載入失敗:", record.photo);
              }}
            />
          ) : (
            <p>暫無照片</p>
          )}
        </div>

        {/* 村民詳情彈窗 */}
        <VillagerModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          villagerId={selectedVillager?.id}
          villagerName={selectedVillager?.name}
        />
      </>
    );
  }

  // 原始布局
  return (
    <>
      {/* 整合的資訊區塊 */}
      <div className="visit-info-integrated" id="integrated-info">
        <div className="record-title">
          <h3>訪視紀錄</h3>
          <span className="record-date">{record.date}</span>
        </div>
        
        <div className="info-section">
          {/* 學期 */}
          <div className="info-item semester">
            <div className="info-item-title">
              <i className="fas fa-book"></i>
              <span>學期</span>
            </div>
            <div className="info-item-content">
              {record.semester}
            </div>
          </div>
          
          {/* 參與學生 */}
          <div className="info-item students">
            <div className="info-item-title">
              <i className="fas fa-users"></i>
              <span>參與學生</span>
            </div>
            <div className="info-item-content">
              <ParticipantTags participants={record.students} type="student" />
            </div>
          </div>
          
          {/* 村民 */}
          <div className="info-item villagers">
            <div className="info-item-title">
              <i className="fas fa-home"></i>
              <span>村民</span>
            </div>
            <div className="info-item-content">
              <ParticipantTags 
                participants={record.villagers} 
                type="villager" 
                onVillagerClick={handleVillagerClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 照片區塊 */}
      <div className="photo-container" id="location-photos">
        {record.photo ? (
          <img 
            src={record.photo} 
            alt="訪視照片" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/images/photo-error.png';
              console.error("照片載入失敗:", record.photo);
            }}
          />
        ) : (
          <p>暫無照片</p>
        )}
      </div>

      {/* 訪視筆記 */}
      <div className="visit-notes">
        <h3><i className="fas fa-clipboard"></i> 訪視筆記</h3>
        <p id="visit-notes">{record.description || "無訪視筆記"}</p>
      </div>

      {/* 村民詳情彈窗 */}
      <VillagerModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        villagerId={selectedVillager?.id}
        villagerName={selectedVillager?.name}
      />
    </>
  );
};

export default RecordDetails;