export default class AmbienteModel{
    
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Busca todos os ambientes no banco de dados.
     * @returns {Promise<Array>}
     */
    async findAll(filters = {}){
        const query = `
            SELECT 
                a.*, 
                COUNT(r.id) FILTER (WHERE r.status = 'pendente') as pending_reservations_count
            FROM 
                ambientes a
            LEFT JOIN 
                reservas r ON a.id = r.recurso_id AND r.recurso_tipo = 'ambiente'
            GROUP BY 
                a.id
            ORDER BY 
                a.identificacao;
        `;
        
        const { rows } = await this.pool.query(query);
        return rows;
    }
        /**
     * Busca um ambiente específico pelo seu ID.
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id){
        const { rows } = await this.pool.query('SELECT * FROM ambientes WHERE id = $1', [id]);
        return rows[0];
    }
    /**
     * Busca um ambiente pela sua identificação (nome).
     * @param {string} identificacao
     * @returns {Promise<Object|null>}
     */
    async findByIdentificador (identificacao){
        const { rows } = await this.pool.query('SELECT * FROM ambientes WHERE identificacao = $1', [identificacao]);
        return rows[0];
    };
    /**
     * Cria um novo ambiente no banco de dados.
     * @param {Object} ambienteData
     * @returns {Promise<Object>}
     */
    async create (ambienteData) {
        const { identificacao, tipo, status } = ambienteData;
        const query = 'INSERT INTO ambientes (identificacao, tipo, status) VALUES ($1, $2, $3) RETURNING *';
        const values = [identificacao, tipo, status || 'Disponível'];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    };

    /**
     * Atualiza um ambiente existente no banco de dados.
     * @param {number} id
     * @param {Object} ambienteData
     * @returns {Promise<Object>}
     */
    async update(id, ambienteData){
        const { identificacao, tipo, status } = ambienteData;
        const query = `
            UPDATE ambientes
            SET
                identificacao = COALESCE($1, identificacao),
                tipo = COALESCE($2, tipo),
                status = COALESCE($3, status)
            WHERE id = $4
            RETURNING *;`;
        const values = [identificacao, tipo, status, id];
        
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    };

    /**
     * Deleta um ambiente do banco de dados pelo seu ID.
     * @param {number} id
     * @returns {Promise<Object>}
     *
    */

    async remove(id){
        const { rows } = await this.pool.query('DELETE FROM ambientes WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    };
}