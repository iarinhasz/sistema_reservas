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
            const statusList = filters.status.split(',');
            whereClauses.push(`r.status = ANY($${values.length + 1}::text[])`);
            values.push(statusList);
        }
        if (filters.data) {
            whereClauses.push(`r.data_inicio::date = $${values.length + 1}`);
            values.push(filters.data);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        query += ' ORDER BY r.data_criacao ASC;';
        
        const { rows } = await this.pool.query(query, values);
        return rows; 
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

    async findByUser(cpf, filters = {}) {
        let query = `
            SELECT r.*,
                COALESCE(a.identificacao, eq.nome) as recurso_nome
            FROM reservas r
            LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
            LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
            WHERE r.usuario_cpf = $1
        `;
        const values = [cpf];

        // A lógica que adiciona os filtros à query
        if (filters && filters.recursoId && filters.recursoTipo) {
            // Se os filtros existem, eles são registrados aqui
            console.log('MODEL: Filtros recebidos para aplicar na query:', filters);
            query += ` AND r.recurso_id = $2 AND LOWER(r.recurso_tipo) = LOWER($3)`;
            values.push(filters.recursoId, filters.recursoTipo);
        } else {
            // Se nenhum filtro foi recebido, isso será registrado
            console.log('MODEL: Nenhum filtro de recurso recebido, buscando todas as reservas.');
        }

        query += ` ORDER BY r.data_inicio DESC;`;

        // O log mais importante: mostra a query final antes de ser executada
        console.log('MODEL: Query FINAL que será executada:', query);
        console.log('MODEL: VALORES para a query:', values);

        const { rows } = await this.pool.query(query, values);
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
            AND data_fim > NOW() 
            AND status = 'aprovada';
        `;
        const { rows } = await this.pool.query(query, [recurso_id, recurso_tipo]);
        return rows;
    }

    async addReview(id, nota, comentario) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Query com conversão de tipo (CAST) explícita
            const query = `
                UPDATE reservas 
                SET nota = $1::INTEGER, comentario = $2::TEXT 
                WHERE id = $3::INTEGER 
                RETURNING *;
            `;
            const values = [nota, comentario, id];

            const { rows } = await client.query(query, values);

            await client.query('COMMIT');

            if (rows.length === 0) {
                throw new Error(`Nenhuma reserva encontrada com o ID ${id} para atualizar.`);
            }

            // Adicionamos um log para ver os dados que o banco RETORNOU após o UPDATE
            console.log(`MODEL: Review para reserva ID ${id} salva com sucesso. Dados atualizados:`, rows[0]);
            return rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('MODEL (addReview): Erro na transação.', error);
            throw error;
        } finally {
            client.release();
        }
    }
    async findAllWithReviews() {
    const query = `
        SELECT
            r.id,
            r.titulo,
            r.nota,
            r.comentario,
            r.data_inicio, -- Adicionado para ter a data de início
            r.data_fim,
            u.nome AS usuario_nome,
            -- A MÁGICA ACONTECE AQUI:
            -- Pega o nome do ambiente, se não houver, pega o nome do equipamento
            COALESCE(a.identificacao, eq.nome) AS recurso_nome
        FROM
            reservas r
        LEFT JOIN
            usuarios u ON r.usuario_cpf = u.cpf
        LEFT JOIN
            ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
        LEFT JOIN
            equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
        WHERE
            r.nota IS NOT NULL AND r.comentario IS NOT NULL
        ORDER BY
            r.data_fim DESC;
        `;
        const { rows } = await this.pool.query(query);
        return rows;
    }


    async findReviewsByRecurso(recurso_id, recurso_tipo) {
        const query = `
            SELECT
                r.id,
                r.nota,
                r.comentario,
                r.data_fim,
                u.nome AS usuario_nome
            FROM
                reservas r
            JOIN
                usuarios u ON r.usuario_cpf = u.cpf
            WHERE
                r.recurso_id = $1 AND
                r.recurso_tipo = $2 AND
                r.nota IS NOT NULL AND
                r.comentario IS NOT NULL
            ORDER BY
                r.data_fim DESC;
        `;
        const { rows } = await this.pool.query(query, [recurso_id, recurso_tipo]);
        return rows;
    }

    async findReviewsByAmbienteCompleto(ambiente_id) {
        const query = `
            SELECT
                r.id, r.nota, r.comentario, r.data_inicio, r.data_fim,
                u.nome as usuario_nome,
                COALESCE(a.identificacao, eq.nome) as recurso_nome
            FROM reservas r
            JOIN usuarios u ON r.usuario_cpf = u.cpf
            LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
            LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
            WHERE
                r.nota IS NOT NULL
                AND (
                    -- Ou o review é do próprio ambiente
                    (r.recurso_tipo = 'ambiente' AND r.recurso_id = $1)
                    OR
                    -- Ou o review é de um equipamento que PERTENCE a este ambiente
                    (r.recurso_tipo = 'equipamento' AND eq.ambiente_id = $1)
                )
            ORDER BY r.data_fim DESC;
        `;
        const { rows } = await this.pool.query(query, [ambiente_id]);
        return rows;
    }
    
    async countApprovedOverlappingReservations({ recurso_id, recurso_tipo, data_inicio, data_fim }) {
        const query = `
            SELECT COUNT(*)
            FROM reservas
            WHERE
                recurso_id = $1 AND
                recurso_tipo = $2 AND
                status = 'aprovada' AND
                -- A função OVERLAPS verifica se dois períodos de tempo se cruzam
                (data_inicio, data_fim) OVERLAPS ($3, $4);
        `;
        const values = [recurso_id, recurso_tipo, data_inicio, data_fim];
        const { rows } = await this.pool.query(query, values);
        return parseInt(rows[0].count, 10);
    }
     async findPendingByAmbienteId(ambienteId) {
        const query = `
            SELECT
                r.*,
                COALESCE(a.identificacao, eq.nome) as recurso_nome,
                u.nome as usuario_nome
            FROM reservas r
            JOIN usuarios u ON r.usuario_cpf = u.cpf
            LEFT JOIN ambientes a ON r.recurso_id = a.id AND r.recurso_tipo = 'ambiente'
            LEFT JOIN equipamentos eq ON r.recurso_id = eq.id AND r.recurso_tipo = 'equipamento'
            WHERE
                r.status = 'pendente'
                AND (
                    (r.recurso_tipo = 'ambiente' AND r.recurso_id = $1)
                    OR
                    (r.recurso_tipo = 'equipamento' AND eq.ambiente_id = $1)
                )
            ORDER BY r.data_criacao ASC;
        `;
        const { rows } = await this.pool.query(query, [ambienteId]);
        return rows;
    }
}

export default ReservaModel;