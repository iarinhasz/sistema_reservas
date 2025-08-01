class AmbienteController{

    constructor(ambienteService) {
        this.ambienteService = ambienteService;
        //this.reservaModel = reservaModel;
    }

    listAll = async(req, res)=>{
        try {
            const filters = req.query;
            const ambientes = await this.ambienteService.findAll(filters);
            res.status(200).json(ambientes);
        } catch (error) {
            console.error('Erro ao listar ambientes:', error.message ,error.stack);
            res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }

    create = async (req, res)=>{
        try {
            const novoAmbiente = await this.ambienteService.create(req.body);
            res.status(201).json({ message: "Ambiente criado com sucesso!", ambiente: novoAmbiente });
        } catch (error) {
            if (error.message === "Identificador já cadastrado") {
                return res.status(409).json({ message: error.message });
            }
            if (error.message === "Identificador obrigatório") {
                return res.status(400).json({ message: error.message });
            }
            console.error('Erro ao criar ambiente:', error);
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }

    getById = async(req, res) =>{
        try {
            const { id } = req.params;
            const ambiente = await this.ambienteService.findById(parseInt(id, 10));
            res.status(200).json(ambiente);
        } catch (error) {
            if (error.message === 'Ambiente não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            console.error('Erro ao buscar ambiente por ID:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    update=async(req, res)=>{
        try {
            const { id } = req.params;
            const ambienteAtualizado = await this.ambienteService.update(parseInt(id, 10), req.body);
            res.status(200).json({
                message: 'Ambiente atualizado com sucesso!',
                ambiente: ambienteAtualizado
            });
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("já cadastrado")) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao atualizar ambiente:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    delete = async (req, res)=>{
        try {
            const { id } = req.params;
            const ambienteDeletado = await this.ambienteService.delete(parseInt(id, 10));
            res.status(200).json({
                message: 'Ambiente deletado com sucesso!',
                ambienteDeletado: ambienteDeletado
            });
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("reservas futuras")) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao deletar ambiente:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}

export default AmbienteController;