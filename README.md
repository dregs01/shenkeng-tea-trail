# 深坑茶原鄉・炮子崙古道（Vite + React）

由 Claude Design 匯出的 DC 元件 1:1 移植而成的標準前端專案，可在任何瀏覽器執行、部署，供外部使用者測試。

## 為什麼要做這個轉換
原本 Claude Design 匯出的 `guide-app_dc.html` 不是一般網頁，而是 Design 平台專用的元件格式（`<x-dc>`、`<sc-if>`、`{{ }}`、`support.js` runtime）。瀏覽器看不懂這些標籤，所以直接開會「跑版」——所有頁面疊在一起。這個專案把它改寫成真正能跑的 React。

## 環境需求
- Node.js 18 以上

## 快速開始
```bash
npm install
npm run dev
```
打開終端機顯示的網址（預設 http://localhost:5173）。

### 讓手機也能測（同一個 Wi-Fi）
`npm run dev` 已開啟 `host`，終端機會印出一個 `http://192.168.x.x:5173` 的網址，用手機瀏覽器打開即可。

## 打包與部署
```bash
npm run build      # 產出靜態檔到 dist/
npm run preview    # 本機預覽 build 結果
```
`dist/` 是純靜態檔，可直接丟到 Netlify、Vercel、GitHub Pages 等。給外部測試者時，部署完把網址寄出去即可。

## RWD 行為
- **手機 / 窄螢幕**：app 全螢幕鋪滿。
- **桌機 / 平板**：顯示置中的 390×844 手機框，方便預覽。
- 設定在 `src/styles.css` 的 `.stage` / `.device`，斷點目前是 480px。

## 換成真實圖片
目前用 inline SVG 佔位圖。拿到真圖後：
1. 把圖片放進 `public/assets/`，檔名對應：
   - `map.png`（首頁背景）
   - `cai-thumb.png`（蔡家縮圖）
   - `lin-thumb.png`（林家縮圖）
   - `cai-scene.png`（蔡家場景插畫，比例約 1000:476）
2. 打開 `src/assets.js`，把 `USE_PLACEHOLDER` 改成 `false`。

## 之後接 PWA（離線 / 加到主畫面）
安裝 `vite-plugin-pwa`，在 `vite.config.js` 加入即可，最適合古道現場離線使用：
```bash
npm i -D vite-plugin-pwa
```
（需要時再幫你接上 manifest、Service Worker、離線快取策略。）

## 檔案結構
```
src/
  main.jsx     入口 + RWD 手機框外殼
  App.jsx      主元件（狀態機、五道謎題、奉茶、活動報名）
  data.js      題目與活動資料
  assets.js    圖片（佔位圖 + 替換開關）
  styles.css   全域樣式與動畫
```

## 互動內容
- 首頁 →「開始探索」進選點，「參加活動」開報名清單
- 蔡家古厝場景：5 個會發光的印章（4 題單選 +1 題拖曳配對「崁厝工法」）、中央「奉茶」兩段式體驗
- 全部解開後跳出完成提示
- `forgivingMode`（預設開）：單選答錯不鎖定，可繼續嘗試
