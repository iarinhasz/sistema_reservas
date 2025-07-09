import pool from '../../config/database.js';

/**
 * Cria uma nova solicitação de reserva.
 * O status inicial é sempre 'pendente'.
 */
const create = async (reservaData) => {
    const { usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo } = reservaData;
    const query = `
        INSERT INTO reservas (usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

/**
 * Lista todas as reservas.
 */
const findAll = async () => {
    const query = `
        SELECT r.*, 
               COALESCE(a.identificacao, eq.nome) as recurso_nome,
               u.nome as usuario_nome
        FROM reservas r
        LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
        LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
        LEFT JOIN usuarios u ON r.usuario_cpf = u.cpf
        ORDER BY r.data_inicio;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

/**
 * Busca uma reserva pelo seu ID.
 */
const findById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
    return rows[0];
};

/**
 * Busca todas as reservas de um usuário específico pelo CPF.
 */
const findByUser = async (cpf) => {
    const query = `
        SELECT r.*,
               COALESCE(a.identificacao, eq.nome) as recurso_nome
        FROM reservas r
        LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
        LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
        WHERE r.usuario_cpf = $1
        ORDER BY r.data_inicio DESC;
    `;
    const { rows } = await pool.query(query, [cpf]);
    return rows;
};

/**
 * Atualiza o status de uma reserva (para aprovar, rejeitar, etc.).
 */
const updateStatus = async (id, status) => {
    const query = 'UPDATE reservas SET status = $1 WHERE id = $2 RETURNING *';
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
};

const rejectConflictsFor = async (approvedReservation) => {
    const { id, recurso_id, recurso_tipo, data_inicio, data_fim } = approvedReservation;
    const query = `
        UPDATE reservas SET status = 'rejeitada'
        WHERE
            recurso_id = $1 AND
            recurso_tipo = $2 AND
            status = 'pendente' AND
            id != $3 AND -- Não rejeita a própria reserva que acabamos de aprovar
            (data_inicio, data_fim) OVERLAPS ($4, $5);
    `;
    const { rowCount } = await pool.query(query, [recurso_id, recurso_tipo, id, data_inicio, data_fim]);
    return rowCount; // Retorna o número de reservas que foram rejeitadas
};


export default {
    create,
    findAll,
    findById,
    findByUser,
    updateStatus,
    rejectConflictsFor,
};