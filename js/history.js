/* ============================================================
   HISTORIAL
============================================================ */
/*function renderHistorial(lista) {
    const bodyEl = document.getElementById('historialBody');
    if (!bodyEl) return;

    const desdeRaw = document.getElementById('filtroDesde')?.value;
    const hastaRaw = document.getElementById('filtroHasta')?.value;

    let filtrada = [...lista].sort((a, b) => {
        return (parseFechaBase(b.fecha)?.getTime() || 0) - (parseFechaBase(a.fecha)?.getTime() || 0);
    });

    if (desdeRaw || hastaRaw) {
        filtrada = filtrada.filter(h => {
            const fh = parseFechaBase(h.fecha);
            if (!fh) return false;
            fh.setHours(0,0,0,0);
            const t = fh.getTime();
            const okD = !desdeRaw || t >= new Date(desdeRaw + 'T00:00:00').getTime();
            const okH = !hastaRaw || t <= new Date(hastaRaw + 'T23:59:59').getTime();
            return okD && okH;
        });
    }

    if (!filtrada.length) {
        bodyEl.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Sin registros para el rango seleccionado.</td></tr>';
        return;
    }

    bodyEl.innerHTML = filtrada.map(h => {
        const isIngreso = h.mov?.toUpperCase().includes('INGRESO');
        return `<tr>
            <td data-label="Fecha">${(h.fecha || '').replace('T',' ').substring(0,16)}</td>
            <td data-label="Operación"><span class="badge ${isIngreso ? 'badge-ingreso' : 'badge-salida'}">${h.mov}</span></td>
            <td data-label="Producto">${h.prod}</td>
            <td data-label="Cantidad" style="font-family:'DM Mono',monospace; font-weight:700;">${h.cant}</td>
            <td data-label="Referencia">${h.ref || '—'}</td>
            <td data-label="Saldo Final" style="font-family:'DM Mono',monospace; font-weight:700;">${h.saldo}</td>
        </tr>`;
    }).join('');
}

function aplicarFiltros() { renderHistorial(datosCache); }

function limpiarFiltros() {
    document.getElementById('filtroDesde').value = '';
    document.getElementById('filtroHasta').value = '';
    renderHistorial(datosCache);
}

function exportarExcel() {
    const desdeRaw = document.getElementById('filtroDesde')?.value;
    const hastaRaw = document.getElementById('filtroHasta')?.value;

    let datos = [...datosCache].sort((a,b) => (parseFechaBase(b.fecha)?.getTime()||0) - (parseFechaBase(a.fecha)?.getTime()||0));
    if (desdeRaw || hastaRaw) {
        datos = datos.filter(h => {
            const fh = parseFechaBase(h.fecha);
            if (!fh) return false;
            fh.setHours(0,0,0,0);
            const t = fh.getTime();
            const okD = !desdeRaw || t >= new Date(desdeRaw + 'T00:00:00').getTime();
            const okH = !hastaRaw || t <= new Date(hastaRaw + 'T23:59:59').getTime();
            return okD && okH;
        });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `Reporte_ACP_${new Date().toISOString().substring(0,10)}.xlsx`);
}--//


/* ============================================================
   HISTORIAL
=============================================================== */

function usuarioPuedeEditarHistorial() {
    return sessionStorage.getItem('rolGrifo') === 'ADMIN';
}

function actualizarVisibilidadColumnaAcciones() {
    const th = document.getElementById('thAcciones');
    if (th) {
        th.style.display = usuarioPuedeEditarHistorial() ? '' : 'none';
    }
}

