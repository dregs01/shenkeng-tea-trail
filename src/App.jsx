import React from 'react'
import { HOTSPOTS, ACTIVITIES } from './data.js'
import { MAP_IMG, CAI_THUMB, LIN_THUMB, CAI_SCENE } from './assets.js'

// 把 CSS 字串（"a:b;c:d"）轉成 React style 物件，方便逐字沿用原本的 inline 樣式
function s(str) {
  const o = {}
  for (const rule of str.split(';')) {
    const i = rule.indexOf(':')
    if (i === -1) continue
    const key = rule.slice(0, i).trim()
    const val = rule.slice(i + 1).trim()
    if (!key) continue
    o[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val
  }
  return o
}

export default class App extends React.Component {
  static defaultProps = { accentColor: '#b15a3c', pinHalo: true, forgivingMode: true }

  state = {
    screen: 'home',
    quizId: null,
    selected: null,
    answered: false,
    wrongPicks: [],
    matchAssign: { a: null, b: null, c: null },
    matchChecked: false,
    dragging: null,
    solved: [false, false, false, false],
    doneSeen: false,
    showActivities: false,
    joined: {},
    tea: { open: false, step: 0 },
    teaDone: false,
  }

  slotRefs = {}

  hotspots() { return HOTSPOTS }

  componentDidMount() {
    this._move = (e) => { if (this.state.dragging) this.setState({ dragging: { ...this.state.dragging, x: e.clientX, y: e.clientY } }) }
    this._up = (e) => { if (this.state.dragging) this.dropAt(e.clientX, e.clientY) }
    window.addEventListener('pointermove', this._move)
    window.addEventListener('pointerup', this._up)
  }
  componentWillUnmount() {
    window.removeEventListener('pointermove', this._move)
    window.removeEventListener('pointerup', this._up)
  }

  openQuiz(i) {
    this.setState({ quizId: i, selected: null, answered: false, wrongPicks: [], matchAssign: { a: null, b: null, c: null }, matchChecked: false, dragging: null })
  }
  closeQuiz() { this.setState({ quizId: null, dragging: null }) }

  choose(i) {
    if (this.state.answered) return
    const h = this.hotspots()[this.state.quizId]
    const forgiving = this.props.forgivingMode ?? true
    if (i === h.answer) this.setState({ selected: i, answered: true })
    else if (forgiving) { if (!this.state.wrongPicks.includes(i)) this.setState({ wrongPicks: [...this.state.wrongPicks, i] }) }
    else this.setState({ selected: i, answered: true })
  }

  startDrag(id, e) { if (e.cancelable) e.preventDefault(); this.setState({ dragging: { nameId: id, x: e.clientX, y: e.clientY } }) }
  dropAt(x, y) {
    const drag = this.state.dragging
    let hit = null
    for (const sid of ['a', 'b', 'c']) {
      const el = this.slotRefs[sid]
      if (el) { const r = el.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) { hit = sid; break } }
    }
    const assign = { ...this.state.matchAssign }
    for (const k in assign) if (assign[k] === drag.nameId) assign[k] = null
    if (hit) assign[hit] = drag.nameId
    this.setState({ matchAssign: assign, dragging: null, matchChecked: false })
  }
  clearSlot(id) { const a = { ...this.state.matchAssign }; a[id] = null; this.setState({ matchAssign: a, matchChecked: false }) }
  confirmMatch() { this.setState({ matchChecked: true }) }
  retryMatch() { this.setState({ matchAssign: { a: null, b: null, c: null }, matchChecked: false }) }

  finishQuiz() { const arr = [...this.state.solved]; arr[this.state.quizId] = true; this.setState({ solved: arr, quizId: null, dragging: null }) }
  setSlot(id) { return (el) => { this.slotRefs[id] = el } }

  openActivities() { this.setState({ showActivities: true }) }
  closeActivities() { this.setState({ showActivities: false }) }
  toggleJoin(id) { const j = { ...this.state.joined }; j[id] = !j[id]; this.setState({ joined: j }) }
  openTea() { this.setState({ tea: { open: true, step: 0 } }) }
  teaAdvance() { if (this.state.tea.step === 0) this.setState({ tea: { open: true, step: 1 } }); else this.setState({ tea: { open: false, step: 0 }, teaDone: true }) }
  closeTea() { this.setState({ tea: { open: false, step: 0 } }) }

  render() {
    const A = this.props.accentColor ?? '#b15a3c'
    const showHalo = this.props.pinHalo ?? true
    const ink = '#3b342a', inkSoft = '#6f6450'
    const st = this.state
    const solved = st.solved
    const solvedCount = solved.filter(Boolean).length

    const sealBase = { width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'LXGW WenKai TC',cursive", fontSize: '25px', lineHeight: 1, boxShadow: '0 3px 8px rgba(59,52,42,.28)' }
    const sealOpen = { ...sealBase, background: 'rgba(247,241,227,.95)', color: A, border: '2px dashed ' + A }
    const sealSolved = { ...sealBase, background: A, color: '#f7f1e3', border: '2px solid rgba(0,0,0,.22)' }
    const sealStyle = (i) => (solved[i] ? sealSolved : sealOpen)

    const miniBase = { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'LXGW WenKai TC',cursive", fontSize: '18px', flex: '0 0 auto' }
    const miniOpen = { ...miniBase, background: 'rgba(247,241,227,.9)', color: A, border: '1.5px dashed ' + A }
    const miniSolved = { ...miniBase, background: A, color: '#f7f1e3', border: '1.5px solid rgba(0,0,0,.2)' }

    const teaSeal = { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'LXGW WenKai TC',cursive", fontSize: '26px', background: st.teaDone ? '#9a7b4f' : '#c69a45', color: '#fff7e6', border: '2px solid rgba(0,0,0,.2)', boxShadow: '0 3px 8px rgba(59,52,42,.3)' }
    const teaMini = { ...miniBase, background: st.teaDone ? '#9a7b4f' : '#c69a45', color: '#fff7e6', border: '1.5px solid rgba(0,0,0,.2)' }

    const showDone = solved.every(Boolean) && !st.doneSeen

    return (
      <div style={s("position:absolute;inset:0;overflow:hidden;font-family:'Noto Sans TC',sans-serif;background:#efe6d3;")}>

        {/* ======================= HOME ======================= */}
        {st.screen === 'home' && (
          <div style={s("position:absolute;inset:0;background:#2a2620;")}>
            <img src={MAP_IMG} alt="炮子崙古道手繪地圖" style={s("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;")} />
            <div style={s("position:absolute;inset:0;background:linear-gradient(180deg,rgba(40,36,30,.10) 0%,rgba(40,36,30,.04) 36%,rgba(40,36,30,.52) 70%,rgba(30,26,21,.88) 100%);")}></div>
            <div style={s("position:absolute;left:0;right:0;bottom:0;padding:30px 26px 40px;color:#f4ecd9;")}>
              <div style={s("display:inline-block;padding:5px 13px;border:1px solid rgba(244,236,217,.5);border-radius:20px;font-size:11.5px;letter-spacing:3px;margin-bottom:16px;")}>新北深坑・茶山聚落</div>
              <h1 style={s("font-family:'LXGW WenKai TC',cursive;font-size:54px;line-height:1.02;margin:0 0 12px;text-shadow:0 2px 12px rgba(0,0,0,.55);")}>炮子崙古道</h1>
              <p style={s("font-size:15px;line-height:1.65;margin:0 0 24px;color:rgba(244,236,217,.82);max-width:300px;")}>走訪百年茅草屋與石頭厝，沿途解謎，認識先民就地取材、以茅草蓋屋的生活智慧。</p>
              <div style={s("display:flex;gap:12px;flex-wrap:wrap;")}>
                <button onClick={() => this.setState({ screen: 'select' })} style={s("display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border:none;border-radius:30px;background:#f4ecd9;color:#3b342a;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);")}>開始探索<span style={s("font-size:18px;")}>→</span></button>
                <button onClick={() => this.openActivities()} style={s("display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border:1.5px solid rgba(244,236,217,.7);border-radius:30px;background:rgba(244,236,217,.1);color:#f4ecd9;font-size:16px;font-weight:600;cursor:pointer;")}>參加活動</button>
                <button onClick={() => this.setState({ screen: 'collection' })} style={s("display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border:1.5px solid rgba(244,236,217,.7);border-radius:30px;background:rgba(244,236,217,.1);color:#f4ecd9;font-size:16px;font-weight:600;cursor:pointer;")}>我的卡冊</button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= SELECT ======================= */}
        {st.screen === 'select' && (
          <div style={s("position:absolute;inset:0;background:#efe6d3;display:flex;flex-direction:column;")}>
            <div style={s("display:flex;align-items:center;gap:12px;padding:14px 16px;background:#f4ecd9;border-bottom:1px solid rgba(59,52,42,.12);")}>
              <button onClick={() => this.setState({ screen: 'home' })} style={s("width:36px;height:36px;border-radius:50%;border:1px solid rgba(59,52,42,.18);background:#fbf6ea;color:#3b342a;font-size:18px;cursor:pointer;line-height:1;")}>←</button>
              <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:23px;color:#3b342a;")}>選擇導覽地點</div>
            </div>
            <div style={s("flex:1;overflow-y:auto;padding:18px 18px 30px;")}>
              <p style={s("font-size:13.5px;color:#6f6450;margin:2px 4px 18px;line-height:1.6;")}>沿著古道有兩座百年家屋，點選地點，邊走邊解謎。</p>

              {/* Cai card */}
              <button onClick={() => this.setState({ screen: 'scene' })} style={s("display:block;width:100%;text-align:left;padding:0;border:1px solid rgba(59,52,42,.16);border-radius:18px;overflow:hidden;background:#fbf6ea;cursor:pointer;margin-bottom:18px;box-shadow:0 4px 14px rgba(59,52,42,.1);")}>
                <div style={s("position:relative;height:150px;background:#efe6d3;")}>
                  <img src={CAI_THUMB} alt="蔡家古厝" style={s("width:100%;height:100%;object-fit:cover;")} />
                  <div style={s("position:absolute;top:10px;left:10px;padding:4px 11px;border-radius:14px;background:rgba(177,90,60,.92);color:#f7f1e3;font-size:12px;font-weight:600;white-space:nowrap;")}>4 個謎題</div>
                </div>
                <div style={s("padding:14px 16px 16px;")}>
                  <div style={s("display:flex;align-items:baseline;justify-content:space-between;")}>
                    <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:26px;color:#3b342a;line-height:1;")}>蔡家古厝</div>
                    <div style={s("font-size:12px;color:#9a7b4f;")}>解謎 {solvedCount}/4</div>
                  </div>
                  <p style={s("font-size:13px;color:#6f6450;margin:8px 0 0;line-height:1.55;")}>140 年石頭厝、良心市集、崁厝工法與地牛的祕密。</p>
                </div>
              </button>

              {/* Lin card (locked) */}
              <div style={s("display:block;width:100%;border:1px solid rgba(59,52,42,.12);border-radius:18px;overflow:hidden;background:#f2ead9;opacity:.82;")}>
                <div style={s("position:relative;height:130px;background:#e7dcc6;")}>
                  <img src={LIN_THUMB} alt="林家草厝" style={s("width:100%;height:100%;object-fit:cover;filter:grayscale(.4);")} />
                  <div style={s("position:absolute;inset:0;background:rgba(239,230,211,.35);")}></div>
                  <div style={s("position:absolute;top:10px;left:10px;padding:4px 11px;border-radius:14px;background:rgba(59,52,42,.55);color:#f7f1e3;font-size:12px;font-weight:600;")}>即將推出</div>
                </div>
                <div style={s("padding:14px 16px 16px;")}>
                  <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:26px;color:#6f6450;line-height:1;")}>林家草厝</div>
                  <p style={s("font-size:13px;color:#9a8e76;margin:8px 0 0;line-height:1.55;")}>百年杜英迎賓樹、原始白茅草屋、魚鱗式疊草工法。</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= SCENE ======================= */}
        {st.screen === 'scene' && (
          <div style={s("position:absolute;inset:0;background:#efe6d3;display:flex;flex-direction:column;")}>
            <div style={s("display:flex;align-items:center;gap:12px;padding:14px 16px;background:#f4ecd9;border-bottom:1px solid rgba(59,52,42,.12);z-index:5;")}>
              <button onClick={() => this.setState({ screen: 'select', quizId: null })} style={s("width:36px;height:36px;border-radius:50%;border:1px solid rgba(59,52,42,.18);background:#fbf6ea;color:#3b342a;font-size:18px;cursor:pointer;line-height:1;")}>←</button>
              <div style={s("flex:1;")}>
                <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:22px;color:#3b342a;line-height:1;")}>蔡家古厝</div>
                <div style={s("font-size:11.5px;color:#9a7b4f;")}>140 年石頭厝・炮子崙茶山</div>
              </div>
              <div style={s("font-size:13px;color:#6f6450;background:#fbf6ea;border:1px solid rgba(59,52,42,.15);padding:5px 12px;border-radius:16px;")}>解謎 {solvedCount}/4</div>
            </div>

            <div style={s("flex:1;display:flex;flex-direction:column;position:relative;overflow-y:auto;")}>
              <div style={s("position:relative;width:100%;aspect-ratio:1000/476;flex:0 0 auto;")}>
                <img src={CAI_SCENE} alt="蔡家古厝手繪插畫" style={s("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
                <div style={s("position:absolute;top:0;left:0;right:0;height:34%;background:linear-gradient(180deg,rgba(239,230,211,.92),rgba(239,230,211,0));")}></div>

                {[
                  { left: '12%', top: '74%' },//市
                  { left: '30%', top: '70%' },//厝
                  { left: '22%', top: '23%' },//工  
                  { left: '84%', top: '50%' },//牛
                ].map((pos, i) => (
                  <button key={i} onClick={() => this.openQuiz(i)} style={{ ...s("position:absolute;transform:translate(-50%,-50%);width:46px;height:46px;padding:0;border:none;background:transparent;cursor:pointer;z-index:4;"), left: pos.left, top: pos.top }}>
                    {showHalo && !solved[i] && <span style={s("position:absolute;inset:-7px;border-radius:50%;border:2px solid rgba(177,90,60,.45);animation:halo 2.2s ease-out infinite;")}></span>}
                    <span style={sealStyle(i)}>{HOTSPOTS[i].char}</span>
                    {solved[i] && <span style={s("position:absolute;top:-3px;right:-3px;width:19px;height:19px;border-radius:50%;background:#5f7a44;color:#fff;font-size:12px;line-height:19px;text-align:center;border:2px solid #efe6d3;")}>✓</span>}
                  </button>
                ))}

                {/* 奉茶 */}
                <button onClick={() => this.openTea()} style={s("position:absolute;left:48%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;padding:0;border:none;background:transparent;cursor:pointer;z-index:5;")}>
                  <span style={s("position:relative;width:50px;height:50px;display:flex;align-items:center;justify-content:center;")}>
                    {showHalo && !st.teaDone && <span style={s("position:absolute;inset:-7px;border-radius:50%;border:2px solid rgba(198,154,69,.55);animation:halo 2.4s ease-out infinite;")}></span>}
                    <span style={teaSeal}>茶</span>
                    {st.teaDone && <span style={s("position:absolute;top:-3px;right:-3px;width:19px;height:19px;border-radius:50%;background:#5f7a44;color:#fff;font-size:12px;line-height:19px;text-align:center;border:2px solid #efe6d3;")}>✓</span>}
                  </span>
                </button>
              </div>

              <p style={s("text-align:center;font-size:13px;color:#6f6450;margin:14px 26px 4px;line-height:1.6;")}>點點看會發光的<span style={s("color:#b15a3c;font-weight:600;")}>印章</span>，或從下面清單開始解謎。</p>
              <div style={s("padding:10px 18px 24px;")}>
                <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:19px;color:#9a7b4f;margin:4px 2px 10px;")}>古厝裡的祕密</div>
                <button onClick={() => this.openTea()} style={s("display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#f6ecd6;border:1px solid rgba(198,154,69,.45);border-radius:13px;padding:10px 13px;margin-bottom:9px;cursor:pointer;box-shadow:0 1px 0 rgba(59,52,42,.05);")}>
                  <span style={teaMini}>茶</span>
                  <span style={s("flex:1;")}><span style={s("display:block;font-size:15.5px;color:#3b342a;font-weight:600;line-height:1.2;")}>受班長招待・奉茶</span><span style={s("display:block;font-size:11.5px;color:#9a7b4f;")}>茶山人情體驗</span></span>
                  <span style={s("font-size:12px;color:#b08a3e;font-weight:600;white-space:nowrap;flex:0 0 auto;")}>{st.teaDone ? '已奉茶' : '體驗'}</span>
                </button>
                {HOTSPOTS.map((h, i) => (
                  <button key={i} onClick={() => this.openQuiz(i)} style={s("display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fbf6ea;border:1px solid rgba(59,52,42,.14);border-radius:13px;padding:10px 13px;margin-bottom:9px;cursor:pointer;box-shadow:0 1px 0 rgba(59,52,42,.05);")}>
                    <span style={solved[i] ? miniSolved : miniOpen}>{h.char}</span>
                    <span style={s("flex:1;")}><span style={s("display:block;font-size:15.5px;color:#3b342a;font-weight:600;line-height:1.2;")}>{h.name}</span><span style={s("display:block;font-size:11.5px;color:#9a7b4f;")}>{h.tag}</span></span>
                    <span style={solved[i] ? s("font-size:12px;color:#5f7a44;font-weight:600;white-space:nowrap;flex:0 0 auto;") : s("font-size:12px;color:#b15a3c;white-space:nowrap;flex:0 0 auto;")}>{solved[i] ? '已解開' : '待解開'}</span>
                  </button>
                ))}
              </div>

              {/* done banner */}
              {showDone && (
                <div style={s("position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;background:rgba(34,30,24,.5);")}>
                  <div style={s("background:#f4ecd9;border-radius:20px;padding:28px 26px;width:82%;text-align:center;box-shadow:0 12px 32px rgba(0,0,0,.4);animation:sheetUp .4s ease;")}>
                    <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:30px;color:#b15a3c;margin-bottom:8px;")}>恭喜走讀完成！</div>
                    <p style={s("font-size:14.5px;line-height:1.65;color:#4a4234;margin:0 0 20px;")}>你已解開蔡家古厝的全部 4 道謎題，把茶山的生活智慧收進口袋了。</p>
                    <button onClick={() => this.setState({ doneSeen: true })} style={s("width:100%;padding:13px;border-radius:13px;border:1px solid rgba(59,52,42,.25);background:#fbf6ea;color:#3b342a;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:10px;")}>再看看古厝</button>
                    <button onClick={() => this.setState({ screen: 'select', quizId: null })} style={s("width:100%;padding:14px;border-radius:13px;border:none;background:#b15a3c;color:#fbf6ea;font-size:15px;font-weight:600;cursor:pointer;")}>前往下一個地點</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= QUIZ MODAL ======================= */}
        {st.quizId !== null && this.renderQuiz(A, ink, inkSoft, sealBase)}

        {/* ======================= 奉茶 ======================= */}
        {st.tea.open && this.renderTea()}

        {/* ======================= 活動 ======================= */}
        {st.showActivities && this.renderActivities(A)}

        {/* drag ghost */}
        {st.dragging && (
          <div style={{ position: 'fixed', left: st.dragging.x + 'px', top: st.dragging.y + 'px', transform: 'translate(-50%,-50%)', padding: '10px 18px', borderRadius: '22px', background: A, color: '#f7f1e3', fontFamily: "'LXGW WenKai TC',cursive", fontSize: '22px', pointerEvents: 'none', zIndex: 200, boxShadow: '0 6px 16px rgba(0,0,0,.3)' }}>
            {this.labelOf(this.state.dragging.nameId)}
          </div>
        )}
        {/* ======================= 卡冊 ======================= */}
        {st.screen === 'collection' && this.renderCollection()}
      </div>
    )
  }

  labelOf(id) {
    const h = this.hotspots()[this.state.quizId]
    if (!h || !h.chips) return ''
    const c = h.chips.find((x) => x.id === id)
    return c ? c.label : ''
  }

  renderQuiz(A, ink, inkSoft, sealBase) {
    const st = this.state
    const h = this.hotspots()[st.quizId]
    const modalSeal = { ...sealBase, width: '40px', height: '40px', fontSize: '21px', background: A, color: '#f7f1e3', border: 'none', boxShadow: 'none' }
    const primaryBtnStyle = { width: '100%', padding: '15px', borderRadius: '14px', border: 'none', background: A, color: '#fbf6ea', fontSize: '17px', fontWeight: 600, cursor: 'pointer', marginTop: '16px', boxShadow: '0 4px 12px rgba(59,52,42,.22)' }

    return (
      <div style={s("position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;justify-content:flex-end;")}>
        <div onClick={() => this.closeQuiz()} style={s("position:absolute;inset:0;background:rgba(34,30,24,.55);")}></div>
        <div style={s("position:relative;background:#f4ecd9;border-radius:26px 26px 0 0;max-height:90%;overflow-y:auto;padding:22px 22px 30px;box-shadow:0 -10px 30px rgba(0,0,0,.3);animation:sheetUp .35s cubic-bezier(.2,.8,.2,1);")}>
          <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:4px;")}>
            <span style={modalSeal}>{h.char}</span>
            <div style={s("flex:1;")}>
              <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:24px;color:#3b342a;line-height:1.1;")}>{h.name}</div>
              <div style={s("font-size:11.5px;color:#9a7b4f;letter-spacing:1px;")}>{h.tag}</div>
            </div>
            <button onClick={() => this.closeQuiz()} style={s("width:34px;height:34px;border-radius:50%;border:none;background:rgba(59,52,42,.08);color:#6f6450;font-size:17px;cursor:pointer;line-height:1;")}>✕</button>
          </div>
          <p style={s("font-size:16.5px;line-height:1.55;color:#3b342a;font-weight:600;margin:16px 0 18px;")}>{h.q}</p>

          {h.type === 'choice' && this.renderChoice(h, A, ink, primaryBtnStyle)}
          {h.type === 'match' && this.renderMatch(h, A, ink, inkSoft, primaryBtnStyle)}
        </div>
      </div>
    )
  }

  renderChoice(h, A, ink, primaryBtnStyle) {
    const st = this.state
    const optBase = { display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: '10px', borderRadius: '14px', border: '1.5px solid rgba(59,52,42,.22)', background: '#fbf6ea', color: ink, fontSize: '15.5px', lineHeight: 1.4, cursor: 'pointer', fontFamily: "'Noto Sans TC',sans-serif" }
    const optCorrect = { ...optBase, background: '#e7eed8', border: '2px solid #5f7a44', color: '#3f5230', cursor: 'default', fontWeight: 600 }
    const optWrong = { ...optBase, background: '#f3ddd6', border: '2px solid #b14a3c', color: '#8a3a2c', cursor: 'default' }
    const optDim = { ...optBase, opacity: 0.5, cursor: 'default' }
    const wp = st.wrongPicks

    return (
      <>
        {h.options.map((text, i) => {
          let style = optBase, click = () => this.choose(i)
          if (st.answered) {
            if (i === h.answer) style = optCorrect
            else if (i === st.selected) style = optWrong
            else style = optDim
            click = () => {}
          } else if (wp.includes(i)) { style = optWrong; click = () => {} }
          return <button key={i} onClick={click} style={style}>{text}</button>
        })}
        {!st.answered && st.wrongPicks.length > 0 && (
          <p style={s("font-size:14px;color:#b14a3c;margin:4px 2px 0;")}>再想想看，答案就藏在眼前的古厝裡。</p>
        )}
        {st.answered && this.renderKnowledge(h, primaryBtnStyle)}
      </>
    )
  }

  renderMatch(h, A, ink, inkSoft, primaryBtnStyle) {
    const st = this.state
    const slotZoneBase = { minWidth: '96px', padding: '12px 10px', borderRadius: '12px', border: '2px dashed rgba(59,52,42,.35)', background: 'rgba(247,241,227,.6)', color: inkSoft, fontFamily: "'LXGW WenKai TC',cursive", fontSize: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
    const zoneFilled = { background: A, color: '#f7f1e3', border: '2px solid rgba(0,0,0,.2)', borderStyle: 'solid' }
    const zoneOk = { background: '#e7eed8', color: '#3f5230', border: '2px solid #5f7a44', borderStyle: 'solid' }
    const zoneBad = { background: '#f3ddd6', color: '#8a3a2c', border: '2px solid #b14a3c', borderStyle: 'solid' }
    const chipStyle = { padding: '10px 18px', borderRadius: '22px', background: '#fbf6ea', border: '1.5px solid ' + A, color: ink, fontFamily: "'LXGW WenKai TC',cursive", fontSize: '22px', cursor: 'grab', touchAction: 'none', userSelect: 'none', boxShadow: '0 2px 6px rgba(59,52,42,.18)' }
    const checked = st.matchChecked
    const labelOf = (id) => { const c = h.chips.find((x) => x.id === id); return c ? c.label : '' }

    const matchSlots = h.slots.map((slot) => {
      const a = st.matchAssign[slot.id]
      let style = { ...slotZoneBase }
      if (checked) style = a === h.correct[slot.id] ? { ...slotZoneBase, ...zoneOk } : { ...slotZoneBase, ...zoneBad }
      else if (a) style = { ...slotZoneBase, ...zoneFilled }
      return { id: slot.id, desc: slot.desc, display: a ? labelOf(a) : '拖到這裡', style, onClick: (!checked && a) ? () => this.clearSlot(slot.id) : () => {} }
    })
    const assignedIds = Object.values(st.matchAssign).filter(Boolean)
    const matchChips = h.chips.filter((c) => !assignedIds.includes(c.id))
    const allFilled = ['a', 'b', 'c'].every((k) => st.matchAssign[k])
    const matchCorrect = checked && h.slots.every((slot) => st.matchAssign[slot.id] === h.correct[slot.id])
    const confirmEnabled = allFilled
    const confirmBtnStyle = confirmEnabled ? primaryBtnStyle : { ...primaryBtnStyle, opacity: 0.4, cursor: 'default', background: inkSoft, marginTop: '0' }
    const retryBtnStyle = { width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid ' + A, background: '#fbf6ea', color: A, fontSize: '16px', fontWeight: 600, cursor: 'pointer' }

    return (
      <>
        <div style={s("display:flex;flex-direction:column;gap:12px;margin-bottom:16px;")}>
          {matchSlots.map((slot) => (
            <div key={slot.id} style={s("display:flex;align-items:center;gap:12px;")}>
              <div style={s("flex:1;font-size:14.5px;color:#3b342a;line-height:1.45;")}>{slot.desc}</div>
              <div ref={this.setSlot(slot.id)} onClick={slot.onClick} style={slot.style}>{slot.display}</div>
            </div>
          ))}
        </div>
        <div style={s("display:flex;flex-wrap:wrap;gap:12px;justify-content:center;min-height:46px;margin-bottom:16px;")}>
          {matchChips.map((chip) => (
            <button key={chip.id} onPointerDown={(e) => this.startDrag(chip.id, e)} style={chipStyle}>{chip.label}</button>
          ))}
        </div>
        {!checked && (
          <button onClick={() => { if (confirmEnabled) this.confirmMatch() }} style={confirmBtnStyle}>確認配對</button>
        )}
        {checked && !matchCorrect && (
          <>
            <p style={s("font-size:14px;color:#b14a3c;text-align:center;margin:0 0 10px;")}>還沒全對，再試一次！</p>
            <button onClick={() => this.retryMatch()} style={retryBtnStyle}>再試一次</button>
          </>
        )}
        {matchCorrect && this.renderKnowledge(h, primaryBtnStyle)}
      </>
    )
  }

  renderKnowledge(h, primaryBtnStyle) {
    return (
      <>
        <div style={s("margin-top:18px;padding:16px;background:#fbf6ea;border:1px solid rgba(154,123,79,.3);border-left:4px solid #9a7b4f;border-radius:12px;")}>
          <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:18px;color:#9a7b4f;margin-bottom:6px;")}>知識卡</div>
          <p style={s("font-size:14.5px;line-height:1.7;color:#4a4234;margin:0;")}>{h.know}</p>
        </div>
        <button onClick={() => this.finishQuiz()} style={primaryBtnStyle}>完成，收進口袋</button>
      </>
    )
  }

  renderTea() {
    const st = this.state
    const teaText = st.tea.step === 0
      ? '「來，山路行甲遮，先坐落歇睏。」蔡班長端出一杯自家種的文山包種茶，還有一碗豆花招待你。'
      : '茶湯清香、入喉回甘。班長笑說：吃點甜的、喝口茶，待會走山卡有力。這杯茶是務農之餘的私藏、不外賣——是茶山待客的人情味。'
    const teaBtn = st.tea.step === 0 ? '雙手接過茶' : '謝謝班長'

    return (
      <div style={s("position:absolute;inset:0;z-index:25;display:flex;align-items:flex-end;")}>
        <div onClick={() => this.closeTea()} style={s("position:absolute;inset:0;background:rgba(34,30,24,.6);")}></div>
        <div style={s("position:relative;width:100%;background:#f4ecd9;border-radius:26px 26px 0 0;padding:26px 24px 30px;box-shadow:0 -10px 30px rgba(0,0,0,.3);animation:sheetUp .35s ease;")}>
          <button onClick={() => this.closeTea()} style={s("position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(59,52,42,.08);color:#6f6450;font-size:17px;cursor:pointer;")}>✕</button>
          <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:27px;color:#7a5a2f;text-align:center;margin-bottom:2px;")}>奉茶</div>
          <div style={s("font-size:12px;color:#9a7b4f;text-align:center;letter-spacing:2px;margin-bottom:14px;")}>受蔡班長招待</div>
          <div style={s("display:flex;justify-content:center;margin:4px 0 18px;")}>
            <div style={s("position:relative;width:122px;height:112px;")}>
              <span style={s("position:absolute;left:46px;top:2px;width:5px;height:34px;border-radius:3px;background:linear-gradient(180deg,rgba(150,120,80,0),rgba(150,120,80,.45));animation:steam 2.6s ease-in-out infinite;")}></span>
              <span style={s("position:absolute;left:66px;top:-2px;width:5px;height:38px;border-radius:3px;background:linear-gradient(180deg,rgba(150,120,80,0),rgba(150,120,80,.4));animation:steam 2.6s ease-in-out .9s infinite;")}></span>
              <div style={s("position:absolute;left:24px;top:42px;width:74px;height:50px;background:#bd8c4b;border-radius:8px 8px 28px 28px;box-shadow:inset 0 7px 0 rgba(0,0,0,.12);")}></div>
              <div style={s("position:absolute;left:30px;top:46px;width:62px;height:13px;background:#7a4a22;border-radius:50%;")}></div>
              <div style={s("position:absolute;left:92px;top:50px;width:24px;height:30px;border:6px solid #bd8c4b;border-left:none;border-radius:0 16px 16px 0;")}></div>
              <div style={s("position:absolute;left:12px;top:94px;width:98px;height:15px;background:#cda461;border-radius:50%;")}></div>
            </div>
          </div>
          <p style={s("font-size:15.5px;line-height:1.75;color:#3b342a;text-align:center;margin:0 0 20px;")}>{teaText}</p>
          <button onClick={() => this.teaAdvance()} style={s("width:100%;padding:15px;border-radius:14px;border:none;background:#b15a3c;color:#fbf6ea;font-size:17px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(59,52,42,.22);")}>{teaBtn}</button>
        </div>
      </div>
    )
  }

  renderActivities(A) {
    const st = this.state
    return (
      <div style={s("position:absolute;inset:0;z-index:25;display:flex;flex-direction:column;justify-content:flex-end;")}>
        <div onClick={() => this.closeActivities()} style={s("position:absolute;inset:0;background:rgba(34,30,24,.6);")}></div>
        <div style={s("position:relative;background:#f4ecd9;border-radius:26px 26px 0 0;max-height:90%;overflow-y:auto;padding:22px 22px 30px;box-shadow:0 -10px 30px rgba(0,0,0,.3);animation:sheetUp .35s ease;")}>
          <div style={s("display:flex;align-items:center;margin-bottom:6px;")}>
            <div style={s("flex:1;font-family:'LXGW WenKai TC',cursive;font-size:25px;color:#3b342a;")}>茶山活動報名</div>
            <button onClick={() => this.closeActivities()} style={s("width:34px;height:34px;border-radius:50%;border:none;background:rgba(59,52,42,.08);color:#6f6450;font-size:17px;cursor:pointer;")}>✕</button>
          </div>
          <p style={s("font-size:13px;color:#6f6450;margin:0 0 16px;line-height:1.6;")}>跟著茶山一起共工、做農事，名額有限，先報名先預約。</p>
          {ACTIVITIES.map((a) => {
            const joined = !!st.joined[a.id]
            const btnStyle = joined
              ? { width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #5f7a44', background: '#e7eed8', color: '#3f5230', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }
              : { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: A, color: '#fbf6ea', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }
            return (
              <div key={a.id} style={s("border:1px solid rgba(59,52,42,.14);border-radius:15px;padding:14px 15px;margin-bottom:12px;background:#fbf6ea;")}>
                <div style={s("display:flex;align-items:baseline;gap:8px;margin-bottom:6px;")}>
                  <div style={s("flex:1;font-size:16.5px;font-weight:700;color:#3b342a;")}>{a.name}</div>
                  <div style={s("font-size:12px;color:#9a7b4f;white-space:nowrap;flex:0 0 auto;")}>{a.when}</div>
                </div>
                <p style={s("font-size:13.5px;color:#6f6450;line-height:1.6;margin:0 0 12px;")}>{a.desc}</p>
                <button onClick={() => this.toggleJoin(a.id)} style={btnStyle}>{joined ? '已報名 ✓' : '我有興趣，報名'}</button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  renderCollection() {
  const { solved } = this.state
  const A = this.props.accentColor ?? '#b15a3c'

  return (
    <div style={s("position:absolute;inset:0;background:#efe6d3;display:flex;flex-direction:column;")}>
      {/* 頂部 header */}
      <div style={s("display:flex;align-items:center;gap:12px;padding:14px 16px;background:#f4ecd9;border-bottom:1px solid rgba(59,52,42,.12);")}>
        <button onClick={() => this.setState({ screen: 'home' })} style={s("width:36px;height:36px;border-radius:50%;border:1px solid rgba(59,52,42,.18);background:#fbf6ea;color:#3b342a;font-size:18px;cursor:pointer;line-height:1;")}>←</button>
        <div style={s("flex:1;")}>
          <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:22px;color:#3b342a;line-height:1;")}>我的卡冊</div>
          <div style={s("font-size:11.5px;color:#9a7b4f;")}>已解開 {solved.filter(Boolean).length}/4 張</div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div style={s("flex:1;overflow-y:auto;padding:18px 18px 30px;")}>
        <p style={s("font-size:13px;color:#6f6450;margin:0 0 16px;line-height:1.6;")}>走訪古厝解謎後，知識卡會收進這裡。</p>

        {HOTSPOTS.map((h, i) => (
          <div key={i} style={{
            ...s("border-radius:16px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 10px rgba(59,52,42,.1);"),
            opacity: solved[i] ? 1 : 0.5,
          }}>
            {solved[i] ? (
              /* 已解開：完整卡片 */
              <div style={s("background:#fbf6ea;border:1px solid rgba(154,123,79,.25);border-radius:16px;padding:16px;")}>
                <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:10px;")}>
                  <span style={{ width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'LXGW WenKai TC',cursive", fontSize: '25px', background: A, color: '#f7f1e3', border: '2px solid rgba(0,0,0,.22)', boxShadow: '0 3px 8px rgba(59,52,42,.28)', flexShrink: 0 }}>{h.char}</span>
                  <div>
                    <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:20px;color:#3b342a;line-height:1;")}>{h.name}</div>
                    <div style={s("font-size:11px;color:#9a7b4f;letter-spacing:1px;margin-top:2px;")}>{h.tag}</div>
                  </div>
                  <span style={s("margin-left:auto;font-size:11px;color:#5f7a44;font-weight:600;background:#e7eed8;padding:3px 9px;border-radius:10px;")}>已收藏</span>
                </div>
                <div style={s("border-left:3px solid #9a7b4f;padding-left:12px;")}>
                  <p style={s("font-size:13.5px;line-height:1.75;color:#4a4234;margin:0;")}>{h.know}</p>
                </div>
              </div>
            ) : (
              /* 未解開：鎖定狀態 */
              <div style={s("background:#f2ead9;border:1px dashed rgba(59,52,42,.2);border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;")}>
                <span style={{ width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'LXGW WenKai TC',cursive", fontSize: '25px', background: 'rgba(59,52,42,.08)', color: 'rgba(59,52,42,.25)', border: '2px dashed rgba(59,52,42,.2)', flexShrink: 0 }}>？</span>
                <div>
                  <div style={s("font-size:14px;color:#9a8e76;font-weight:600;")}>尚未解開</div>
                  <div style={s("font-size:12px;color:#b8a98a;margin-top:2px;")}>前往古厝找到印章「{h.char}」</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 全部解開後的彩蛋文字 */}
        {solved.every(Boolean) && (
          <div style={s("text-align:center;padding:20px 10px;")}>
            <div style={s("font-family:'LXGW WenKai TC',cursive;font-size:22px;color:#b15a3c;margin-bottom:6px;")}>🎉 集齊全部知識！</div>
            <p style={s("font-size:13px;color:#9a7b4f;line-height:1.7;margin:0;")}>你已把蔡家古厝的生活智慧都收進口袋，<br/>是真正的茶山知己。</p>
          </div>
        )}
      </div>
    </div>
  )
}
}
