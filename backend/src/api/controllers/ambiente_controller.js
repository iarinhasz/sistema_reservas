import pool from '../../config/database.js';

const listAll = async (req, res) => {
    try {
    const { rows } = await pool.query('SELECT * FROM ambientes ORDER BY identificacao');
    
    // Se a consulta for bem-sucedida, retorna os ambientes em formato JSON
    res.status(200).json(rows);

    } catch (error) {
    // Se ocorrer qualquer erro na consulta, logamos no console para debug
    console.error('Erro ao listar ambientes:', error);
    // E retornamos uma mensagem de erro genérica para o cliente
    res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

// Função para CRIAR um novo ambiente
const create = async (req, res) => {
    try {
    // Pegamos os dados do novo ambiente do corpo (body) da requisição
    const { identificacao, tipo, status } = req.body;

    // Verificação simples para garantir que a identificação foi enviada
    if (!identificacao) {
        return res.status(400).json({ message: 'O campo "identificacao" é obrigatório.' });
    }

    // Query SQL para inserir um novo ambiente.
    // Usamos $1, $2, $3 para evitar SQL Injection. É uma prática de segurança essencial!
    const query = 'INSERT INTO ambientes (identificacao, tipo, status) VALUES ($1, $2, $3) RETURNING *';
    const values = [identificacao, tipo, status || 'Disponível']; // Usa 'Disponível' se o status não for enviado

    const { rows } = await pool.query(query, values);

    // Retorna o novo ambiente criado com o status 201 (Created)
    res.status(201).json(rows[0]);

    } catch (error) {
    console.error('Erro ao criar ambiente:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

//atualizar um ambiente
const update = async (req, res) => {
    try{
    //identificar qual ambiente será atualizado (id)
    const {id} = req.params;

    //converter id p inteiro
    const ambienteId = parseInt(id, 10);

    const existingAmbiente = await pool.query('SELECT * FROM ambientes WHERE id = $1', [ambienteId]);
    
    const{identificacao, tipo, status} = req.body;

    //id existe?
    if (existingAmbiente.rowCount === 0) {
        return res.status(404).json({ message: 'Ambiente não encontrado.' });
    }

    // Query SQL para atualizar o ambiente.
    //coalesce -> mantem o valor anntigo se o novo nao for fornecido
    const query = `UPDATE ambientes
                    SET
                        identificacao = COALESCE($1, identificacao),
                        tipo = COALESCE($2, tipo),
                        status = COALESCE($3, status)
                    WHERE id = $4
                    RETURNING *;`;
                
    const values = [
        identificacao || null,
        tipo || null,
        status || null,
        ambienteId
    ];
    const result = await pool.query(query, values);

    //atualizado
    res.status(200).json({
        message: 'Ambiente atualizado com sucesso!',
        ambiente: result.rows[0]
    });


    } catch(error){
        console.error('Erro ao atualizar ambiente:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};
const getById = async (req, res) => {
    try{const { id } = req.params;
    
    const ambienteId = parseInt(id, 10);
    
    const result = await pool.query('SELECT * FROM ambientes WHERE id = $1', [ambienteId]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Ambiente não encontrado.' });
    }
    
    res.status(200).json(result.rows[0]);

    } catch{
        console.error('Erro ao buscar ambiente por ID:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const delete_ = async (req, res) => {
    try{
        const { id } = req.params;
        const ambienteId = parseInt(id, 10);

        const result = await pool.query('DELETE FROM ambientes WHERE id = $1 RETURNING *', [ambienteId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ambiente não encontrado para deletar.' });
        }

        res.status(200).json({
            message: 'Ambiente deletado com sucesso!',
            ambienteDeletado: result.rows[0]
        });
    }catch{
        console.error('Erro ao deletar ambiente:', error);
        if (error.code === '23503') { // Código de erro do PostgreSQL para violação de chave estrangeira
            return res.status(409).json({ message: 'Não é possível deletar este ambiente pois ele possui equipamentos ou reservas associadas.' });
            }
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};
export default {
    create,
    listAll,
    getById,
    update,
    delete: delete_,
};
