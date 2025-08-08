import { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from '../css/ReservarModal.module.css';

const gerarHorarios = (inicio = 8, fim = 22, intervalo = 60) => {
    const horarios = [];
    for (let i = inicio; i < fim; i++) {
        horarios.push(`${String(i).padStart(2, '0')}:00`);
    }
    return horarios;
};

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses são de 0 a 11
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ReservarModal = ({ recurso, user,onClose, onSuccess }) => {
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
        const disponiveis = todosHorarios.filter(h => !horariosOcupados.includes(h));
        setHorariosInicioDisponiveis(disponiveis);
        setStartTime('');
        setEndTime('');
    }, [reservasDoDia, selectedDate]);

    useEffect(() => {
        if (!startTime) {
            setHorariosFimDisponiveis([]);
            return;
        }
        const todosHorarios = gerarHorarios(parseInt(startTime.split(':')[0]) + 1, 23);
        const proximaReserva = reservasDoDia
            .map(r => new Date(r.data_inicio).getHours())
            .filter(h => h > parseInt(startTime.split(':')[0]))
            .sort((a, b) => a - b)[0];
        const limite = proximaReserva || 22;
        const disponiveis = todosHorarios.filter(h => parseInt(h.split(':')[0]) <= limite);
        setHorariosFimDisponiveis(disponiveis);
        setEndTime('');
    }, [startTime, reservasDoDia]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!titulo || !selectedDate || !startTime || !endTime) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setLoading(true);
        try {
            const data_inicio = new Date(`${selectedDate}T${startTime}:00`).toISOString();
            const data_fim = new Date(`${selectedDate}T${endTime}:00`).toISOString();
            
            const reservaData = { 
                recurso_id: recurso.id, 
                recurso_tipo: recurso.recurso_tipo, 
                titulo, 
                data_inicio, 
                data_fim 
            };
            let endpoint = '/reservas/'; // Rota padrão para usuários
            if (user && user.tipo === 'admin') {
                endpoint = '/reservas/admin-create'; // Rota especial para admins
            }
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
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Fazer Reserva para: {recurso.nome || recurso.identificacao}</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="titulo">Título da Reserva</label>
                        <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
                    </div>
                    <div className={styles.timeGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="data">Dia</label>
                            <input type="date" id="data" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="startTime">Horário de Início</label>
                            <select id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required disabled={horariosInicioDisponiveis.length === 0}>
                                <option value="" disabled>Selecione</option>
                                {horariosInicioDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="endTime">Horário de Fim</label>
                            <select id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required disabled={horariosFimDisponiveis.length === 0}>
                                <option value="" disabled>Selecione</option>
                                {horariosFimDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.confirmButton} disabled={loading}>
                            {loading ? 'Reservando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservarModal;