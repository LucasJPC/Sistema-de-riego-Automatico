'use strict';

// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================
const SECTIONS_CONFIG = [
  { id: 'termotanque', title: 'Termotanque Solar',                    color: '#0d47a1' },
  { id: 'accesorios', title: 'Accesorios para Termotanque Solar',     color: '#1565c0' },
  { id: 'materiales', title: 'Materiales de Plomería y Eléctricos',   color: '#00838f' },
  { id: 'mano_obra',  title: 'Mano de Obra',                          color: '#2e7d32' },
];

const state = {
  logo: null,
  sections: SECTIONS_CONFIG.map(cfg => ({ ...cfg, items: [] })),
};

let itemIdCounter = 1;

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Fecha de hoy por defecto
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('quoteDate').value = today;

  // Número de presupuesto inicial
  const savedNum = localStorage.getItem('lastQuoteNumber');
  document.getElementById('quoteNumber').value = savedNum
    ? String(parseInt(savedNum, 10) + 1).padStart(4, '0')
    : '0001';

  loadMyData();
  loadLogo();
  renderSections();
  updateTotals();

  // Autosave "mis datos" en cada cambio
  ['myName', 'myCuit', 'myAddress', 'myPhone', 'myEmail', 'myIvaCondition'].forEach(id => {
    document.getElementById(id).addEventListener('input', saveMyData);
    document.getElementById(id).addEventListener('change', saveMyData);
  });

  // Actualizar totales al cambiar % IVA
  document.getElementById('ivaPercent').addEventListener('input', () => {
    document.getElementById('ivaPctLabel').textContent =
      document.getElementById('ivaPercent').value;
    updateTotals();
  });
});

// ============================================================
// MIS DATOS — localStorage
// ============================================================
function saveMyData() {
  const data = {
    name:         document.getElementById('myName').value,
    cuit:         document.getElementById('myCuit').value,
    address:      document.getElementById('myAddress').value,
    phone:        document.getElementById('myPhone').value,
    email:        document.getElementById('myEmail').value,
    ivaCondition: document.getElementById('myIvaCondition').value,
  };
  localStorage.setItem('myData', JSON.stringify(data));
}

function loadMyData() {
  const raw = localStorage.getItem('myData');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    document.getElementById('myName').value         = d.name         || '';
    document.getElementById('myCuit').value         = d.cuit         || '';
    document.getElementById('myAddress').value      = d.address      || '';
    document.getElementById('myPhone').value        = d.phone        || '';
    document.getElementById('myEmail').value        = d.email        || '';
    document.getElementById('myIvaCondition').value = d.ivaCondition || 'Responsable Inscripto';
  } catch (_) { /* ignorar datos corruptos */ }
}

// ============================================================
// LOGO
// ============================================================
function handleLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.logo = e.target.result;
    localStorage.setItem('logo', state.logo);
    refreshLogoPreview();
  };
  reader.readAsDataURL(file);
}

function loadLogo() {
  const saved = localStorage.getItem('logo');
  if (saved) { state.logo = saved; refreshLogoPreview(); }
}

function removeLogo(event) {
  event.stopPropagation();
  state.logo = null;
  localStorage.removeItem('logo');
  document.getElementById('logoInput').value = '';
  refreshLogoPreview();
}

function refreshLogoPreview() {
  const img        = document.getElementById('logoPreview');
  const placeholder = document.getElementById('logoPlaceholder');
  const removeBtn  = document.getElementById('logoRemoveBtn');
  if (state.logo) {
    img.src              = state.logo;
    img.style.display    = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display   = 'flex';
  } else {
    img.style.display         = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display   = 'none';
  }
}

// ============================================================
// SECCIONES E ÍTEMS
// ============================================================
function renderSections() {
  const container = document.getElementById('sectionsContainer');
  container.innerHTML = state.sections.map(renderSectionHTML).join('');
}

