import React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import socket from '../services/socket.js';
import api from '../services/api.js';


const WEBSOCKETS_ENABLED = true; // Modo padrão: tempo real

const NotificacaoContext = createContext();

export const NotificacaoProvider = ({ children }) => {
    const [hasNewUserRequest, setHasNewUserRequest] = useState(false);
    const [newReservationAlerts, setNewReservationAlerts] = useState(new Set());

    useEffect(() => {
        if (WEBSOCKETS_ENABLED) {
            // --- LÓGICA 1: WEBSOCKET (Push em tempo real) ---
            console.log("Sistema de Notificacoes: Modo WebSocket ativado.");

            const handleNewReservation = (data) => {
                if (data.recurso_tipo === 'ambiente') {
                    setNewReservationAlerts(prev => new Set(prev).add(data.recurso_id));
                }
            };
            const handleNewUser = () => setHasNewUserRequest(true);

            socket.on('nova_reserva_pendente', handleNewReservation);
            socket.on('novo_cadastro_pendente', handleNewUser);

            // Função de limpeza para os listeners do socket
            return () => {
                socket.off('nova_reserva_pendente', handleNewReservation);
                socket.off('novo_cadastro_pendente', handleNewUser);
            };

        } else {
            // --- LÓGICA 2: POLLING (Puxa dados periodicamente) ---
            console.log("Sistema de Notificacoes: Modo Polling ativado (verificando a cada 15 segundos).");
            
            const fetchSummary = async () => {
                try {
                    const response = await api.get('/notificacoes/summary');
                    const { hasNewUserRequest, newReservationAlerts } = response.data;
                    setHasNewUserRequest(hasNewUserRequest);
                    setNewReservationAlerts(new Set(newReservationAlerts));
                } catch (error) {
                    console.error("Erro no Polling de notificacoes:", error);
                }
            };

            fetchSummary(); // Executa uma vez imediatamente
            const intervalId = setInterval(fetchSummary, 15000); // E depois a cada 15 segundos

            // Função de limpeza para o intervalo
            return () => clearInterval(intervalId);
        }
    }, []);

    //limpar os alertas
    const clearUserRequestAlert = () => setHasNewUserRequest(false);
    const clearReservationAlert = (ambienteId) => {
        setNewReservationAlerts(prev => {
            const newAlerts = new Set(prev);
            newAlerts.delete(ambienteId);
            return newAlerts;
        });
    };

    const value = { hasNewUserRequest, newReservationAlerts, clearUserRequestAlert, clearReservationAlert };

    return (
        <NotificacaoContext.Provider value={value}>
            {children}
        </NotificacaoContext.Provider>
    );
};

export const useNotificacao = () => {
    return useContext(NotificacaoContext);
};