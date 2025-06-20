import React, { useEffect, useState } from "react";
import "../styles/employeePayroll.css";

const url: string = "http://localhost:3050"; // Usar la constante URL

interface PayrollRow {
  Month: number;
  Year: number;
  MonthName: string;
  GrossSalary: number;
  TotalDeductions: number;
  NetSalary: number;
}

interface Deduction {
  DeductionType: string;
  isPercentage: boolean;
  Percentage?: number;
  Amount: number;
}

export default function MonthlyPayroll() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [deductions, setDeductions] = useState<Deduction[] | null>(null);

  useEffect(() => {
    const fetchMonthlyPayroll = async () => {
      try {
        const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
        if (!usuarioGuardado.Id) {
          console.error("No se encontró un usuario logueado.");
          alert("No se encontró un usuario logueado.");
          return;
        }

        console.log("Datos enviados al backend:", {
          userId: usuarioGuardado.Id,
          endpoint: `${url}/api/v2/employees/${usuarioGuardado.Id}/payroll/monthly`,
        });

        const response = await fetch(`${url}/api/v2/employees/${usuarioGuardado.Id}/payroll/monthly`, {
          method: "GET",
          headers: {
            "User-Id": usuarioGuardado.Id.toString(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setRows(data.data || []);
      } catch (error) {
        console.error("Error al obtener planillas mensuales:", error);
        alert("Ocurrió un error al intentar obtener las planillas mensuales.");
      }
    };

    fetchMonthlyPayroll();
  }, []);

  const handleShowDeductions = async (month: number, year: number) => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        console.error("No se encontró un usuario logueado.");
        alert("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees/${usuarioGuardado.Id}/payroll/monthly/${year}/${month}/deductions`, {
        method: "GET",
        headers: {
          "User-Id": usuarioGuardado.Id.toString(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDeductions(data.data || []);
    } catch (error) {
      console.error("Error al obtener deducciones:", error);
      alert("Ocurrió un error al intentar obtener las deducciones.");
    }
  };

  return (
    <div className="employee-payroll-container">
      <h2>Planilla Mensual</h2>
      <table className="empleados-tabla">
        <thead>
          <tr>
            <th>Mes/Año</th>
            <th>Salario Bruto</th>
            <th>Deducciones</th>
            <th>Salario Neto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.Month}-${row.Year}`}>
              <td>{row.MonthName} {row.Year}</td>
              <td>₡{row.GrossSalary}</td>
              <td>
                <button onClick={() => handleShowDeductions(row.Month, row.Year)}>
                  ₡{row.TotalDeductions}
                </button>
              </td>
              <td>₡{row.NetSalary}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de deducciones */}
      {deductions && (
        <div className="modal">
          <h3>Deducciones</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Porcentaje</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d, i) => (
                <tr key={i}>
                  <td>{d.DeductionType}</td>
                  <td>{d.isPercentage ? `${d.Percentage}%` : "-"}</td>
                  <td>₡{d.Amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setDeductions(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}