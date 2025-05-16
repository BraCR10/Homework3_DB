"use client";

import React from 'react';

//se define la estructura del objeto InputFieldProps con sus propiedades
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  //onChange: Manejador de eventos que se ejecuta cada vez que se cambia el valor del input
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //void significa que no retorna nada, solo ejecuta alguna accion
  requiredMessage: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, requiredMessage }) => {
  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required //quiere decir que el campo sea obligatorio
        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(requiredMessage)} // Mensaje al no ingresar nada en el inputfield
        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')} // Limpia el mensaje de error al escribir
        className="login-input" //le asigna los estilos de esa clase del css
      />
    </div>
  );
};

export default InputField;