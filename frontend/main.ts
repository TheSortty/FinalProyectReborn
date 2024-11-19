
const pedidosTable = document.querySelector('#pedidosTable tbody')!;
const pedidoForm = document.querySelector('#pedidoForm') as HTMLFormElement;
const buscarNumeroInput = document.querySelector('#buscarNumero') as HTMLInputElement;
const buscarNumeroBtn = document.querySelector('#buscarNumeroBtn')!;
const buscarFechaInicio = document.querySelector('#buscarFechaInicio') as HTMLInputElement;
const buscarFechaFin = document.querySelector('#buscarFechaFin') as HTMLInputElement;
const buscarFechaBtn = document.querySelector('#buscarFechaBtn')!;
const resultadoBusqueda = document.querySelector('#resultadoBusqueda') as HTMLDivElement;
const generatePdfBtn = document.querySelector('#generatePdfBtn')!;
const downloadPdfBtn = document.getElementById('downloadPdfBtn')!;
const idClienteSelect = document.querySelector('#idcliente') as HTMLSelectElement;
const productosContainer = document.getElementById('productosContainer')!;
const addProductoBtn = document.getElementById('addProductoBtn')!;
const totalPedidoInput = document.querySelector('#totalPedido') as HTMLInputElement;

const API_URL = 'http://localhost:3000/api';
let pedidoIdEditar: number | null = null;
let resultadosBusqueda: any[] = [];
let productosCache: any[] = [];



