import pool from '../../config/database.js';


const create = async (reservaData) => {
    const { usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo, status = 'pendente' } = reservaData;
    
    const query = `
        INSERT INTO reservas (usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
};


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


const findById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
    return rows[0];
};


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
/**
 * Busca por reservas futuras para um recurso específico (ambiente ou equipamento).
 * @param {object} resourceInfo - { recurso_id, recurso_tipo }
 * @returns {Promise<Array>}
 */
const findFutureByResourceId = async ({ recurso_id, recurso_tipo }) => {
    const query = `
        SELECT * FROM reservas 
        WHERE recurso_id = $1 
        AND recurso_tipo = $2 
        AND data_inicio > NOW() 
        AND status = 'aprovada';
    `;
    const { rows } = await pool.query(query, [recurso_id, recurso_tipo]);
    return rows;
};

const addReview = async (id, nota, comentario) => {
    const query = `
        UPDATE reservas 
        SET nota = $1, comentario = $2 
        WHERE id = $3 
        RETURNING *;
    `;
    const values = [nota, comentario, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const checkAvailability = async ({ recurso_id, recurso_tipo, data_inicio, data_fim }) => {
    const query = `
        SELECT COUNT(*)
        FROM reservas
        WHERE
            recurso_id = $1 AND
            recurso_tipo = $2 AND
            status = 'aprovada' AND
            data_inicio < $4 AND
            data_fim > $3;
    `;
    const values = [recurso_id, recurso_tipo, data_inicio, data_fim];

    try {
        const result = await pool.query(query, values);
        const conflictExists = parseInt(result.rows[0].count, 10) > 0;
        return conflictExists;
    } catch (error) {
        console.error("Erro ao verificar disponibilidade de reserva:", error);
        throw error;
    }
};

export default {
    create,
    findAll,
    findById,
    findByUser,
    updateStatus,
    rejectConflictsFor,
    findFutureByResourceId,
    addReview,
    checkAvailability
};