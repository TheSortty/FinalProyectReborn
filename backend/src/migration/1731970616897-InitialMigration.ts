import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1731970616897 implements MigrationInterface {
    name = 'InitialMigration1731970616897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`producto\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigoProducto\` varchar(50) NOT NULL, \`denominacion\` varchar(100) NOT NULL, \`precioVenta\` decimal(10,2) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cliente\` (\`id\` int NOT NULL AUTO_INCREMENT, \`cuit\` varchar(50) NOT NULL, \`razonSocial\` varchar(100) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pedido_venta_detalle\` (\`id\` int NOT NULL AUTO_INCREMENT, \`idproducto\` int NOT NULL, \`cantidad\` int NOT NULL, \`subtotal\` decimal(10,2) NOT NULL, \`idpedidoventa\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pedido_venta\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fechaPedido\` date NOT NULL, \`nroComprobante\` int NOT NULL, \`formaPago\` varchar(50) NOT NULL, \`totalPedido\` decimal(10,2) NOT NULL, \`borrado\` int NOT NULL DEFAULT '0', \`idcliente\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pedido_venta_detalle\` ADD CONSTRAINT \`FK_62e5cb9df7a09b704da7c1e9dab\` FOREIGN KEY (\`idproducto\`) REFERENCES \`producto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pedido_venta_detalle\` ADD CONSTRAINT \`FK_b513770d4cc942b51f86bc15e64\` FOREIGN KEY (\`idpedidoventa\`) REFERENCES \`pedido_venta\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pedido_venta\` ADD CONSTRAINT \`FK_cb42ba6e3e082aa8fbd20b0a2f6\` FOREIGN KEY (\`idcliente\`) REFERENCES \`cliente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

/*************  ✨ Codeium Command ⭐  *************/
    /**
     * Reverts the changes applied by the `up` method.
     *
     * Reverses the order of the `up` method and drops the tables and foreign keys
     * in the reverse order they were created.
     */
/******  56263c07-fcf7-4c75-9416-48bdb98e6534  *******/    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pedido_venta\` DROP FOREIGN KEY \`FK_cb42ba6e3e082aa8fbd20b0a2f6\``);
        await queryRunner.query(`ALTER TABLE \`pedido_venta_detalle\` DROP FOREIGN KEY \`FK_b513770d4cc942b51f86bc15e64\``);
        await queryRunner.query(`ALTER TABLE \`pedido_venta_detalle\` DROP FOREIGN KEY \`FK_62e5cb9df7a09b704da7c1e9dab\``);
        await queryRunner.query(`DROP TABLE \`pedido_venta\``);
        await queryRunner.query(`DROP TABLE \`pedido_venta_detalle\``);
        await queryRunner.query(`DROP TABLE \`cliente\``);
        await queryRunner.query(`DROP TABLE \`producto\``);
    }

}
