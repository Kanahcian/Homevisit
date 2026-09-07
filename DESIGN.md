---
name: 加拿家家訪地圖
description: 加拿部落家訪服務隊用的地圖式家訪資料庫
colors:
  primary: "#4a8fe7"
  primary-deep: "#3972c0"
  primary-alt: "#2980b9"
  primary-alt-deep: "#21618c"
  danger: "#e74c3c"
  danger-deep: "#c0392b"
  success: "#33801d"
  text-primary: "#333333"
  text-secondary: "#666666"
  text-tertiary: "#999999"
  border: "#e0e0e0"
  divider: "#eeeeee"
  surface: "#ffffff"
  surface-muted: "#f8f9fa"
typography:
  body:
    fontFamily: "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "24px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 15px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 15px"
  button-danger-hover:
    backgroundColor: "{colors.danger-deep}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  chip-active:
    backgroundColor: "{colors.text-primary}"
    textColor: "#ffffff"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: 加拿家家訪地圖

## Overview

**Creative North Star: "The Trail Companion / 隨行嚮導"**

這是一套為家訪服務隊設計的隨行工具：新手成員邊走邊查、建立信心，熟手成員快速查資料、快速紀錄。視覺語言務實、沉穩、不喧賓奪主——地圖與資料才是主角，介面本身應該像一位可靠的嚮導，安靜地站在旁邊。色彩克制，功能性動作（確認、危險、成功）用色彩直接標示，不做裝飾性漸層或花俏效果。

**Key Characteristics:**
- 單一信賴藍（Steady Trust Blue）作為主色，用於按鈕、連結、地圖標記
- 紅／綠僅用於危險與成功等功能性回饋，不作裝飾
- 圓角、間距皆走溫和但不圓潤過頭的尺度（8px 為主）
- 排版走系統字體，不追求品牌化字體表現

## Colors

克制的功能性配色：一個主藍色，加上紅（危險）與綠（成功）兩個語意色，其餘皆為灰階中性色。

