import './styles.css'

type StartResp = { session_id: string; deck_token: string; positions: string[]; total_cards: number }

type DrawResp = { card_index: number; hidden: true } | { done: true }

type FlipResp = { name: string; suit: string; reversed: boolean }

type SaveState = {
  session_id: string
  deck_token: string
  positions: string[]
  total_cards: number
  drawn: Array<{
    index: number
    flipped?: FlipResp
  }>
}

const API_BASE = '/api/deck'

function $(sel: string, root: Document | HTMLElement = document) {
  const el = root.querySelector(sel)
  if (!el) throw new Error(`missing ${sel}`)
  return el as HTMLElement
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

async function api<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
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
    try {
      // Idempotent: if we already have session, skip
      const existing = loadState()
      if (existing) { render(); return }
      const payload = { spread: 'three_cards', allow_reversed: true, user_id: 0 }
      const resp = await api<StartResp>('/start', payload)
      const state: SaveState = { session_id: resp.session_id, deck_token: resp.deck_token, positions: resp.positions, total_cards: resp.total_cards, drawn: [] }
      saveState(state)
      render()
    } catch (e) {
      btn.disabled = false
      anim.classList.remove('spin')
      alert('Сеть недоступна. Попробуйте позже.')
    }
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
  btn.onclick = async () => {
    btn.disabled = true
    try {
      const resp = await api<DrawResp>('/draw', { session_id: state.session_id, deck_token: state.deck_token })
      if ('done' in resp) {
        renderFlip(state)
        return
      }
      state.drawn.push({ index: resp.card_index })
      saveState(state)
      renderDraw(state)
    } catch (e) {
      btn.disabled = false
      alert('Сеть недоступна. Попробуйте позже.')
    }
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
    el.innerHTML = it.flipped ? cardHtml(it.index, it.flipped) : hiddenHtml(it.index)
    el.onclick = async () => {
      if (it.flipped) return
      try {
        const resp = await api<FlipResp>('/flip', { session_id: state.session_id, deck_token: state.deck_token, card_index: it.index })
        it.flipped = resp
        saveState(state)
        renderFlip(state)
      } catch (e) {
        alert('Сеть недоступна. Попробуйте позже.')
      }
    }
    list.appendChild(el)
  }
  const finish = $('#finish') as HTMLButtonElement
  finish.onclick = async () => {
    try {
      const drawn = state.drawn.map(d => ({ index: d.index, ...(d.flipped || {}) }))
      await api('/finish', { session_id: state.session_id, deck_token: state.deck_token, drawn })
      saveState(null)
      if ((window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.close()
      } else {
        alert('Готово! Сессию закрыли.')
        render()
      }
    } catch (e) {
      alert('Сеть недоступна. Попробуйте позже.')
    }
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
