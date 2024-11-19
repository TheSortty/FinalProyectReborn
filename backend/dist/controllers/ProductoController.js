import { AppDataSource } from "../data-source.js";
import { Producto } from "../models/Producto.js";
export class ProductoController {
    static createProducto = async (req, res) => {
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
        }
        catch (error) {
            console.error("Error al crear producto:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
    static getAllProductos = async (req, res) => {
        try {
            const productos = await AppDataSource.manager.find(Producto);
            res.status(200).json(productos);
        }
        catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
}
