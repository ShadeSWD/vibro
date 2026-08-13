/* Каркас страниц «Вибрация корабля». */
'use strict';
(function () {
  const me = document.currentScript;
  const root = (me && me.dataset.root) || './';
  const page = (me && me.dataset.page) || '';
  const nav = [
    { h: '', k: 'index', t: 'Обзор' },
    { t: 'Теория', h: 'theory', drop: [
      { h: 'theory', k: 'theory', t: 'Оглавление курса' },
      { h: 't-sources', k: 't-sources', t: '1. Возмущающие силы' },
      { h: 't-single', k: 't-single', t: '2. Одна степень свободы' },
      { h: 't-two', k: 't-two', t: '3. Несколько степеней свободы' },
      { h: 't-beams', k: 't-beams', t: '4. Колебания балок' },
      { h: 't-plates', k: 't-plates', t: '5. Колебания пластин' },
      { h: 't-energy', k: 't-energy', t: '6. Метод Релея и корпус' },
      { h: 'hull', k: 'hull', t: 'Вибрация корпуса судна' },
      { h: 'norms', k: 'norms', t: 'Нормирование вибрации' },
    ] },
    { t: 'Опыты', h: 'models', drop: [
      { h: 'models', k: 'models', t: 'Все пять моделей' },
      { h: 'demo-m1', k: 'demo-m1', t: 'М1. Свободные колебания' },
      { h: 'demo-m2', k: 'demo-m2', t: 'М2. Резонансная кривая' },
      { h: 'demo-m3', k: 'demo-m3', t: 'М3. Две массы' },
      { h: 'demo-m4', k: 'demo-m4', t: 'М4. Консоль на вибростенде' },
      { h: 'demo-m5', k: 'demo-m5', t: 'М5. Автомобиль на дороге' },
    ] },
    { h: 'problems', k: 'problems', t: 'Задачи' },
    { h: 'sources', k: 'sources', t: 'Источники' },
  ];
  const navLink = (it) =>
    `<a href="${root}${it.h}" class="${page === it.k ? 'on' : ''}">${it.t}</a>`;
  const navHtml = nav.map((g) => {
    if (!g.drop) return navLink(g);
    const on = g.drop.some((it) => page === it.k) ? 'on' : '';
    return `<span class="nav-drop"><a href="${root}${g.h}" class="${on}">${g.t} ▾</a>`
      + `<span class="drop">${g.drop.map(navLink).join('')}</span></span>`;
  }).join('');
  const header = document.createElement('header');
  header.className = 'site';
  header.innerHTML = `<div class="wrap">
    <a class="logo" href="${root}"><span class="logo-emoji" aria-hidden="true">〰️</span><span>Вибрация корабля</span></a>
    <nav class="top">${navHtml}</nav>
  </div>`;
  document.body.prepend(header);
  const onReady = (fn) => (document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn) : fn());
  const footer = document.createElement('footer');
  footer.className = 'site';
  footer.innerHTML = `<div class="wrap">
    <div>Учебный сайт по курсу «Вибрация корабля» · все модели считаются и анимируются прямо в браузере</div>
  </div>`;
  onReady(() => document.body.appendChild(footer));
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.style.position = 'absolute';
  defs.innerHTML = `<defs>
    <marker id="arrE" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#16161a"/></marker>
    <marker id="arrS" markerWidth="10" markerHeight="8" refX="1" refY="4" orient="auto">
      <path d="M10,0 L0,4 L10,8 z" fill="#16161a"/></marker>
    <marker id="arrR" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#b3382e"/></marker>
    <marker id="arrB" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 z" fill="#155e75"/></marker>
  </defs>`;
  onReady(() => document.body.appendChild(defs));
})();
