/* ═══════════════════════════════════════
   CROSSCHECK — Booking System
   Изпраща резервацията чрез WhatsApp
═══════════════════════════════════════ */

// ── КОНФИГУРАЦИЯ — смени с твоя WhatsApp номер
const WHATSAPP_NUMBER = '359XXXXXXXXX'; // напр. '359888123456'

// ── УСЛУГИ
const SERVICES = [
  { id: 'haircut',  name: 'Мъжко Подстригване',    price: 'от 10 €', time: '60 мин' },
  { id: 'classic',  name: 'Класическо Подстригване', price: 'от 12 €', time: '60 мин' },
  { id: 'beard',    name: 'Оформяне на Брада',       price: 'от 8 €',  time: '30 мин' },
  { id: 'combo',    name: 'Комбо Коса & Брада',      price: 'от 15 €', time: '60 мин' },
];

// ── РАБОТНО ВРЕМЕ
const WORK_START = 10; // 10:00
const WORK_END   = 20; // 20:00
const SLOT_MINS  = 30; // на всеки 30 мин

// ── STATE
let state = {
  step: 1,
  service: null,
  date: null,
  time: null,
  name: '',
  phone: '',
};

let calYear, calMonth;

// ── INIT
function initBooking() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();

  // render services
  const grid = document.getElementById('bkServices');
  if (!grid) return;
  grid.innerHTML = SERVICES.map(s => `
    <div class="bk-svc" data-id="${s.id}" onclick="selectService('${s.id}')">
      <div class="bk-svc__name">${s.name}</div>
      <div class="bk-svc__meta">
        <span class="bk-svc__price">${s.price}</span>
        <span class="bk-svc__time">${s.time}</span>
      </div>
    </div>
  `).join('');

  renderCalendar();
  goToStep(1);
}

// ── OPEN / CLOSE
function openBooking() {
  const overlay = document.getElementById('bookingOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  state = { step: 1, service: null, date: null, time: null, name: '', phone: '' };
  initBooking();
}

function closeBooking() {
  document.getElementById('bookingOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// close on overlay click
document.getElementById('bookingOverlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeBooking();
});

// ── STEP NAVIGATION
function goToStep(n) {
  state.step = n;

  // panels
  document.querySelectorAll('.bk-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === n);
  });

  // step indicators
  document.querySelectorAll('.bk-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 === n) s.classList.add('active');
    if (i + 1 < n)  s.classList.add('done');
  });
  document.querySelectorAll('.bk-step-line').forEach((l, i) => {
    l.classList.toggle('done', i + 1 < n);
  });

  // buttons
  const back    = document.getElementById('bkBack');
  const next    = document.getElementById('bkNext');
  const confirm = document.getElementById('bkConfirm');

  back.style.display    = n > 1 && n < 4 ? 'block' : 'none';
  next.style.display    = n < 3 ? 'block' : 'none';
  confirm.style.display = n === 3 ? 'block' : 'none';

  if (n === 3) renderSummary();
  validateStep();
}

function nextStep() {
  if (!validateStep()) return;
  if (state.step < 3) goToStep(state.step + 1);
}

function prevStep() {
  if (state.step > 1) goToStep(state.step - 1);
}

// ── VALIDATE
function validateStep() {
  const next = document.getElementById('bkNext');
  const conf = document.getElementById('bkConfirm');
  let valid = false;

  if (state.step === 1) valid = !!state.service;
  if (state.step === 2) valid = !!state.date && !!state.time;
  if (state.step === 3) {
    const name  = document.getElementById('bkName')?.value.trim();
    const phone = document.getElementById('bkPhone')?.value.trim();
    valid = name?.length > 1 && phone?.length > 5;
  }

  if (next)  next.disabled  = !valid;
  if (conf)  conf.disabled  = !valid;
  return valid;
}

// ── SELECT SERVICE
function selectService(id) {
  state.service = id;
  document.querySelectorAll('.bk-svc').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  validateStep();
}

