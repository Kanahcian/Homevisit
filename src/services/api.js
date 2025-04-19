// API服務 - 處理與後端的所有通信
// 可以在開發和生產環境中切換API基本URL

const API_BASE_URL = process.env.REACT_APP_API_URL;

// 轉換Google Drive圖片連結為可顯示的縮圖URL
const convertGoogleDriveLink = (url) => {
  if (!url) return null;

  // 解析 Google Drive 連結的 FILE_ID
  const match = url.match(/file\/d\/(.*?)(\/|$)/);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`; // 1000px 縮圖
  }

  return url; // 如果無法解析，返回原始URL
};

// 日期格式化函數
const formatDate = (dateString) => {
  if (!dateString) return "未記錄";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // 如果日期無效，返回原始字符串
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("日期格式化錯誤:", error);
    return dateString;
  }
};

// 獲取所有地點
export const fetchLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/locations`);
    
    if (!response.ok) {
      throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === "success") {
      return data.data;
    } else {
      console.error("獲取地點失敗", data);
      return [];
    }
  } catch (error) {
    console.error("API 請求錯誤:", error);
    throw error;
  }
};

// 根據地點ID獲取家訪記錄
export const fetchRecords = async (locationId) => {
  try {
    // 嘗試方法1：作為查詢參數發送
    let apiUrl = `${API_BASE_URL}/api/records?locationid=${locationId}`;
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    // 如果第一種方法失敗，嘗試方法2：作為請求體發送
    if (!response.ok) {
      const payload = { locationid: Number(locationId) };
      
      response = await fetch(`${API_BASE_URL}/api/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }
    
    // 如果仍然失敗，記錄錯誤並返回空數組
    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      console.error("API 回應錯誤:", errorText);
      return [];
    }

    const data = await response.json();
    
    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data.map(record => {
        // 從村民詳情中創建帶ID的村民數據
        let villagerDetails = [];
        
        if (record.villagers && Array.isArray(record.villagers)) {
          // 如果只有村民名稱，則使用臨時ID
          villagerDetails = record.villagers.map((name, index) => ({
            name: name,
            id: index + 1
          }));
        }
        
        return {
          recordId: record.recordid,
          semester: record.semester,
          date: formatDate(record.date),
          description: record.description || "無訪視筆記",
          photo: convertGoogleDriveLink(record.photo),
          account: record.account,
          students: record.students || [],
          villagers: villagerDetails || [],
        };
      });
    } else {
      console.error("API 回應格式不符預期:", data);
      return [];
    }
  } catch (error) {
    console.error("API 請求錯誤:", error);
    throw error;
  }
};

// 獲取村民詳情
export const fetchVillagerDetails = async (villagerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/villager/${villagerId}`);
    
    if (!response.ok) {
      throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === "success") {
      // 處理村民數據
      const villager = data.data;
      return {
        id: villager.villagerid,
        name: villager.name,
        gender: villager.gender === 'M' ? '男' : villager.gender === 'F' ? '女' : villager.gender,
        job: villager.job || '無資料',
        photo: convertGoogleDriveLink(villager.photo),
        url: villager.url,
        locationId: villager.locationid
      };
    } else {
      console.error("獲取村民詳情失敗", data);
      return null;
    }
  } catch (error) {
    console.error("API 請求錯誤:", error);
    throw error;
  }
};

// 通過名稱查找村民ID（模擬API，實際應由後端提供）
export const findVillagerIdByName = async (name) => {
  try {
    // 獲取所有地點的記錄
    const locations = await fetchLocations();
    
    for (const location of locations) {
      const records = await fetchRecords(location.id);
      
      // 搜索所有記錄中的村民
      for (const record of records) {
        if (record.villagers) {
          for (const villager of record.villagers) {
            if (typeof villager === 'object' && villager.name === name) {
              return villager.id;
            } else if (villager === name) {
              // 如果找到名稱但沒有ID，返回null表示需要進一步操作
              return null;
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("查找村民ID錯誤:", error);
    return null;
  }
};

export default {
  fetchLocations,
  fetchRecords,
  fetchVillagerDetails,
  findVillagerIdByName,
  convertGoogleDriveLink,
  formatDate
};