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

        const values = [nome, marca, modelo, quantidade_total, ambiente_id || null];

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

    } catch{

    }
}

const getById = async(req, res)=>{

}

const update = async (req, res)=>{

}


const delete_ = async (req, res) =>{
    
}
export default {
    create,
    listAll,
    getById,
    update,
    delete: delete_
};