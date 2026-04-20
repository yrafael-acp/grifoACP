/* ============================================================
   SIMULADOR SEMANAL
============================================================ */

let _simuladorSemanalInicializado = false;

function obtenerSemanaActualId() {
    const hoy = new Date();
    const dow = hoy.getDay();
    const diff = hoy.getDate() - dow + (dow === 0 ? -6 : 1);
    const lunes = new Date(hoy);
    lunes.setDate(diff);
    lunes.setHours(0, 0, 0, 0);

    const yyyy = lunes.getFullYear();
    const mm = String(lunes.getMonth() + 1).padStart(2, '0');
    const dd = String(lunes.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

function obtenerFechasSemana(semanaId) {
    const lunes = semanaId ? new Date(`${semanaId}T00:00:00`) : new Date();
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { lunes, domingo };
}

function asegurarEstructuraProyecciones() {
    if (!window.proyeccionesDual) {
        window.proyeccionesDual = {};
    }

    if (!proyeccionesDual.DIESEL) {
        proyeccionesDual.DIESEL = { cons: [0,0,0,0,0,0,0], ing: [0,0,0,0,0,0,0], saldoIni: 0 };
    }

    if (!proyeccionesDual.GASOHOL) {
        proyeccionesDual.GASOHOL = { cons: [0,0,0,0,0,0,0], ing: [0,0,0,0,0,0,0], saldoIni: 0 };
    }

    proyeccionesDual.DIESEL.cons = Array.isArray(proyeccionesDual.DIESEL.cons) ? proyeccionesDual.DIESEL.cons : [0,0,0,0,0,0,0];
    proyeccionesDual.DIESEL.ing = Array.isArray(proyeccionesDual.DIESEL.ing) ? proyeccionesDual.DIESEL.ing : [0,0,0,0,0,0,0];
    proyeccionesDual.GASOHOL.cons = Array.isArray(proyeccionesDual.GASOHOL.cons) ? proyeccionesDual.GASOHOL.cons : [0,0,0,0,0,0,0];
    proyeccionesDual.GASOHOL.ing = Array.isArray(proyeccionesDual.GASOHOL.ing) ? proyeccionesDual.GASOHOL.ing : [0,0,0,0,0,0,0];

    while (proyeccionesDual.DIESEL.cons.length < 7) proyeccionesDual.DIESEL.cons.push(0);
    while (proyeccionesDual.DIESEL.ing.length < 7) proyeccionesDual.DIESEL.ing.push(0);
    while (proyeccionesDual.GASOHOL.cons.length < 7) proyeccionesDual.GASOHOL.cons.push(0);
    while (proyeccionesDual.GASOHOL.ing.length < 7) proyeccionesDual.GASOHOL.ing.push(0);

    proyeccionesDual.DIESEL.cons = proyeccionesDual.DIESEL.cons.slice(0, 7);
    proyeccionesDual.DIESEL.ing = proyeccionesDual.DIESEL.ing.slice(0, 7);
    proyeccionesDual.GASOHOL.cons = proyeccionesDual.GASOHOL.cons.slice(0, 7);
    proyeccionesDual.GASOHOL.ing = proyeccionesDual.GASOHOL.ing.slice(0, 7);

    proyeccionesDual.DIESEL.saldoIni = parseFloat(proyeccionesDual.DIESEL.saldoIni) || 0;
    proyeccionesDual.GASOHOL.saldoIni = parseFloat(proyeccionesDual.GASOHOL.saldoIni) || 0;
}

function renderizarSimuladorBase() {
    const tbody = document.getElementById('bodySimuladoDual');
    if (!tbody) return;

    asegurarEstructuraProyecciones();

    tbody.innerHTML = '';
    const DIAS = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];

    const hoy = new Date();
    const dow = hoy.getDay();
    const diff = hoy.getDate() - dow + (dow === 0 ? -6 : 1);
    const lunes = new Date(hoy);
    lunes.setDate(diff);
    lunes.setHours(0,0,0,0);

    tbody.innerHTML += `
    <tr style="background:var(--warning-lt); border-bottom:2px solid var(--accent);">
        <td style="padding:8px; font-weight:800; color:var(--warning); border-right:2px solid var(--border); font-size:.75rem;">🏁 APERTURA</td>
        <td colspan="2" style="padding:4px; background:var(--warning-lt);">
            <input type="number" id="saldo_ini_d" class="input-sim" style="border:1px dashed #f59e0b; color:#92400e; font-weight:800; width:80px !important;"
                   value="${proyeccionesDual.DIESEL.saldoIni || 0}" placeholder="Saldo D" oninput="actualizarCalculosSimulacion()">
        </td>
        <td style="border-right:2px solid var(--border); font-size:.6rem; color:var(--text-muted); text-align:center;">gl</td>
        <td colspan="2" style="padding:4px; background:var(--warning-lt);">
            <input type="number" id="saldo_ini_g" class="input-sim" style="border:1px dashed #f59e0b; color:#92400e; font-weight:800; width:80px !important;"
                   value="${proyeccionesDual.GASOHOL.saldoIni || 0}" placeholder="Saldo G" oninput="actualizarCalculosSimulacion()">
        </td>
        <td style="font-size:.6rem; color:var(--text-muted); text-align:center;">gl</td>
    </tr>`;

    for (let i = 0; i < 7; i++) {
        const fecha = new Date(lunes);
        fecha.setDate(lunes.getDate() + i);
        const isPast = fecha < new Date().setHours(0,0,0,0);

        tbody.innerHTML += `
        <tr id="fila_dual_${i}" style="${isPast ? 'background:var(--surface-2);' : ''}">
            <td style="padding:8px; font-weight:700; border-right:2px solid var(--border); font-size:.75rem;">
                ${DIAS[fecha.getDay()]}<br>
                <small style="font-weight:400; font-size:.6rem; color:var(--text-muted);">${fecha.toLocaleDateString('es-PE')}</small>
            </td>
            <td style="padding:3px;">
                <input type="number" id="d_cons_${i}" value="${proyeccionesDual.DIESEL.cons[i] || 0}"
                       class="input-sim input-cons" oninput="actualizarCalculosSimulacion()">
            </td>
            <td style="padding:3px;">
                <input type="number" id="d_ing_${i}" value="${proyeccionesDual.DIESEL.ing[i] || 0}"
                       class="input-sim input-ing" oninput="actualizarCalculosSimulacion()">
            </td>
            <td id="d_saldo_${i}" style="padding:8px; text-align:right; font-family:'DM Mono',monospace; font-weight:700; border-right:2px solid var(--border); font-size:.78rem;">0.00</td>
            <td style="padding:3px;">
                <input type="number" id="g_cons_${i}" value="${proyeccionesDual.GASOHOL.cons[i] || 0}"
                       class="input-sim input-cons" oninput="actualizarCalculosSimulacion()">
            </td>
            <td style="padding:3px;">
                <input type="number" id="g_ing_${i}" value="${proyeccionesDual.GASOHOL.ing[i] || 0}"
                       class="input-sim input-ing" oninput="actualizarCalculosSimulacion()">
            </td>
            <td id="g_saldo_${i}" style="padding:8px; text-align:right; font-family:'DM Mono',monospace; font-weight:700; font-size:.78rem;">0.00</td>
        </tr>`;
    }

    actualizarCalculosSimulacion();
}

function actualizarCalculosSimulacion() {
    if (!document.getElementById('saldo_ini_d')) return;

    asegurarEstructuraProyecciones();

    let sD = parseFloat(document.getElementById('saldo_ini_d').value) || 0;
    let sG = parseFloat(document.getElementById('saldo_ini_g').value) || 0;

    proyeccionesDual.DIESEL.saldoIni = sD;
    proyeccionesDual.GASOHOL.saldoIni = sG;

    let totalD = 0;
    let totalG = 0;

    for (let j = 0; j < 7; j++) {
        proyeccionesDual.DIESEL.cons[j] = parseFloat(document.getElementById(`d_cons_${j}`)?.value) || 0;
        proyeccionesDual.DIESEL.ing[j] = parseFloat(document.getElementById(`d_ing_${j}`)?.value) || 0;
        proyeccionesDual.GASOHOL.cons[j] = parseFloat(document.getElementById(`g_cons_${j}`)?.value) || 0;
        proyeccionesDual.GASOHOL.ing[j] = parseFloat(document.getElementById(`g_ing_${j}`)?.value) || 0;

        totalD += proyeccionesDual.DIESEL.ing[j];
        totalG += proyeccionesDual.GASOHOL.ing[j];
    }

    for (let i = 0; i < 7; i++) {
        sD = (sD - proyeccionesDual.DIESEL.cons[i]) + proyeccionesDual.DIESEL.ing[i];
        sG = (sG - proyeccionesDual.GASOHOL.cons[i]) + proyeccionesDual.GASOHOL.ing[i];

        aplicarAlertasVisuales(`d_saldo_${i}`, sD, proyeccionesDual.DIESEL.cons[i], 5000);
        aplicarAlertasVisuales(`g_saldo_${i}`, sG, proyeccionesDual.GASOHOL.cons[i], 1000);
    }

    const elD = document.getElementById('totalIngresoD');
    const elG = document.getElementById('totalIngresoG');
    if (elD) elD.textContent = totalD.toFixed(2);
    if (elG) elG.textContent = totalG.toFixed(2);
}

function aplicarAlertasVisuales(id, saldo, consDia, tope) {
    const el = document.getElementById(id);
    if (!el) return;

    el.textContent = saldo.toFixed(2);
    el.removeAttribute('class');

    if (saldo < 0) {
        el.textContent += ' 🚨';
        el.style.cssText = 'color:#dc2626;background:#fee2e2;padding:2px 6px;border-radius:4px;font-weight:800;';
    } else if (saldo > tope) {
        el.textContent += ' ⚠️';
        el.style.cssText = 'color:#7e22ce;background:#f3e8ff;padding:2px 6px;border-radius:4px;font-weight:700;';
    } else if (consDia > 0 && saldo < consDia * 2) {
        el.textContent += ' ⏳';
        el.style.cssText = 'color:#ea580c;background:#ffedd5;padding:2px 6px;border-radius:4px;font-weight:700;';
    } else {
        el.style.cssText = 'color:var(--primary);';
    }
}

function limpiarSimulacion() {
    if (!confirm('¿Deseas resetear la proyección a valores base?')) return;

    asegurarEstructuraProyecciones();

    proyeccionesDual.DIESEL = {
        cons: [1500,1500,1500,1500,1500,1500,1500],
        ing: [0,0,0,0,0,0,0],
        saldoIni: proyeccionesDual.DIESEL.saldoIni || 0
    };

    proyeccionesDual.GASOHOL = {
        cons: [150,150,150,150,150,150,150],
        ing: [0,0,0,0,0,0,0],
        saldoIni: proyeccionesDual.GASOHOL.saldoIni || 0
    };

    renderizarSimuladorBase();
}

async function guardarProyeccionSemanal() {
    const btn = document.getElementById('btnGuardarSim');
    const semana = obtenerSemanaActualId();

    if (btn) {
        btn.textContent = '⏳ Sincronizando…';
        btn.disabled = true;
    }

    asegurarEstructuraProyecciones();

    const apertura = {
        diesel: parseFloat(document.getElementById('saldo_ini_d')?.value) || 0,
        gasohol: parseFloat(document.getElementById('saldo_ini_g')?.value) || 0
    };

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'saveSimDual',
                user: currentUser || 'S/U',
                semana,
                data: proyeccionesDual,
                apertura
            })
        });

        alert(`✅ Proyección semanal guardada correctamente.\nSemana: ${semana}`);
    } catch (e) {
        console.error('guardarProyeccionSemanal:', e);
        alert('❌ Error al guardar. Intenta nuevamente.');
    } finally {
        if (btn) {
            btn.textContent = '✅ Confirmar y Sincronizar';
            btn.disabled = false;
        }
    }
}

