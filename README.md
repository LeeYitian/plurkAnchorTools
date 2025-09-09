# 噗浪安價小工具

以 Next.js、React、tailwindcss 製作的文字小工具，適用於社群網站噗浪（Plurk）。

## 功能介紹

### 分段工具：將長文斷成噗浪留言的長度

- 噗浪一則留言長度為 360 字，包含空格和空行；11 行斷行，不包含空行。

<img src="https://upload.cc/i1/2025/09/09/fPYWpn.gif" alt="分段工具" width="300"/>

### 組合工具：將安價噗文合成一篇長文，方便貼到網誌等文章編輯網頁、軟體。

| 功能                                                                                                                                                                                                                          | 預覽                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 提供篩選功能，快速濾出需要放到好讀版的內容。<br><br>_噗文網址格式： `https://plurk.com/p/[id]`_                                                                                                                               | <img src="https://upload.cc/i1/2025/09/09/6psgM7.gif" alt="組合工具_篩選" width="300"/>    |
| 組合完後可選擇複製內容、Markdown、HTML<br><br>內容：就跟直接用滑鼠選取後複製一樣<br>Markdown：跟噗浪語法類似，骰子會是 `(coin)` 的格式，而非圖片<br>HTML：包含 HTML 標籤的字串（不包含樣式）。預設會用 `<p>` 把整個文章包起來 | <img src="https://upload.cc/i1/2025/09/09/nthRNQ.gif" alt="組合工具_複製" width="300"/>    |
| 桌面版：點選文章段落可滾動至原噗文位置，方便選取周圍的其他留言或取消選取                                                                                                                                                      | <img src="https://upload.cc/i1/2025/09/09/puD9mk.gif" alt="組合工具_捲動" width="300"/>    |
| 手機版：以 Drawer 呈現噗文，點選文章段落可直接選擇是否取消選取                                                                                                                                                                | <img src="https://upload.cc/i1/2025/09/09/DLdK5j.gif" alt="組合工具_手機版" height="200"/> |

## 技術介紹

### Next.js Route、Server Component

利用 Next.js 中 route handlers 還有 Server Component 的特性，避免 CORS 問題，取回噗浪文章資料。

### useContext、useReducer

由於專案不大，選用 React 本身的 useContext 和 useReducer 達成跨元件傳遞資料的功能。

### UIUX

- scrollbar 客製化和 dvh 單位在舊瀏覽器上可能不支援，因此有 css fallback
- 利用 css animation 令使用者注意網址輸入框位置的改變
- 在 route 切換及 fetch 時加上 loading

## 使用者回饋紀錄

[介紹及錯誤回報噗文](https://www.plurk.com/p/3hpbx8t2r0)
