//Descripción: componente para el filtro de los empleados

"use client";

import React from 'react';

interface FilterBarProps {
  filtro: string;
  setFiltro: React.Dispatch<React.SetStateAction<string>>;
  aplicarFiltro: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filtro, setFiltro, aplicarFiltro }) => {
  return (
    <div className="filtro-container">
      <input
        type="text"
        placeholder="Filtrar por nombre"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="filtro-input"
      />
      <button onClick={aplicarFiltro} className="filtro-boton">
        Aplicar Filtro
      </button>
    </div>
  );
};

export default FilterBar;