async function cargarSimulacionSemanaActual() {
    const semana = obtenerSemanaActualId();

    try {
        const resp = await fetch(`${WEB_APP_URL}?action=getSimulacionSemana&semana=${encodeURIComponent(semana)}`);
        const json = await resp.json();

        if (json.status !== 'OK' || !json.data) {
            asegurarEstructuraProyecciones();
            renderizarSimuladorBase();
            return;
        }

        proyeccionesDual.DIESEL = {
            cons: Array.isArray(json.data.DIESEL?.cons) ? json.data.DIESEL.cons.slice(0, 7) : [0,0,0,0,0,0,0],
            ing: Array.isArray(json.data.DIESEL?.ing) ? json.data.DIESEL.ing.slice(0, 7) : [0,0,0,0,0,0,0],
            saldoIni: parseFloat(json.data.DIESEL?.apertura) || 0
        };

        proyeccionesDual.GASOHOL = {
            cons: Array.isArray(json.data.GASOHOL?.cons) ? json.data.GASOHOL.cons.slice(0, 7) : [0,0,0,0,0,0,0],
            ing: Array.isArray(json.data.GASOHOL?.ing) ? json.data.GASOHOL.ing.slice(0, 7) : [0,0,0,0,0,0,0],
            saldoIni: parseFloat(json.data.GASOHOL?.apertura) || 0
        };

        asegurarEstructuraProyecciones();
        renderizarSimuladorBase();
    } catch (e) {
        console.error('cargarSimulacionSemanaActual:', e);
        asegurarEstructuraProyecciones();
        renderizarSimuladorBase();
    }
}

