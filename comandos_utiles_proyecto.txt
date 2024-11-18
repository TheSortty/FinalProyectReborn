
# Comandos útiles para el proyecto FinalProyectReborn (Node.js + TypeScript + TypeORM + MySQL)

## Comandos para configurar el proyecto:
1. `npm init -y`
   - Inicializa un proyecto Node.js creando un archivo `package.json` con la configuración básica.

2. `npm install express typeorm mysql2 reflect-metadata dotenv`
   - Instala las dependencias necesarias para el proyecto (Express, TypeORM, MySQL, Reflect Metadata y dotenv).

3. `npm install typescript ts-node @types/node @types/express --save-dev`
   - Instala TypeScript y las dependencias para desarrollo (`ts-node` para ejecutar archivos TypeScript).

## Comandos para compilar y ejecutar el proyecto:
4. `npm run start`
   - Ejecuta el proyecto en modo desarrollo usando `ts-node`. Ejecuta el archivo `src/index.ts`.

5. `npm run build`
   - Compila el código TypeScript a JavaScript y coloca los archivos resultantes en la carpeta `dist`.

6. `npm run serve`
   - Ejecuta el código compilado desde la carpeta `dist` usando Node.js.

## Comandos para TypeORM y manejo de migraciones:
7. `npx typeorm migration:generate -n InitialMigration`
   - Genera un archivo de migración basado en los cambios detectados en las entidades. Crea el archivo en `src/migration`.

8. `npx typeorm migration:run`
   - Aplica todas las migraciones pendientes en la base de datos para actualizar su estructura.

9. `npx typeorm migration:show`
   - Muestra una lista de migraciones pendientes que aún no han sido aplicadas en la base de datos.

10. `npx typeorm migration:revert`
    - Revierte la última migración aplicada. Útil para deshacer cambios en la base de datos.

## Comandos útiles para la base de datos MySQL:
11. `SHOW TABLES;`
    - Muestra todas las tablas existentes en la base de datos actual.

12. `DROP TABLE nombre_tabla;`
    - Elimina una tabla específica de la base de datos.

13. `CREATE DATABASE nombre_db;`
    - Crea una nueva base de datos.

14. `USE nombre_db;`
    - Selecciona la base de datos con la que deseas trabajar.

## Comandos adicionales para limpiar y reinstalar:
15. `rm -rf node_modules`
    - Elimina la carpeta `node_modules` del proyecto.

16. `npm install`
    - Reinstala todas las dependencias listadas en `package.json`.

## Comandos para reiniciar la base de datos automáticamente:
17. `mysql -u usuario -p -e "DROP DATABASE IF EXISTS clientepedidos; CREATE DATABASE clientepedidos;"`
    - Elimina y recrea la base de datos. Debes reemplazar `usuario` con tu nombre de usuario de MySQL.

## Comandos para verificar el compilador TypeScript:
18. `npx tsc --listFiles`
    - Muestra todos los archivos TypeScript que serán compilados según la configuración actual del `tsconfig.json`.

19. `npx tsc --watch`
    - Compila automáticamente los archivos TypeScript cada vez que detecta cambios.

## Nuevo -- 

## Inicialización y Configuración del Proyecto

1. **Instalación de dependencias**
   ```bash
   npm install
   ```
   Instala todas las dependencias especificadas en el archivo `package.json`.

2. **Compilación del proyecto TypeScript**
   ```bash
   npm run build
   ```
   Compila los archivos TypeScript a JavaScript y los coloca en la carpeta `dist/`.

3. **Inicio del servidor**
   ```bash
   npm run start
   ```
   Compila el proyecto y ejecuta el servidor usando el archivo compilado `dist/index.js`.

## Migraciones con TypeORM

4. **Generar una nueva migración**
   ```bash
   npx typeorm migration:generate ./src/migration/InitialMigration -d dist/data-source.js
   ```
   Genera una nueva migración basada en los cambios detectados en las entidades. Utiliza el archivo compilado `data-source.js` como referencia.

5. **Ejecutar migraciones**
   ```bash
   npx typeorm migration:run -d dist/data-source.js
   ```
   Aplica las migraciones pendientes en la base de datos usando el archivo compilado `data-source.js`.

6. **Mostrar migraciones pendientes**
   ```bash
   npx typeorm migration:show -d dist/data-source.js
   ```
   Muestra las migraciones que aún no han sido aplicadas.

## Manejo de la Base de Datos

7. **Verificar y/o crear la base de datos automáticamente**
   La función `ensureDatabaseExists()` en `index.ts` verifica si la base de datos existe y la crea si no es así.

## Comandos de MySQL

8. **Conectarse a MySQL desde la terminal**
   ```bash
   mysql -u tu_usuario -p
   ```
   Conéctate a tu servidor MySQL (reemplaza `tu_usuario` con el nombre de usuario de tu base de datos).

9. **Seleccionar la base de datos y mostrar tablas**
   ```sql
   USE clientePedidos;
   SHOW TABLES;
   ```

## Solución de Problemas

10. **Limpiar la compilación**
    ```bash
    npx tsc --build --clean
    ```
    Limpia los archivos compilados antes de volver a compilar el proyecto.

11. **Compilar y ejecutar manualmente**
    ```bash
    npx tsc
    node dist/index.js
    ```
    Compila el proyecto y ejecuta el archivo JavaScript compilado.

## Configuración de TypeScript y Node.js

12. **Usar `ts-node` con módulos ES**
    ```bash
    npx ts-node-esm src/index.ts
    ```
    Ejecuta el archivo TypeScript usando `ts-node-esm` para soportar módulos ES.

## Notas adicionales

- Recuerda siempre desactivar `"synchronize": true` después de que las tablas hayan sido creadas automáticamente para evitar modificaciones no controladas en la base de datos.
- Usa siempre migraciones para hacer cambios en la estructura de la base de datos una vez que el proyecto esté en producción.


