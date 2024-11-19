import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

//Se puede utilizar el simbolo "!" para decirle a typescript que el metodo va a ser utilizado en algun momento.

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50 })
    cuit!: string;

    @Column({ type: "varchar", length: 100 })
    razonSocial!: string;
}
