'use strict';

// ── Catálogo de productos ────────────────────────
const CATALOGO = [
  { desc: 'Termotanque solar 120 L',                               precio: 282.19 },
  { desc: 'Termotanque solar 150-15AC',                            precio: 338.08 },
  { desc: 'Termotanque solar 200-20AC',                            precio: 488.19 },
  { desc: 'Termotanque solar 250-25AC',                            precio: 631.05 },
  { desc: 'Termotanque solar 300-30AC',                            precio: 760.58 },
  { desc: 'Controlador electrónico para resistencia de 2 kW',      precio:  52.04 },
  { desc: 'Resistencia de cobre 2000 W, 60 cm, rosca 1¼"',        precio:  19.43 },
  { desc: 'Válvula mezcladora termostática regulable 3/4"',        precio:  48.43 },
  { desc: 'Ánodo de magnesio para tubo',                           precio:   6.64 },
  { desc: 'Mano de obra',                                          precio: 387.00 },
  { desc: 'Materiales hidráulicos y eléctricos',                   precio: 200.00 },
];

// ── Logo upload ──────────────────────────────────
document.getElementById('logo-upload').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('v-logo');
    img.src = e.target.result;
    img.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// ── Construir opciones del catálogo ─────────────
function buildCatalogOptions() {
  return CATALOGO.map((p, i) =>
    `<option value="${i}">${p.desc} — USD ${p.precio.toFixed(2)}</option>`
  ).join('');
}

// ── Agregar ítem ────────────────────────────────
let itemCount = 0;

