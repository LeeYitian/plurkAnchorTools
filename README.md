# 噗浪安價小工具

以 Next.js、React、tailwindcss 製作的文字小工具，適用於社群網站噗浪（Plurk）。

## 目錄

- [功能介紹](#功能介紹)
- [技術介紹](#技術介紹)
- [啟動專案](#啟動專案)
- [使用者回饋紀錄](#使用者回饋紀錄)

## 功能介紹

### 分段工具：將長文斷成噗浪留言的長度

| 功能                                                                     | 預覽                                                                                    |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 分段<br>噗浪一則留言長度為 360 字，包含空格和空行；11 行斷行，不包含空行 | <img src="https://upload.cc/i1/2025/09/09/fPYWpn.gif" alt="分段工具" width="300"/>      |
| Plurk OAuth 授權<br>經授權後可代替使用者在選定的噗文中留言               | <img src="https://upload.cc/i1/2026/06/01/fmtyhI.gif" alt="段文工具_授權" width="300"/> |

### 組合工具：將安價噗文合成一篇長文，方便貼到網誌等文章編輯網頁、軟體

| 功能                                                                                                                                                                                                                                                                                             | 預覽                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 篩選<br>快速濾出需要放到好讀版的內容<br><br>_噗文網址格式： `https://plurk.com/p/[id]`_                                                                                                                                                                                                          | <img src="https://upload.cc/i1/2025/09/09/6psgM7.gif" alt="組合工具_篩選" width="300"/>                                                                                             |
| 組合及複製<br>組合完後可選擇複製內容、Markdown、HTML<br><br>內容：就跟直接用滑鼠選取後複製一樣<br>Markdown：跟噗浪語法類似，骰子會是 `(coin)` 的格式，而非圖片<br>HTML：包含 HTML 標籤的字串（不包含樣式）。預設會用 `<p>` 把整個文章包起來                                                      | <img src="https://upload.cc/i1/2025/09/09/nthRNQ.gif" alt="組合工具_複製" width="300"/>                                                                                             |
| 編輯及儲存（可離線進行）<br>以 contenteditable 進行編輯並將編輯結果存在瀏覽器的 IndexedDB 中。下次用同樣的網址取回噗文後，畫面會直接顯示之前紀錄的狀態<br><br>可在選取的留言上右鍵或是連點兩下開進入編輯模式或是還原<br>使用者可選擇刪除單則噗文紀錄、或是清空瀏覽器中的所有跟這個工具有關的紀錄 | <img src="https://images.plurk.com/67B1Q9aov2NKLmVGXXMVi.gif" alt="組合工具_編輯" width="300"/>                                                                                     |
| 跨裝置<br>以 QRCode 或是直接輸入短碼將原儲存在瀏覽器中的紀錄轉移到另一個裝置<br><br>請注意若瀏覽器中已有同則噗文的編輯紀錄，取得其他裝置的資料時會直接覆蓋瀏覽器中的資料<br>雲端上的資料只會保存一小時                                                                                           | <img src="https://upload.cc/i1/2026/05/05/OFiPMh.gif" alt="組合工具_跨裝置" width="300"/> <img src="https://upload.cc/i1/2026/05/05/CfVmUn.gif" alt="組合工具_跨裝置" width="300"/> |

| 介面特色                                                                                                                                         | 預覽                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 桌面版<br>點選文章段落可滾動至原噗文位置，方便選取周圍的其他留言或取消選取                                                                       | <img src="https://upload.cc/i1/2025/09/09/puD9mk.gif" alt="組合工具_捲動" width="300"/>                                                                                                  |
| 手機版<br>以 Drawer 呈現噗文，點選文章段落可直接選擇是否取消選取                                                                                 | <img src="https://upload.cc/i1/2025/09/09/DLdK5j.gif" alt="組合工具_手機版" height="150"/>                                                                                               |
| 自訂右鍵選單<br>可以透過在骰子上面點選右鍵找到符合條件（同骰、大小、輸贏）噗文<br><br>在骰子之外的地方右鍵，另有編輯、還原、取消選取的選單可使用 | <img src="https://upload.cc/i1/2025/10/19/qJcPCi.gif" alt="組合工具_自訂選單" height="100"/> <img src="https://upload.cc/i1/2025/10/19/t1UzoB.gif" alt="組合工具_自訂選單" width="300"/> |

## 技術介紹

### Next.js Route、Server Component、API

利用 Next.js 中 route handlers 還有 Server Component 的特性，避免 CORS 問題，取回噗浪文章資料。

### Indexed DB 將紀錄儲存於瀏覽器

開啟 Indexed DB 資料庫，以噗文 id 及留言 id 儲存選取紀錄及編輯紀錄。並在下一次 fetch 資料庫中已有 id 的噗文時導出紀錄，令使用者可繼續上一次的作業。<br/>
不用擔心網頁重新整理後，編輯紀錄就會消失。除非需要跨裝置，否則不需要後端處理資料。

### Upstash Redis

簡單透過 Key Value 資料對應，將原本只會存在瀏覽器中的編輯紀錄上傳到雲端，完成跨裝置繼續編輯的功能。由於目的在於傳輸，所以資料只會短暫儲存。<br>另外，噗浪的貼文本來就是 html 字串，也避免 contenteditable 傳入預期之外的 html 字串，在存進 redis 之前會將資料 sanitize。

### Plurk OAuth 授權

從 counsumer key/secret，獲取暫時的 request token/secret，到最後使用者授權後取得 access key/secret。<br/>並搭配 Redis 建立 session id（HttpOnly Cookie） 避免將 secret 明文放在 cookie 中。<br/>由於手機限制，使用 popup + 中繼頁進行授權流程，在另開分頁（視窗）後根據裝置不同自動關閉彈窗或是提示使用者關閉。

### useContext、useReducer

由於專案不大，選用 React 本身的 useContext 和 useReducer 達成跨元件傳遞資料的功能。

### 基礎 PWA

增加 manifest 檔案將網頁轉為可安裝至手機或桌面的類應用程式。

### UIUX

- scrollbar 客製化和 dvh 單位在舊瀏覽器上可能不支援，因此有 css fallback
- 利用 css animation 令使用者注意網址輸入框位置的改變
- 在 route 切換及 fetch 時加上 loading
- 覆蓋資料前進行提示
- 編輯過內容後有醒目提示
- 深色模式（prefers-color-scheme 搭配手動切換）

### 功能資料流

#### 分段工具

```
使用者輸入文字
  → splitText（切段，360字／11行限制）
  → 顯示切段結果，可逐段複製

（選用）OAuth 授權發文：
  /api/auth/requestToken  →  Plurk 授權頁面
  ↓（使用者同意）
  /api/auth/callback  →  createSession（寫入 Redis）
  →  /auth/complete（中繼頁，供 popup 關閉）

發文：
  前端選定目標噗文  →  /api/postResponse
  →  oauthSignedFetch（附 OAuth 簽章）  →  Plurk API
```

#### 組合工具

```
使用者貼上噗文 URL
  →  /api/fetchPlurks（Responses/get API + HTML 解析噗首）
  →  PlurksDataContext（useReducer 管理狀態）
  →  從 IndexedDB 載入既有勾選與編輯紀錄

勾選留言：
  更新 selectedPlurksIds（context）  →  寫入 IndexedDB（selected-ids）

編輯留言：
  雙擊 → contentEditable
  →  blur 時比對內容是否改變
  →  有變更：寫入 IndexedDB（edited-plurks）+ 更新 context

跨裝置傳輸（傳送端）：
  點「傳送」  →  讀取 IndexedDB 所有編輯紀錄
  →  /api/saveData（sanitize HTML → 寫入 Redis）
  →  回傳 6 碼 key  →  顯示 QR Code

跨裝置傳輸（接收端）：
  掃描 QR Code  →  /unit/fromscan?key={6碼}
  →  /api/getData（從 Redis 取回）
  →  replaceSinglePlurkData（覆寫 IndexedDB）
  →  重新 fetch 噗文，恢復編輯狀態
```

## 啟動專案

### 本地啟動

環境變數：

```
# Plurk OAuth 應用程式憑證（至 https://www.plurk.com/PlurkApp/create 申請）
PLURK_CONSUMER_KEY
PLURK_CONSUMER_SECRET

# Vercel、Upstash Redis 相關變數（於 Vercel 設定中連結 Redis 後取得）
PLURKAT_KV_REST_API_READ_ONLY_TOKEN
PLURKAT_KV_REST_API_TOKEN
PLURKAT_KV_REST_API_URL
PLURKAT_KV_URL
PLURKAT_REDIS_URL
VERCEL_OIDC_TOKEN
```

接著執行：

```bash
npm install
npm run dev
```

> 若不需要 OAuth 發文功能，可略過 `PLURK_CONSUMER_KEY/SECRET`，分段工具仍可正常切段與複製。  
> 若不需要跨裝置同步，可略過 Redis 設定，組合工具仍可在本機正常使用 IndexedDB。

## 使用者回饋紀錄

[介紹及錯誤回報噗文](https://www.plurk.com/p/3hpbx8t2r0)
