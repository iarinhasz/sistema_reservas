
import { beforeEach, describe, expect, jest, test } from '@jest/globals';


jest.unstable_mockModule('../../models/ambiente.model.js', () => ({
    default: {
        findByIdentificador: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
    },
}));

jest.unstable_mockModule('../../models/reserva.model.js', () => ({
    default: {
        findFutureByResourceId: jest.fn(),
    },
}));

describe('AmbienteService', () => {
    let AmbienteService;
    let AmbienteModel;
    let ReservaModel;

    beforeEach(async () => {
        AmbienteService = (await import('../ambiente.service.js')).default;
        AmbienteModel = (await import('../../models/ambiente.model.js')).default;
        ReservaModel = (await import('../../models/reserva.model.js')).default;
        
        jest.clearAllMocks();
    });


    describe('Create', () => {
        test('deve criar um ambiente com sucesso quando os dados são válidos', async () => {
            const dadosNovoAmbiente = { tipo: 'Laboratório', identificacao: 'Lab 2' };
            AmbienteModel.findByIdentificador.mockResolvedValue(null);
            AmbienteModel.create.mockResolvedValue({ id: 1, ...dadosNovoAmbiente });

            const resultado = await AmbienteService.create(dadosNovoAmbiente);

            expect(resultado).toBeDefined();
            expect(resultado.identificacao).toBe('Lab 2');
            expect(AmbienteModel.create).toHaveBeenCalledWith(dadosNovoAmbiente);
        });

        test('deve lançar um erro ao tentar criar um ambiente com identificador duplicado', async () => {
            const dadosAmbienteDuplicado = { tipo: 'Laboratório', identificacao: 'Lab 2' };
            AmbienteModel.findByIdentificador.mockResolvedValue({ id: 1, identificacao: 'Lab 2' });
            
            await expect(AmbienteService.create(dadosAmbienteDuplicado))
                .rejects
                .toThrow('Identificador já cadastrado');
        });
    });

    //update
    describe('Update', () => {
        test('deve atualizar um ambiente com sucesso', async () => {
            const ambienteId = 1;
            const dadosUpdate = { identificacao: 'Laboratório de Robótica' };
            const ambienteAtualizado = { id: ambienteId, ...dadosUpdate };
            // Simula que o ambiente a ser atualizado existe
            AmbienteModel.findById.mockResolvedValue({ id: ambienteId, identificacao: 'Lab Antigo' });
            // Simula que não há conflito de identificador
            AmbienteModel.findByIdentificador.mockResolvedValue(null);
            // Simula o retorno do model de update
            AmbienteModel.update.mockResolvedValue(ambienteAtualizado);
            
            const resultado = await AmbienteService.update(ambienteId, dadosUpdate);

            expect(resultado.identificacao).toBe('Laboratório de Robótica');
            expect(AmbienteModel.update).toHaveBeenCalledWith(ambienteId, dadosUpdate);
        });

        test('deve lançar um erro ao tentar atualizar para um identificador que já existe', async () => {
            const ambienteId = 1; // ID do ambiente que estamos tentando editar
            const dadosUpdate = { identificacao: 'Lab Conflitante' };
            const ambienteConflitante = { id: 2, identificacao: 'Lab Conflitante' }; // Outro ambiente já tem esse nome

            // Simula que o ambiente a ser atualizado existe
            AmbienteModel.findById.mockResolvedValue({ id: ambienteId, identificacao: 'Lab Original' });
    
            AmbienteModel.findByIdentificador.mockResolvedValue(ambienteConflitante);

            await expect(AmbienteService.update(ambienteId, dadosUpdate))
                .rejects
                .toThrow("Identificador já cadastrado em outro ambiente.");
        });
    });

    //teste para delete
    describe('Delete', () => {
        test('deve deletar um ambiente com sucesso quando não há reservas futuras', async () => {
            // Arrange
            const ambienteId = 1;
            // Simula que o ambiente a ser deletado existe
            AmbienteModel.findById.mockResolvedValue({ id: ambienteId, identificacao: 'Lab Antigo' });
            // Simula que a busca por reservas futuras retorna um array vazio
            ReservaModel.findFutureByResourceId.mockResolvedValue([]);
            // Simula que a remoção no model funciona
            AmbienteModel.remove.mockResolvedValue({ id: ambienteId, identificacao: 'Lab Antigo' });

            // Act
            await AmbienteService.delete(ambienteId);

            // Assert
            expect(AmbienteModel.remove).toHaveBeenCalledWith(ambienteId);
        });
        test('deve lançar um erro ao tentar deletar um ambiente que possui reservas futuras', async () => {
            const ambienteId = 1;
            // Simula que o ambiente a ser deletado existe
            AmbienteModel.findById.mockResolvedValue({ id: ambienteId, identificacao: 'Lab Com Reserva' });
            ReservaModel.findFutureByResourceId.mockResolvedValue([{ id: 100, data_inicio: '2025-10-10' }]);

            await expect(AmbienteService.delete(ambienteId))
            .rejects
            .toThrow('Não é possível excluir um espaço com reservas futuras');
        });
    });
    describe('Read', () => {
        test('findAll deve retornar uma lista de todos os ambientes', async () => {
            // Arrange
            const listaDeAmbientes = [{ id: 1, identificacao: 'Lab 1' }, { id: 2, identificacao: 'Auditório' }];
            AmbienteModel.findAll.mockResolvedValue(listaDeAmbientes);

            // Act
            const resultado = await AmbienteService.findAll();

            // Assert
            expect(resultado).toEqual(listaDeAmbientes);
            expect(resultado.length).toBe(2);
            expect(AmbienteModel.findAll).toHaveBeenCalledTimes(1);
        });
        test('findAll deve retornar apenas ambientes quando um filtro de tipo é aplicado', async () => {
            const filtro = { tipo: 'sala' };
            const listaDeSalas = [{ id: 1, identificacao: 'S1', tipo: 'sala' }];
            AmbienteModel.findAll.mockResolvedValue(listaDeSalas);

            const resultado = await AmbienteService.findAll(filtro);

            expect(resultado).toEqual(listaDeSalas);
            expect(AmbienteModel.findAll).toHaveBeenCalledWith(filtro);
        });
        test('findById deve retornar um único ambiente', async () => {
            // Arrange
            const ambiente = { id: 1, identificacao: 'Lab 1' };
            AmbienteModel.findById.mockResolvedValue(ambiente);

            // Act
            const resultado = await AmbienteService.findById(1);

            // Assert
            expect(resultado).toEqual(ambiente);
            expect(AmbienteModel.findById).toHaveBeenCalledWith(1);
        });
    });
});