function addItem() {
  itemCount++;
  const id = itemCount;
  const container = document.getElementById('items-list');
  const card = document.createElement('div');
  card.className = 'item-card';
  card.id = `item-card-${id}`;
  card.innerHTML = `
    <div class="item-header">
      <select class="i-catalog" onchange="applyCatalog(${id})">
        <option value="">— Seleccionar del catálogo —</option>
        ${buildCatalogOptions()}
        <option value="custom">Personalizado (sin autocompletar)</option>
      </select>
      <button class="btn-del-row" onclick="document.getElementById('item-card-${id}').remove()" title="Eliminar ítem">✕</button>
    </div>
    <div class="item-body">
      <div class="ib-desc">
        <label class="ib-label">Artículo / Descripción</label>
        <textarea class="i-desc" id="desc-${id}" rows="3" placeholder="Descripción del artículo..."></textarea>
      </div>
      <div class="ib-cant">
        <label class="ib-label">Cant.</label>
        <input type="number" class="i-cant" value="1" min="1" />
      </div>
      <div class="ib-precio">
        <label class="ib-label">Precio unit. (USD)</label>
        <input type="number" class="i-precio" id="precio-${id}" placeholder="0.00" min="0" step="0.01" />
      </div>
      <div class="ib-iva">
        <label class="ib-label">% IVA</label>
        <select class="i-iva">
          <option value="0.21">21%</option>
          <option value="0.105">10,5%</option>
          <option value="0">0%</option>
        </select>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// ── Autocompletar desde catálogo ─────────────────
function applyCatalog(id) {
  const card    = document.getElementById(`item-card-${id}`);
  const selVal  = card.querySelector('.i-catalog').value;
  const descEl  = document.getElementById(`desc-${id}`);
  const precioEl = document.getElementById(`precio-${id}`);

  if (selVal === '' || selVal === 'custom') {
    descEl.value   = '';
    precioEl.value = '';
    return;
  }

  const item = CATALOGO[parseInt(selVal)];
  if (!item) return;
  descEl.value   = item.desc;
  precioEl.value = item.precio.toFixed(2);
}

// Primer ítem por defecto
addItem();

// ── Formateo ─────────────────────────────────────
function fmtUSD(n) {
  return 'USD ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtARS(n) {
  return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Generar presupuesto ──────────────────────────
function generarPresupuesto() {
  /* Empresa */
  setText('v-empresa', val('prov-empresa'));
  setText('v-dir',     val('prov-dir'));
  setText('v-ciudad',  val('prov-ciudad'));
  setText('v-cotiza',  val('prov-cotiza') ? 'Cotiza: ' + val('prov-cotiza') : '');
  setText('v-tel',     val('prov-tel')    ? 'Teléfono: ' + val('prov-tel') : '');
  setText('v-cuit',    val('prov-cuit')   ? 'CUIT: ' + val('prov-cuit') : '');

  const emailEl = document.getElementById('v-email');
  const emailVal = val('prov-email');
  emailEl.textContent = emailVal;
  emailEl.href = emailVal ? 'mailto:' + emailVal : '#';

  const webEl = document.getElementById('v-web');
  const webVal = val('prov-web');
  webEl.textContent = webVal;
  webEl.href = webVal ? 'https://' + webVal.replace(/^https?:\/\//, '') : '#';

  /* Cliente */
  setText('v-cli-nombre',    val('cli-nombre'));
  setText('v-cli-email',     val('cli-email'));
  setText('v-cli-dir',       val('cli-dir'));
  setText('v-cli-localidad', val('cli-localidad'));
  setText('v-cli-provincia', val('cli-provincia'));
  setText('v-cli-tel',       val('cli-tel'));

  /* Info bar */
  setText('v-nro-cliente',  val('nro-cliente'));
  setText('v-nro-presup',   val('nro-presup'));
  setText('v-proyecto',     val('proyecto'));
  setText('v-valido-hasta', val('valido-hasta') || '-');
  setText('v-fecha', new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }));

  /* Título proyecto */
  setText('v-proj-titulo', val('proj-titulo'));

  /* Ítems */
  const tbody = document.getElementById('v-items-body');
  tbody.innerHTML = '';

  let subTotalUSD = 0;
  let iva105USD   = 0;
  let iva21USD    = 0;

  document.querySelectorAll('.item-card').forEach(card => {
    const desc   = card.querySelector('.i-desc').value.trim();
    const cant   = parseFloat(card.querySelector('.i-cant').value)   || 0;
    const precio = parseFloat(card.querySelector('.i-precio').value) || 0;
    const ivaPct = parseFloat(card.querySelector('.i-iva').value)    || 0;

    const subTotal = cant * precio;
    const ivaAmt   = subTotal * ivaPct;
    const total    = subTotal + ivaAmt;
    const pctLabel = ivaPct === 0.21 ? '21%' : ivaPct === 0.105 ? '10,5%' : '0%';

    subTotalUSD += subTotal;
    if (ivaPct === 0.21)  iva21USD  += ivaAmt;
    if (ivaPct === 0.105) iva105USD += ivaAmt;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:pre-wrap">${escHtml(desc)}</td>
      <td class="center">${cant}</td>
      <td class="right">${fmtUSD(precio)}</td>
      <td class="right">${fmtUSD(subTotal)}</td>
      <td class="center">${pctLabel}</td>
      <td class="right">${fmtUSD(ivaAmt)}</td>
      <td class="right">${fmtUSD(total)}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalUSD = subTotalUSD + iva105USD + iva21USD;
  const cotiz    = parseFloat(document.getElementById('cotizacion').value) || 0;
  const totalARS = totalUSD * cotiz;

  /* Cotización */
  const cotBar = document.getElementById('v-cotizacion-bar');
  if (cotiz > 0) {
    cotBar.textContent = `USD 1  $  ${cotiz.toLocaleString('es-AR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })}`;
    cotBar.classList.remove('hidden');
  } else {
    cotBar.classList.add('hidden');
  }

  /* Notas */
  const notasBlock = document.getElementById('v-notas-block');
  const notasVal = val('notas');
  if (notasVal) {
    notasBlock.textContent = notasVal;
    notasBlock.classList.remove('hidden');
  } else {
    notasBlock.classList.add('hidden');
  }

  /* Totales */
  setText('v-subtotal',   fmtUSD(subTotalUSD));
  setText('v-iva105',     fmtUSD(iva105USD));
  setText('v-iva21',      fmtUSD(iva21USD));
  setText('v-total-usd',  fmtUSD(totalUSD));
  setText('v-total-ars',  cotiz > 0 ? fmtARS(totalARS) : '—');

  /* Condiciones */
  setText('v-condiciones', val('condiciones'));

  /* Mostrar */
  const pres = document.getElementById('presupuesto');
  pres.classList.remove('hidden');
  pres.scrollIntoView({ behavior: 'smooth' });
}

// ── Helpers ──────────────────────────────────────
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
