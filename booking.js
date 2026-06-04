/* ═══════════════════════════════════════════
   CROSSCHECK — Booking System with Firebase
═══════════════════════════════════════════ */

// ── FIREBASE CONFIG — смени с твоите данни след регистрация
const FB_CONFIG = {
  apiKey:            "ТВОЯТ_API_KEY",
  authDomain:        "ТВОЯТ_PROJECT.firebaseapp.com",
  projectId:         "ТВОЯТ_PROJECT_ID",
  storageBucket:     "ТВОЯТ_PROJECT.appspot.com",
  messagingSenderId: "ТВОЯТ_SENDER_ID",
  appId:             "ТВОЯТ_APP_ID"
};

// ── WHATSAPP номер (смени с реалния)
const WHATSAPP = '359XXXXXXXXX';

// ── УСЛУГИ
const SERVICES = [
  { id: 'haircut', name: 'Мъжко Подстригване',      price: 'от 10 €', dur: 60 },
  { id: 'classic', name: 'Класическо Подстригване',  price: 'от 12 €', dur: 60 },
  { id: 'beard',   name: 'Оформяне на Брада',         price: 'от 8 €',  dur: 30 },
  { id: 'combo',   name: 'Комбо Коса & Брада',        price: 'от 15 €', dur: 60 },
];

const HOURS_START = 10, HOURS_END = 20, SLOT = 30;

// ── STATE
let db = null;
let state = { service: null, date: null, time: null, phone: '' };
let calY, calM, bookedSlots = [];

// ── INIT FIREBASE
function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    db = firebase.firestore();
    return true;
  } catch(e) {
    console.warn('Firebase не е конфигуриран:', e.message);
    return false;
  }
}

