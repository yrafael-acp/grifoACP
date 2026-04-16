/**
 * flota.api.js
 * Capa de datos: todas las llamadas al backend GAS
 * Centraliza fetch GET y POST, maneja errores uniformemente
 */

'use strict';

const FlotaAPI = {

    // ── HELPERS ───────────────────────────────────

    _url: FlotaConfig.WEB_APP_URL,

    /**
     * GET request genérico
     * @param {Object} params
     * @returns {Promise<any>}
     */
    async get(params) {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`${this._url}?${qs}`);
        return res.json();
    },

    /**
     * POST request genérico (no-cors para GAS)
     * @param {Object} payload
     * @param {boolean} expectResponse - true si necesitamos leer el response
     * @returns {Promise<any>}
     */
    async post(payload, expectResponse = false) {
        const options = {
            method: 'POST',
            body: JSON.stringify(payload),
        };

        if (!expectResponse) {
            options.mode = 'no-cors';
            await fetch(this._url, options);
            return { status: 'OK' };
        }

        const res = await fetch(this._url, options);
        return res.json();
    },

    // ── FLOTA ─────────────────────────────────────

    /**
     * Trae la flota completa para una semana
     * @param {string} fechaISO - yyyy-MM-dd del lunes
     * @returns {Promise<Array>}
     */
    async getFlota(fechaISO) {
        return this.get({ action: 'getFlota', fecha: fechaISO });
    },

    /**
     * Guarda una excepción de dotación semanal
     * @param {string} semana - fecha lunes ISO
     * @param {string} placa - normalizada sin guiones
     * @param {number} dotacion
     * @param {string} userLog
     */
    async saveExcepcion(semana, placa, dotacion, userLog) {
        return this.post({
            action: 'saveExcepcion',
            semana,
            placa,
            dotacion,
            userLog: userLog || 'S/U',
        });
    },

    /**
     * Guarda un despacho manual temporal
     * @param {string} placa
     * @param {string} fecha - yyyy-MM-dd
     * @param {string} tipo - tipo de combustible
     * @param {number} cantidad
     */
    async saveTemporal(placa, fecha, tipo, cantidad) {
        return this.post({
            action: 'saveTemporal',
            placa: placa.toUpperCase().trim(),
            fecha,
            tipo,
            cantidad,
        });
    },

    /**
     * Limpia todos los vales manuales de la hoja temporal
     */
    async limpiarTemporales() {
        return this.post({ action: 'limpiarTemporales' });
    },

    /**
     * Obtiene el detalle de órdenes SAP
     * @param {string} ordenes - separadas por coma
     * @param {string} desde - fecha ISO
     * @param {string} hasta - fecha ISO
     */
    async getDetalleOrden(ordenes, desde, hasta) {
        return this.get({
            action: 'getDetalleOrden',
            orden: encodeURIComponent(ordenes),
            desde,
            hasta,
        });
    },

    /**
     * Sincroniza data de SAP por rango de fechas
     * @param {string} desde
     * @param {string} hasta
     */
    async distribuirDataPorRango(desde, hasta) {
        return this.post({ action: 'distribuirDataPorRango', desde, hasta });
    },

    /**
     * Inserta una unidad nueva en el maestro
     * @param {Object} data
     */
    async insertarFlota(data) {
        return this.post({ action: 'insertFlota', ...data });
    },

    /**
     * Actualiza (da de baja) una unidad en el maestro
     * @param {string} placa
     * @param {string} fechaBaja - yyyy-MM-dd
     */
    async darBajaFlota(placa, fechaBaja) {
        return this.post({ action: 'updateFlota', placa, fechaBaja });
    },

    /**
     * Audita unidades inactivas
     * @param {'mes'|'anio'} tipo
     * @param {string|number} anio
     * @param {string|number} mes
     */
    async auditar(tipo, anio, mes) {
        return this.get({ action: 'auditar', tipo, anio, mes });
    },

    /**
     * Sube data SAP desde Excel
     * @param {Array} payload - filas del excel parseadas
     * @param {string} user
     */
    async uploadSAPData(payload, user) {
        return this.post({ action: 'uploadSAPData', user, payload }, true);
    },
};
