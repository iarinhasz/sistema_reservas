import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    icon: Icon, // Prop para receber um componente de ícone
    as: Component = 'button',
    ...props
}) => {

    const combinedClassName = [
        styles.button,
        styles[variant] || styles.primary,
        disabled ? styles.disabled : '',
        className
    ].join(' ');

    return (
        <Component
            type={Component === 'button' ? type : undefined}
            onClick={onClick}
            className={combinedClassName}
            disabled={disabled}
            {...props}
        >
            {Icon && <Icon />}
            {children}
        </Component>
    );
};

export default Button;