
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

export enum TaskStatus {
	ABERTO = 'aberto',
	FAZENDO = 'fazendo',
	FINALIZADO = 'finalizado',
}

@Entity()
export class Task {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	// SQLite não suporta 'enum' nativamente — armazenamos como texto
	@Column({ type: 'text', default: TaskStatus.ABERTO })
	status: TaskStatus;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
