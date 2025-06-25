import React, { useState, useMemo } from 'react';
import './TagFilter.css';

// 標籤分類配置
const TAG_CATEGORIES = [
  {
    id: 'all',
    name: '全部',
    icon: '🗺️',
    description: '顯示所有地點',
    matchFunction: () => true
  },
  {
    id: 'village_evening',
    name: '村晚',
    icon: '🎤',
    description: '村晚相關地點',
    matchFunction: (tags) => tags.some(tag => tag.includes('村晚'))
  },
  {
    id: 'church',
    name: '教會',
    icon: '⛪',
    description: '教會相關地點',
    matchFunction: (tags) => tags.some(tag => 
      tag.includes('教會') || tag.includes('教堂') || tag.includes('長老教會')
    )
  },
  {
    id: 'festival',
    name: '射耳祭',
    icon: '🏹',
    description: '射耳祭住宿地點',
    matchFunction: (tags) => tags.some(tag => 
      tag.includes('射耳祭住宿') || tag.includes('射耳祭')
    )
  },
  {
    id: 'clan',
    name: '宗親會',
    icon: '🏛️',
    description: '江氏宗親會',
    matchFunction: (tags) => tags.some(tag => 
      tag.includes('江氏宗親會') || tag.includes('宗親會')
    )
  },
  {
    id: 'farm',
    name: '農訪',
    icon: '🌱',
    description: '農業相關地點',
    matchFunction: (tags) => tags.some(tag => 
      tag.includes('農訪') || tag.includes('農業')
    )
  },
  {
    id: 'defense',
    name: '防身術',
    icon: '🥋',
    description: '防身術相關地點',
    matchFunction: (tags) => tags.some(tag => 
      tag.includes('防身術') || tag.includes('防身')
    )
  }
];

/**
 * 從地點標籤陣列中提取所有個別標籤
 */
const extractAllTags = (tagArray) => {
  if (!tagArray || !Array.isArray(tagArray)) return [];
  
  return tagArray
    .flatMap(tagString => 
      typeof tagString === 'string' 
        ? tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []
    )
    .filter((tag, index, array) => array.indexOf(tag) === index);
};

const TagFilter = ({ locations, onFilterChange, selectedFilter, isFullScreen }) => {
  // 過濾出有地點的分類
  const availableCategories = useMemo(() => {
    return TAG_CATEGORIES.filter(category => {
      if (category.id === 'all') return true;
      
      return locations.some(location => {
        const allTags = extractAllTags(location.tag);
        return category.matchFunction(allTags);
      });
    });
  }, [locations]);

  // 處理標籤點擊
  const handleTagClick = (categoryId) => {
    if (onFilterChange) {
      onFilterChange(categoryId === selectedFilter ? 'all' : categoryId);
    }
  };

  // 如果是全屏模式，不顯示篩選器
  if (isFullScreen) {
    return null;
  }

  return (
    <div className="tag-filter-container">
      <div className="tag-filter-scroll">
        {availableCategories.map(category => (
          <button
            key={category.id}
            className={`tag-filter-btn ${selectedFilter === category.id ? 'active' : ''}`}
            onClick={() => handleTagClick(category.id)}
            title={category.description}
            data-category={category.id}
          >
            <span className="tag-icon">{category.icon}</span>
            <span className="tag-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;