function renderSectionHTML(section) {
  const subtotal = sectionSubtotal(section);
  return `
    <div class="section-card" id="section-${section.id}">
      <div class="section-header" style="background:${section.color}">
        <span class="section-title">${esc(section.title)}</span>
        <span class="section-subtotal" id="subtotal-${section.id}">Subtotal: ${fmt(subtotal)}</span>
      </div>
      <div class="items-table-wrap">
        <div class="items-table-header">
          <span>Descripción</span>
          <span>Cant.</span>
          <span>Precio Unit.</span>
          <span>Subtotal</span>
          <span></span>
        </div>
        <div id="items-${section.id}">
          ${section.items.map(item => renderItemHTML(section.id, item)).join('')}
        </div>
      </div>
      <div class="section-footer">
        <button class="btn-add-item" onclick="addItem('${section.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar ítem
        </button>
      </div>
    </div>
  `;
}

function renderItemHTML(sectionId, item) {
  const sub = item.quantity * item.unitPrice;
  return `
    <div class="item-row" id="item-row-${item.id}">
      <input type="text"
             value="${esc(item.description)}"
             placeholder="Descripción del ítem"
             oninput="updateField('${sectionId}', ${item.id}, 'description', this.value)">
      <input type="number"
             value="${item.quantity}"
             min="0" step="any"
             oninput="updateField('${sectionId}', ${item.id}, 'quantity', parseFloat(this.value)||0)">
      <input type="number"
             value="${item.unitPrice || ''}"
             min="0" step="any"
             placeholder="0,00"
             oninput="updateField('${sectionId}', ${item.id}, 'unitPrice', parseFloat(this.value)||0)">
      <span class="item-subtotal" id="isub-${item.id}">${fmt(sub)}</span>
      <button class="btn-delete" onclick="deleteItem('${sectionId}', ${item.id})" title="Eliminar ítem">&#215;</button>
    </div>
  `;
}

function addItem(sectionId) {
  const section = getSection(sectionId);
  const item = { id: itemIdCounter++, description: '', quantity: 1, unitPrice: 0 };
  section.items.push(item);
  refreshSectionItems(section);
  updateTotals();

  // Foco en el campo descripción del nuevo ítem
  setTimeout(() => {
    const row = document.getElementById(`item-row-${item.id}`);
    if (row) row.querySelector('input[type="text"]').focus();
  }, 0);
}

function deleteItem(sectionId, itemId) {
  const section = getSection(sectionId);
  section.items = section.items.filter(i => i.id !== itemId);
  refreshSectionItems(section);
  updateTotals();
}

function updateField(sectionId, itemId, field, value) {
  const section = getSection(sectionId);
  const item = section.items.find(i => i.id === itemId);
  if (!item) return;
  item[field] = value;

  if (field === 'quantity' || field === 'unitPrice') {
    const subEl = document.getElementById(`isub-${itemId}`);
    if (subEl) subEl.textContent = fmt(item.quantity * item.unitPrice);
    refreshSectionSubtotal(section);
    updateTotals();
  }
}

function refreshSectionItems(section) {
  const container = document.getElementById(`items-${section.id}`);
  if (container) container.innerHTML = section.items.map(item => renderItemHTML(section.id, item)).join('');
  refreshSectionSubtotal(section);
}

function refreshSectionSubtotal(section) {
  const el = document.getElementById(`subtotal-${section.id}`);
  if (el) el.textContent = `Subtotal: ${fmt(sectionSubtotal(section))}`;
}

// ============================================================
// CÁLCULO DE TOTALES
// ============================================================
function updateTotals() {
  const subtotal = state.sections.reduce((sum, s) => sum + sectionSubtotal(s), 0);
  const ivaPct   = parseFloat(document.getElementById('ivaPercent').value) || 0;
  const iva      = subtotal * (ivaPct / 100);
  const total    = subtotal + iva;

  document.getElementById('subtotalDisplay').textContent = fmt(subtotal);
  document.getElementById('ivaDisplay').textContent      = fmt(iva);
  document.getElementById('totalDisplay').textContent    = fmt(total);
  document.getElementById('ivaPctLabel').textContent     = ivaPct;
}

