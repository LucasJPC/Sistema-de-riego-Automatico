const IVA = 0.21;

// ── Logo upload ──────────────────────────────────────────────
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

// ── Agregar fila de material ─────────────────────────────────
function addMaterial(containerId) {
  const container = document.getElementById(containerId);
  const row = document.createElement('div');
  row.className = 'mat-row';
  row.innerHTML = `
    <label>Descripción
      <input type="text" class="mat-desc" placeholder="Ej: Caño cobre 3/4&quot;" />
    </label>
    <label>Cantidad
      <input type="number" class="mat-qty" value="1" min="1" />
    </label>
    <label>Precio neto unit. ($)
      <input type="number" class="mat-precio" placeholder="0.00" min="0" step="0.01" />
    </label>
    <button class="btn-del" onclick="this.parentElement.remove()" title="Eliminar">✕</button>
  `;
  container.appendChild(row);
}

// ── Formatear moneda ─────────────────────────────────────────
function fmt(n) {
  return '$ ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ── Leer materiales de un contenedor ─────────────────────────
function leerMateriales(containerId) {
  const rows = document.querySelectorAll(`#${containerId} .mat-row`);
  const items = [];
  rows.forEach(row => {
    const desc   = row.querySelector('.mat-desc').value.trim();
    const qty    = parseFloat(row.querySelector('.mat-qty').value)    || 0;
    const precio = parseFloat(row.querySelector('.mat-precio').value) || 0;
    if (desc || precio > 0) items.push({ desc, qty, precio });
  });
  return items;
}

// ── Construir fila de tabla ───────────────────────────────────
function buildRow(qty, desc, precioUnit) {
  const neto  = qty * precioUnit;
  const iva   = neto * IVA;
  const total = neto + iva;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="center">${qty}</td>
    <td>${desc}</td>
    <td class="num">${fmt(precioUnit)}</td>
    <td class="num">${fmt(iva)}</td>
    <td class="num">${fmt(total)}</td>
  `;
  return { tr, neto, iva, total };
}

// ── Sección encabezado en tabla ───────────────────────────────
function buildSectionHeader(text) {
  const tr = document.createElement('tr');
  tr.className = 'section-header';
  tr.innerHTML = `<td colspan="5">${text}</td>`;
  return tr;
}

// ── Generar presupuesto ───────────────────────────────────────
function generarPresupuesto() {
  // Datos proveedor
  document.getElementById('v-prov-empresa').textContent = val('prov-empresa');
  document.getElementById('v-prov-cuit').textContent    = val('prov-cuit')    ? 'CUIT: ' + val('prov-cuit')    : '';
  document.getElementById('v-prov-dir').textContent     = val('prov-dir');
  document.getElementById('v-prov-tel').textContent     = val('prov-tel')     ? 'Tel: '  + val('prov-tel')     : '';
  document.getElementById('v-prov-email').textContent   = val('prov-email');
  document.getElementById('v-footer-empresa').textContent = val('prov-empresa') + (val('prov-tel') ? '  |  ' + val('prov-tel') : '') + (val('prov-email') ? '  |  ' + val('prov-email') : '');

  // Número y fecha
  document.getElementById('v-nro').textContent   = val('presup-nro') || '—';
  document.getElementById('v-fecha').textContent = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Datos cliente
  document.getElementById('v-cli-nombre').textContent = val('cli-nombre');
  document.getElementById('v-cli-cuit').textContent   = val('cli-cuit');
  document.getElementById('v-cli-dir').textContent    = val('cli-dir');
  document.getElementById('v-cli-tel').textContent    = val('cli-tel');
  document.getElementById('v-cli-email').textContent  = val('cli-email');

  // ── Tabla de ítems ────────────────────────────────────────
  const tbody = document.getElementById('v-items-body');
  tbody.innerHTML = '';

  let totalNeto = 0;
  let totalIva  = 0;
  let totalFin  = 0;

  // 1. Termotanque Solar
  const ttDesc   = val('tt-desc') || 'Termotanque Solar';
  const ttLitros = val('tt-litros');
  const ttQty    = parseFloat(document.getElementById('tt-qty').value)    || 1;
  const ttPrecio = parseFloat(document.getElementById('tt-precio').value) || 0;
  const ttLabel  = ttLitros ? `${ttDesc} – ${ttLitros} litros` : ttDesc;

  tbody.appendChild(buildSectionHeader('Termotanque Solar'));
  const tt = buildRow(ttQty, ttLabel, ttPrecio);
  tbody.appendChild(tt.tr);
  totalNeto += tt.neto; totalIva += tt.iva; totalFin += tt.total;

  // 2. Materiales Termotanque
  const matTT = leerMateriales('mat-tt-list');
  if (matTT.length > 0) {
    tbody.appendChild(buildSectionHeader('Materiales para el Termotanque'));
    matTT.forEach(m => {
      const r = buildRow(m.qty, m.desc, m.precio);
      tbody.appendChild(r.tr);
      totalNeto += r.neto; totalIva += r.iva; totalFin += r.total;
    });
  }

  // 3. Materiales Gas y Electricidad
  const matGE = leerMateriales('mat-ge-list');
  if (matGE.length > 0) {
    tbody.appendChild(buildSectionHeader('Materiales para Gas y Electricidad'));
    matGE.forEach(m => {
      const r = buildRow(m.qty, m.desc, m.precio);
      tbody.appendChild(r.tr);
      totalNeto += r.neto; totalIva += r.iva; totalFin += r.total;
    });
  }

  // 4. Otros ítems
  const otros = leerMateriales('otros-list');
  if (otros.length > 0) {
    tbody.appendChild(buildSectionHeader('Otros Ítems'));
    otros.forEach(m => {
      const r = buildRow(m.qty, m.desc, m.precio);
      tbody.appendChild(r.tr);
      totalNeto += r.neto; totalIva += r.iva; totalFin += r.total;
    });
  }

  // Totales
  document.getElementById('v-subtotal').textContent   = fmt(totalNeto);
  document.getElementById('v-iva-total').textContent  = fmt(totalIva);
  document.getElementById('v-total-final').textContent = fmt(totalFin);

  // Notas
  const notas = val('notas');
  const notasSection = document.getElementById('v-notas-section');
  if (notas) {
    document.getElementById('v-notas').textContent = notas;
    notasSection.classList.remove('hidden');
  } else {
    notasSection.classList.add('hidden');
  }

  // Mostrar
  document.getElementById('presupuesto-view').classList.remove('hidden');
  document.getElementById('presupuesto-view').scrollIntoView({ behavior: 'smooth' });
}

function val(id) {
  return document.getElementById(id).value.trim();
}
