"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pedidosTable = document.querySelector('#pedidosTable tbody');
const pedidoForm = document.querySelector('#pedidoForm');
const buscarNumeroInput = document.querySelector('#buscarNumero');
const buscarNumeroBtn = document.querySelector('#buscarNumeroBtn');
const buscarFechaInicio = document.querySelector('#buscarFechaInicio');
const buscarFechaFin = document.querySelector('#buscarFechaFin');
const buscarFechaBtn = document.querySelector('#buscarFechaBtn');
const resultadoBusqueda = document.querySelector('#resultadoBusqueda');
const generatePdfBtn = document.querySelector('#generatePdfBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const idClienteSelect = document.querySelector('#idcliente');
const productosContainer = document.getElementById('productosContainer');
const addProductoBtn = document.getElementById('addProductoBtn');
const totalPedidoInput = document.querySelector('#totalPedido');
const API_URL = 'http://localhost:3000/api';
let pedidoIdEditar = null;
let resultadosBusqueda = [];
let productosCache = [];
// Función para eliminar un pedido
function eliminarPedido(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const confirmar = confirm("¿Estás seguro de que deseas eliminar este pedido?");
        if (!confirmar)
            return;
        try {
            const response = yield fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            alert("Pedido eliminado correctamente.");
            cargarPedidos(); // Volver a cargar la lista de pedidos
        }
        catch (error) {
            console.error("Error al eliminar el pedido:", error);
            alert("Ocurrió un error al eliminar el pedido.");
        }
    });
}
// Función para cargar la lista de pedidos
function cargarPedidos() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/pedidos`);
            const pedidos = yield response.json();
            pedidosTable.innerHTML = pedidos.map((pedido) => `
            <tr>
                <td>${pedido.id}</td>
                <td>${pedido.cliente.razonSocial}</td>
                <td>${pedido.fechaPedido}</td>
                <td>${pedido.nroComprobante}</td>
                <td>${pedido.formaPago}</td>
                <td>${pedido.totalPedido}</td>
                <td>
                    <button onclick="editarPedido(${pedido.id})">Editar</button>
                    <button onclick="eliminarPedido(${pedido.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
        }
        catch (error) {
            console.error("Error al cargar los pedidos:", error);
            alert("Ocurrió un error al cargar los pedidos. Verifica la conexión con el servidor.");
        }
    });
}
// Función para cargar clientes en el select
function cargarClientes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('http://localhost:3000/api/clientes');
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const clientes = yield response.json();
            console.log(clientes);
            idClienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
            clientes.forEach((cliente) => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.razonSocial;
                idClienteSelect.appendChild(option);
                console.log(option);
            });
        }
        catch (error) {
            console.error("Error al cargar clientes:", error);
            alert("Ocurrió un error al cargar los clientes.");
        }
    });
}
// Función para actualizar un select con los productos cargados
function actualizarSelectProductos(select) {
    select.innerHTML = '<option value="">Seleccione un producto</option>';
    productosCache.forEach((producto) => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.denominacion} - $${producto.precioVenta}`;
        option.setAttribute('data-precio', producto.precioVenta);
        select.appendChild(option);
    });
}
// Función para cargar productos en el select de productos
function cargarProductos() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Cargando productos...");
            const response = yield fetch('http://localhost:3000/api/productos');
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            productosCache = yield response.json();
            console.log("Productos cargados y almacenados en caché:", productosCache);
            // Actualizar selects existentes en el formulario
            document.querySelectorAll('.productoSelect').forEach((select) => {
                actualizarSelectProductos(select);
            });
        }
        catch (error) {
            console.error("Error al cargar productos:", error);
            alert("Ocurrió un error al cargar los productos.");
        }
    });
}
// Función para agregar un producto al formulario
function addProducto() {
    console.log("Agregando un nuevo producto..."); // Log para depuración
    const productoItem = document.createElement('div');
    productoItem.classList.add('producto-item');
    const productoSelect = document.createElement('select');
    productoSelect.classList.add('productoSelect');
    // Llenar el select usando los productos en caché
    productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
    if (productosCache.length > 0) {
        productosCache.forEach((producto) => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.denominacion} - $${producto.precioVenta}`;
            option.setAttribute('data-precio', producto.precioVenta);
            productoSelect.appendChild(option);
        });
        console.log("Productos agregados al select:", productoSelect);
    }
    else {
        console.error("No hay productos en caché para mostrar.");
    }
    const cantidadInput = document.createElement('input');
    cantidadInput.type = 'number';
    cantidadInput.classList.add('cantidadInput');
    cantidadInput.min = '1';
    cantidadInput.required = true;
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Eliminar';
    removeButton.onclick = () => {
        productoItem.remove();
        calcularTotal();
    };
    productoSelect.addEventListener('change', calcularTotal);
    cantidadInput.addEventListener('input', calcularTotal);
    productoItem.appendChild(productoSelect);
    productoItem.appendChild(cantidadInput);
    productoItem.appendChild(removeButton);
    productosContainer.appendChild(productoItem);
    console.log("Nuevo producto agregado al contenedor.");
}
// Función para calcular el total del pedido
function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.producto-item').forEach(item => {
        var _a;
        const productoSelect = item.querySelector('.productoSelect');
        const cantidadInput = item.querySelector('.cantidadInput');
        const precio = parseFloat(((_a = productoSelect.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.getAttribute('data-precio')) || '0');
        const cantidad = parseInt(cantidadInput.value) || 0;
        total += precio * cantidad;
    });
    totalPedidoInput.value = total.toFixed(2);
}
// Función para buscar pedido por número de comprobante
function buscarPorNumeroComprobante() {
    return __awaiter(this, void 0, void 0, function* () {
        const numeroComprobante = buscarNumeroInput.value;
        if (!numeroComprobante) {
            alert("Por favor, ingresa un número de comprobante.");
            return;
        }
        try {
            const response = yield fetch(`${API_URL}/buscar?nroComprobante=${numeroComprobante}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const pedido = yield response.json();
            mostrarResultadoBusqueda([pedido]);
        }
        catch (error) {
            console.error("Error al buscar el pedido:", error);
            alert("Ocurrió un error al buscar el pedido. Verifica la conexión con el servidor.");
        }
    });
}
// Función para buscar pedidos por rango de fechas
function buscarPorFechas() {
    return __awaiter(this, void 0, void 0, function* () {
        const fechaInicio = buscarFechaInicio.value;
        const fechaFin = buscarFechaFin.value;
        if (!fechaInicio || !fechaFin) {
            alert("Por favor, ingresa ambas fechas para realizar la búsqueda.");
            return;
        }
        try {
            const response = yield fetch(`${API_URL}/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            if (!response.ok) {
                const errorText = yield response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            const pedidos = yield response.json();
            if (pedidos.length === 0) {
                alert("No se encontraron pedidos en el rango de fechas especificado.");
            }
            else {
                mostrarResultadoBusqueda(pedidos);
            }
        }
        catch (error) {
            console.error("Error al buscar los pedidos por fecha:", error);
            alert("Ocurrió un error al buscar los pedidos por fecha. Verifica la conexión con el servidor.");
        }
    });
}
// Función para mostrar los resultados de la búsqueda
function mostrarResultadoBusqueda(pedidos) {
    resultadosBusqueda = pedidos;
    resultadoBusqueda.innerHTML = pedidos.map((pedido) => {
        const totalPedido = parseFloat(pedido.totalPedido) || 0;
        return `
            <div>
                <p><strong>ID:</strong> ${pedido.id}</p>
                <p><strong>Cliente:</strong> ${pedido.idcliente}</p>
                <p><strong>Fecha del Pedido:</strong> ${new Date(pedido.fechaPedido).toLocaleDateString()}</p>
                <p><strong>Número de Comprobante:</strong> ${pedido.nroComprobante}</p>
                <p><strong>Forma de Pago:</strong> ${pedido.formaPago}</p>
                <p><strong>Total Pedido:</strong> $${totalPedido.toFixed(2)}</p>
                <hr>
            </div>
        `;
    }).join('');
}
// Función para editar un pedido
function editarPedido(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Obtener los datos del pedido
            const response = yield fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const pedido = yield response.json();
            // Pedir los nuevos valores usando prompt()
            const idcliente = prompt("Ingrese el ID del cliente:", pedido.idcliente) || pedido.idcliente;
            const fechaPedido = prompt("Ingrese la fecha del pedido (YYYY-MM-DD):", new Date(pedido.fechaPedido).toISOString().split('T')[0]) || pedido.fechaPedido;
            const nroComprobante = prompt("Ingrese el número de comprobante:", pedido.nroComprobante) || pedido.nroComprobante;
            const formaPago = prompt("Ingrese la forma de pago:", pedido.formaPago) || pedido.formaPago;
            const totalPedido = parseFloat(prompt("Ingrese el total del pedido:", pedido.totalPedido) || pedido.totalPedido);
            // Crear el objeto con los datos actualizados
            const pedidoActualizado = {
                idcliente,
                fechaPedido,
                nroComprobante,
                formaPago,
                totalPedido,
            };
            // Enviar los datos actualizados al backend
            const updateResponse = yield fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedidoActualizado),
            });
            if (!updateResponse.ok) {
                throw new Error(`Error ${updateResponse.status}: ${updateResponse.statusText}`);
            }
            alert("Pedido actualizado correctamente.");
            cargarPedidos(); // Volver a cargar la lista de pedidos
        }
        catch (error) {
            console.error("Error al editar el pedido:", error);
            alert("Ocurrió un error al editar el pedido.");
        }
    });
}
// Función para guardar o actualizar un pedido
function guardarPedido(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const pedido = {
            idcliente: document.querySelector('#idcliente').value,
            fechaPedido: document.querySelector('#fechaPedido').value,
            nroComprobante: document.querySelector('#nroComprobante').value,
            formaPago: document.querySelector('#formaPago').value,
            totalPedido: parseFloat(document.querySelector('#totalPedido').value) || 0,
            detalles: Array.from(document.querySelectorAll('.producto-item')).map(item => {
                const productoSelect = item.querySelector('.productoSelect').value;
                const cantidadInput = parseInt(item.querySelector('.cantidadInput').value, 10);
                return {
                    idproducto: productoSelect,
                    cantidad: cantidadInput,
                };
            }),
        };
        try {
            const method = pedidoIdEditar ? 'PUT' : 'POST';
            const url = pedidoIdEditar ? `${API_URL}/pedidos/${pedidoIdEditar}` : `${API_URL}/pedidos`;
            const response = yield fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido),
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            alert('Pedido guardado correctamente.');
            pedidoIdEditar = null;
            pedidoForm.reset();
            cargarPedidos(); // Recargar la lista de pedidos para mostrar el nuevo pedido
        }
        catch (error) {
            console.error("Error al guardar el pedido:", error);
            alert("Ocurrió un error al guardar el pedido. Por favor, verifica los datos ingresados.");
        }
    });
}
function descargarPDF() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/generar-pdf`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/pdf' },
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const blob = yield response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'reporte_comprobantes.pdf';
            link.click();
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Error al descargar el PDF:', error);
            alert('Ocurrió un error al descargar el PDF.');
        }
    });
}
window.eliminarPedido = eliminarPedido;
// Inicializar eventos
pedidoForm.addEventListener('submit', guardarPedido);
buscarNumeroBtn.addEventListener('click', buscarPorNumeroComprobante);
buscarFechaBtn.addEventListener('click', buscarPorFechas);
downloadPdfBtn.addEventListener('click', descargarPDF);
addProductoBtn.addEventListener('click', addProducto);
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    yield cargarClientes();
    yield cargarProductos(); // Cargar productos una vez al iniciar
    cargarPedidos();
}));
