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

interface MonthlyPayrollProps {
  userId: number; // ID del usuario impersonado
}

export default function MonthlyPayroll({ userId }: MonthlyPayrollProps) {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [deductions, setDeductions] = useState<Deduction[] | null>(null);

  useEffect(() => {
    const fetchMonthlyPayroll = async () => {
      try {
        const response = await fetch(`${url}/api/v2/employees/${userId}/payroll/monthly`, {
          method: "GET",
          headers: {
            "User-Id": userId.toString(),
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
  }, [userId]); // Dependencia en userId para actualizar los datos al cambiar de empleado

  const handleShowDeductions = async (month: number, year: number) => {
    try {
      const response = await fetch(`${url}/api/v2/employees/${userId}/payroll/monthly/${year}/${month}/deductions`, {
        method: "GET",
        headers: {
          "User-Id": userId.toString(),
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