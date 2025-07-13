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

export default { resetDatabase };