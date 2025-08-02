export default class UsuarioModel {
    constructor(pool){
        this.pool = pool;
    }

    static async create(userData) {
        const {cpf, nome, email, senhaHash, tipo } = userData;
        const query = `
            INSERT INTO usuarios (cpf, nome, email, senha, tipo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING cpf, nome, email, tipo, data_criacao;
        `;
        const values = [cpf, nome, email, senhaHash, tipo || 'usuario'];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }

    static async findByEmail(email) {
        const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        return rows[0];
    }

    static async findByCpf(cpf) {
        const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE cpf = $1', [cpf]);
        return rows[0];
    }

    static async findPending ({ search, page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT cpf, nome, email, tipo, data_criacao FROM usuarios WHERE status = 'pendente'`;
        const queryParams = [];

        if (search) {
            queryParams.push(`%${search}%`);
            query += ` AND nome ILIKE $${queryParams.length}`;
        }

        query += ` ORDER BY data_criacao DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const { rows } = await this.pool.query(query, queryParams);
    
        // Query para contagem total para paginação
        const countResult = await this.pool.query("SELECT COUNT(*) FROM usuarios WHERE status = 'pendente'");
        const totalItems = parseInt(countResult.rows[0].count, 10);

    return { usuarios: rows, totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page };
    }

    // Função para mudar o status de um usuário
    static async updateStatus (cpf, newStatus) {
        const { rows } = await pool.query(
            "UPDATE usuarios SET status = $1 WHERE cpf = $2 RETURNING *",
            [newStatus, cpf]
        );
    return rows[0];
    }

    static async findAll () {
    const { rows } = await this.pool.query("SELECT cpf, nome, email, tipo, status, data_criacao FROM usuarios WHERE status != 'pendente' ORDER BY nome");
    return rows;
    }

    // Função para deletar um usuário (usado na rejeição)
    static async deleteByCpf (cpf) {
        const { rows } = await this.pool.query("DELETE FROM usuarios WHERE cpf = $1 RETURNING *", [cpf]);
        return rows[0];
    }

    static async update (cpf, userData) {

        const keys = Object.keys(userData); 

        const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

        const values = Object.values(userData);

        values.push(cpf);
        const cpfParamIndex = values.length;

        const query = `
            UPDATE usuarios 
            SET ${setClauses} 
            WHERE cpf = $${cpfParamIndex} 
            RETURNING cpf, nome, email, tipo, status;
        `;

        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }

}

