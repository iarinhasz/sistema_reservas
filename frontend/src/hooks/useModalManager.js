import { useState } from 'react';

export const useModalManager = () => {
    const [modals, setModals] = useState({
        addEquipamento: false,
        editEquipamento: false,
        editAmbiente: false,
        reservar: false,
    });
    const [currentItem, setCurrentItem] = useState(null);

    const openModal = (modalName, item = null) => {
        setModals(prev => ({ ...prev, [modalName]: true }));
        if (item) setCurrentItem(item);
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
        setCurrentItem(null);
    };

    return { modals, currentItem, openModal, closeModal };
};