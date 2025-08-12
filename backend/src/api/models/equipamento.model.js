class EquipamentoModel {
    /**
     * @param {object} pool - O pool de conexões do PostgreSQL.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * @param {object} equipamentoData - { nome, marca, modelo, quantidade_total, ambiente_id }
     * @returns {Promise<object>} O equipamento criado.
     */
    async create(equipamentoData) {
        const { nome, marca, modelo, quantidade_total, ambiente_id, criado_por_cpf } = equipamentoData;
        const query = `
            INSERT INTO equipamentos (nome, marca, modelo, quantidade_total, ambiente_id, criado_por_cpf)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const values = [nome, marca || null, modelo || null, quantidade_total, ambiente_id, criado_por_cpf];
        
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }

    /**
     * Lista todos os equipamentos, com possibilidade de filtro.
     * @param {object} filters - Filtros como { ambiente_id }
     * @returns {Promise<Array>} Uma lista de equipamentos.
     */
    async findAll(filters = {}) {
        let query = `
                SELECT 
                    eq.*, 
                    u.nome as criado_por_nome 
                FROM equipamentos eq
                LEFT JOIN usuarios u ON eq.criado_por_cpf = u.cpf
            `;
        const values = [];
        
        if (filters.ambienteId) {
            query += ' WHERE ambiente_id = $1';
            values.push(filters.ambienteId);
        }
        
        query += ' ORDER BY nome';
        
        const { rows } = await this.pool.query(query, values);
        return rows;
    }

    /**
     * Busca um equipamento pelo seu ID.
     * @param {number} id - O ID do equipamento.
     * @returns {Promise<object|undefined>} O equipamento encontrado ou undefined.
     */
    async findById(id) {
        const query = `
            SELECT 
                eq.*, 
                u.nome as criado_por_nome 
            FROM equipamentos eq
            LEFT JOIN usuarios u ON eq.criado_por_cpf = u.cpf
            WHERE eq.id = $1
        `;
        const { rows } = await this.pool.query(query, [id]);
        return rows[0];
    }

    /**
     * Busca um equipamento pelo nome e ID do ambiente.
     * @param {string} nome 
     * @param {number} ambiente_id 
     * @returns {Promise<object|undefined>} O equipamento encontrado ou undefined.
     */
    async findByNomeEAmbiente(nome, ambiente_id) {
        const { rows } = await this.pool.query(
            'SELECT * FROM equipamentos WHERE nome = $1 AND ambiente_id = $2',
            [nome, ambiente_id]
        );
        return rows[0];
    }

    /**
     * Atualiza um equipamento com base nos dados fornecidos.
     * @param {number} id - O ID do equipamento a ser atualizado.
     * @param {object} dataToUpdate - Os dados a serem atualizados.
     * @returns {Promise<object|null>} O equipamento atualizado ou null se nada foi alterado.
     */
    async update(id, dataToUpdate) {
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

        if (setClauses.length === 0) {
            return null;
        }
        
        values.push(id);

        const query = `
            UPDATE equipamentos
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }

    /**
     * Deleta um equipamento pelo seu ID.
     * @param {number} id - O ID do equipamento a ser deletado.
     * @returns {Promise<object|undefined>} O equipamento que foi deletado.
     */
    async remove(id) {
        const { rows } = await this.pool.query('DELETE FROM equipamentos WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    }
}

export default EquipamentoModel;