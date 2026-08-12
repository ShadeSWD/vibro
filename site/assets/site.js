/* Каркас страниц «Вибрация корабля». */
'use strict';
(function () {
  const me = document.currentScript;
  const root = (me && me.dataset.root) || './';
  const page = (me && me.dataset.page) || '';
  const models = [
    { href: 'demo-m1', title: 'М1. Масса на пружине: затухание' },
    { href: 'demo-m2', title: 'М2. Вынужденные колебания и резонанс' },
    { href: 'demo-m3', title: 'М3. Две массы: формы, биения, гаситель' },
    { href: 'demo-m4', title: 'М4. Линейка на вибростенде' },
    { href: 'demo-m5', title: 'М5. Автомобиль по неровной дороге' },
  ];
  const chapters = [
    { href: 't-sources', title: 'Гл. 1. Возмущающие силы' },
    { href: 't-single', title: 'Гл. 2. Одна степень свободы' },
    { href: 't-two', title: 'Гл. 3. Несколько степеней свободы' },
    { href: 't-beams', title: 'Гл. 4. Балки и рамы' },
    { href: 't-plates', title: 'Гл. 5. Пластины' },
    { href: 't-energy', title: 'Гл. 6. Метод Релея и корпус' },
  ];
  const nav = [
    { href: '', key: 'index', title: 'Обзор' },
    { href: 'theory', key: 'theory', title: 'Теория', drop: chapters },
    { href: 'models', key: 'models', title: 'Модели', drop: models },
    { href: 'problems', key: 'problems', title: 'Задачи' },
    { href: 'norms', key: 'norms', title: 'Нормы' },
    { href: 'hull', key: 'hull', title: 'Корпус судна' },
    { href: 'sources', key: 'sources', title: 'Источники' },
  ];
  const header = document.createElement('header');
  header.className = 'site';
  header.innerHTML = `<div class="wrap">
    <a class="logo" href="${root}"><span class="logo-emoji" aria-hidden="true">〰️</span><span>Вибрация корабля</span></a>
    <nav class="top">${nav.map((it) => {
      const on = page === it.key || (it.drop && it.drop.some((d) => d.href === page));
      if (!it.drop) return `<a href="${root}${it.href}" class="${on ? 'on' : ''}">${it.title}</a>`;
      return `<div class="nav-drop"><a href="${root}${it.href}" class="${on ? 'on' : ''}">${it.title} ▾</a>
        <div class="drop">${it.drop.map((d) =>
          `<a href="${root}${d.href}" class="${page === d.href ? 'on' : ''}">${d.title}</a>`).join('')}</div></div>`;
    }).join('')}</nav>
  </div>`;
  document.body.prepend(header);
  const footer = document.createElement('footer');
  footer.className = 'site';
  footer.innerHTML = `<div class="wrap">
    <div>Учебный сайт по курсу «Вибрация корабля» · все модели считаются и анимируются прямо в браузере</div>
  </div>`;
  document.body.appendChild(footer);
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
  document.body.appendChild(defs);
})();
