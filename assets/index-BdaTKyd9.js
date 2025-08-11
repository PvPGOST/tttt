(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))d(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const t of r.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&d(t)}).observe(document,{childList:!0,subtree:!0});function s(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function d(i){if(i.ep)return;i.ep=!0;const r=s(i);fetch(i.href,r)}})();function o(e,n=document){const s=n.querySelector(e);if(!s)throw new Error(`missing ${e}`);return s}function g(){var i,r;const e=(i=window.Telegram)==null?void 0:i.WebApp,n=(r=e==null?void 0:e.initDataUnsafe)==null?void 0:r.start_param;if(n&&n.startsWith("spread:")){const t=n.slice(7);if(t==="card_of_day"||t==="three_cards"||t==="love")return t}const d=new URLSearchParams(location.search).get("startapp")||"";if(d.startsWith("spread:")){const t=d.slice(7);if(t==="card_of_day"||t==="three_cards"||t==="love")return t}return"three_cards"}function b(e){return e==="card_of_day"?1:e==="three_cards"?3:6}function y(){const e=localStorage.getItem("tarobot_session");if(!e)return null;try{return JSON.parse(e)}catch{return null}}function a(e){e?localStorage.setItem("tarobot_session",JSON.stringify(e)):localStorage.removeItem("tarobot_session")}function p(e){return e==="card_of_day"?"Карта дня":e==="three_cards"?"Три карты":"Любовный расклад"}function f(){const e=o("#app");e.innerHTML=`
    <div class="container">
      <div class="header">Таро — WebApp</div>
      <div id="screen"></div>
    </div>
  `;const n=y();n?n.drawn.length<n.total_cards?v(n):u(n):_()}function _(){const e=o("#screen"),n=g();e.innerHTML=`
    <div class="progress">Режим: ${p(n)}</div>
    <div class="deck"><div class="back"></div><div class="count">Колода готова</div></div>
    <div class="hidden-card" id="anim"></div>
    <div style="height:8px"></div>
    <button class="primary" id="btn">Перемешать</button>
  `;const s=o("#anim"),d=o("#btn");d.onclick=async()=>{s.classList.add("spin"),d.disabled=!0;const i={spread:n,drawn:[],total_cards:b(n)};a(i),f()}}function v(e){const n=o("#screen"),s=e.total_cards-e.drawn.length,d=`Карта ${e.drawn.length+1} из ${e.total_cards}`;n.innerHTML=`
    <div class="progress">Режим: ${p(e.spread)} • ${d}</div>
    <div class="deck"><div class="back"></div><div class="count">В колоде: ${s}</div></div>
    <div class="card-list" id="list"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="primary" id="btn" ${e.drawn.length>=e.total_cards?"disabled":""}>Тянуть карту</button>
      <button id="done" ${e.drawn.length===e.total_cards?"":"disabled"}>Готово</button>
    </div>
  `;const i=o("#list");for(const c of e.drawn){const l=document.createElement("div");l.className="card pop",l.innerHTML=c.flipped?h(c.index,{name:"Карта",suit:"—",reversed:!!c.flipped}):m(c.index),i.appendChild(l)}const r=o("#btn");r.onclick=()=>{e.drawn.length>=e.total_cards||(e.drawn.push({index:e.drawn.length}),a(e),v(e))};const t=o("#done");t.onclick=()=>u(e)}function u(e){const n=o("#screen"),s=`Карта ${Math.min(e.drawn.length+1,e.total_cards)} из ${e.total_cards}`;n.innerHTML=`
    <div class="progress">Режим: ${p(e.spread)} • ${s}</div>
    <div class="card-list" id="list"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="primary" id="finish" ${e.drawn.length===e.total_cards?"":"disabled"}>Готово</button>
    </div>
  `;const d=o("#list");for(const r of e.drawn){const t=document.createElement("div");t.className="card pop",t.innerHTML=r.flipped?h(r.index,{name:"Карта",suit:"—",reversed:!!r.flipped}):m(r.index),t.onclick=()=>{r.flipped||(r.flipped=Math.random()<.5,a(e),u(e))},d.appendChild(t)}const i=o("#finish");i.onclick=async()=>{var t,c;const r=(t=window.Telegram)==null?void 0:t.WebApp;try{(c=r==null?void 0:r.sendData)==null||c.call(r,JSON.stringify({ok:!0,spread:e.spread}))}catch{}a(null),r?r.close():(alert("Готово!"),f())}}function m(e){return`<div><div class="title">Карта #${e+1}</div><div class="meta">закрыта</div></div>`}function h(e,n){const s=n.reversed?"reversed":"";return`<div><div class="title">${n.name}</div><div class="meta">${n.suit}</div></div><div class="flipped ${s}">⟲</div>`}f();