### Primary
- **沉穩信賴藍 Steady Trust Blue** (#4a8fe7): 主要按鈕、連結文字、地圖標記、選中狀態。整個系統最主要的可互動色。
- **深信賴藍 Deep Trust Blue** (#3972c0): 主藍色的 hover / active 狀態。
- **信賴藍（次要用途）Trust Blue Alt** (#2980b9) / **深階** (#21618c): 管理員登入等次要表單按鈕的 hover 對，與主藍色同色系但用於區隔次要動作。

### Secondary
- **警示紅 Alert Red** (#e74c3c): 刪除、錯誤訊息、危險動作。
- **深警示紅 Deep Alert Red** (#c0392b): 警示紅的 hover / active 狀態。

### Tertiary
- **確認綠 Confirm Green** (#33801d): 成功訊息、新增/確認完成的回饋。

### Neutral
- **主要文字 Ink** (#333333): 標題與主要內文文字。
- **次要文字 Slate** (#666666): 說明文字、次要標籤。
- **輔助文字 Mist** (#999999): 佔位文字、非重點資訊。
- **邊框 Hairline** (#e0e0e0): 卡片、輸入框邊框。
- **分隔線 Divider** (#eeeeee): 列表項目分隔線。
- **表面 Surface** (#ffffff): 卡片、彈窗、選單背景。
- **柔和表面 Surface Muted** (#f8f9fa): 卡片標題列、次要區塊背景。

### Named Rules
**The Functional Color Rule.** 紅與綠只出現在危險/成功這類明確的功能性回饋上，不用來做裝飾或強調非功能性的內容。

## Typography

**Body Font:** Arial（回退 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif）
**Label Font:** 與 Body 同一字體家族，僅字重與字級不同

**Character:** 純系統字體，不追求品牌化的字體表現；可讀性與載入速度優先於個性。

### Hierarchy
- **Body** (400, 14px, line-height 1.5): 內文、清單項目、表單欄位。
- **Label** (500, 13px, line-height 1.3): 標籤按鈕、選單項目、次要標示文字。

目前程式碼中 `index.css` 宣告了系統字體堆疊，但 `App.css` 對 `html, body` 又重新宣告為 `Arial, sans-serif`，兩者衝突且以 App.css 後載入為準。

### Named Rules
**The Single Voice Rule.** 全站只有一套字體家族，不引入第二種字體做裝飾性標題。

## Layout

以全螢幕地圖為底，桌面版用左側 SidePanel（280px 寬）疊加資訊，手機版用底部 BottomCard 由下往上滑出。搜尋欄與標籤篩選器固定於地圖上方，隨選單開闔而位移。間距尺度以 4px 為基準，實際落點集中在 8 / 12 / 16 / 20 / 24px。互動元件的過渡動畫統一使用 `0.2s–0.3s ease`。

## Elevation & Depth

**目標方向（本次確認，尚未套用到程式碼）：扁平化、用邊框分層，不用陰影表達層級。** 現有卡片與彈窗仍大量使用柔和陰影（`box-shadow` 落在 `0 1–8px`、黑色透明度 10–30%）營造浮起效果；這次 document 時使用者已確認要往扁平化方向調整，之後做 `layout` / `quieter` 之類的視覺工作時，請以「邊框分層、不用陰影」為準，並逐步汰換現有陰影樣式。

### Named Rules
**The Flat-By-Default Rule.** 卡片與容器在靜止狀態下是扁平的，用 1px 邊框（`{colors.border}`）區分層級，陰影不再作為預設的層次手段。

## Shapes

以 8px 圓角（`{rounded.md}`）為主要基準，小型元素（標籤篩選按鈕、搜尋欄）用更大的膠囊型圓角（24-25px），頭像與圖示按鈕用全圓（50%）。整體形狀語言溫和但不追求極端圓潤。

## Components

### Buttons
- **Shape:** 中圓角（8px）
- **Primary:** 背景 `{colors.primary}`、文字白色、padding `10px 15px`
- **Danger:** 背景 `{colors.danger}`、文字白色，用於刪除/危險確認
- **Hover / Focus:** 背景色轉為對應的 deep 色階，過渡 `0.2s ease`

### Chips (標籤篩選)
- **Style:** 白底、`1px solid #ddd` 邊框、膠囊圓角（24px）、柔和陰影
- **State:** 選中時背景轉為 `{colors.text-primary}`（深灰／近黑）、文字白色

### Cards / Containers
- **Corner Style:** 大圓角（12px）
- **Background:** `{colors.surface}`
- **Shadow Strategy:** 現況為柔和浮起陰影；目標方向見 Elevation & Depth，逐步改為邊框分層
- **Internal Padding:** 16-24px

### Inputs / Fields
- **Style:** 無邊框、透明背景，依附於外層搜尋容器的圓角與陰影
- **Focus:** 外層容器陰影加深（`0 4px 12px`）

### Navigation
- **MainMenu：** 側滑選單，項目使用 Label 字級；管理員登入用次要藍色系按鈕。
- **Mobile：** 底部卡片（BottomCard）取代側邊欄，由下往上滑出。

## Do's and Don'ts

### Do:
- **Do** 把紅／綠色只用在危險／成功這類明確的功能性回饋上（The Functional Color Rule）。
- **Do** 新元件的圓角預設用 `{rounded.md}`（8px），小型互動按鈕才用膠囊圓角。
- **Do** 之後的視覺調整往「邊框分層、不用陰影」的方向收斂（The Flat-By-Default Rule）。

### Don't:
- **Don't** 引入第二種字體做裝飾性標題（The Single Voice Rule）。
- **Don't** 在 `html`/`body` 這類全域選擇器上重複宣告衝突的 `font-family`（目前 `index.css` 與 `App.css` 已有此問題，新程式碼不要延續）。
- **Don't** 為了強調非功能性內容而使用警示紅或確認綠。
