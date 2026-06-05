# 美甲工作室 一頁式網站模板

> 店家形象網站 + 線上預約表單  
> 純 HTML / CSS / JavaScript，無需框架

---

## 目錄結構

```
nail-studio/
├── index.html          # 首頁（一頁式）
├── booking.html        # 預約表單頁
├── css/
│   ├── variables.css   # 全站顏色變數（改色只需改這裡）
│   ├── base.css        # Reset + 共用元件
│   ├── index.css       # 首頁專屬樣式
│   └── booking.css     # 預約頁專屬樣式
├── js/
│   ├── main.js         # 首頁腳本
│   └── booking.js      # 預約頁腳本
├── images/             # 放 favicon / OG 圖 / Logo（自行新增）
└── README.md           # 本文件
```

---

## 快速上線

1. 將整個資料夾上傳至任何靜態主機（GitHub Pages、Vercel、Netlify 皆可）。
2. 依照下方「內容替換清單」修改假字。
3. 確認圖片路徑正確。
4. 完成。

---

## 內容替換清單

搜尋 `【修改】` 關鍵字，依序替換：

| 項目 | 位置 |
|------|------|
| 店名 | `index.html`、`booking.html` 全文搜尋「美甲工作室」 |
| 品牌標語 | `index.html` hero-tagline |
| Logo 圖片 | `.logo-mark` 元素，替換為 `<img>` 標籤 |
| 社群連結 | `index.html` `.hero-socials` 各 `href="#"` |
| 關於我們文案 | `index.html` `#about` 區塊 |
| 營業時間 | `index.html` `.info-card` 第一張 |
| 地址 / 地圖連結 | `index.html` `.info-card` 第二張 |
| 聯絡方式 | `index.html` `.info-card` 第三張 |
| 服務項目（8項） | `index.html` `#services` 全部服務卡 |
| 服務人員（3位） | `index.html` `#staff` 全部人員卡 |
| 注意事項 | `index.html` `.notes-list` |
| Copyright 店名 | `index.html` footer |
| Powered by 連結 | `index.html` footer `href="#"` |
| SEO Meta 假字 | `index.html` / `booking.html` `<head>` 區塊 |
| Favicon | `images/favicon.ico` |
| OG 圖片 | `images/og-cover.jpg` |
| 時段選項 | `booking.html` `<select id="f-time">` |

---

## 改色方式

只需修改 `css/variables.css`，所有元件顏色自動同步。

```css
:root {
  --color-bg:           #FAF8F5;  /* 頁面底色（米白） */
  --color-primary:      #9B89B4;  /* 主色（薰衣紫）*/
  --color-primary-dark: #7A6594;  /* 主色深色 hover */
  --color-accent:       #C9A87C;  /* 輔色（暖金）*/
  /* ... 詳見檔案完整說明 */
}
```

預約表單選擇卡背景與頁面底色同步：
```css
/* booking.css 第 ~65 行 */
.service-select-card {
  background: var(--color-bg); /* 改此變數即可 */
}
```

---

## 串接說明

### A. Google Sheet（儲存預約資料）

#### 前端位置
`js/booking.js` — 第 4 節「表單送出」，搜尋 `【串接標示 A】`：

```javascript
// 替換假模擬，改為：
fetch('YOUR_APPS_SCRIPT_URL', {
  method: 'POST',
  mode: 'no-cors',  // Apps Script 需要此設定
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});
```

#### Google Apps Script 範本

