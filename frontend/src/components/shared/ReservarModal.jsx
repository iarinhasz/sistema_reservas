import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import formStyles from '../../styles/Form.module.css';
import modalStyles from '../../styles/modal.module.css';

import Button from './Button';

const gerarHorarios = (inicio = 8, fim = 22) => {
    const horarios = [];
    for (let i = inicio; i < fim; i++) {
        horarios.push(`${String(i).padStart(2, '0')}:00`);
    }
    return horarios;
};

const getTodayString = () => new Date().toISOString().split('T')[0];


const ReservarModal = ({ recurso, onClose, onSuccess }) => {
    const { user } = useAuth(); // Pegamos o usuário para saber se é admin
    const [titulo, setTitulo] = useState('');
    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    const [reservasDoDia, setReservasDoDia] = useState([]);
    const [horariosInicioDisponiveis, setHorariosInicioDisponiveis] = useState([]);
    const [horariosFimDisponiveis, setHorariosFimDisponiveis] = useState([]);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedDate) {
            setReservasDoDia([]);
            return;
        }
        const fetchReservasDoDia = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await api.get(`/reservas?recurso_id=${recurso.id}&recurso_tipo=${recurso.recurso_tipo}&data=${selectedDate}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setReservasDoDia(response.data.data || []);
            } catch (err) {
                setError('Erro ao buscar agenda para esta data.');
            } finally {
                setLoading(false);
            }
        };
        fetchReservasDoDia();
    }, [selectedDate, recurso.id, recurso.recurso_tipo]);


    useEffect(() => {
        if (!selectedDate) return;

        const todosHorarios = gerarHorarios();
        const horariosOcupados = reservasDoDia.flatMap(reserva => {
            const inicio = new Date(reserva.data_inicio).getHours();
            const fim = new Date(reserva.data_fim).getHours();
            const horarios = [];
            for (let i = inicio; i < fim; i++) {
                horarios.push(`${String(i).padStart(2, '0')}:00`);
            }
            return horarios;
        });

        const hojeString = getTodayString();
        const horaAtual = new Date().getHours();

        const disponiveis = todosHorarios.filter(h => {
            // Regra 1: O horário não pode estar ocupado
            const horarioJaOcupado = horariosOcupados.includes(h);
            if (horarioJaOcupado) return false;
            
            // Regra 2: Se a data selecionada for hoje, o horário não pode ter passado
            if (selectedDate === hojeString) {
                const horaDoSlot = parseInt(h.split(':')[0]);
                // A hora do slot deve ser MAIOR OU IGUAL à hora atual
                return horaDoSlot >= horaAtual;
            }
            
            // Se for uma data futura, o horário é válido
            return true;
        });

        setHorariosInicioDisponiveis(disponiveis);
        setStartTime('');
        setEndTime('');
    }, [reservasDoDia, selectedDate]);

    useEffect(() => {
        if (!startTime) {
            setHorariosFimDisponiveis([]);
            return;
        }
        // Gera horários a partir da hora seguinte à hora de início
        const todosHorariosFim = gerarHorarios(parseInt(startTime.split(':')[0]) + 1, 23);
        
        // Encontra o início da próxima reserva já agendada
        const proximaReserva = reservasDoDia
            .map(r => new Date(r.data_inicio).getHours())
            .filter(h => h > parseInt(startTime.split(':')[0]))
            .sort((a, b) => a - b)[0];
        
        // O limite para o fim da reserva é o início da próxima ou o final do dia
        const limite = proximaReserva || 22;
        
        const disponiveis = todosHorariosFim.filter(h => parseInt(h.split(':')[0]) <= limite);
        setHorariosFimDisponiveis(disponiveis);
        setEndTime('');
    }, [startTime, reservasDoDia]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!titulo || !selectedDate || !startTime || !endTime) {
            setError('Todos os campos são obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            const data_inicio = new Date(`${selectedDate}T${startTime}:00`).toISOString();
            const data_fim = new Date(`${selectedDate}T${endTime}:00`).toISOString();
            const reservaData = { 
                recurso_id: recurso.id, 
                recurso_tipo: recurso.recurso_tipo, 
                titulo, data_inicio, data_fim 
            };
            
            // O endpoint muda se o usuário for admin
            const endpoint = user?.tipo === 'admin' ? '/reservas/admin-create' : '/reservas';
            await api.post(endpoint, reservaData);

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar a reserva.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={modalStyles.modalBackdrop} onClick={onClose}>
            <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={modalStyles.modalHeader}>
                    <h2>Fazer Reserva para: {recurso.identificacao}</h2>
                    <button onClick={onClose} className={modalStyles.closeButton}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="titulo">Título da Reserva</label>
                        <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
                    </div>
                    <div className={modalStyles.timeGrid}>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="data">Dia</label>
                            <input
                                type="date"
                                id="data"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={getTodayString()}
                                required
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="startTime">Início</label>
                            <select id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                                <option value="" disabled>Selecione</option>
                                {horariosInicioDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="endTime">Fim</label>
                            <select id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required disabled={!startTime}>
                                <option value="" disabled>Selecione</option>
                                {horariosFimDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {error && <p className={formStyles.error}>{error}</p>}
                    
                    <div className={modalStyles.modalActions}>
                        <Button type="button" onClick={onClose} variant="cancel">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} variant="primary">
                            {loading ? 'Reservando...' : 'Confirmar Reserva'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservarModal;