import "reflect-metadata";
import { DataSource } from "typeorm";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
//ola
// Asegurar la creación de la base de datos
export async function ensureDatabaseExists() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``);
        console.log(`Base de datos '${process.env.DB_DATABASE}' verificada o creada.`);
        await connection.end();
    } catch (error) {
        console.error("Error al verificar o crear la base de datos:", error);
        process.exit(1);
    }
}

// Configuración del DataSource
export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false, // IMPORTANTE: Desactívalo en producción para evitar cambios automáticos en la base de datos
    dropSchema: false, // Solo actívalo si necesitas limpiar la base de datos durante desarrollo
    migrationsRun: false, // Ejecuta automáticamente las migraciones pendientes
    logging: ["error", "warn"], // Mostrar solo errores y advertencias
    entities: ["dist/models/*.js"], // Archivos compilados de entidades
    migrations: ["dist/migration/*.js"], // Archivos compilados de migraciones
    subscribers: [],
});
