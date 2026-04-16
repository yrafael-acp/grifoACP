/* ============================================================
   CONFIGURACIÓN GLOBAL
============================================================ */
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwExlJ_SGhr3EW2X0eHbRk5x_DVUykGExlNUgolQP3jUuS8G28a7EAePa0xu_FJIe-v9w/exec';

// Roles definidos localmente (la validación de clave va al servidor)
const USER_ROLES = {
    "ERAFAEL":    "ADMIN",
    "CVILLANUEVA":"ADMIN",
    "EURBINA":    "ADMIN",
    "WCASTRO":    "ADMIN",
    "ACERRUTI":   "ADMIN",
    "LJUAREZ":    "READ",
    "CGONZALES":  "READ",
    "CORRILLO":   "READ",
    "FFERNANDEZ": "READ",
    "WNEYRA":     "READ",
    "ASALAZAR":   "READ"
};

let currentUser    = null;
let datosCache     = [];
let miGrafico      = null;
let stockTotalDiesel  = 0;
let stockTotalGasohol = 0;
let vistaGrafico   = 'mensual';
let cargandoDataInicial = true;
let timerApertura;

let proyeccionesDual = {
    DIESEL:  { cons: [1500,1500,1500,1500,1500,1500,1500], ing: [0,0,0,0,0,0,0], saldoIni: 0 },
    GASOHOL: { cons: [150,150,150,150,150,150,150],         ing: [0,0,0,0,0,0,0], saldoIni: 0 }
};

const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MESES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
