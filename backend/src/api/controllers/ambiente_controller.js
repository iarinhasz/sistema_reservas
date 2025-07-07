import pool from '../../config/database.js';

const listAll = async (req, res) => {
    try {
    const { rows } = await pool.query('SELECT * FROM ambientes ORDER BY identificacao');
    
    // Se a consulta for bem-sucedida, retorna os ambientes em formato JSON
    res.status(200).json(rows);

    } catch (error) {
    // Se ocorrer qualquer erro na consulta, logamos no console para debug
    console.error('Erro ao listar ambientes:', error);
    // E retornamos uma mensagem de erro genérica para o cliente
    res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

// Função para CRIAR um novo ambiente
const create = async (req, res) => {
    try {
    // Pegamos os dados do novo ambiente do corpo (body) da requisição
    const { identificacao, tipo, status } = req.body;

    // Verificação simples para garantir que a identificação foi enviada
    if (!identificacao) {
        return res.status(400).json({ message: 'O campo "identificacao" é obrigatório.' });
    }

    // Query SQL para inserir um novo ambiente.
    // Usamos $1, $2, $3 para evitar SQL Injection. É uma prática de segurança essencial!
    const query = 'INSERT INTO ambientes (identificacao, tipo, status) VALUES ($1, $2, $3) RETURNING *';
    const values = [identificacao, tipo, status || 'Disponível']; // Usa 'Disponível' se o status não for enviado

    const { rows } = await pool.query(query, values);

    // Retorna o novo ambiente criado com o status 201 (Created)
    res.status(201).json(rows[0]);

    } catch (error) {
    console.error('Erro ao criar ambiente:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
    }
};
export default {
    listAll,
    create,
};
