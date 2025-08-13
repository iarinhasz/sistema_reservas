import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

export default class TestingController {

    async resetDatabase(req, res) {
        try {
            await pool.query('TRUNCATE TABLE usuarios, ambientes, equipamentos, reservas RESTART IDENTITY CASCADE;');
            console.log('Banco de dados de teste limpo com sucesso.');

            const saltRounds = 10;
            const senhaHash = await bcrypt.hash('senha_segura', saltRounds);

            const insertAdminQuery = `
                INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
                VALUES ('12345678900', 'Admin Padrão', 'admin@email.com', $1, 'admin', 'ativo');
            `;
            await pool.query(insertAdminQuery, [senhaHash]);
            console.log('Usuário administrador de teste recriado.');

            await pool.query(`
                INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
                VALUES ('12345678901', 'Aluno Teste', 'aluno@email.com', $1, 'aluno', 'ativo');
            `, [senhaHash]);
            console.log('Usuário aluno de teste criado.');

            await pool.query(`
                INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
                VALUES ('12345678902', 'Professor Teste', 'professor@email.com', $1, 'professor', 'ativo');
            `, [senhaHash]);
            console.log('Usuário professor de teste criado.');

            res.status(200).json({ message: 'Banco de dados resetado e usuarios de testes recriados com sucesso.' });
        } catch (error) {
            console.error('Falha ao resetar o banco de dados:', error);
            res.status(500).json({ message: 'Falha ao resetar o banco de dados.' });
        }
    }

    async createActiveUser(req, res) {
        try {
            const { cpf, nome, email, senha, tipo } = req.body;
            
            const query = `
                INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
                VALUES ($1, $2, $3, $4, $5, 'ativo');
            `;
            await pool.query(query, [cpf, nome, email, senha, tipo]);
            
            res.status(201).json({ message: `Usuário ativo ${email} criado com sucesso.` });
        } catch (error) {
            console.error('Falha ao criar usuário ativo de teste:', error);
            res.status(500).json({ message: 'Falha ao criar usuário ativo de teste.' });
        }
    }

    async createReserva(req, res) {
        try {
            const {
                recurso_id, recurso_tipo, usuario_email, titulo,
                data_inicio, data_fim, status, com_review,
                nota_review = 3, comentario_review = "Review de teste."
            } = req.body;

            const userResult = await pool.query('SELECT cpf FROM usuarios WHERE email = $1', [usuario_email]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: `Usuário de teste com email ${usuario_email} não encontrado.` });
            }
            const usuario_cpf = userResult.rows[0].cpf;

            const reservaQuery = `
                INSERT INTO reservas (recurso_id, recurso_tipo, usuario_cpf, titulo, data_inicio, data_fim, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const reservaResult = await pool.query(reservaQuery, [
                recurso_id, recurso_tipo, usuario_cpf, titulo, data_inicio, data_fim, status
            ]);
            const novaReserva = reservaResult.rows[0];

            if (com_review) {
                const reviewQuery = `
                    UPDATE reservas SET nota = $1, comentario = $2 WHERE id = $3;
                `;
                await pool.query(reviewQuery, [nota_review, comentario_review, novaReserva.id]);
                novaReserva.nota = nota_review;
                novaReserva.comentario = comentario_review;
            }

            res.status(201).json({ message: 'Reserva de teste criada com sucesso!', reserva: novaReserva });

        } catch (error) {
            console.error('Falha ao criar reserva de teste:', error);
            res.status(500).json({ message: 'Falha ao criar reserva de teste.' });
        }
    }
}