import { RequestHandler } from "express";
import { AppDataSource } from "../data-source.js";
import { Cliente } from "../models/Cliente.js";

export class ClienteController {
    static createCliente: RequestHandler = async (req, res) => {
        try {
            const { cuit, razonSocial } = req.body;

            if (!cuit || !razonSocial) {
                res.status(400).json({ message: "Faltan datos requeridos (CUIT, Razón Social)." });
                return;
            }

            const cliente = new Cliente();
            cliente.cuit = cuit;
            cliente.razonSocial = razonSocial;

            await AppDataSource.manager.save(cliente);
            res.status(201).json({ message: "Cliente creado exitosamente", cliente });
        } catch (error) {
            console.error("Error al crear cliente:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    static getAllClientes: RequestHandler = async (req, res) => {
        try {
            const clientes = await AppDataSource.manager.find(Cliente);
            res.status(200).json(clientes);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
}
