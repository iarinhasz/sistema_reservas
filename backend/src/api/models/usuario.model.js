import pool from '../../config/database.js';

const create = async (userData) => { 
    const {cpf, nome, email, senha, tipo } = userData;
    const query = `
        INSERT INTO usuarios (cpf, nome, email, senha, tipo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING cpf, nome, email, tipo, data_criacao;
    `;
    const values = [cpf, nome, email, senha, tipo || 'usuario'];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const findByEmail = async (email) => {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return rows[0];
};

const findByCpf = async (cpf) => {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE cpf = $1', [cpf]);
    return rows[0];
};

const findPending = async ({ search, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    let query = `SELECT cpf, nome, email, tipo, data_criacao FROM usuarios WHERE status = 'pendente'`;
    const queryParams = [];

    if (search) {
        queryParams.push(`%${search}%`);
        query += ` AND nome ILIKE $${queryParams.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const { rows } = await pool.query(query, queryParams);
    
    // Query para contagem total para paginação
    const countResult = await pool.query("SELECT COUNT(*) FROM usuarios WHERE status = 'pendente'");
    const totalItems = parseInt(countResult.rows[0].count, 10);

    return { usuarios: rows, totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page };
};

// Função para mudar o status de um usuário
const updateStatus = async (cpf, newStatus) => {
    const { rows } = await pool.query(
        "UPDATE usuarios SET status = $1 WHERE cpf = $2 RETURNING *",
        [newStatus, cpf]
    );
    return rows[0];
};
const findAll = async () => {
    const { rows } = await pool.query("SELECT cpf, nome, email, tipo, status, data_criacao FROM usuarios WHERE status != 'pendente' ORDER BY nome");
    return rows;
};


// Função para deletar um usuário (usado na rejeição)
const deleteByCpf = async (cpf) => {
    const { rows } = await pool.query("DELETE FROM usuarios WHERE cpf = $1 RETURNING *", [cpf]);
    return rows[0];
}

export default {
    create,
    findByEmail,
    findByCpf,
    findPending,
    updateStatus,
    findAll,
    deleteByCpf
};