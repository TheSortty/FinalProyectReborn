import "reflect-metadata";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { AppDataSource } from "./data-source.js";
import ClienteRoutes from "./routes/ClienteRoutes.js";
import ProductoRoutes from "./routes/ProductoRoutes.js";
import PedidoVentaRoutes from "./routes/PedidoVentaRoutes.js";
dotenv.config();
const app = express();
// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ["http://127.0.0.1:5500", "http://127.0.0.1:5500/"];
        if (allowedOrigins.includes(origin || "")) {
            callback(null, true);
        }
        else {
            callback(new Error("No permitido por CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Middleware para procesar JSON
app.use(express.json());
// Registrar las rutas
app.use("/api", ClienteRoutes);
app.use("/api", ProductoRoutes);
app.use("/api", PedidoVentaRoutes);
// Funcion para verificar si la base de datos existe y crearla si no es asa.
async function ensureDatabaseExists() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    });
    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
    console.log(`Base de datos '${process.env.DB_DATABASE}' verificada o creada.`);
    await connection.end();
}
async function startServer() {
    try {
        await ensureDatabaseExists();
        // Inicializar el DataSource si no está ya conectado
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("Conectado a la base de datos MySQL");
        }
        else {
            console.log("Conexión ya establecida con la base de datos.");
        }
        // Iniciar el servidor Express en el puerto especificado
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}
// Iniciar el servidor
startServer();
