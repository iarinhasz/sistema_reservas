// src/api/controllers/testing.controller.js
import pool from '../../config/database.js';

const resetDatabase = async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE usuarios, ambientes, equipamentos, reservas RESTART IDENTITY;');
        console.log('Banco de dados de teste limpo com sucesso.');
        
        // IMPORTANTE: Recriamos o admin para que os testes possam fazer login.
        const insertAdminQuery = `
            INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
            VALUES ('12345678900', 'Admin Padrão', 'admin@email.com', 'senha_segura', 'admin', 'ativo');
        `;
        await pool.query(insertAdminQuery);
        console.log('Usuário administrador de teste recriado.');

        // Insere usuário aluno para teste
        await pool.query(`
            INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
            VALUES ('12345678901', 'Aluno Teste', 'aluno@email.com', 'senha_segura', 'aluno', 'ativo');
        `);
        console.log('Usuário aluno de teste criado.');

        // Insere usuário professor para teste
        await pool.query(`
            INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) 
            VALUES ('12345678902', 'Professor Teste', 'professor@email.com', 'senha_segura', 'professor', 'ativo');
        `);
        console.log('Usuário professor de teste criado.');

        res.status(200).json({ message: 'Banco de dados resetado e usuarios de testes recriado com sucesso.' });
    } catch (error) {
        console.error('Falha ao resetar o banco de dados:', error);
        res.status(500).json({ message: 'Falha ao resetar o banco de dados.' });
    }
};

const createActiveUser = async (req, res) => {
    try {
        // Pega os dados enviados pelo teste do Cypress
        const { cpf, nome, email, senha, tipo } = req.body;
        
        // Insere o usuário diretamente com status 'ativo'
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
};

const createReserva = async (req, res) => {
    try {
        // 1. Extrai os dados enviados pelo teste do Cypress
        const {
            recurso_id,
            recurso_tipo,
            usuario_email,
            titulo,
            data_inicio,
            data_fim,
            status,
            com_review,
            nota_review = 3,
            comentario_review = "Review de teste."
        } = req.body;

        // 2. Busca o CPF do usuário a partir do email fornecido
        const userResult = await pool.query('SELECT cpf FROM usuarios WHERE email = $1', [usuario_email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: `Usuário de teste com email ${usuario_email} não encontrado.` });
        }
        const usuario_cpf = userResult.rows[0].cpf;

        // 3. Insere a reserva no banco de dados
        const reservaQuery = `
            INSERT INTO reservas (recurso_id, recurso_tipo, usuario_cpf, titulo, data_inicio, data_fim, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const reservaResult = await pool.query(reservaQuery, [
            recurso_id, recurso_tipo, usuario_cpf, titulo, data_inicio, data_fim, status
        ]);
        const novaReserva = reservaResult.rows[0];

        // 4. Se o teste pedir, atualiza a reserva recém-criada com o review
        if (com_review) {
            const reviewQuery = `
                UPDATE reservas 
                SET nota = $1, comentario = $2 
                WHERE id = $3;
            `;
            await pool.query(reviewQuery, [nota_review, comentario_review, novaReserva.id]);
            novaReserva.nota = nota_review;
            novaReserva.comentario = comentario_review;
        }

        // 5. Retorna a reserva criada para o Cypress
        res.status(201).json({ message: 'Reserva de teste criada com sucesso!', reserva: novaReserva });

    } catch (error) {
        console.error('Falha ao criar reserva de teste:', error);
        res.status(500).json({ message: 'Falha ao criar reserva de teste.' });
    }
};

export default { resetDatabase, createActiveUser, createReserva};