// API服務 - 處理與後端的所有通信
// 可以在開發和生產環境中切換API基本URL

const API_BASE_URL = process.env.REACT_APP_API_URL;

// 模擬村民資料 - 當 API 無法訪問時使用
const MOCK_VILLAGERS = {
  "1": {
    id: 1,
    name: "江新武長老",
    gender: "男", // 將 'M' 轉換為 '男'
    job: "務農",
    url: "https://drive.google.com/drive/folders/1yPZgOwiplTbiocQyH8pCNwkZd78HTKnN",
    photo: "https://drive.google.com/thumbnail?id=1y8ASM5k7T9ZeD4-R9dnFv9PCilAYmB4D",
    locationId: 5
  },
  "2": {
    id: 2,
    name: "Cina Valis",
    gender: "女", // 將 'F' 轉換為 '女'
    job: "教師",
    url: null,
    photo: null,
    locationId: 5
  }
};

// 轉換Google Drive連結為縮圖URL
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

// 新增地點
export const addLocation = async (locationData) => {
  try {
    console.log('正在新增地點:', locationData);
    
    const response = await fetch(`${API_BASE_URL}/api/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData)
    });
    
    if (!response.ok) {
      let errorMessage = `API請求失敗: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // 如果無法解析錯誤響應，使用默認錯誤訊息
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data.status === "success") {
      console.log('地點新增成功:', data.data);
      return data.data;
    } else {
      console.error("新增地點失敗", data);
      throw new Error(data.message || '新增地點失敗');
    }
  } catch (error) {
    console.error("新增地點 API 請求錯誤:", error);
    throw error;
  }
};

