"use client";
import React, { useState } from 'react';
import InputField from './InputField';
import LoginMessage from './LoginMessage';
import '../../styles/login.css';
const url: string = "http://localhost:3050";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${url}/api/v2/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: usuario,
          Password: contrasena,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.loginStatus) {
          localStorage.setItem("usuario", JSON.stringify({
            Id: data.data.loginStatus.Id,
            Username: data.data.loginStatus.Username,
            Role: data.data.loginStatus.Role,
          }));
          const role = data.data.loginStatus.Role;
          if (role === "Administrador") {
            router.push("/employee"); // Redirige al panel de empleados
          } else if (role === "Empleado") {
            router.push("/payroll"); // Redirige al panel de nómina
          }
        } else {
          setMensaje('❌ Respuesta inesperada del servidor');
        }
      } else if (response.status === 401) {
        const errorData = await response.json();
        setMensaje(`❌ ${errorData.error.detail}`);
      } else {
        setMensaje('❌ Ha ocurrido un error inesperado');
      }
    } catch (error) {
      console.error(error);
      setMensaje('❌ No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="login-outer-container">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <InputField
            label="Usuario:"
            type="text"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              setMensaje('');
            }}
            requiredMessage="Este campo es obligatorio."
          />
          <InputField
            label="Contraseña:"
            type="password"
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              setMensaje('');
            }}
            requiredMessage="Este campo es obligatorio."
          />
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
        <LoginMessage mensaje={mensaje} />
      </div>
    </div>
  );
};

export default LoginForm;