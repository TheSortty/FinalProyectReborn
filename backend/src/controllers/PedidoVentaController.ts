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

            // Verificar que el número de comprobante no este duplicado
            const comprobanteExistente = await queryRunner.manager.findOne(PedidoVenta, { where: { nroComprobante } });
            if (comprobanteExistente) {
                throw new Error(`El número de comprobante ${nroComprobante} ya existe. Debe ser único.`);
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

    // M3todo estatico para obtener todos los pedidos
    static getAllPedidosDef: RequestHandler = async (req, res) => {
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


    // Método para obtener un pedido por su ID
    static getPedidoById: RequestHandler = async (req, res): Promise<void> => {
        const { id } = req.params;

        try {
            // Usar QueryBuilder para obtener el pedido junto con las relaciones
            const pedido = await AppDataSource.manager.createQueryBuilder(PedidoVenta, "pedido")
                .leftJoinAndSelect("pedido.cliente", "cliente")
                .leftJoinAndSelect("pedido.detalles", "detalles")
                .leftJoinAndSelect("detalles.producto", "producto")
                .where("pedido.id = :id", { id: Number(id) })
                .getOne();

            // Mostrar la consulta SQL generada
            console.log(AppDataSource.manager.createQueryBuilder(PedidoVenta, "pedido").getSql());

            // Verificar si el pedido existe
            if (!pedido) {
                res.status(404).json({ message: `El pedido con ID ${id} no fue encontrado.` });
                return;
            }

            // Consulta adicional para obtener los detalles del pedido
            const detalles = await AppDataSource.manager.find(PedidoVentaDetalle, {
                where: { pedidoVenta: { id: pedido.id } },
                relations: ["producto"],
            });            

            // Asignar manualmente los detalles usando un bucle
            detalles.forEach(async (detalle: PedidoVentaDetalle) => {
                const pedidoDetalle = new PedidoVentaDetalle();
                pedidoDetalle.idproducto = detalle.idproducto;
                pedidoDetalle.cantidad = detalle.cantidad;
                pedidoDetalle.subtotal = detalle.subtotal;
                pedidoDetalle.pedidoVenta = Promise.resolve(pedido);

                // Guardar cada detalle en la base de datos
                await AppDataSource.manager.save(pedidoDetalle);
            });

            // Devolver el pedido encontrado con los detalles
            res.status(200).json({ ...pedido, detalles });
        } catch (error) {
            console.error("Error al obtener el pedido:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error instanceof Error ? error.message : "" });
        }
    };

    static updatePedido: RequestHandler = async (req, res): Promise<void> => {
        const { id } = req.params;
        const { fechaPedido, nroComprobante, formaPago, totalPedido, idcliente, detalles } = req.body;
    
        try {
            // Buscar el pedido
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, { where: { id: Number(id) }, relations: ["detalles"] });
            if (!pedido) {
                res.status(404).json({ message: `Pedido con ID ${id} no encontrado.` });
                return;
            }
    
            // Actualizar los campos del pedido
            pedido.fechaPedido = new Date(fechaPedido);
            pedido.nroComprobante = nroComprobante;
            pedido.formaPago = formaPago;
            pedido.totalPedido = totalPedido;
    
            // Actualizar los detalles del pedido
            for (const detalle of detalles) {
                const producto = await AppDataSource.manager.findOne(Producto, { where: { id: detalle.idproducto } });
                if (!producto) {
                    res.status(404).json({ message: `Producto con ID ${detalle.idproducto} no encontrado.` });
                    return;
                }
    
                let pedidoDetalle = (await pedido.detalles).find(d => d.producto.id === detalle.idproducto);
                if (pedidoDetalle) {
                    pedidoDetalle.cantidad = detalle.cantidad;
                    pedidoDetalle.subtotal = detalle.subtotal;
                } else {
                    pedidoDetalle = new PedidoVentaDetalle();
                    pedidoDetalle.producto = producto;
                    pedidoDetalle.cantidad = detalle.cantidad;
                    pedidoDetalle.subtotal = detalle.subtotal;
                    pedidoDetalle.pedidoVenta = Promise.resolve(pedido);
                    (await pedido.detalles).push(pedidoDetalle);
                }
    
                // Guardar el detalle actualizado
                await AppDataSource.manager.save(pedidoDetalle);
            }
    
            // Guardar el pedido actualizado
            await AppDataSource.manager.save(pedido);
    
            res.status(200).json({ message: "Pedido actualizado exitosamente", pedido });
        } catch (error) {
            console.error("Error al actualizar el pedido:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error instanceof Error ? error.message : "" });
        }
    };
    
    static deletePedidoDef: RequestHandler = async (req, res): Promise<void> => {
        const { id } = req.params;
    
        try {
            // Buscar el pedido
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, { where: { id: Number(id) }, relations: ["detalles"] });
            if (!pedido) {
                res.status(404).json({ message: `Pedido con ID ${id} no encontrado.` });
                return;
            }
    
            // Eliminar los detalles del pedido
            for (const detalle of await pedido.detalles) {
                await AppDataSource.manager.remove(detalle);
            }
    
            // Eliminar el pedido
            await AppDataSource.manager.remove(pedido);
    
            res.status(200).json({ message: "Pedido eliminado exitosamente" });
        } catch (error) {
            console.error("Error al eliminar el pedido:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error instanceof Error ? error.message : "" });
        }
    };
    static deletePedido: RequestHandler = async (req, res): Promise<void> => {
        const { id } = req.params;
    
        try {
            // Buscar el pedido
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, { where: { id: Number(id) } });
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
            res.status(500).json({ message: "Error interno del servidor", error: error instanceof Error ? error.message : "" });
        }
    };
    static generatePDF: RequestHandler = async (req, res) => {
        const { id } = req.params;

        try {
            // Buscar el pedido por ID
            const pedido = await AppDataSource.manager.findOne(PedidoVenta, {
                where: { id: Number(id) },
                relations: ["cliente", "detalles", "detalles.producto"],
            });

            if (!pedido) {
                res.status(404).json({ message: "Pedido no encontrado." });
                return;
            }

            // Crear un documento PDF
            const doc = new PDFDocument();

            // Configurar encabezados y metadatos
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=pedido_${id}.pdf`
            );

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