// Función para eliminar un pedido
async function eliminarPedido(id: number) {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este pedido?");
    if (!confirmar) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        alert("Pedido eliminado correctamente.");
        cargarPedidos(); // Volver a cargar la lista de pedidos
    } catch (error) {
        console.error("Error al eliminar el pedido:", error);
        alert("Ocurrió un error al eliminar el pedido.");
    }
}
// Función para cargar la lista de pedidos
async function cargarPedidos() {
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        const pedidos = await response.json();
        pedidosTable.innerHTML = pedidos.map((pedido: any) => `
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
    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        alert("Ocurrió un error al cargar los pedidos. Verifica la conexión con el servidor.");
    }
}
// Función para cargar clientes en el select
async function cargarClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/clientes');
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const clientes = await response.json();
        console.log(clientes);
        idClienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
        clientes.forEach((cliente: any) => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.razonSocial;
            idClienteSelect.appendChild(option);
            console.log(option);
        });
    } catch (error) {
        console.error("Error al cargar clientes:", error);
        alert("Ocurrió un error al cargar los clientes.");
    }
}
// Función para actualizar un select con los productos cargados
function actualizarSelectProductos(select: HTMLSelectElement) {
    select.innerHTML = '<option value="">Seleccione un producto</option>';
    productosCache.forEach((producto: any) => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.denominacion} - $${producto.precioVenta}`;
        option.setAttribute('data-precio', producto.precioVenta);
        select.appendChild(option);
    });
}
// Función para cargar productos en el select de productos
async function cargarProductos() {
    try {
        console.log("Cargando productos...");
        const response = await fetch('http://localhost:3000/api/productos');
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        productosCache = await response.json();
        console.log("Productos cargados y almacenados en caché:", productosCache);

        // Actualizar selects existentes en el formulario
        document.querySelectorAll('.productoSelect').forEach((select) => {
            actualizarSelectProductos(select as HTMLSelectElement);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Ocurrió un error al cargar los productos.");
    }
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
        productosCache.forEach((producto: any) => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.denominacion} - $${producto.precioVenta}`;
            option.setAttribute('data-precio', producto.precioVenta);
            productoSelect.appendChild(option);
        });
        console.log("Productos agregados al select:", productoSelect);
    } else {
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
        const productoSelect = item.querySelector('.productoSelect') as HTMLSelectElement;
        const cantidadInput = item.querySelector('.cantidadInput') as HTMLInputElement;
        const precio = parseFloat(productoSelect.selectedOptions[0]?.getAttribute('data-precio') || '0');
        const cantidad = parseInt(cantidadInput.value) || 0;

        total += precio * cantidad;
    });

    totalPedidoInput.value = total.toFixed(2);
}
// Función para buscar pedido por número de comprobante
async function buscarPorNumeroComprobante() {
    const numeroComprobante = buscarNumeroInput.value;

    if (!numeroComprobante) {
        alert("Por favor, ingresa un número de comprobante.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/buscar?nroComprobante=${numeroComprobante}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const pedido = await response.json();
        mostrarResultadoBusqueda([pedido]);
    } catch (error) {
        console.error("Error al buscar el pedido:", error);
        alert("Ocurrió un error al buscar el pedido. Verifica la conexión con el servidor.");
    }
}

// Función para buscar pedidos por rango de fechas
async function buscarPorFechas() {
    const fechaInicio = buscarFechaInicio.value;
    const fechaFin = buscarFechaFin.value;

    if (!fechaInicio || !fechaFin) {
        alert("Por favor, ingresa ambas fechas para realizar la búsqueda.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const pedidos = await response.json();
        if (pedidos.length === 0) {
            alert("No se encontraron pedidos en el rango de fechas especificado.");
        } else {
            mostrarResultadoBusqueda(pedidos);
        }
    } catch (error) {
        console.error("Error al buscar los pedidos por fecha:", error);
        alert("Ocurrió un error al buscar los pedidos por fecha. Verifica la conexión con el servidor.");
    }
}

// Función para mostrar los resultados de la búsqueda
function mostrarResultadoBusqueda(pedidos: any[]) {
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
async function editarPedido(id: number) {
    try {
        // Obtener los datos del pedido
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const pedido = await response.json();

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
        const updateResponse = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoActualizado),
        });

        if (!updateResponse.ok) {
            throw new Error(`Error ${updateResponse.status}: ${updateResponse.statusText}`);
        }

        alert("Pedido actualizado correctamente.");
        cargarPedidos(); // Volver a cargar la lista de pedidos
    } catch (error) {
        console.error("Error al editar el pedido:", error);
        alert("Ocurrió un error al editar el pedido.");
    }
}


// Función para guardar o actualizar un pedido
async function guardarPedido(event: Event) {
    event.preventDefault();

    const pedido = {
        idcliente: (document.querySelector('#idcliente') as HTMLInputElement).value,
        fechaPedido: (document.querySelector('#fechaPedido') as HTMLInputElement).value,
        nroComprobante: (document.querySelector('#nroComprobante') as HTMLInputElement).value,
        formaPago: (document.querySelector('#formaPago') as HTMLInputElement).value,
        totalPedido: parseFloat((document.querySelector('#totalPedido') as HTMLInputElement).value) || 0,
        detalles: Array.from(document.querySelectorAll('.producto-item')).map(item => {
            const productoSelect = (item.querySelector('.productoSelect') as HTMLSelectElement).value;
            const cantidadInput = parseInt((item.querySelector('.cantidadInput') as HTMLInputElement).value, 10);
            return {
                idproducto: productoSelect,
                cantidad: cantidadInput,
            };
        }),
    };

    try {
        const method = pedidoIdEditar ? 'PUT' : 'POST';
        const url = pedidoIdEditar ? `${API_URL}/pedidos/${pedidoIdEditar}` : `${API_URL}/pedidos`;

        const response = await fetch(url, {
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
    } catch (error) {
        console.error("Error al guardar el pedido:", error);
        alert("Ocurrió un error al guardar el pedido. Por favor, verifica los datos ingresados.");
    }
}
async function descargarPDF() {
    try {
        const response = await fetch(`${API_URL}/generar-pdf`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/pdf' },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reporte_comprobantes.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar el PDF:', error);
        alert('Ocurrió un error al descargar el PDF.');
    }
}
(window as any).eliminarPedido = eliminarPedido;

// Inicializar eventos
pedidoForm.addEventListener('submit', guardarPedido);
buscarNumeroBtn.addEventListener('click', buscarPorNumeroComprobante);
buscarFechaBtn.addEventListener('click', buscarPorFechas);
downloadPdfBtn.addEventListener('click', descargarPDF);
addProductoBtn.addEventListener('click', addProducto);

document.addEventListener('DOMContentLoaded', async () => {
    await cargarClientes();
    await cargarProductos(); // Cargar productos una vez al iniciar
    cargarPedidos();
});