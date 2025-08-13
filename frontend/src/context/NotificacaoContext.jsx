import React, { createContext, useState, useEffect, useCallback } from 'react';
import socket from '../services/socket.js';

export const NotificacaoContext = createContext();

export const NotificacaoProvider = ({ children }) => {
    const [temNovoCadastro, setTemNovoCadastro] = useState(false);
    const [alertasReserva, setAlertasReserva] = useState(new Set());

    useEffect(() => {
        const handleNovaReserva = (data) => {
            if (data.recurso_tipo === 'ambiente') {
                setAlertasReserva(prevAlertas => new Set(prevAlertas).add(data.recurso_id));
            }
        };

        const handleNovoCadastro = () => {
            console.log("[WebSocket] Evento 'novo_cadastro_pendente' recebido!");
            setTemNovoCadastro(true);
        };

        socket.onAny((eventName, ...args) => {
            console.log(`[WebSocket DEBUG] Evento recebido: "${eventName}" com dados:`, args);
        });

        socket.on('nova_reserva_pendente', handleNovaReserva);
        socket.on('novo_cadastro_pendente', handleNovoCadastro);

        return () => {
            socket.off('nova_reserva_pendente', handleNovaReserva);
            socket.off('novo_cadastro_pendente', handleNovoCadastro);
        };
    }, []);

    const limparAlertaCadastro = () => setTemNovoCadastro(false);
    
    const limparAlertaReserva = useCallback((ambienteId) => {
        setAlertasReserva(prevAlertas => {
            const novosAlertas = new Set(prevAlertas);
            if (novosAlertas.has(ambienteId)) {
                novosAlertas.delete(ambienteId);
                return novosAlertas;
            }
            return prevAlertas; // Retorna o estado anterior se não houver mudança
        });
    }, []);

    const value = {
        temNovoCadastro,
        alertasReserva,
        limparAlertaCadastro,
        limparAlertaReserva
    };

    return (
        <NotificacaoContext.Provider value={value}>
            {children}
        </NotificacaoContext.Provider>
    );
};