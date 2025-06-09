import React, { useEffect, useState } from "react";
import "./employeePayroll.css";

interface WeeklyPayrollProps {
  userId: number;
}

interface PayrollRow {
  WeekId: number;
  StartDate: string;
  EndDate: string;
  GrossSalary: number;
  TotalDeductions: number;
  NetSalary: number;
  OrdinaryHours: number;
  NormalExtraHours: number;
  DobleExtraHours: number;
}

interface Deduction {
  DeductionType: string;
  isPercentage: boolean;
  Percentage?: number;
  Amount: number;
}

interface GrossDetail {
  Date: string;
  EntryTime: string;
  ExitTime: string;
  OrdinaryHours: number;
  OrdinaryAmount: number;
  NormalExtraHours: number;
  NormalExtraAmount: number;
  DoubleExtraHours: number;
  DoubleExtraAmount: number;
  DayTotal: number;
}

export default function WeeklyPayroll({ userId }: WeeklyPayrollProps) {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [deductions, setDeductions] = useState<Deduction[] | null>(null);
  const [grossDetail, setGrossDetail] = useState<GrossDetail[] | null>(null);

  useEffect(() => {
    fetch(`/api/v2/employees/${userId}/payroll/weekly/`)
      .then(res => res.json())
      .then(data => setRows(data.data || []));
  }, [userId]);

  const handleShowDeductions = (weekId: number) => {
    fetch(`/api/v2/employees/${userId}/payroll/weekly/${weekId}/deductions`)
      .then(res => res.json())
      .then(data => setDeductions(data.data || []));
  };

  const handleShowGrossDetail = (weekId: number) => {
    fetch(`/api/v2/employees/${userId}/payroll/weekly/${weekId}/gross-detail`)
      .then(res => res.json())
      .then(data => setGrossDetail(data.data || []));
  };

  return (
    <div className="employee-payroll-container">
      <h2>Planilla Semanal</h2>
      <table className="empleados-tabla">
        <thead>
          <tr>
            <th>Semana</th>
            <th>Salario Bruto</th>
            <th>Deducciones</th>
            <th>Salario Neto</th>
            <th>Horas Ordinarias</th>
            <th>Horas Extra (1.5x)</th>
            <th>Horas Extra (2.0x)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.WeekId}>
              <td>{row.StartDate} - {row.EndDate}</td>
              <td>
                <button onClick={() => handleShowGrossDetail(row.WeekId)}>
                  ₡{row.GrossSalary}
                </button>
              </td>
              <td>
                <button onClick={() => handleShowDeductions(row.WeekId)}>
                  ₡{row.TotalDeductions}
                </button>
              </td>
              <td>₡{row.NetSalary}</td>
              <td>{row.OrdinaryHours}</td>
              <td>{row.NormalExtraHours}</td>
              <td>{row.DobleExtraHours}</td>
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

      {/* Modal de detalle bruto */}
      {grossDetail && (
        <div className="modal">
          <h3>Detalle Diario</h3>
          <table>
            <thead>
              <tr>
                <th>Día</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Horas Ordinarias</th>
                <th>Monto Ordinario</th>
                <th>Horas Extra (1.5x)</th>
                <th>Monto Extra (1.5x)</th>
                <th>Horas Extra (2.0x)</th>
                <th>Monto Extra (2.0x)</th>
                <th>Total Día</th>
              </tr>
            </thead>
            <tbody>
              {grossDetail.map((d, i) => (
                <tr key={i}>
                  <td>{d.Date}</td>
                  <td>{d.EntryTime}</td>
                  <td>{d.ExitTime}</td>
                  <td>{d.OrdinaryHours}</td>
                  <td>₡{d.OrdinaryAmount}</td>
                  <td>{d.NormalExtraHours}</td>
                  <td>₡{d.NormalExtraAmount}</td>
                  <td>{d.DoubleExtraHours}</td>
                  <td>₡{d.DoubleExtraAmount}</td>
                  <td>₡{d.DayTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setGrossDetail(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}