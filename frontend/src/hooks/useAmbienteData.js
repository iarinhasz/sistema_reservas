import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAmbienteData = (id) => {
    const [ambiente, setAmbiente] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    const [solicitacoesReserva, setSolicitacoesReserva] = useState([]);
    const [agendaReservas, setAgendaReservas] = useState([]); // NOVO ESTADO PARA A AGENDA
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Adicionamos uma nova chamada para buscar TODAS as reservas do ambiente
                const [ambienteRes, equipamentosRes, solicitacoesRes, agendaRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/equipamentos?ambienteId=${id}`),
                    api.get(`/reservas?recurso_id=${id}&recurso_tipo=ambiente&status=pendente`),
                    api.get(`/reservas?recurso_id=${id}&recurso_tipo=ambiente`) // Busca todas
                ]);
                setAmbiente(ambienteRes.data);
                setEquipamentos(equipamentosRes.data);
                setSolicitacoesReserva(solicitacoesRes.data || []);
                setAgendaReservas(agendaRes.data || []); // Salva as reservas da agenda
                setError('');
            } catch (err) {
                setError('Falha ao carregar dados. Verifique se o ambiente existe.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, refreshKey]);

    const refreshData = () => setRefreshKey(prev => prev + 1);

    return { 
        ambiente, equipamentos, solicitacoesReserva, agendaReservas, loading, error, refreshData,
        setAmbiente, setEquipamentos
    };
};