function normalizarFechaInput(fecha) {
    if (!fecha) return '';
    const f = String(fecha).trim();

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(f)) return f;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(f)) return f.replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return `${f}T00:00`;

    const parsed = new Date(f);
    if (isNaN(parsed.getTime())) return '';

    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const hh = String(parsed.getHours()).padStart(2, '0');
    const mi = String(parsed.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function renderHistorial(lista) {
    const bodyEl = document.getElementById('historialBody');
    if (!bodyEl) return;

    actualizarVisibilidadColumnaAcciones();

    const desdeRaw = document.getElementById('filtroDesde')?.value;
    const hastaRaw = document.getElementById('filtroHasta')?.value;

    let base = (Array.isArray(lista) ? lista : []).map((item, idx) => ({
        ...item,
        _idx: idx
    }));

    let filtrada = [...base].sort((a, b) => {
        return (parseFechaBase(b.fecha)?.getTime() || 0) - (parseFechaBase(a.fecha)?.getTime() || 0);
    });

    if (desdeRaw || hastaRaw) {
        const desde = desdeRaw ? new Date(`${desdeRaw}T00:00:00`) : null;
        const hasta = hastaRaw ? new Date(`${hastaRaw}T23:59:59`) : null;

        filtrada = filtrada.filter(item => {
            const fecha = parseFechaBase(item.fecha);
            if (!fecha) return false;
            if (desde && fecha < desde) return false;
            if (hasta && fecha > hasta) return false;
            return true;
        });
    }

    if (!filtrada.length) {
        const colspan = usuarioPuedeEditarHistorial() ? 7 : 6;
        bodyEl.innerHTML = `
            <tr>
                <td colspan="${colspan}" style="text-align:center; padding:30px; color:var(--text-muted);">
                    Sin registros para el rango seleccionado.
                </td>
            </tr>
        `;
        return;
    }

    bodyEl.innerHTML = filtrada.map(h => {
        const isIngreso = h.mov?.toUpperCase().includes('INGRESO');

        const acciones = usuarioPuedeEditarHistorial()
            ? `
                <td data-label="Acciones">
                    <div class="acciones-wrap">
                        <button type="button" class="btn btn-sm btn-primary" onclick="editarMovimiento(${h._idx})">Editar</button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="eliminarMovimiento(${h._idx})">Eliminar</button>
                    </div>
                </td>
            `
            : '';

        return `
            <tr>
                <td data-label="Fecha">${(h.fecha || '').replace('T', ' ').substring(0, 16)}</td>
                <td data-label="Operación">
                    <span class="badge ${isIngreso ? 'badge-ingreso' : 'badge-salida'}">${h.mov || ''}</span>
                </td>
                <td data-label="Producto">${h.prod || ''}</td>
                <td data-label="Cantidad" style="font-family:'DM Mono', monospace; font-weight:700;">${h.cant ?? ''}</td>
                <td data-label="Referencia">${h.ref || '—'}</td>
                <td data-label="Saldo Final" style="font-family:'DM Mono', monospace; font-weight:700;">${h.saldo ?? ''}</td>
                ${acciones}
            </tr>
        `;
    }).join('');
}

function aplicarFiltros() {
    renderHistorial(datosCache || []);
}

function limpiarFiltros() {
    const desde = document.getElementById('filtroDesde');
    const hasta = document.getElementById('filtroHasta');

    if (desde) desde.value = '';
    if (hasta) hasta.value = '';

    renderHistorial(datosCache || []);
}

function exportarExcel() {
    const lista = Array.isArray(datosCache) ? [...datosCache] : [];
    const desdeRaw = document.getElementById('filtroDesde')?.value;
    const hastaRaw = document.getElementById('filtroHasta')?.value;

    let filtrada = [...lista].sort((a, b) => {
        return (parseFechaBase(b.fecha)?.getTime() || 0) - (parseFechaBase(a.fecha)?.getTime() || 0);
    });

    if (desdeRaw || hastaRaw) {
        const desde = desdeRaw ? new Date(`${desdeRaw}T00:00:00`) : null;
        const hasta = hastaRaw ? new Date(`${hastaRaw}T23:59:59`) : null;

        filtrada = filtrada.filter(item => {
            const fecha = parseFechaBase(item.fecha);
            if (!fecha) return false;
            if (desde && fecha < desde) return false;
            if (hasta && fecha > hasta) return false;
            return true;
        });
    }

    const exportData = filtrada.map(h => ({
        Fecha: (h.fecha || '').replace('T', ' ').substring(0, 16),
        Operacion: h.mov || '',
        Producto: h.prod || '',
        Cantidad: h.cant ?? '',
        Referencia: h.ref || '',
        SaldoFinal: h.saldo ?? ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `Reporte_ACP_${new Date().toISOString().substring(0, 10)}.xlsx`);
}

function editarMovimiento(idx) {
    if (!usuarioPuedeEditarHistorial()) return;

    const item = datosCache?.[idx];
    if (!item) return;

    const modal = document.getElementById('modalEditarMovimiento');
    const editIdx = document.getElementById('editIdx');
    const editFecha = document.getElementById('editFecha');
    const editMov = document.getElementById('editMov');
    const editProd = document.getElementById('editProd');
    const editCant = document.getElementById('editCant');
    const editRef = document.getElementById('editRef');

    if (!modal || !editIdx || !editFecha || !editMov || !editProd || !editCant || !editRef) {
        alert('Falta agregar el modal de edición en index.html');
        return;
    }

    editIdx.value = idx;
    editFecha.value = normalizarFechaInput(item.fecha);
    editMov.value = item.mov || 'INGRESO';
    editProd.value = item.prod || 'DIESEL';
    editCant.value = item.cant ?? '';
    editRef.value = item.ref || '';

    modal.classList.add('open');
}

function cerrarModalEditar() {
    const modal = document.getElementById('modalEditarMovimiento');
    if (modal) modal.classList.remove('open');
}

async function guardarEdicionMovimiento(event) {
    if (event) event.preventDefault();
    if (!usuarioPuedeEditarHistorial()) return;

    const idx = Number(document.getElementById('editIdx')?.value);
    const fecha = document.getElementById('editFecha')?.value || '';
    const mov = document.getElementById('editMov')?.value || '';
    const prod = document.getElementById('editProd')?.value || '';
    const cant = parseFloat(document.getElementById('editCant')?.value || '0');
    const ref = document.getElementById('editRef')?.value || '';

    if (!fecha) {
        alert('La fecha es obligatoria.');
        return;
    }

    if (!(cant > 0)) {
        alert('La cantidad debe ser mayor a 0.');
        return;
    }

    const original = datosCache?.[idx];
    if (!original) {
        alert('No se encontró el registro original.');
        return;
    }

    const updated = { fecha, mov, prod, cant, ref };

    try {
        const resp = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'updateMovement',
                rowIndex: idx,
                original,
                updated,
                userLog: sessionStorage.getItem('userGrifo') || 'ADMIN'
            })
        });

        const text = await resp.text();
        console.log('updateMovement response:', text);

        let json = {};
        try { json = JSON.parse(text); } catch (_) {}

        if (!resp.ok || json.status === 'ERROR') {
            alert(json.message || 'No se pudo actualizar el registro.');
            return;
        }

        cerrarModalEditar();
        location.reload();
    } catch (error) {
        console.error('updateMovement error:', error);
        alert('Error al guardar cambios. Revisa consola y despliegue del Apps Script.');
    }
}
async function eliminarMovimiento(idx) {
    if (!usuarioPuedeEditarHistorial()) return;
    if (!confirm('¿Eliminar este movimiento?')) return;

    const original = datosCache?.[idx];
    if (!original) {
        alert('No se encontró el registro.');
        return;
    }

    try {
        const resp = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'deleteMovement',
                rowIndex: idx,
                original,
                userLog: sessionStorage.getItem('userGrifo') || 'ADMIN'
            })
        });

        const text = await resp.text();
        console.log('deleteMovement response:', text);

        let json = {};
        try { json = JSON.parse(text); } catch (_) {}

        if (!resp.ok || json.status === 'ERROR') {
            alert(json.message || 'No se pudo eliminar el registro.');
            return;
        }

        location.reload();
    } catch (error) {
        console.error('deleteMovement error:', error);
        alert('Error al eliminar. Revisa consola y despliegue del Apps Script.');
    }
}
