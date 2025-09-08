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
      </ul>
    </details>
  );
}
