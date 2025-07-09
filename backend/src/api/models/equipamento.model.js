
import pool from '../../config/database.js';

/**
 * Cria um novo equipamento no banco de dados.
 */
const create = async (equipamentoData) => {
    const { nome, marca, modelo, quantidade_total, ambiente_id } = equipamentoData;
    
    const query = `
        INSERT INTO equipamentos (nome, marca, modelo, quantidade_total, ambiente_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    
    const values = [nome, marca || null, modelo || null, quantidade_total, ambiente_id];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

/**
 * Lista todos os equipamentos.
 */
const findAll = async () => {
    const { rows } = await pool.query('SELECT * FROM equipamentos ORDER BY nome');
    return rows;
};

/**
 * Busca um equipamento pelo seu ID.
 */
const findById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM equipamentos WHERE id = $1', [id]);
    return rows[0];
};

/**
 * Atualiza um equipamento com base nos dados fornecidos.
 * Constrói a query dinamicamente.
 */
const update = async (id, dataToUpdate) => {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const key in dataToUpdate) {
        if (['nome', 'marca', 'modelo', 'quantidade_total', 'ambiente_id'].includes(key)) {
            setClauses.push(`${key} = $${paramIndex}`);
            values.push(dataToUpdate[key]);
            paramIndex++;
        }
    }

    // Se nenhum campo válido foi passado, não há o que atualizar.
    if (setClauses.length === 0) {
        return null; // Retorna nulo para o controller saber que nada foi feito.
    }
    
    values.push(id);

    const query = `
        UPDATE equipamentos
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
};

/**
 * Deleta um equipamento pelo seu ID.
 */
const remove = async (id) => {
    const { rows } = await pool.query('DELETE FROM equipamentos WHERE id = $1 RETURNING *', [id]);
    return rows[0];
};

export default {
    create,
    findAll,
    findById,
    update,
    remove
};