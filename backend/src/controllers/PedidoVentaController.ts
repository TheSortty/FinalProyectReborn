import { RequestHandler } from "express";
import { Equal } from "typeorm";
import { AppDataSource } from "../data-source.js";
import PDFDocument from "pdfkit";
import { PedidoVenta } from "../models/PedidoVenta.js";
import { PedidoVentaDetalle } from "../models/PedidoVentaDetalle.js";
import { Cliente } from "../models/Cliente.js";
import { Producto } from "../models/Producto.js";
import { DetallePedido } from "../interfaces/DetallePedido.js";

export class PedidoVentaController {
    // Método para crear un nuevo pedido
    static createPedido: RequestHandler = async (req, res) => {
        const queryRunner = AppDataSource.createQueryRunner();

        try {
            const { idcliente, nroComprobante, formaPago, detalles } = req.body;

            // Validar datos requeridos
            if (!idcliente || !nroComprobante || !formaPago || !detalles) {
                res.status(400).json({ message: "Faltan datos requeridos (Cliente, Nro Comprobante, Forma de Pago, Detalles)." });
                return;
            }

            await queryRunner.connect();
            await queryRunner.startTransaction();

            // Verificar que el cliente exista
            const cliente = await queryRunner.manager.findOne(Cliente, { where: { id: idcliente } });
            if (!cliente) {
                throw new Error("El cliente no existe.");
            }

            // Verificar que no haya productos duplicados en el detalle
            const productoIds = detalles.map((detalle: DetallePedido) => detalle.idproducto);
            const productosDuplicados = productoIds.filter((id: number, index: number) => productoIds.indexOf(id) !== index);

            if (productosDuplicados.length > 0) {
                throw new Error(`El pedido contiene productos duplicados: ${productosDuplicados.join(", ")}`);
            }

            // Crear cabecera del pedido
            const pedido = new PedidoVenta();
            pedido.nroComprobante = nroComprobante;
            pedido.formaPago = formaPago;
            pedido.totalPedido = 0;
            pedido.cliente = cliente;

            await queryRunner.manager.save(pedido);

            // Procesar detalles del pedido
            let totalPedido = 0;
            for (const detalle of detalles) {
                const { idproducto, cantidad } = detalle;

                // Verificar que el producto exista
                const producto = await queryRunner.manager.findOne(Producto, { where: { id: idproducto } });
                if (!producto) {
                    throw new Error(`El producto con ID ${idproducto} no existe.`);
                }

                // Calcular subtotal
                const subtotal = producto.precioVenta * cantidad;
                totalPedido += subtotal;

                // Crear detalle del pedido
                const pedidoDetalle = new PedidoVentaDetalle();
                pedidoDetalle.idproducto = idproducto;
                pedidoDetalle.cantidad = cantidad;
                pedidoDetalle.subtotal = subtotal;
                pedidoDetalle.pedidoVenta = Promise.resolve(pedido);

                await queryRunner.manager.save(pedidoDetalle);
            }

            // Actualizar total del pedido
            pedido.totalPedido = totalPedido;
            await queryRunner.manager.save(pedido);

            // Confirmar transaccion
            await queryRunner.commitTransaction();
            res.status(201).json({ message: "Pedido creado exitosamente", pedido });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Error al crear pedido:", error);

            // Manejo del error
            if (error instanceof Error) {
                res.status(500).json({ message: "Error interno del servidor", error: error.message });
            } else {
                res.status(500).json({ message: "Error interno del servidor" });
            }
        } finally {
            await queryRunner.release();
        }
    };

