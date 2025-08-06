class ReservaModel{
    constructor(pool){
        this.pool = pool;
    }

    async findById(id){
        const { rows } = await this.pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
        return rows[0];
    }

    async create (reservaData){
        const { usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo, status = 'pendente' } = reservaData;
        const query = `
            INSERT INTO reservas (usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [usuario_cpf, recurso_id, recurso_tipo, data_inicio, data_fim, titulo, status];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }

    async findAll(filters = {}){
        let query = `
            SELECT r.*, 
                   COALESCE(a.identificacao, eq.nome) as recurso_nome, 
                   u.nome as usuario_nome
            FROM reservas r
            LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
            LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
            LEFT JOIN usuarios u ON r.usuario_cpf = u.cpf
        `;
        
        const values = [];
        const whereClauses = [];

        if (filters.recurso_id && filters.recurso_tipo) {
            whereClauses.push(`r.recurso_id = $${values.length + 1} AND r.recurso_tipo = $${values.length + 2}`);
            values.push(filters.recurso_id, filters.recurso_tipo);
        }
        
        if (filters.status) {
            whereClauses.push(`r.status = $${values.length + 1}`);
            values.push(filters.status);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Ordena pela data de criação para a fila de aprovação funcionar corretamente
        query += ' ORDER BY r.data_criacao ASC;';
        
        const { rows } = await this.pool.query(query, values);
        return { data: rows }; 
    }
    
    async checkAvailability ({ recurso_id, recurso_tipo, data_inicio, data_fim }){
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
            const result = await this.pool.query(query, values);
            const conflictExists = parseInt(result.rows[0].count, 10) > 0;
            return conflictExists;
        } catch (error) {
            console.error("Erro ao verificar disponibilidade de reserva:", error);
            throw error;
        }
    }

    async findByUser(cpf){
        const query = `
            SELECT r.*,
                COALESCE(a.identificacao, eq.nome) as recurso_nome
            FROM reservas r
            LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
            LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
            WHERE r.usuario_cpf = $1
            ORDER BY r.data_inicio DESC;
        `;
        const { rows } = await this.pool.query(query, [cpf]);
        return rows;
    }

    async updateStatus(id, status){
        const query = 'UPDATE reservas SET status = $1 WHERE id = $2 RETURNING *';
        const { rows } = await this.pool.query(query, [status, id]);
        return rows[0];
    }

    async rejectConflictsFor(approvedReservation){
        const { id, recurso_id, recurso_tipo, data_inicio, data_fim } = approvedReservation;
        const query = `
            UPDATE reservas SET status = 'rejeitada'
            WHERE
                recurso_id = $1 AND
                recurso_tipo = $2 AND
                status = 'pendente' AND
                id != $3 AND
                (data_inicio, data_fim) OVERLAPS ($4, $5);
        `;
        const { rowCount } = await this.pool.query(query, [recurso_id, recurso_tipo, id, data_inicio, data_fim]);
        return rowCount;
    }

    async findFutureByResourceId({ recurso_id, recurso_tipo }){
        const query = `
            SELECT * FROM reservas 
            WHERE recurso_id = $1 
            AND recurso_tipo = $2 
            AND data_inicio > NOW() 
            AND status = 'aprovada';
        `;
        const { rows } = await this.pool.query(query, [recurso_id, recurso_tipo]);
        return rows;
    }

    async addReview (id, nota, comentario){
        const query = `
            UPDATE reservas 
            SET nota = $1, comentario = $2 
            WHERE id = $3 
            RETURNING *;
        `;
        const values = [nota, comentario, id];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }
}

export default ReservaModel;