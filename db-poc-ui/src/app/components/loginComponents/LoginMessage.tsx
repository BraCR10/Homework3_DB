"use client";

import React from 'react';

//se define la estructura del objeto LoginMessageProps con sus propiedades
interface LoginMessageProps {
  mensaje: string;
}

const LoginMessage: React.FC<LoginMessageProps> = ({ mensaje }) => {
  return mensaje ? <p className="login-message-error">{mensaje}</p> : null;
};

export default LoginMessage;