    // Método para obtener todos los pedidos (solo los no borrados)
    static getAllPedidos: RequestHandler = async (req, res) => {
        try {
            const pedidos = await AppDataSource.manager.find(PedidoVenta, {
                where: { borrado: 0 },
                relations: ["cliente", "detalles", "detalles.producto"],
            });
            res.status(200).json(pedidos);
        } catch (error) {
            console.error("Error al obtener pedidos:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    // Método para obtener un pedido por su ID (solo si no está borrado)
    static getPedidoById: RequestHandler = async (req, res) => {
        const { id } = req.params;

        try {
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, {
                where: { id: Number(id), borrado: 0 },
                relations: ["cliente", "detalles", "detalles.producto"],
            });

            if (!pedido) {
                res.status(404).json({ message: `El pedido con ID ${id} no fue encontrado.` });
                return;
            }

            res.status(200).json(pedido);
        } catch (error) {
            console.error("Error al obtener el pedido:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    // Método para actualizar un pedido
    static updatePedido: RequestHandler = async (req, res) => {
        const { id } = req.params;
        const { idcliente, fechaPedido, nroComprobante, formaPago, detalles } = req.body;

        try {
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, {
                where: { id: Number(id), borrado: 0 },
                relations: ["detalles"],
            });

            if (!pedido) {
                res.status(404).json({ message: `Pedido con ID ${id} no encontrado.` });
                return;
            }

            // Verificar que el cliente exista antes de asignarlo
            const cliente = await AppDataSource.manager.findOne(Cliente, { where: { id: idcliente } });
            if (!cliente) {
                res.status(404).json({ message: "El cliente no existe." });
                return;
            }
            pedido.cliente = cliente;

            pedido.fechaPedido = new Date(fechaPedido);
            pedido.nroComprobante = nroComprobante;
            pedido.formaPago = formaPago;

            // Eliminar detalles actuales y agregar nuevos
            await AppDataSource.manager.delete(PedidoVentaDetalle, { pedidoVenta: { id: pedido.id } });

            let totalPedido = 0;
            for (const detalle of detalles) {
                const producto = await AppDataSource.manager.findOne(Producto, { where: { id: detalle.idproducto } });
                if (!producto) {
                    res.status(404).json({ message: `Producto con ID ${detalle.idproducto} no encontrado.` });
                    return;
                }

                const nuevoDetalle = new PedidoVentaDetalle();
                nuevoDetalle.idproducto = detalle.idproducto;
                nuevoDetalle.cantidad = detalle.cantidad;
                nuevoDetalle.subtotal = producto.precioVenta * detalle.cantidad;
                nuevoDetalle.pedidoVenta = Promise.resolve(pedido);

                await AppDataSource.manager.save(nuevoDetalle);
                totalPedido += nuevoDetalle.subtotal;
            }

            pedido.totalPedido = totalPedido;

            // Guardar cambios
            await AppDataSource.manager.save(pedido);
            res.status(200).json({ message: "Pedido actualizado exitosamente.", pedido });
        } catch (error) {
            console.error("Error al actualizar el pedido:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    // Borrado lógico del pedido
    static deletePedido: RequestHandler = async (req, res) => {
        const { id } = req.params;

        try {
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, {
                where: { id: Number(id) },
            });

            if (!pedido) {
                res.status(404).json({ message: `Pedido con ID ${id} no encontrado.` });
                return;
            }

            // Realizar el borrado lógico
            pedido.borrado = 1;
            await AppDataSource.manager.save(pedido);
            res.status(200).json({ message: "Pedido marcado como borrado lógicamente." });
        } catch (error) {
            console.error("Error al borrar lógicamente el pedido:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    // Método para generar un PDF del pedido
    static generatePDF: RequestHandler = async (req, res) => {
        const { id } = req.params;

        try {
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, {
                where: { id: Number(id) },
                relations: ["cliente", "detalles", "detalles.producto"],
            });

            if (!pedido) {
                res.status(404).json({ message: "Pedido no encontrado." });
                return;
            }

            // Validar si el pedido esta borrado logicamente
            if (pedido.borrado === 1) {
                res.status(400).json({ message: "No se puede generar un PDF para un pedido borrado lógicamente." });
                return;
            }

            const doc = new PDFDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=pedido_${id}.pdf`);

            // Encabezado del PDF
            doc.fontSize(18).text("Pedido de Venta", { align: "center" });
            doc.moveDown();
            doc.fontSize(12).text(`ID Pedido: ${pedido.id}`);
            doc.text(`Cliente: ${pedido.cliente.razonSocial}`);
            doc.text(`Fecha del Pedido: ${pedido.fechaPedido}`);
            doc.text(`Forma de Pago: ${pedido.formaPago}`);
            doc.text(`Total Pedido: $${pedido.totalPedido}`);
            doc.moveDown();

            // Detalles del pedido
            doc.fontSize(14).text("Detalles del Pedido:");
            (await pedido.detalles).forEach((detalle) => {
                doc
                    .fontSize(12)
                    .text(
                        `Producto: ${detalle.producto.denominacion}, Cantidad: ${detalle.cantidad}, Subtotal: $${detalle.subtotal}`
                    );
            });

            // Finalizar el documento
            doc.end();
            doc.pipe(res);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
}
