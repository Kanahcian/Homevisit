import React, { useState, useEffect, useRef } from 'react';
import './Search.css';

// 搜索建議下拉列表項目組件
const SuggestionItem = ({ location, onClick, similarityScore }) => {
  return (
    <div className="suggestion-item" onClick={() => onClick(location)}>
      <span className="suggestion-name">{location.name}</span>
      {similarityScore && (
        <span className="suggestion-score">{Math.round(similarityScore)}%</span>
      )}
    </div>
  );
};

const Search = ({ locations, onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // 計算字串相似度（使用 Levenshtein 距離算法）
  const levenshteinDistance = (a, b) => {
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
  const similarityScore = (str1, str2) => {
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

  // 搜尋地點
  const searchLocations = (query) => {
    if (!query || query.trim().length < 1) {
      return [];
    }
    
    // 將查詢文字標準化
    query = query.trim().toLowerCase();
    
    // 先嘗試精確匹配、開頭匹配或包含匹配
    const exactMatches = locations.filter(location => {
      const name = location.name.toLowerCase();
      return name === query || name.startsWith(query) || name.includes(query);
    });
    
    // 如果有精確匹配，直接返回
    if (exactMatches.length > 0) {
      // 排序：完全匹配 > 開頭匹配 > 包含匹配
      return exactMatches.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        // 完全匹配最優先
        if (nameA === query && nameB !== query) return -1;
        if (nameA !== query && nameB === query) return 1;
        
        // 其次是開頭匹配
        if (nameA.startsWith(query) && !nameB.startsWith(query)) return -1;
        if (!nameA.startsWith(query) && nameB.startsWith(query)) return 1;
        
        // 最後按名稱長度排序（較短的名稱可能更相關）
        return nameA.length - nameB.length;
      });
    }
    
    // 否則進行模糊匹配
    const results = locations
      .map(location => {
        // 計算相似度分數
        const score = similarityScore(location.name.toLowerCase(), query);
        
        // 檢查是否為包含匹配
        const isContained = location.name.toLowerCase().includes(query);
        
        // 計算匹配位置 (用於排序和顯示高亮)
        const matchPosition = location.name.toLowerCase().indexOf(query);
        
        return { 
          ...location, 
          score, 
          isContained,
          matchPosition
        };
      })
      .filter(item => item.score > 35 || item.isContained) // 相似度超過35%或包含關鍵字的結果
      .sort((a, b) => {
        // 優先排序：
        // 1. 包含關鍵字的結果
        if (a.isContained && !b.isContained) return -1;
        if (!a.isContained && b.isContained) return 1;
        
        // 2. 如果都包含，則按照匹配位置排序（越早出現越靠前）
        if (a.isContained && b.isContained) {
          if (a.matchPosition !== b.matchPosition) {
            return a.matchPosition - b.matchPosition;
          }
        }
        
        // 3. 最後按相似度排序
        return b.score - a.score;
      });
    
    // 只返回前 5 個結果
    return results.slice(0, 5);
  };

  // 當查詢變更時更新建議
  useEffect(() => {
    if (query.trim()) {
      const results = searchLocations(query);
      setSuggestions(results);
      setIsActive(true);
    } else {
      setSuggestions([]);
      setIsActive(false);
    }
  }, [query, locations]);

  // 處理點擊建議項目
  const handleSuggestionClick = (location) => {
    setQuery(location.name);
    setSuggestions([]);
    setIsActive(false);
    onSearch(location.name);
  };

  // 處理清除按鈕點擊
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsActive(false);
    inputRef.current.focus();
  };

  // 處理點擊文檔其他地方時關閉建議列表
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target)
      ) {
        setSuggestions([]);
        setIsActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 處理按鍵事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div 
      className={`search-container ${isActive ? 'active' : ''}`} 
      ref={searchContainerRef}
    >
      <i className="fas fa-search search-icon"></i>
      <input
        ref={inputRef}
        type="text"
        id="search-input"
        placeholder="搜尋地點名稱..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsActive(true)}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <i 
          className="fas fa-times search-clear" 
          id="search-clear"
          onClick={handleClear}
        ></i>
      )}
      
      {suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((item, index) => (
            <SuggestionItem
              key={`suggestion-${index}-${item.id}`}
              location={item}
              onClick={handleSuggestionClick}
              similarityScore={item.score}
            />
          ))}
        </div>
      )}
      
      {query && suggestions.length === 0 && (
        <div className="search-suggestions">
          <div className="suggestion-item no-results">
            找不到「{query}」相關地點
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;