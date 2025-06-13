import React, { useState } from 'react';
import './RecordDetails.css';
import VillagerModal from '../VillagerModal/VillagerModal';

// 参与者标签组件
const ParticipantTags = ({ participants, type, onVillagerClick }) => {
  if (!participants || participants.length === 0) {
    return <span className="empty-info">無{type === 'student' ? '學生' : '村民'}參與</span>;
  }

  return (
    <>
      {participants.map((person, index) => {
        // 處理不同形式的資料結構
        const name = typeof person === 'object' ? person.name : person;
        
        // 根據名稱分配已知的 ID
        let id;
        if (name === "江新武長老") {
          id = 1;
        } else if (name === "Cina Valis") {
          id = 2;
        } else {
          id = index + 1; // 預設 ID
        }
        
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
      
      {type === 'villager' && participants.length > 0 && (
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

  // 处理村民点击事件
  const handleVillagerClick = (name, id) => {
    console.log(`村民點擊: 名稱=${name}, ID=${id}`);
    
    // 轉換 ID 確保是數字 (如果可能的話)
    let villagerID = id;
    if (typeof id === 'string' && !id.startsWith('temp_')) {
      // 嘗試將字串轉換為數字
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        villagerID = numId;
      }
    }
    
    setSelectedVillager({ name, id: villagerID });
    setModalOpen(true);
  };

  // 緊湊布局 - 新的卡片式設計
  if (compactLayout) {
    return (
      <>
        {/* 緊湊記錄卡片 */}
        <div className="compact-record-card">
          {/* 日期標題 */}
          <div className="compact-record-header">
            <span className="record-semester">{record.semester}</span>
            <span className="record-date">{record.date}</span>
          </div>
          
          {/* 第一行：參與學生 和 參與村民 */}
          <div className="compact-row">
            <div className="compact-section participants-section">
              <div className="section-title">參與學生</div>
              <div className="section-content">
                <ParticipantTags participants={record.students} type="student" />
              </div>
            </div>
            
            <div className="compact-section participants-section">
              <div className="section-title">參與村民</div>
              <div className="section-content">
                <ParticipantTags 
                  participants={record.villagers} 
                  type="villager" 
                  onVillagerClick={handleVillagerClick}
                />
              </div>
            </div>
          </div>
          
          {/* 第二行：家訪記錄 */}
          <div className="compact-row">
            <div className="compact-section full-width">
              <div className="section-title">家訪記錄</div>
              <div className="section-content">
                <div className="visit-description">
                  {record.description || "無訪視筆記"}
                </div>
              </div>
            </div>
          </div>
          
          {/* 第三行：照片 */}
          {record.photo && (
            <div className="compact-row">
              <div className="compact-section full-width photo-only">
                <div className="section-content">
                  <div className="compact-photo-container">
                    <img 
                      src={record.photo} 
                      alt="訪視照片" 
                      className="compact-photo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/photo-error.png';
                        console.error("照片載入失敗:", record.photo);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 村民详情弹窗 */}
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
      {/* 整合的资讯区块 */}
      <div className="visit-info-integrated" id="integrated-info">
        <div className="record-title">
          <h3>訪視紀錄</h3>
          <span className="record-date">{record.date}</span>
        </div>
        
        <div className="info-section">
          {/* 学期 */}
          <div className="info-item semester">
            <div className="info-item-title">
              <i className="fas fa-book"></i>
              <span>學期</span>
            </div>
            <div className="info-item-content">
              {record.semester}
            </div>
          </div>
          
          {/* 参与学生 */}
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

      {/* 照片区块 */}
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

      {/* 访视笔记 */}
      <div className="visit-notes">
        <h3><i className="fas fa-clipboard"></i> 訪視筆記</h3>
        <p id="visit-notes">{record.description || "無訪視筆記"}</p>
      </div>

      {/* 村民详情弹窗 */}
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