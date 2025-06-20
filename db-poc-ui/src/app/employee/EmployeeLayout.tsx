import React, { ReactNode } from "react";
import "../styles/employeeLayout.css";

interface EmployeeLayoutProps {
  children: [ReactNode, ReactNode]; // Espera dos hijos: semanal y mensual
  onLogout: () => void;
}

export default function EmployeeLayout({ children, onLogout }: EmployeeLayoutProps) {
  const [selected, setSelected] = React.useState<"weekly" | "monthly">("weekly");

  return (
    <div className="employee-layout">
      <nav className="employee-nav">
        <button
          className={selected === "weekly" ? "active" : ""}
          onClick={() => setSelected("weekly")}
        >
          Planilla Semanal
        </button>
        <button
          className={selected === "monthly" ? "active" : ""}
          onClick={() => setSelected("monthly")}
        >
          Planilla Mensual
        </button>
        <button className="logout-btn" onClick={onLogout}>Salir</button>
      </nav>
      <main className="employee-main">
        {selected === "weekly" ? children[0] : children[1]}
      </main>
    </div>
  );
}