function inicializarSimuladorSemanal() {
    if (_simuladorSemanalInicializado) return;
    _simuladorSemanalInicializado = true;
    cargarSimulacionSemanaActual();
}

async function abrirHistorialProyecciones() {
    const modal = document.getElementById('modalHistorialProyecciones');
    const select = document.getElementById('selectHistorialProyeccion');
    const meta = document.getElementById('metaHistorialProyeccion');
    const body = document.getElementById('bodyHistorialSimuladoDual');

    if (!modal || !select || !meta || !body) {
        alert('Falta agregar el modal de historial en index.html');
        return;
    }

    select.innerHTML = '<option value="">Cargando semanas...</option>';
    meta.textContent = '';
    body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Cargando historial...</td></tr>';

    modal.classList.add('open');

    try {
        const resp = await fetch(`${WEB_APP_URL}?action=getHistorialSemanasSimulacion`);
        const json = await resp.json();

        if (json.status !== 'OK') {
            select.innerHTML = '<option value="">Sin datos</option>';
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No se pudo cargar el historial.</td></tr>';
            return;
        }

        const items = Array.isArray(json.items) ? json.items : [];
        if (!items.length) {
            select.innerHTML = '<option value="">No hay semanas guardadas</option>';
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No hay historial guardado.</td></tr>';
            return;
        }

        select.innerHTML = '<option value="">Seleccione una semana</option>' +
            items.map(it => `
                <option value="${it.semana}">
                    Semana ${it.semana}
                </option>
            `).join('');
    } catch (e) {
        console.error('abrirHistorialProyecciones:', e);
        select.innerHTML = '<option value="">Error al cargar</option>';
        body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Error al cargar historial.</td></tr>';
    }
}

