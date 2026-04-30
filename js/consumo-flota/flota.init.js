window.onload = async () => {
    const user = sessionStorage.getItem('sessionGrifo');
    const rol = sessionStorage.getItem('rolGrifo');

    // Bloqueo de acceso directo por URL sin autenticación
    if (!user || !rol) {
        window.location.href = 'index.html';
        return;
    }

    const anioActual = new Date().getFullYear();

    // 1. Poblar selectores
    FlotaUtils.poblarAnios();
    FlotaUtils.poblarSemanasPorAnio(anioActual);

    // 2. Sincronizar fecha de referencia
    const selectorSemanas = document.getElementById('selectorSemanas');
    if (selectorSemanas?.value) {
        FlotaState.lunesReferencia = new Date(selectorSemanas.value + 'T12:00:00');
    } else {
        FlotaState.lunesReferencia = FlotaUtils.getLunesActual(new Date());
    }

    // 3. Aplicar restricciones de rol
    FlotaUI.aplicarRestriccionesRol(rol);

    // 4. Estado de semana
    FlotaUI.actualizarEtiquetaEstado();

    // 5. Cargar datos
    setTimeout(sincronizarDesdeNube, 300);

    // 6. Auto-sync
    setInterval(() => {
        const userAct = sessionStorage.getItem('sessionGrifo');
        const rolAct = sessionStorage.getItem('rolGrifo');

        if (!userAct || !rolAct) {
            window.location.href = 'index.html';
            return;
        }

        sincronizarDesdeNube();
    }, FlotaConfig.DELAY_SYNC_INTERVAL);

    // 7. Cerrar modales al hacer click fuera
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // 8. Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        }
    });
};
