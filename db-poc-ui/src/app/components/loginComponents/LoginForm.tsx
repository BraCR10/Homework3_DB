"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from './InputField';
import LoginMessage from './LoginMessage';
import '../../styles/login.css';
const url: string = "http://localhost:3050";

const LoginForm = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const router = useRouter(); // Hook para manejar la navegación

  //maneja el envio del formulario del login
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
        console.log('Respuesta del servidor:', data); //borrar
        //guardar información del usuario que inició sesión
        const usuarioLogueado = { Username: usuario, Id: data.Id }; // Usa la variable 'usuario' correctamente
        localStorage.setItem("usuario", JSON.stringify(usuarioLogueado));
        router.push('/employee'); // Redirige al usuario a la página de empleados
      } 
      else if (response.status === 401) {
        const errorData = await response.json();
        setMensaje(`❌ ${errorData.error.detail}`);
      } 
      else {
        setMensaje('❌ Ha ocurrido un error inesperado');
      }
    } 
    catch (error) {
        console.error('Error al realizar la solicitud:', error); //borrar
        setMensaje('❌ No se pudo conectar con el servidor');
        }
    };


  return (
    //contenedor del login
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}> {/*Formulario por llenar*/}

        {/*TextBox del usuario*/}
        <InputField
          label="Usuario:"
          type="text"
          value={usuario}
          onChange={(e) => { //Cada vez que se escribe en el input, se actualiza la constante "usuario"
            setUsuario(e.target.value);
            setMensaje('');
          }}
          requiredMessage="Este campo es obligatorio."
        />

        {/*TextBox de la contraseña*/}
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

        {/*Boton de Entrar*/}
        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>

      {/*Mensaje de respuesta*/}
      <LoginMessage mensaje={mensaje} />
    </div>
  );
};

export default LoginForm;