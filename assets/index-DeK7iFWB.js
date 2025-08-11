(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))d(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const t of r.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&d(t)}).observe(document,{childList:!0,subtree:!0});function s(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function d(i){if(i.ep)return;i.ep=!0;const r=s(i);fetch(i.href,r)}})();function o(e,n=document){const s=n.querySelector(e);if(!s)throw new Error(`missing ${e}`);return s}function m(){var i,r;const e=(i=window.Telegram)==null?void 0:i.WebApp,n=(r=e==null?void 0:e.initDataUnsafe)==null?void 0:r.start_param;if(n&&n.startsWith("spread:")){const t=n.slice(7);if(t==="card_of_day"||t==="three_cards"||t==="love")return t}const d=new URLSearchParams(location.search).get("startapp")||"";if(d.startsWith("spread:")){const t=d.slice(7);if(t==="card_of_day"||t==="three_cards"||t==="love")return t}return"three_cards"}function h(e){return e==="card_of_day"?1:e==="three_cards"?3:6}function g(){const e=localStorage.getItem("tarobot_session");if(!e)return null;try{return JSON.parse(e)}catch{return null}}function a(e){e?localStorage.setItem("tarobot_session",JSON.stringify(e)):localStorage.removeItem("tarobot_session")}function l(){const e=o("#app");e.innerHTML=`
    <div class="container">
      <div class="header">Таро — WebApp</div>
      <div id="screen"></div>
    </div>
  `;const n=g();n?n.drawn.length<n.total_cards?f(n):p(n):y()}function y(){const e=o("#screen"),n=m();e.innerHTML=`
    <div class="progress">Начнём с перемешивания колоды</div>
    <div class="hidden-card" id="anim"></div>
    <div style="height:8px"></div>
    <button class="primary" id="btn">Перемешать</button>
  `;const s=o("#anim"),d=o("#btn");d.onclick=async()=>{s.classList.add("spin"),d.disabled=!0;const i={spread:n,drawn:[],total_cards:h(n)};a(i),l()}}function f(e){const n=o("#screen"),s=`Карта ${e.drawn.length+1} из ${e.total_cards}`;n.innerHTML=`
    <div class="progress">${s}</div>
    <div class="card-list" id="list"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="primary" id="btn">Тянуть карту</button>
      <button id="done" ${e.drawn.length===e.total_cards?"":"disabled"}>Готово</button>
    </div>
  `;const d=o("#list");for(const t of e.drawn){const c=document.createElement("div");c.className="card",c.innerHTML=t.flipped?v(t.index,{name:"Карта",suit:"—",reversed:!!t.flipped}):u(t.index),d.appendChild(c)}const i=o("#btn");i.onclick=()=>{e.drawn.push({index:e.drawn.length}),a(e),f(e)};const r=o("#done");r.onclick=()=>p(e)}function p(e){const n=o("#screen"),s=`Карта ${Math.min(e.drawn.length+1,e.total_cards)} из ${e.total_cards}`;n.innerHTML=`
    <div class="progress">${s}</div>
    <div class="card-list" id="list"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="primary" id="finish" ${e.drawn.length===e.total_cards?"":"disabled"}>Готово</button>
    </div>
  `;const d=o("#list");for(const r of e.drawn){const t=document.createElement("div");t.className="card",t.innerHTML=r.flipped?v(r.index,{name:"Карта",suit:"—",reversed:!!r.flipped}):u(r.index),t.onclick=()=>{r.flipped||(r.flipped=Math.random()<.5,a(e),p(e))},d.appendChild(t)}const i=o("#finish");i.onclick=async()=>{var t,c;const r=(t=window.Telegram)==null?void 0:t.WebApp;try{(c=r==null?void 0:r.sendData)==null||c.call(r,JSON.stringify({ok:!0,spread:e.spread}))}catch{}a(null),r?r.close():(alert("Готово!"),l())}}function u(e){return`<div class="title">Карта #${e+1}</div><div class="meta">закрыта</div>`}function v(e,n){const s=n.reversed?"reversed":"";return`<div><div class="title">${n.name}</div><div class="meta">${n.suit}</div></div><div class="flipped ${s}">⟲</div>`}l();
