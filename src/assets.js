// ============================================================
//  圖片資源
//  目前用 inline SVG 佔位圖，方便先給外部測試者看流程。
//
//  之後要換成真實圖片時，只要兩步：
//   1. 把真圖放進  public/assets/  （檔名見下方 REAL）
//   2. 把  USE_PLACEHOLDER  改成 false
// ============================================================

export const USE_PLACEHOLDER = false

const REAL = {
  map: '/assets/map.webp',           // 首頁背景手繪地圖
  caiThumb: '/assets/cai-thumb.webp', // 選單：蔡家古厝縮圖
  linThumb: '/assets/lin-thumb.webp', // 選單：林家草厝縮圖
  caiScene: '/assets/cai-scene.webp', // 場景：蔡家古厝插畫（比例 1000:476）
  linScene: '/assets/lin-scene.webp', // 場景：林家草厝插畫
}

const enc = (svg) => 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\n\s*/g, ''))

// 首頁背景：直幅手繪地圖風
const PH_MAP = enc(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844">
  <rect width="390" height="844" fill="#e3d4b6"/>
  <g opacity="0.5" fill="#cdb98f">
    <circle cx="70" cy="120" r="90"/><circle cx="330" cy="300" r="120"/>
    <circle cx="60" cy="560" r="110"/><circle cx="340" cy="720" r="100"/>
  </g>
  <path d="M60 800 C120 640 90 540 180 470 S300 360 250 240 320 130 300 60"
        fill="none" stroke="#8a6b3f" stroke-width="9" stroke-linecap="round" stroke-dasharray="2 18"/>
  <g fill="#6f7f4d" opacity="0.85">
    <path d="M120 470 l18 -34 18 34 z"/><path d="M150 470 l20 -40 20 40 z"/>
    <path d="M260 250 l18 -34 18 34 z"/><path d="M290 250 l20 -40 20 40 z"/>
  </g>
  <g>
    <rect x="158" y="452" width="40" height="30" fill="#b8895a"/>
    <path d="M152 452 l26 -22 26 22 z" fill="#9a6b3a"/>
    <rect x="276" y="222" width="40" height="30" fill="#b8895a"/>
    <path d="M270 222 l26 -22 26 22 z" fill="#9a6b3a"/>
  </g>
  <text x="195" y="60" font-family="serif" font-size="26" fill="#5b4a30" text-anchor="middle">炮子崙古道</text>
  <text x="195" y="824" font-family="sans-serif" font-size="15" fill="#7a6843" text-anchor="middle">手繪地圖（佔位圖）</text>
</svg>`)

// 場景插畫：寬幅，比例約 1000:476
const PH_SCENE = enc(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 476">
  <rect width="1000" height="476" fill="#e6d8bc"/>
  <rect y="330" width="1000" height="146" fill="#cdbf94"/>
  <g fill="#7d8a54">
    <circle cx="120" cy="320" r="70"/><circle cx="170" cy="300" r="55"/>
    <circle cx="880" cy="330" r="80"/><circle cx="830" cy="305" r="55"/>
  </g>
  <g>
    <rect x="380" y="250" width="240" height="120" fill="#c39a6b"/>
    <rect x="380" y="318" width="240" height="52" fill="#9a8460"/>
    <path d="M360 250 l140 -70 140 70 z" fill="#8c6b41"/>
    <rect x="470" y="300" width="60" height="70" fill="#5c4630"/>
    <rect x="405" y="280" width="38" height="34" fill="#e6d8bc"/>
    <rect x="557" y="280" width="38" height="34" fill="#e6d8bc"/>
  </g>
  <text x="500" y="446" font-family="sans-serif" font-size="22" fill="#6f5c3a" text-anchor="middle">蔡家古厝・手繪插畫（佔位圖）</text>
</svg>`)

const thumb = (label, roof) => enc(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#e6d8bc"/>
  <rect y="210" width="400" height="90" fill="#cdbf94"/>
  <rect x="140" y="150" width="120" height="80" fill="#c39a6b"/>
  <path d="M128 150 l72 -46 72 46 z" fill="${roof}"/>
  <rect x="182" y="186" width="36" height="44" fill="#5c4630"/>
  <text x="200" y="288" font-family="sans-serif" font-size="18" fill="#6f5c3a" text-anchor="middle">${label}（佔位圖）</text>
</svg>`)

const PH = {
  map: PH_MAP,
  caiScene: PH_SCENE,
  caiThumb: thumb('蔡家古厝', '#8c6b41'),
  linThumb: thumb('林家草厝', '#a89060'),
  linScene: PH_SCENE, // 暫時沿用同一張佔位圖，之後可以做專屬的
}

export const MAP_IMG = USE_PLACEHOLDER ? PH.map : REAL.map
export const CAI_THUMB = USE_PLACEHOLDER ? PH.caiThumb : REAL.caiThumb
export const LIN_THUMB = USE_PLACEHOLDER ? PH.linThumb : REAL.linThumb
export const CAI_SCENE = USE_PLACEHOLDER ? PH.caiScene : REAL.caiScene
export const LIN_SCENE = USE_PLACEHOLDER ? PH.linScene : REAL.linScene
// 單一物件的佔位圖（用在題目和卡冊）
function itemPlaceholder(label) {
  return enc(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">
  <rect width="400" height="280" fill="#e6d8bc"/>
  <circle cx="200" cy="110" r="55" fill="#c9b48a"/>
  <text x="200" y="230" font-family="sans-serif" font-size="19" fill="#6f5c3a" text-anchor="middle">${label}（佔位圖）</text>
</svg>`)
}

// 取得單一物件的圖片：佔位圖 or 真實檔案
export function itemImage(filename, label) {
  return USE_PLACEHOLDER ? itemPlaceholder(label) : `/assets/items/${filename}`
}