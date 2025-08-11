import './styles.css'

type Spread = 'card_of_day' | 'three_cards' | 'love'

type FlipResp = { name: string; suit: string; reversed: boolean }

type SaveState = {
  spread: Spread
  drawn: Array<{
    index: number
    flipped?: boolean
  }>
  total_cards: number
}

function $(sel: string, root: Document | HTMLElement = document) {
  const el = root.querySelector(sel)
  if (!el) throw new Error(`missing ${sel}`)
  return el as HTMLElement
}

function getStartSpread(): Spread {
  const tg = (window as any).Telegram?.WebApp
  const sp: string | undefined = tg?.initDataUnsafe?.start_param
  if (sp && sp.startsWith('spread:')) {
    const v = sp.slice('spread:'.length)
    if (v === 'card_of_day' || v === 'three_cards' || v === 'love') return v
  }
  const p = new URLSearchParams(location.search)
  const startapp = p.get('startapp') || ''
  if (startapp.startsWith('spread:')) {
    const v = startapp.slice('spread:'.length)
    if (v === 'card_of_day' || v === 'three_cards' || v === 'love') return v
  }
  return 'three_cards'
}

function initialTotal(spread: Spread): number {
  if (spread === 'card_of_day') return 1
  if (spread === 'three_cards') return 3
  return 6
}

function loadState(): SaveState | null {
  const raw = localStorage.getItem('tarobot_session')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

function saveState(state: SaveState | null) {
  if (!state) localStorage.removeItem('tarobot_session')
  else localStorage.setItem('tarobot_session', JSON.stringify(state))
}

function render() {
  const root = $('#app')
  root.innerHTML = `
    <div class="container">
      <div class="header">Таро — WebApp</div>
      <div id="screen"></div>
    </div>
  `
  const s = loadState()
  if (!s) renderShuffle()
  else if (s.drawn.length < s.total_cards) renderDraw(s)
  else renderFlip(s)
}

function renderShuffle() {
  const screen = $('#screen')
  const spread = getStartSpread()
  screen.innerHTML = `
    <div class="progress">Начнём с перемешивания колоды</div>
    <div class="hidden-card" id="anim"></div>
    <div style="height:8px"></div>
    <button class="primary" id="btn">Перемешать</button>
  `
  const anim = $('#anim')
  const btn = $('#btn') as HTMLButtonElement
  btn.onclick = async () => {
    anim.classList.add('spin')
    btn.disabled = true
    const state: SaveState = { spread, drawn: [], total_cards: initialTotal(spread) }
    saveState(state)
    render()
  }
}

function renderDraw(state: SaveState) {
  const screen = $('#screen')
  const progress = `Карта ${state.drawn.length + 1} из ${state.total_cards}`
  screen.innerHTML = `
    <div class="progress">${progress}</div>
    <div class="card-list" id="list"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="primary" id="btn">Тянуть карту</button>
      <button id="done" ${state.drawn.length === state.total_cards ? '' : 'disabled'}>Готово</button>
    </div>
  `
  const list = $('#list')
  for (const it of state.drawn) {
    const el = document.createElement('div')
    el.className = 'card'
    el.innerHTML = it.flipped ? cardHtml(it.index, it.flipped) : hiddenHtml(it.index)
    list.appendChild(el)
  }
  const btn = $('#btn') as HTMLButtonElement
  btn.onclick = () => {
    state.drawn.push({ index: state.drawn.length })
    saveState(state)
    renderDraw(state)
  }
  const done = $('#done') as HTMLButtonElement
  done.onclick = () => renderFlip(state)
}

function renderFlip(state: SaveState) {
  const screen = $('#screen')
  const progress = `Карта ${Math.min(state.drawn.length + 1, state.total_cards)} из ${state.total_cards}`
  screen.innerHTML = `
    <div class="progress">${progress}</div>
    <div class="card-list" id="list"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="primary" id="finish" ${state.drawn.length === state.total_cards ? '' : 'disabled'}>Готово</button>
    </div>
  `
  const list = $('#list')
  for (const it of state.drawn) {
    const el = document.createElement('div')
    el.className = 'card'
    el.innerHTML = it.flipped ? cardHtml(it.index, { name: 'Карта', suit: '—', reversed: !!it.flipped }) : hiddenHtml(it.index)
    el.onclick = () => {
      if (it.flipped) return
      it.flipped = Math.random() < 0.5
      saveState(state)
      renderFlip(state)
    }
    list.appendChild(el)
  }
  const finish = $('#finish') as HTMLButtonElement
  finish.onclick = async () => {
    const tg = (window as any).Telegram?.WebApp
    try { tg?.sendData?.(JSON.stringify({ ok: true, spread: state.spread })) } catch {}
    saveState(null)
    if (tg) tg.close(); else { alert('Готово!'); render() }
  }
}

function hiddenHtml(index: number) {
  return `<div class="title">Карта #${index + 1}</div><div class="meta">закрыта</div>`
}

function cardHtml(index: number, c: FlipResp) {
  const rev = c.reversed ? 'reversed' : ''
  return `<div><div class="title">${c.name}</div><div class="meta">${c.suit}</div></div><div class="flipped ${rev}">⟲</div>`
}

render()
