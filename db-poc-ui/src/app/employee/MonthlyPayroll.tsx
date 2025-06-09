import React, { useEffect, useState } from "react";
import "./employeePayroll.css";

interface MonthlyPayrollProps {
  userId: number;
}

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

export default function MonthlyPayroll({ userId }: MonthlyPayrollProps) {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [deductions, setDeductions] = useState<Deduction[] | null>(null);

  useEffect(() => {
    fetch(`/api/v2/employees/${userId}/payroll/monthly`)
      .then(res => res.json())
      .then(data => setRows(data.data || []));
  }, [userId]);

  const handleShowDeductions = (month: number, year: number) => {
    fetch(`/api/v2/employees/${userId}/payroll/monthly/${year}/${month}/deductions`)
      .then(res => res.json())
      .then(data => setDeductions(data.data || []));
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
          {rows.map(row => (
            <tr key={row.Month + "-" + row.Year}>
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