function cerrarHistorialProyecciones() {
    const modal = document.getElementById('modalHistorialProyecciones');
    if (modal) modal.classList.remove('open');
}

async function cargarDetalleHistorialProyeccion() {
    const select = document.getElementById('selectHistorialProyeccion');
    const meta = document.getElementById('metaHistorialProyeccion');
    const body = document.getElementById('bodyHistorialSimuladoDual');

    if (!select || !meta || !body) return;

    const semana = select.value;
    if (!semana) {
        meta.textContent = '';
        body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Seleccione una semana.</td></tr>';
        return;
    }

    body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Cargando detalle...</td></tr>';

    try {
        const resp = await fetch(`${WEB_APP_URL}?action=getSimulacionSemana&semana=${encodeURIComponent(semana)}`);
        const json = await resp.json();

        if (json.status !== 'OK' || !json.data) {
            meta.textContent = '';
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No se encontró detalle.</td></tr>';
            return;
        }

        const usuario = json.data.DIESEL?.usuario || json.data.GASOHOL?.usuario || 'S/U';
        meta.textContent = `Semana ${semana} · Guardado por ${usuario}`;

        renderHistorialProyeccionSoloLectura(semana, json.data);
    } catch (e) {
        console.error('cargarDetalleHistorialProyeccion:', e);
        meta.textContent = '';
        body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Error al cargar detalle.</td></tr>';
    }
}

