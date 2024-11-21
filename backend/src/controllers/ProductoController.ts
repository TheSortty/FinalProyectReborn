import { RequestHandler } from "express";
import { AppDataSource } from "../data-source.js";
import { Producto } from "../models/Producto.js";

export class ProductoController {
    static createProducto: RequestHandler = async (req, res) => {
        try {
            const { codigoProducto, denominacion, precioVenta } = req.body;

            if (!codigoProducto || !denominacion || !precioVenta) {
                res.status(400).json({ message: "Faltan datos requeridos (Código, Denominación, Precio)." });
                return;
            }

            const producto = new Producto();
            producto.codigoProducto = codigoProducto;
            producto.denominacion = denominacion;
            producto.precioVenta = precioVenta;

            await AppDataSource.manager.save(producto);
            res.status(201).json({ message: "Producto creado exitosamente", producto });
        } catch (error) {
            console.error("Error al crear producto:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    static getAllProductos: RequestHandler = async (req, res) => {
        try {
            const productos = await AppDataSource.manager.find(Producto);
            res.status(200).json(productos);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    //Obtenener productos por Id
    static getProductoById: RequestHandler = async (req, res) => {
        const { id } = req.params; // Obtener el ID del producto desde los parámetros

        try {
            // Buscar el producto en la base de datos
            const producto = await AppDataSource.manager.findOneBy(Producto, { id: Number(id) });

            // Verificar si el producto existe
            if (!producto) {
                res.status(404).json({ message: `Producto con ID ${id} no encontrado.` });
                return; // Terminar la ejecución sin devolver explícitamente un valor
            }

            // Enviar el producto encontrado como respuesta
            res.status(200).json(producto);
        } catch (error) {
            console.error("Error al obtener el producto:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };


}
