import pool from '../../config/database.js';

const create = async (req, res) => {
    try {
        const { nome, marca, modelo, quantidade_total, ambiente_id } = req.body;

        if (!nome || quantidade_total === undefined) {
            return res.status(400).json({ message: "Os campos 'nome' e 'quantidade_total' são obrigatórios." });
        }

        const query = `
            INSERT INTO equipamentos (nome, marca, modelo, quantidade_total, ambiente_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;

        const values = [nome, marca || null, modelo || null, quantidade_total, ambiente_id];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Equipamento criado com sucesso!",
            equipamento: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const listAll = async(req, res) =>{
    try{
        const result = await pool.query('SELECT * FROM equipamentos ORDER BY nome');
        res.status(200).json(result.rows);
    } catch{
        console.error('Erro ao listar equipamentos:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}

const getById = async(req, res)=>{
    try {
        const { id } = req.params;
        const equipamentoId = parseInt(id, 10);

        const result = await pool.query('SELECT * FROM equipamentos WHERE id = $1', [equipamentoId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar equipamento por ID:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}

const update = async (req, res)=>{
    try {
        const { id } = req.params;
        const equipamentoId = parseInt(id, 10);

        const camposParaAtualizar = req.body;

        if (Object.keys(camposParaAtualizar).length === 0) {
            return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
        }
        if (camposParaAtualizar.ambiente_id === null) {
            return res.status(400).json({ message: 'O ambiente_id não pode ser definido como nulo.' });
        }
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const key in camposParaAtualizar) {
            if (['nome', 'marca', 'modelo', 'quantidade_total', 'ambiente_id'].includes(key)) {
                setClauses.push(`${key} = $${paramIndex}`);
                values.push(camposParaAtualizar[key]);
                paramIndex++;
            }
        }
        
        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização.' });
        }
        
        values.push(equipamentoId);

        const query = `
            UPDATE equipamentos
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado para atualizar.' });
        }

        res.status(200).json({
            message: 'Equipamento atualizado com sucesso!',
            equipamento: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}


const delete_ = async (req, res) =>{
    try {
        const { id } = req.params;
        const equipamentoId = parseInt(id, 10);

        const result = await pool.query('DELETE FROM equipamentos WHERE id = $1 RETURNING *', [equipamentoId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado para deletar.' });
        }

        res.status(200).json({
            message: 'Equipamento deletado com sucesso!',
            equipamentoDeletado: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao deletar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}
export default {
    create,
    listAll,
    getById,
    update,
    delete: delete_
};