1. 開啟 [script.google.com](https://script.google.com)，建立新專案。
2. 貼入以下程式碼：

```javascript
// Apps Script — 接收預約並寫入 Google Sheet
const SHEET_ID   = 'YOUR_GOOGLE_SHEET_ID';   // 替換為真實 Sheet ID
const SHEET_NAME = '預約訂單';               // 工作表名稱

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID)
                                .getSheetByName(SHEET_NAME);

    // 若工作表無標題列，自動建立
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '送出時間','姓名','手機','LINE名稱',
        '服務項目','價格','時間','預約日期','預約時段','備註','狀態'
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.line_name,
      data.service,
      data.price,
      data.duration,
      data.date,
      data.time,
      data.note,
      '待確認'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 部署 → 新增部署 → 類型選「網路應用程式」→ 執行身分選「我」→ 存取權選「任何人」→ 部署。
4. 複製「網路應用程式網址」貼回前端 `YOUR_APPS_SCRIPT_URL`。

---

### B. 服務人員下拉開關（Google Sheet 控制顯示/隱藏）

#### Google Sheet 結構（建立「服務人員」工作表）

| 名字 | 職稱 | 描述 | 圖片URL | 啟用 |
|------|------|------|---------|------|
| Coco 老師 | 資深美甲師 | ... | https://... | TRUE |
| Mia 老師  | 美甲師 | ... | https://... | FALSE |

#### Apps Script 讀取端點

```javascript
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'staff') {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('服務人員');
    const rows  = sheet.getDataRange().getValues();
    const headers = rows[0];
    const staff = rows.slice(1)
      .filter(row => row[headers.indexOf('啟用')] === true)
      .map(row => ({
        name:    row[headers.indexOf('名字')],
        role:    row[headers.indexOf('職稱')],
        desc:    row[headers.indexOf('描述')],
        img:     row[headers.indexOf('圖片URL')]
      }));

    return ContentService
      .createTextOutput(JSON.stringify(staff))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### 前端動態載入（取代靜態 HTML 的人員卡）

```javascript
// 在 main.js 中加入（替換靜態 #staff 人員卡）
fetch('YOUR_APPS_SCRIPT_URL?action=staff')
  .then(r => r.json())
  .then(staffList => {
    const grid = document.querySelector('.staff-grid');
    grid.innerHTML = staffList.map(s => `
      <div class="staff-card">
        <div class="staff-img-wrap">
          <img src="${s.img}" alt="${s.name}" loading="lazy" />
        </div>
        <h3 class="staff-name">${s.name}</h3>
        <p class="staff-role">${s.role}</p>
        <p class="staff-desc">${s.desc}</p>
      </div>
    `).join('');
  });
```

---

### C. Google Calendar（查看可預約時間）

#### 概念流程

```
Google Calendar（店家行事曆）
   ↓ Apps Script / Calendar API
前端 availability Tab
   ↓ 顯示有空/已滿時段
```

#### Apps Script 讀取 Calendar 空檔

```javascript
function doGet(e) {
  if (e.parameter.action === 'availability') {
    const cal   = CalendarApp.getCalendarById('YOUR_CALENDAR_ID@group.calendar.google.com');
    const start = new Date(e.parameter.start); // ISO 字串
    const end   = new Date(e.parameter.end);

    const events = cal.getEvents(start, end);

    // 全天時段列表
    const ALL_SLOTS = [
      '10:00','10:30','11:00','11:30','12:00','12:30',
      '13:00','14:00','14:30','15:00','15:30','16:00',
      '16:30','17:00','17:30','18:00'
    ];

    // 已被占用的時段（事件標題需與時段相同，例如「14:30」）
    const busySlots = events.map(ev => ev.getTitle());

    const result = ALL_SLOTS.map(slot => ({
      time:      slot,
      available: !busySlots.includes(slot)
    }));

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### 前端串接點

`js/booking.js` 第 6 節，搜尋 `【串接標示 B】`：

```javascript
// 選擇日期後呼叫：
fetch(`YOUR_APPS_SCRIPT_URL?action=availability&start=2026-06-10&end=2026-06-11`)
  .then(r => r.json())
  .then(slots => renderSlots(slots));
```

---

### D. LINE Messaging API（預約通知）

#### 流程概覽

```
顧客送出預約
   → Apps Script 寫入 Google Sheet
   → Apps Script 呼叫 LINE Messaging API
   → 店家 LINE 官方帳號收到通知訊息
```

#### Apps Script 發送 LINE 通知（接在 doPost 寫入 Sheet 之後）

```javascript
const LINE_CHANNEL_TOKEN = 'YOUR_LINE_CHANNEL_ACCESS_TOKEN';
const LINE_USER_ID       = 'YOUR_LINE_USER_OR_GROUP_ID'; // 店家 LINE User ID

function sendLineNotify(data) {
  const message = `📌 新預約申請
姓名：${data.name}
手機：${data.phone}
LINE：${data.line_name}
服務：${data.service}
日期：${data.date}
時段：${data.time}
備註：${data.note}`;

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_TOKEN}`
    },
    payload: JSON.stringify({
      to:       LINE_USER_ID,
      messages: [{ type: 'text', text: message }]
    })
  });
}
```

在 `doPost` 的 `sheet.appendRow(...)` 後加一行：
```javascript
sendLineNotify(data);
```

#### 取得 LINE Channel Access Token

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 建立 Messaging API 頻道
3. 取得「Channel access token（long-lived）」填入上方
4. 取得店家 LINE User ID（可透過 Webhook 接收訊息後從 userId 取得）

#### LINE Webhook（顧客回覆自動處理）

若需讓 LINE 官方帳號接收顧客訊息並自動回覆：

```javascript
// Apps Script doPost — 區分來源：網站表單 vs LINE Webhook
function doPost(e) {
  const contentType = e.parameter?.source;

  if (contentType === 'line_webhook') {
    // LINE Webhook 事件
    const lineData = JSON.parse(e.postData.contents);
    const event    = lineData.events[0];

    if (event.type === 'message') {
      // 自動回覆
      replyLineMessage(event.replyToken, '感謝您的訊息，客服將盡快與您聯繫！');
    }
  } else {
    // 網站預約表單（原有邏輯）
    handleBookingSubmit(JSON.parse(e.postData.contents));
  }
}

function replyLineMessage(replyToken, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_TOKEN}`
    },
    payload: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }]
    })
  });
}
```

LINE Webhook URL 設定：
1. LINE Developers Console → Messaging API → Webhook URL
2. 填入 Apps Script 網路應用程式網址 + `?source=line_webhook`

---

### E. 預約查詢串接

`js/booking.js` 第 7 節，搜尋 `【串接標示 C】`：

```javascript
fetch(`YOUR_APPS_SCRIPT_URL?action=query&phone=${phone}`)
  .then(r => r.json())
  .then(data => {
    if (data && data.name) {
      renderQueryResult(data); // 現有函式
    } else {
      // 查無資料提示
    }
  });
```

Apps Script `doGet` 加入查詢邏輯：

```javascript
if (action === 'query') {
  const phone = e.parameter.phone;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('預約訂單');
  const rows  = sheet.getDataRange().getValues();

  const record = rows.slice(1).find(row => row[2] === phone); // 手機欄位在 index 2

  if (record) {
    return ContentService.createTextOutput(JSON.stringify({
      name:    record[1],
      service: record[4],
      date:    record[7],
      time:    record[8],
      status:  record[10]
    })).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify(null))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 常見問題

**Q: 表單送出後 CORS 錯誤？**  
A: Apps Script 部署時「存取權」需選「任何人」，fetch 使用 `mode: 'no-cors'`。

**Q: 如何更換 Hero 圖片？**  
A: 修改 `index.html` 中 `.hero-slide` 的 `background-image` 網址，或換成本地圖片路徑。

**Q: 手機版 Hero 圖片顯示不正常？**  
A: 確認圖片尺寸建議最小 1200×800，並於 CSS 調整 `background-position`。

**Q: 如何新增服務項目？**  
A: 複製 `index.html` 一個 `.service-card` 區塊修改，並在 `booking.html` 複製一個 `.service-select-card`。

---

*Powered by 簡實制所*
