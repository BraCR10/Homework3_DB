import React, { useEffect, useState } from "react";
import "./employeePayroll.css";

const url: string = "http://localhost:3050";

interface PayrollRow {
  WeekId: number;
  StartDate: string;
  EndDate: string;
  GrossSalary: number;
  TotalDeductions: number;
  NetSalary: number;
  OrdinaryHours: number;
  NormalExtraHours: number;
  DoubleExtraHours: number;
}

interface Deduction {
  DeductionType: string;
  isPercentage: boolean;
  Percentage?: number;
  Amount: number;
}

interface GrossDetail {
  DateDay: string;
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

export default function WeeklyPayroll() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [deductions, setDeductions] = useState<Deduction[] | null>(null);
  const [grossDetail, setGrossDetail] = useState<GrossDetail[] | null>(null);
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    const fetchWeeklyPayroll = async () => {
      try {
        if (!usuarioGuardado.Id) {
          console.error("No se encontró un usuario logueado.");
          alert("No se encontró un usuario logueado.");
          return;
        }

        console.log("Datos enviados al backend:", {
          userId: usuarioGuardado.Id,
          endpoint: `${url}/api/v2/employees/${usuarioGuardado.Id}/payroll/weekly/`,
        });
        const employeeId = Number(usuarioGuardado.Id);
        const response = await fetch(`${url}/api/v2/employees/${employeeId}/payroll/weekly/`, {
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
        console.error("Error al obtener planillas semanales:", error);
        alert("Ocurrió un error al intentar obtener las planillas semanales.");
      }
    };

    fetchWeeklyPayroll();
  });

  const handleShowDeductions = async (weekId: number) => {
    try {
      const response = await fetch(`${url}/api/v2/employees/${usuarioGuardado.Id}/payroll/weekly/${weekId}/deductions`, {
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

  const handleShowGrossDetail = async (weekId: number) => {
    try {
      const response = await fetch(`${url}/api/v2/employees/${usuarioGuardado.Id}/payroll/weekly/${weekId}/gross-detail`, {
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
      setGrossDetail(data.data || []);
    } catch (error) {
      console.error("Error al obtener detalle bruto:", error);
      alert("Ocurrió un error al intentar obtener el detalle bruto.");
    }
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>No se encontraron planillas semanales.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.WeekId}>
                <td>
                  {/* Formatear las fechas antes de mostrarlas */}
                  {new Date(row.StartDate).toLocaleDateString()} - {new Date(row.EndDate).toLocaleDateString()}
                </td>
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
                <td>{row.DoubleExtraHours}</td>
              </tr>
            ))
          )}
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
                  <td>{d.DateDay}</td>
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