function renderHistorialProyeccionSoloLectura(semana, data) {
    const body = document.getElementById('bodyHistorialSimuladoDual');
    if (!body) return;

    const diesel = data?.DIESEL || { cons: [], ing: [], apertura: 0 };
    const gasohol = data?.GASOHOL || { cons: [], ing: [], apertura: 0 };

    const DIAS = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
    const { lunes } = obtenerFechasSemana(semana);

    let sD = parseFloat(diesel.apertura) || 0;
    let sG = parseFloat(gasohol.apertura) || 0;

    let html = `
        <tr style="background:var(--warning-lt); border-bottom:2px solid var(--accent);">
            <td style="padding:8px; font-weight:800; color:var(--warning); border-right:2px solid var(--border); font-size:.75rem;">🏁 APERTURA</td>
            <td colspan="2" style="padding:8px; text-align:center; font-weight:800;">${sD.toFixed(2)}</td>
            <td style="border-right:2px solid var(--border); font-size:.6rem; color:var(--text-muted); text-align:center;">gl</td>
            <td colspan="2" style="padding:8px; text-align:center; font-weight:800;">${sG.toFixed(2)}</td>
            <td style="font-size:.6rem; color:var(--text-muted); text-align:center;">gl</td>
        </tr>
    `;

    for (let i = 0; i < 7; i++) {
        const fecha = new Date(lunes);
        fecha.setDate(lunes.getDate() + i);

        const dCons = parseFloat(diesel.cons?.[i]) || 0;
        const dIng = parseFloat(diesel.ing?.[i]) || 0;
        const gCons = parseFloat(gasohol.cons?.[i]) || 0;
        const gIng = parseFloat(gasohol.ing?.[i]) || 0;

        sD = (sD - dCons) + dIng;
        sG = (sG - gCons) + gIng;

        html += `
            <tr>
                <td style="padding:8px; font-weight:700; border-right:2px solid var(--border); font-size:.75rem;">
                    ${DIAS[i]}<br>
                    <small style="font-weight:400; font-size:.6rem; color:var(--text-muted);">${fecha.toLocaleDateString('es-PE')}</small>
                </td>
                <td style="padding:8px; text-align:center;">${dCons.toFixed(2)}</td>
                <td style="padding:8px; text-align:center;">${dIng.toFixed(2)}</td>
                <td style="padding:8px; text-align:right; font-family:'DM Mono',monospace; font-weight:700; border-right:2px solid var(--border);">${sD.toFixed(2)}</td>
                <td style="padding:8px; text-align:center;">${gCons.toFixed(2)}</td>
                <td style="padding:8px; text-align:center;">${gIng.toFixed(2)}</td>
                <td style="padding:8px; text-align:right; font-family:'DM Mono',monospace; font-weight:700;">${sG.toFixed(2)}</td>
            </tr>
        `;
    }

    body.innerHTML = html;
}

/* ============================================================
   AUTO INIT SEGURO
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bodySimuladoDual')) {
        inicializarSimuladorSemanal();
    }
});