function sectionSubtotal(section) {
  return section.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

// ============================================================
// GENERAR VISTA DE IMPRESIÓN
// ============================================================
function generatePrint() {
  // Guardar número de presupuesto
  const quoteNum = document.getElementById('quoteNumber').value;
  if (quoteNum) localStorage.setItem('lastQuoteNumber', parseInt(quoteNum, 10));

  const myData = {
    name:         document.getElementById('myName').value,
    cuit:         document.getElementById('myCuit').value,
    address:      document.getElementById('myAddress').value,
    phone:        document.getElementById('myPhone').value,
    email:        document.getElementById('myEmail').value,
    ivaCondition: document.getElementById('myIvaCondition').value,
  };

  const clientData = {
    name:         document.getElementById('clientName').value,
    cuit:         document.getElementById('clientCuit').value,
    address:      document.getElementById('clientAddress').value,
    phone:        document.getElementById('clientPhone').value,
    email:        document.getElementById('clientEmail').value,
    ivaCondition: document.getElementById('clientIvaCondition').value,
  };

  const quoteDate    = document.getElementById('quoteDate').value;
  const validityDays = document.getElementById('validityDays').value;
  const ivaPct       = parseFloat(document.getElementById('ivaPercent').value) || 0;
  const notes        = document.getElementById('notes').value.trim();

  const subtotal = state.sections.reduce((sum, s) => sum + sectionSubtotal(s), 0);
  const iva      = subtotal * (ivaPct / 100);
  const total    = subtotal + iva;

  const dateFmt = quoteDate
    ? new Date(quoteDate + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  const activeSections = state.sections.filter(s => s.items.length > 0);

  const html = `
    <div class="pv-wrapper">

      <!-- Encabezado: mis datos (izq) + logo (der) -->
      <div class="pv-header">
        <div class="pv-my-data">
          ${myData.name    ? `<div class="pv-company-name">${esc(myData.name)}</div>` : ''}
          ${myData.cuit    ? `<div><strong>CUIT:</strong> ${esc(myData.cuit)}</div>` : ''}
          ${myData.address ? `<div><strong>Dirección:</strong> ${esc(myData.address)}</div>` : ''}
          ${myData.phone   ? `<div><strong>Tel:</strong> ${esc(myData.phone)}</div>` : ''}
          ${myData.email   ? `<div><strong>Email:</strong> ${esc(myData.email)}</div>` : ''}
          ${myData.ivaCondition ? `<div><strong>Cond. IVA:</strong> ${esc(myData.ivaCondition)}</div>` : ''}
        </div>
        <div class="pv-logo">
          ${state.logo
            ? `<img src="${state.logo}" alt="Logo de la empresa">`
            : '<div class="pv-logo-placeholder">Sin logo</div>'}
        </div>
      </div>

      <!-- Título del documento -->
      <div class="pv-title-bar">
        <span class="pv-doc-type">PRESUPUESTO</span>
        <span class="pv-meta">N° ${esc(quoteNum) || '—'}&nbsp;&nbsp;|&nbsp;&nbsp;Fecha: ${dateFmt}</span>
      </div>

      <!-- Datos del cliente -->
      <div class="pv-client-section">
        <div class="pv-client-title">Cliente</div>
        <div class="pv-client-grid">
          <div><span class="pv-label">Razón Social:</span> ${esc(clientData.name) || '—'}</div>
          <div>${clientData.cuit ? `<span class="pv-label">CUIT/DNI:</span> ${esc(clientData.cuit)}` : ''}</div>
          <div>${clientData.address ? `<span class="pv-label">Dirección:</span> ${esc(clientData.address)}` : ''}</div>
          <div>${clientData.phone ? `<span class="pv-label">Tel:</span> ${esc(clientData.phone)}` : ''}</div>
          <div>${clientData.email ? `<span class="pv-label">Email:</span> ${esc(clientData.email)}` : ''}</div>
          <div><span class="pv-label">Cond. IVA:</span> ${esc(clientData.ivaCondition)}</div>
        </div>
      </div>

      <!-- Secciones de ítems -->
      ${activeSections.length === 0
        ? '<p style="text-align:center;color:#888;padding:20pt 0;">Sin ítems cargados.</p>'
        : activeSections.map(section => buildSectionTable(section)).join('')
      }

      <!-- Totales -->
      <div class="pv-totals">
        <div class="pv-totals-table">
          <div class="pv-total-row">
            <span>Subtotal (sin IVA):</span>
            <span>${fmt(subtotal)}</span>
          </div>
          <div class="pv-total-row">
            <span>IVA (${ivaPct}%):</span>
            <span>${fmt(iva)}</span>
          </div>
          <div class="pv-total-row grand">
            <span>TOTAL:</span>
            <span>${fmt(total)}</span>
          </div>
        </div>
      </div>

      <!-- Notas -->
      ${notes ? `
        <div class="pv-notes">
          <div class="pv-notes-title">Notas y Condiciones</div>
          <div class="pv-notes-content">${esc(notes).replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}

      <!-- Validez -->
      ${validityDays ? `
        <div class="pv-validity">
          Este presupuesto tiene validez de <strong>${esc(validityDays)}</strong> días corridos a partir de la fecha de emisión.
        </div>
      ` : ''}

    </div>
  `;

  document.getElementById('printView').innerHTML = html;
  window.print();
}

function buildSectionTable(section) {
  const sub = sectionSubtotal(section);
  const rows = section.items.map(item => `
    <tr class="pv-item-row">
      <td>${esc(item.description) || '<em style="color:#aaa">—</em>'}</td>
      <td class="center">${item.quantity}</td>
      <td class="right">${fmt(item.unitPrice)}</td>
      <td class="right">${fmt(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');

  return `
    <table class="pv-section-table">
      <thead>
        <tr class="pv-section-header">
          <th colspan="4" class="pv-section-name" style="background:${section.color}">${esc(section.title)}</th>
        </tr>
        <tr class="pv-col-headers">
          <th class="col-desc">Descripción</th>
          <th class="col-qty">Cant.</th>
          <th class="col-price">Precio Unit.</th>
          <th class="col-subtotal">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="pv-section-subtotal">
          <td colspan="3" class="right">
            <strong>Subtotal ${esc(section.title)}:</strong>
          </td>
          <td class="right"><strong>${fmt(sub)}</strong></td>
        </tr>
      </tbody>
    </table>
  `;
}

// ============================================================
// NUEVO PRESUPUESTO
// ============================================================
function resetForm() {
  if (!confirm('¿Deseas iniciar un nuevo presupuesto?\nSe borrarán los datos del cliente y los ítems cargados.')) return;

  // Limpiar datos del cliente
  ['clientName', 'clientCuit', 'clientAddress', 'clientPhone', 'clientEmail'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('clientIvaCondition').value = 'Consumidor Final';

  // Limpiar ítems
  state.sections.forEach(s => { s.items = []; });

  // Incrementar número de presupuesto
  const current = parseInt(document.getElementById('quoteNumber').value, 10) || 0;
  document.getElementById('quoteNumber').value = String(current + 1).padStart(4, '0');

  // Fecha de hoy
  document.getElementById('quoteDate').value = new Date().toISOString().split('T')[0];

  // Limpiar notas
  document.getElementById('notes').value = '';

  renderSections();
  updateTotals();
}

// ============================================================
// HELPERS
// ============================================================
function getSection(id) {
  return state.sections.find(s => s.id === id);
}

function sectionSubtotal(section) {
  return section.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function fmt(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function esc(text) {
  if (text == null) return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(text)));
  return d.innerHTML;
}
