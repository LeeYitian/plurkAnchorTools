# 噗浪安價小工具

以 Next.js、React、tailwindcss 製作的文字小工具，適用於 社群網站噗浪（Plurk）。

## 功能介紹

### 分段工具：將長文斷成噗浪留言的長度

- 噗浪一則留言長度為 360 字，包含空格和空行；11 行斷行，不包含空行。

![分段工具](https://plurk-anchor-tools.vercel.app/readmePic/chunk.gif)

### 組合工具：將安價噗文合成一篇長文，方便貼到網誌等文章編輯網頁、軟體。

- 提供篩選功能，快速濾出需要放到好讀版的內容。

  _噗文網址格式： `https://plurk.com/p/[id]`_

![組合工具_篩選](https://plurk-anchor-tools.vercel.app/readmePic/unit_select_desktop.gif)

- 組合完後可選擇複製內容、Markdown、HTML
  - 內容：就跟直接用滑鼠選取後複製一樣
  - Markdown：跟噗浪語法類似，骰子會是 `(coin)` 的格式，而非圖片
  - HTML：包含 HTML 標籤的字串（不包含樣式）。預設會用 `<p>` 把整個文章包起來

![組合工具_複製](https://plurk-anchor-tools.vercel.app/readmePic/unit_save.gif)

- RWD

  - 桌面版：點選文章段落可滾動至原噗文位置，方便選取周圍的其他留言或取消選取

![組合工具_捲動](https://plurk-anchor-tools.vercel.app/readmePic/unit_scroll.gif)

- 手機版：以 Drawer 呈現噗文，點選文章段落可直接選擇是否取消選取

![組合工具_捲動](https://plurk-anchor-tools.vercel.app/readmePic/unit_phone_all.gif)

## 技術介紹

### Next Api Route、Server Component

利用 Next.js 的 api route 還有 Server Component 的特性，避免 CORS 問題，取回噗浪文章資料。

### useContext、useReducer

由於專案不大，選用 React 本身的 useContext 和 useReducer 達成跨元件傳遞資料的功能。
