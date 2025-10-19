export default function VersionDetailUnit() {
  return (
    <details className="text-gray-600 text-sm mt-4">
      <summary>看起來很帥的版本紀錄</summary>
      <ul>
        <li>
          v1.0.0：天地初開
          <ul>
            <li>
              讀取噗文，簡易篩選（只看骰點、只看噗主、已選），選取與取消選取
            </li>
            <li>三種複製格式：複製內容、只複製 Markdown、只複製 HTML</li>
            <li>
              RWD，且在些許行為上針對手機或桌面做了不同的優化，以增加使用者體驗
            </li>
          </ul>
        </li>
        <li>
          v1.0.1：細節修正
          <ul>
            <li>調整寬螢幕跑板問題</li>
            <li>手機版會把「取消選取」一起複製起來</li>
            <li>Markdown 空行樣式：/n/n 和 /n</li>
          </ul>
        </li>
        <li>
          v1.2.0：簡易存檔機制（儲存於瀏覽器）
          <ul>
            <li>
              利用 Indexed DB
              將編輯（contenteditable）及選擇紀錄儲存起來，避免網頁重新整理時丟失
            </li>
            <li>新增右鍵選單：編輯、全部還原；桌面版可用雙擊滑鼠進入編輯</li>
            <li>提供刪除 Indexed DB 資料的功能</li>
            <li>修正複製功能以正確取得編輯過的內容</li>
            <li>新增 PWA 支援</li>
            <li>版面及樣式細修</li>
          </ul>
        </li>
        <li>v1.2.1：修正手機版右鍵選單開啟問題（改用 touchstart 事件）</li>
        <li>
          v1.3.0：電腦版新增選取骰點功能（同骰、大小、輸贏）
          <ul>
            <li>改變 contextmenu hook，使其能夠重複利用根據情境產生不同選單</li>
            <li>使用 new DOMParser() 來解析噗文字串資料進行篩選</li>
          </ul>
        </li>
      </ul>
    </details>
  );
}
