import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 匯入 Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

// 添加圖標到庫中，以便在應用中使用
library.add(fas, far);

// 創建 React 根元素
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);