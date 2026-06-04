/* ═══════════════════════════
   CROSSCHECK — Simple Booking
═══════════════════════════ */

const WHATSAPP_NUMBER = '359XXXXXXXXX'; // смени с реалния номер

const SERVICES = [
  { id: 'haircut', name: 'Мъжко Подстригване',     price: 'от 10 €', time: '60 мин' },
  { id: 'classic', name: 'Класическо Подстригване', price: 'от 12 €', time: '60 мин' },
  { id: 'beard',   name: 'Оформяне на Брада',        price: 'от 8 €',  time: '30 мин' },
  { id: 'combo',   name: 'Комбо Коса & Брада',       price: 'от 15 €', time: '60 мин' },
];

let selectedService = null;

// ── ОТВАРЯНЕ
function openBooking() {
  selectedService = null;
  document.getElementById('bookingOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderServices();
  updateSendBtn();
  document.getElementById('bkPhone').value = '';
  document.getElementById('bkDone').style.display = 'none';
  document.getElementById('bkForm').style.display = 'block';
}

// ── ЗАТВАРЯНЕ
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
    <div class="bk-svc${selectedService===s.id?' selected':''}" onclick="pickService('${s.id}')">
      <div class="bk-svc__left">
        <div class="bk-svc__check">${selectedService===s.id?'✓':''}</div>
        <div>
          <div class="bk-svc__name">${s.name}</div>
          <div class="bk-svc__time">${s.time}</div>
        </div>
      </div>
      <div class="bk-svc__price">${s.price}</div>
    </div>
  `).join('');
}

function pickService(id) {
  selectedService = id;
  renderServices();
  updateSendBtn();
}

// ── БУТОН
function updateSendBtn() {
  const phone = document.getElementById('bkPhone')?.value.trim();
  const btn   = document.getElementById('bkSend');
  if (btn) btn.disabled = !selectedService || !phone || phone.length < 6;
}
document.getElementById('bkPhone')?.addEventListener('input', updateSendBtn);

// ── ИЗПРАТИ
function sendBooking() {
  const phone = document.getElementById('bkPhone').value.trim();
  if (!selectedService || !phone) return;

  const svc = SERVICES.find(s => s.id === selectedService);
  const msg = encodeURIComponent(
`Здравейте! Искам да запазя час в CROSSCHECK Barbershop.

✂️ Услуга: ${svc.name} (${svc.price})
📱 Моят телефон: ${phone}

Кога имате свободен час? Благодаря!`
  );

  // показваме потвърждение
  document.getElementById('bkForm').style.display = 'none';
  document.getElementById('bkDone').style.display = 'block';

  // отваряме WhatsApp
  setTimeout(() => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }, 600);
}
