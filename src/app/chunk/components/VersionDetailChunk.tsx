export default function VersionDetailChunk() {
  return (
    <details className="text-gray-600 text-sm mt-4">
      <summary>看起來很帥的版本紀錄</summary>
      <ul>
        <li>v1.0.0：天地初開</li>
        <li>
          v1.1.0：
          <ul>
            <li>修正剛好 360 字的情況</li>
            <li>新增「已複製」樣式</li>
            <li>新增「刪除字數」建議</li>
          </ul>
        </li>
        <li>v1.1.1：新增「清空輸入框」</li>
        <li>v1.2.0：修正 / 新增：除字數外，亦判斷行數</li>
        <li>v1.2.1：修正無法將文字複製到剪貼簿的問題。（改用 async/await ）</li>
        <li>
          v1.3.0：二次修正無法將文字複製到剪貼簿的問題。codepen 的 full page
          模式會阻擋 clipboard API ，因此改用 execCommand 方法
        </li>
        <li>
          v1.4.0：
          <ul>
            <li>換成 react 寫法，部署至 vercel ，加上組合工具</li>
            <li>複製到剪貼簿功能改回 clipboard API</li>
          </ul>
        </li>
        <li>v1.4.1：更新 Next.js 以及新增問題回報連結</li>
      </ul>
    </details>
  );
}