// ── CALENDAR
function renderCalendar() {
  const monthNames = ['Януари','Февруари','Март','Април','Май','Юни',
                      'Юли','Август','Септември','Октомври','Ноември','Декември'];
  const dayNames   = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];

  document.getElementById('bkCalMonth').textContent = `${monthNames[calMonth]} ${calYear}`;

  // header
  const hdr = document.getElementById('bkCalDaysHeader');
  hdr.innerHTML = dayNames.map(d => `<span>${d}</span>`).join('');

  // grid
  const grid  = document.getElementById('bkCalGrid');
  const first = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const days  = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  let html = '';
  // offset for Monday start
  const offset = (first + 6) % 7;
  for (let i = 0; i < offset; i++) html += `<div class="bk-day empty"></div>`;

  for (let d = 1; d <= days; d++) {
    const date    = new Date(calYear, calMonth, d);
    const isPast  = date < today;
    const isToday = date.getTime() === today.getTime();
    const selStr  = state.date ? new Date(state.date).toDateString() : '';
    const isSel   = date.toDateString() === selStr;

    let cls = 'bk-day';
    if (isPast)  cls += ' disabled';
    if (isToday) cls += ' today';
    if (isSel)   cls += ' selected';

    html += `<div class="${cls}" onclick="selectDate(${calYear},${calMonth},${d})">${d}</div>`;
  }
  grid.innerHTML = html;
}

function calPrev() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}
function calNext() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

function selectDate(y, m, d) {
  const date = new Date(y, m, d);
  const today = new Date(); today.setHours(0,0,0,0);
  if (date < today) return;

  state.date = date.toISOString();
  state.time = null;
  renderCalendar();
  renderSlots(date);
  validateStep();
}

// ── TIME SLOTS
function renderSlots(date) {
  const container = document.getElementById('bkSlots');
  if (!container) return;

  const slots = [];
  for (let h = WORK_START; h < WORK_END; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (SLOT_MINS === 30) slots.push(`${String(h).padStart(2,'0')}:30`);
  }

  // simulated taken slots (в реален сценарий — от база данни)
  const taken = [];

  container.innerHTML = slots.map(t => {
    const isTaken = taken.includes(t);
    const isSel   = state.time === t;
    let cls = 'bk-slot';
    if (isTaken) cls += ' taken';
    if (isSel)   cls += ' selected';
    return `<div class="${cls}" onclick="selectTime('${t}')">${t}</div>`;
  }).join('');
}

function selectTime(t) {
  state.time = t;
  document.querySelectorAll('.bk-slot').forEach(el => {
    el.classList.toggle('selected', el.textContent === t);
  });
  validateStep();
}

// ── SUMMARY
function renderSummary() {
  const svc  = SERVICES.find(s => s.id === state.service);
  const date = state.date ? new Date(state.date) : null;
  const days = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];
  const months = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек'];

  const dateStr = date
    ? `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    : '—';

  document.getElementById('bkSummary').innerHTML = `
    <div class="bk-summary-row"><span>Услуга</span><span>${svc?.name || '—'}</span></div>
    <div class="bk-summary-row"><span>Дата</span><span>${dateStr}</span></div>
    <div class="bk-summary-row"><span>Час</span><span>${state.time || '—'}</span></div>
    <div class="bk-summary-row total"><span>Цена</span><span>${svc?.price || '—'}</span></div>
  `;

  // live validation on name/phone
  document.getElementById('bkName')?.addEventListener('input', validateStep);
  document.getElementById('bkPhone')?.addEventListener('input', validateStep);
}

// ── CONFIRM & SEND VIA WHATSAPP
function confirmBooking() {
  const name  = document.getElementById('bkName')?.value.trim();
  const phone = document.getElementById('bkPhone')?.value.trim();

  if (!name || !phone) return;

  state.name  = name;
  state.phone = phone;

  const svc   = SERVICES.find(s => s.id === state.service);
  const date  = new Date(state.date);
  const days  = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];
  const months= ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const dateStr = `${days[date.getDay()]} ${date.getDate()}.${months[date.getMonth()]}.${date.getFullYear()}`;

  const msg = encodeURIComponent(
`Здравейте! Искам да запазя час в CROSSCHECK Barbershop:

✂️ Услуга: ${svc?.name}
📅 Дата: ${dateStr}
🕐 Час: ${state.time}
💰 Цена: ${svc?.price}
👤 Имe: ${name}
📱 Телефон: ${phone}

Моля потвърдете резервацията. Благодаря!`
  );

  // показваме confirmation панел
  document.getElementById('bkConfirmPanel').innerHTML = `
    <div class="bk-confirm">
      <div class="bk-confirm__icon">✓</div>
      <h3>Почти готово!</h3>
      <p>Ще те пренасочим към WhatsApp за потвърждение на часа. Изпрати съобщението и ще получиш отговор скоро.</p>
      <div class="bk-confirm__details">
        <p><strong>${svc?.name}</strong></p>
        <p>${dateStr} в <strong>${state.time}</strong></p>
        <p>Цена: <strong>${svc?.price}</strong></p>
      </div>
    </div>
  `;
  goToStep(4);

  // отваря WhatsApp след кратка пауза
  setTimeout(() => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }, 800);
}
