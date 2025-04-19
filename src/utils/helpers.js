// 輔助函數庫 - 提供通用功能

/**
 * 去除HTML標籤的函數
 * @param {string} html - 包含HTML標籤的文字
 * @returns {string} - 去除HTML標籤後的純文字
 */
export const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  };
  
  /**
   * 格式化日期顯示
   * @param {string|Date} date - 日期字符串或日期對象
   * @param {string} format - 格式化風格 (預設: 'full')
   * @returns {string} - 格式化後的日期
   */
  export const formatDate = (date, format = 'full') => {
    if (!date) return '未記錄';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      if (isNaN(dateObj.getTime())) return String(date);
      
      switch (format) {
        case 'short':
          return dateObj.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          });
        case 'year-month':
          return dateObj.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long'
          });
        case 'full':
        default:
          return dateObj.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          });
      }
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return String(date);
    }
  };
  
  // 計算字串相似度（使用 Levenshtein 距離算法）
  export const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // 初始化矩陣
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // 填充矩陣
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // 替換
            matrix[i][j - 1] + 1,     // 插入
            matrix[i - 1][j] + 1      // 刪除
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };
  
  // 計算相似度分數（0-100，100為完全匹配）
  export const similarityScore = (str1, str2) => {
    // 轉換為小寫以進行不區分大小寫的比較
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // 檢查包含關係
    if (s1.includes(s2) || s2.includes(s1)) {
      const longer = s1.length > s2.length ? s1 : s2;
      const shorter = s1.length > s2.length ? s2 : s1;
      
      // 如果較短的字符串完全包含在較長的字符串中
      // 給予較高的相似度分數，但仍根據長度差異進行調整
      const lengthRatio = shorter.length / longer.length;
      return 70 + (lengthRatio * 30); // 分數範圍從70到100
    }
    
    // 對於不包含的情況，使用編輯距離
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    
    if (longerLength === 0) {
      return 100;
    }
    
    // 計算距離
    const distance = levenshteinDistance(longer, shorter);
    
    // 計算相似度分數
    return (longerLength - distance) / longerLength * 100;
  };
  
  /**
   * 防抖函數 - 用於減少頻繁事件的觸發
   * @param {Function} func - 需要執行的函數
   * @param {number} wait - 等待時間(毫秒)
   * @returns {Function} - 防抖處理後的函數
   */
  export const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  };
  
  /**
   * 轉換Google Drive連結為縮圖URL
   * @param {string} url - Google Drive共享連結
   * @param {string} size - 縮圖大小 (預設: 'w1000')
   * @returns {string|null} - 縮圖URL或原始URL
   */
  export const convertGoogleDriveLink = (url, size = 'w1000') => {
    if (!url) return null;
  
    // 解析 Google Drive 連結的 FILE_ID
    const match = url.match(/file\/d\/(.*?)(\/|$)/);
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`; 
    }
  
    return url; // 如果無法解析，返回原始URL
  };
  
  /**
   * 獲取裝置類型
   * @returns {string} - 'mobile', 'tablet', 或 'desktop'
   */
  export const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };
  
  /**
   * 簡單的本地存儲封裝
   */
  export const storage = {
    // 設置值
    set: (key, value) => {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error('存儲數據失敗:', error);
      }
    },
    
    // 獲取值
    get: (key, defaultValue = null) => {
      try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) return defaultValue;
        return JSON.parse(serialized);
      } catch (error) {
        console.error('讀取數據失敗:', error);
        return defaultValue;
      }
    },
    
    // 刪除值
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('刪除數據失敗:', error);
      }
    },
    
    // 清空所有值
    clear: () => {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('清空數據失敗:', error);
      }
    }
  };