// 根据地点ID获取家访记录
export const fetchRecords = async (locationId) => {
  try {
    // 尝试方法1：作为查询参数发送
    let apiUrl = `${API_BASE_URL}/api/records?locationid=${locationId}`;
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    // 如果第一种方法失败，尝试方法2：作为请求体发送
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
    
    // 如果仍然失败，记录错误并返回空数组
    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      console.error("API 回应错误:", errorText);
      return [];
    }

    const data = await response.json();
    
    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data.map(record => {
        // 处理村民数据 - 修改这里的处理逻辑
        let villagerDetails = [];
        
        if (record.villagers && Array.isArray(record.villagers)) {
          // 检查返回的村民数据结构
          if (record.villagers.length > 0) {
            if (typeof record.villagers[0] === 'object' && record.villagers[0].hasOwnProperty('villager_id')) {
              // 如果API返回的是带ID的对象，使用真实ID
              villagerDetails = record.villagers.map(villager => ({
                name: villager.name,
                id: villager.villager_id
              }));
            } else {
              // 如果只返回名称，标记这些村民需要额外查询其ID
              villagerDetails = record.villagers.map(name => ({
                name: name,
                needsIdLookup: true // 标记需要额外查询ID
              }));
            }
          }
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
      console.error("API 回应格式不符预期:", data);
      return [];
    }
  } catch (error) {
    console.error("API 请求错误:", error);
    throw error;
  }
};

// 修改後的獲取村民詳情函數 - 兼容 API 不可用的情況
export const fetchVillagerDetails = async (villagerId) => {
  if (!villagerId) {
    console.error('嘗試獲取村民詳情但 ID 為空');
    throw new Error('村民 ID 不可為空');
  }

  try {
    console.log(`嘗試獲取村民 ID: ${villagerId}`);
    
    // 先嘗試使用 API
    try {
      // 完整 URL (不依賴環境變數)
      const apiUrl = `https://kanahcian-backend.onrender.com/api/villager/${villagerId}`;
      console.log(`正在請求 API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log("API 回應:", data);
        
        if (data.status === "success" && data.data) {
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
        }
      }
      
      // 如果到達這裡，表示 API 請求沒有返回有效數據
      console.warn(`API 請求未返回有效數據，狀態碼: ${response.status}`);
    } catch (apiError) {
      console.warn(`API 請求失敗: ${apiError.message}`);
    }
    
    // 如果 API 請求失敗，使用模擬數據
    console.log(`使用模擬數據 (ID: ${villagerId})`);
    
    if (MOCK_VILLAGERS[villagerId]) {
      return MOCK_VILLAGERS[villagerId];
    }
    
    // 如果也找不到模擬數據，則拋出錯誤
    throw new Error(`找不到村民資料 (ID: ${villagerId})`);
  } catch (error) {
    console.error("獲取村民資料失敗:", error);
    throw error;
  }
};

// 通过名称查找村民ID
export const findVillagerIdByName = async (name) => {
  if (!name) return null;
  
  try {
    console.log(`尝试查找村民ID: ${name}`);
    
    // 获取所有地点的记录
    const locations = await fetchLocations();
    
    // 缓存查找结果，避免多次请求相同的村民
    if (!window.villagerNameToIdCache) {
      window.villagerNameToIdCache = {};
    }
    
    // 如果缓存中有该名称的ID，直接返回
    if (window.villagerNameToIdCache[name]) {
      console.log(`从缓存中找到村民ID: ${name} -> ${window.villagerNameToIdCache[name]}`);
      return window.villagerNameToIdCache[name];
    }
    
    // 遍历所有地点查找村民
    for (const location of locations) {
      try {
        const records = await fetchRecords(location.id);
        
        // 搜索所有记录中的村民
        for (const record of records) {
          if (record.villagers && Array.isArray(record.villagers)) {
            for (const villager of record.villagers) {
              // 检查不同的数据结构
              if (typeof villager === 'object') {
                if (villager.name === name && villager.id && !villager.id.toString().startsWith('temp_')) {
                  // 缓存并返回找到的真实ID
                  window.villagerNameToIdCache[name] = villager.id;
                  console.log(`找到村民ID: ${name} -> ${villager.id}`);
                  return villager.id;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(`獲取地點${location.id}的紀錄時出錯:`, error);
        continue; // 继续检查下一个地点
      }
    }
    
    console.log(`未找到村民ID: ${name}`);
    return null;
  } catch (error) {
    console.error("查找村民ID錯誤:", error);
    return null;
  }
};

// 更新地點
export const updateLocation = async (locationId, locationData) => {
  try {
    console.log(`正在更新地點 ID: ${locationId}`, locationData);
    
    const response = await fetch(`${API_BASE_URL}/api/location/${locationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData)
    });
    
    if (!response.ok) {
      let errorMessage = `API請求失敗: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // 如果無法解析錯誤響應，使用默認錯誤訊息
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data.status === "success") {
      console.log('地點更新成功:', data.data);
      return data.data;
    } else {
      console.error("更新地點失敗", data);
      throw new Error(data.message || '更新地點失敗');
    }
  } catch (error) {
    console.error("更新地點 API 請求錯誤:", error);
    throw error;
  }
};

// 刪除地點
export const deleteLocation = async (locationId) => {
  try {
    console.log(`正在刪除地點 ID: ${locationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/location/${locationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      let errorMessage = `API請求失敗: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // 如果無法解析錯誤響應，使用默認錯誤訊息
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data.status === "success") {
      console.log('地點刪除成功:', data.message);
      return data;
    } else {
      console.error("刪除地點失敗", data);
      throw new Error(data.message || '刪除地點失敗');
    }
  } catch (error) {
    console.error("刪除地點 API 請求錯誤:", error);
    throw error;
  }
};

export default {
  fetchLocations,
  fetchRecords,
  fetchVillagerDetails,
  findVillagerIdByName,
  addLocation,
  updateLocation,  // 新增
  deleteLocation,  // 新增
  convertGoogleDriveLink,
  formatDate
};

// 添加一個測試函數，方便在控制台中測試
export const testVillagerAPI = async (id = 1) => {
  try {
    console.log(`測試村民 API，ID: ${id}`);
    const result = await fetchVillagerDetails(id);
    console.log("測試結果:", result);
    return result;
  } catch (error) {
    console.error("測試失敗:", error);
    return null;
  }
};