// ── ОТВОРИ
function openBooking() {
  state = { service: null, date: null, time: null, phone: '' };
  bookedSlots = [];
  const now = new Date();
  calY = now.getFullYear(); calM = now.getMonth();

  document.getElementById('bookingOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('bkForm').style.display = 'block';
  document.getElementById('bkDone').style.display = 'none';
  document.getElementById('bkCancel').style.display = 'none';

  renderServices();
  renderCal();
  renderSlots();
  sync();
}

// ── ЗАТВОРИ
function closeBooking() {
  document.getElementById('bookingOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('bookingOverlay')?.addEventListener('click', e => {
  if (e.target.id === 'bookingOverlay') closeBooking();
});

// ── УСЛУГИ
function renderServices() {
  document.getElementById('bkServices').innerHTML = SERVICES.map(s => `
    <div class="bk-svc${state.service===s.id?' selected':''}" onclick="pickSvc('${s.id}')">
      <div class="bk-svc__left">
        <div class="bk-svc__check">${state.service===s.id?'✓':''}</div>
        <div>
          <div class="bk-svc__name">${s.name}</div>
          <div class="bk-svc__time">${s.dur} мин</div>
        </div>
      </div>
      <div class="bk-svc__price">${s.price}</div>
    </div>`).join('');
}
function pickSvc(id) { state.service = id; renderServices(); sync(); }

// ── КАЛЕНДАР
function renderCal() {
  const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни',
                  'Юли','Август','Септември','Октомври','Ноември','Декември'];
  const DAYS   = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];

  document.getElementById('bkCalMonth').textContent = `${MONTHS[calM]} ${calY}`;
  document.getElementById('bkCalHead').innerHTML = DAYS.map(d=>`<span>${d}</span>`).join('');

  const today   = new Date(); today.setHours(0,0,0,0);
  const first   = new Date(calY, calM, 1).getDay();
  const total   = new Date(calY, calM+1, 0).getDate();
  const offset  = (first + 6) % 7;

  let html = Array(offset).fill('<div class="bk-day bk-day--empty"></div>').join('');
  for (let d = 1; d <= total; d++) {
    const dt     = new Date(calY, calM, d);
    const past   = dt < today;
    const isToday = dt.getTime() === today.getTime();
    const selStr = state.date || '';
    const isSel  = `${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` === selStr;
    let cls = 'bk-day';
    if (past)    cls += ' bk-day--dis';
    if (isToday) cls += ' bk-day--today';
    if (isSel)   cls += ' bk-day--sel';
    const ds = `${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html += `<div class="${cls}" onclick="pickDate('${ds}')">${d}</div>`;
  }
  document.getElementById('bkCalGrid').innerHTML = html;
}

function calPrev() {
  calM--; if (calM < 0) { calM = 11; calY--; } renderCal();
}
function calNext() {
  calM++; if (calM > 11) { calM = 0; calY++; } renderCal();
}

async function pickDate(ds) {
  state.date = ds; state.time = null;
  renderCal();
  await loadBookedSlots(ds);
  renderSlots();
  sync();
}

// ── ЗАРЕДИ ЗАЕТИ ЧАСОВЕ ОТ FIREBASE
async function loadBookedSlots(date) {
  bookedSlots = [];
  if (!db) return;
  try {
    const snap = await db.collection('bookings')
      .where('date','==',date)
      .where('status','==','active')
      .get();
    snap.forEach(doc => bookedSlots.push(doc.data().time));
  } catch(e) { console.warn('Firebase грешка:', e); }
}

// ── ЧАСОВЕ
function renderSlots() {
  const container = document.getElementById('bkSlots');
  if (!state.date) {
    container.innerHTML = '<p class="bk-slots-hint">↑ Първо избери дата</p>';
    return;
  }
  const slots = [];
  for (let h = HOURS_START; h < HOURS_END; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (SLOT === 30) slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  container.innerHTML = slots.map(t => {
    const taken = bookedSlots.includes(t);
    const sel   = state.time === t;
    let cls = 'bk-slot';
    if (taken) cls += ' bk-slot--taken';
    if (sel)   cls += ' bk-slot--sel';
    return `<div class="${cls}" onclick="${taken?'':'selectTime(\''+t+'\')'}" title="${taken?'Зает':'Свободен'}">${t}${taken?'<span class="bk-slot-x">✕</span>':''}</div>`;
  }).join('');
}

function selectTime(t) { state.time = t; renderSlots(); sync(); }

// ── SYNC (активиране на бутона)
function sync() {
  const phone = document.getElementById('bkPhone')?.value.trim() || '';
  const ok    = state.service && state.date && state.time && phone.length >= 6;
  const btn   = document.getElementById('bkSend');
  if (btn) btn.disabled = !ok;
}
document.getElementById('bkPhone')?.addEventListener('input', sync);

// ── ИЗПРАТИ РЕЗЕРВАЦИЯ
async function sendBooking() {
  const phone = document.getElementById('bkPhone').value.trim();
  if (!state.service || !state.date || !state.time || !phone) return;

  const svc     = SERVICES.find(s => s.id === state.service);
  const code    = Math.random().toString(36).substring(2,8).toUpperCase();
  const dateObj = new Date(state.date);
  const days    = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];
  const months  = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const dateFmt = `${days[dateObj.getDay()]} ${dateObj.getDate()}.${months[dateObj.getMonth()]}.${dateObj.getFullYear()}`;

  // запис в Firebase
  if (db) {
    try {
      await db.collection('bookings').add({
        service: svc.name, date: state.date, time: state.time,
        phone, cancelCode: code, status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) { console.warn('Firebase грешка:', e); }
  }

  // показваме потвърждение
  document.getElementById('bkForm').style.display = 'none';
  document.getElementById('bkDone').innerHTML = `
    <div class="bk-done">
      <div class="bk-done__icon">✓</div>
      <h3>Заявката е изпратена!</h3>
      <div class="bk-done__summary">
        <div class="bk-done__row"><span>Услуга</span><strong>${svc.name}</strong></div>
        <div class="bk-done__row"><span>Дата</span><strong>${dateFmt}</strong></div>
        <div class="bk-done__row"><span>Час</span><strong>${state.time}</strong></div>
        <div class="bk-done__row"><span>Телефон</span><strong>${phone}</strong></div>
      </div>
      <div class="bk-done__code">
        <span class="bk-done__code-label">Код за отказ на резервация</span>
        <span class="bk-done__code-val">${code}</span>
        <p>Запази този код! Нужен е ако искаш да откажеш часа.</p>
      </div>
    </div>`;
  document.getElementById('bkDone').style.display = 'block';

  // WhatsApp
  const msg = encodeURIComponent(`Здравейте! Запазих час в CROSSCHECK:\n✂️ ${svc.name}\n📅 ${dateFmt} в ${state.time}\n📱 ${phone}\nКод: ${code}`);
  setTimeout(() => window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank'), 700);
}

// ── ОТКАЗ НА РЕЗЕРВАЦИЯ
function showCancelForm() {
  document.getElementById('bkForm').style.display = 'none';
  document.getElementById('bkDone').style.display = 'none';
  document.getElementById('bkCancel').style.display = 'block';
  document.getElementById('bkCancelCode').value = '';
  document.getElementById('bkCancelMsg').textContent = '';
}

async function submitCancel() {
  const code = document.getElementById('bkCancelCode').value.trim().toUpperCase();
  const msg  = document.getElementById('bkCancelMsg');
  if (!code || code.length < 6) { msg.textContent = 'Въведи валиден код.'; msg.className='bk-cancel-msg bk-cancel-msg--err'; return; }

  if (!db) { msg.textContent = 'Системата не е свързана с база данни.'; msg.className='bk-cancel-msg bk-cancel-msg--err'; return; }

  try {
    msg.textContent = 'Търсим резервацията...'; msg.className='bk-cancel-msg';
    const snap = await db.collection('bookings').where('cancelCode','==',code).where('status','==','active').get();
    if (snap.empty) {
      msg.textContent = 'Не намерихме резервация с този код.';
      msg.className = 'bk-cancel-msg bk-cancel-msg--err';
      return;
    }
    // маркираме като отказана
    const docRef = snap.docs[0].ref;
    const data   = snap.docs[0].data();
    await docRef.update({ status: 'cancelled', cancelledAt: firebase.firestore.FieldValue.serverTimestamp() });

    msg.textContent = `✓ Резервацията за ${data.date} в ${data.time} е отказана.`;
    msg.className = 'bk-cancel-msg bk-cancel-msg--ok';
  } catch(e) {
    msg.textContent = 'Грешка. Опитай пак.';
    msg.className = 'bk-cancel-msg bk-cancel-msg--err';
  }
}

// ── INIT
window.addEventListener('DOMContentLoaded', initFirebase);
