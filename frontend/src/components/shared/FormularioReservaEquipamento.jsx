import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './FormularioReservaEquipamento.module.css';
import Button from './Button';

const gerarHorarios = (inicio = 8, fim = 22) => {
    const horarios = [];
    for (let i = inicio; i < fim; i++) {
        horarios.push(`${String(i).padStart(2, '0')}:00`);
    }
    return horarios;
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const FormularioReservaEquipamento = ({ equipamentos, onSuccess }) => {
    const [selectedEquipamentoId, setSelectedEquipamentoId] = useState('');
    const [titulo, setTitulo] = useState('');
    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    const [reservasDoDia, setReservasDoDia] = useState([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedEquipamentoId || !selectedDate) return;

        const fetchReservasDoDia = async () => {
            try {
                const response = await api.get(`/reservas?recurso_id=${selectedEquipamentoId}&recurso_tipo=equipamento&data=${selectedDate}`);
                setReservasDoDia(response.data.data || []);
            } catch (err) {
                console.error('Erro ao buscar agenda do equipamento:', err);
            }
        };
        fetchReservasDoDia();
    }, [selectedEquipamentoId, selectedDate]);

    useEffect(() => {
        if (!selectedEquipamentoId) {
            setHorariosDisponiveis([]);
            return;
        }

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
            if (horariosOcupados.includes(h)) return false;
            if (selectedDate === hojeString && parseInt(h.split(':')[0]) < horaAtual) {
                return false;
            }
            return true;
        });

        setHorariosDisponiveis(disponiveis);
        setStartTime('');
        setEndTime('');
    }, [reservasDoDia, selectedDate, selectedEquipamentoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!titulo || !selectedDate || !startTime || !endTime || !selectedEquipamentoId) {
            setError('Todos os campos são obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            const reservaData = { 
                recurso_id: selectedEquipamentoId, 
                recurso_tipo: 'equipamento', 
                titulo, 
                data_inicio: new Date(`${selectedDate}T${startTime}:00`).toISOString(), 
                data_fim: new Date(`${selectedDate}T${endTime}:00`).toISOString()
            };
            
            await api.post('/reservas', reservaData);
            onSuccess(); // Chama a função de sucesso para refrescar a agenda
            // Limpa o formulário
            setTitulo('');
            setSelectedEquipamentoId('');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar a reserva.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="equipamento">Equipamento</label>
                    <select id="equipamento" value={selectedEquipamentoId} onChange={e => setSelectedEquipamentoId(e.target.value)} required>
                        <option value="" disabled>Selecione um equipamento...</option>
                        {equipamentos.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.nome} (Total: {eq.quantidade_total})</option>
                        ))}
                    </select>
                </div>

                {selectedEquipamentoId && (
                    <>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label htmlFor="titulo">Finalidade da Reserva</label>
                            <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Estudo para a prova de cálculo" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="data">Dia</label>
                            <input type="date" id="data" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={getTodayString()} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="startTime">Início</label>
                            <select id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                                <option value="" disabled>Selecione</option>
                                {horariosDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="endTime">Fim</label>
                            <select id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required>
                                <option value="" disabled>Selecione</option>
                                {horariosDisponiveis.filter(h => h > startTime).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </>
                )}
            </div>
            
            {error && <p className={styles.errorMessage}>{error}</p>}
            
            {selectedEquipamentoId && (
                <div className={styles.actions}>
                    <Button type="submit" disabled={loading} variant="secondary">
                        {loading ? 'A Enviar...' : 'Solicitar Reserva de Equipamento'}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default FormularioReservaEquipamento;
