"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const url: string = "http://localhost:3050";

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null); // Estado para almacenar los datos de la API
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const router = useRouter(); // Inicializar el router
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${url}/api/v2/stats_salaries`);
        if (response.ok) {
          const data = await response.json();
          console.log("Datos de la API:", data.data); // Verificar los datos de la API
          setStats(data.data); // Guardar los datos en el estado
        } else {
          console.error("Error al obtener las estadísticas:", response.status);
          setError("No se pudieron cargar las estadísticas. Inténtalo de nuevo.");
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        setError("Ocurrió un error al intentar cargar las estadísticas.");
      }
    };

    fetchStats();
  }, []);

  // Configuración del gráfico de barras
  const barChartData = stats
  ? {
      labels: stats.puestos.map((puesto: any) => puesto.Nombre), // Nombres de los puestos
      datasets: [
        {
          label: "Gasto Total ($)",
          data: stats.puestos.map((puesto: any) => puesto.GastoTotal), // Gasto total por puesto
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          yAxisID: "y", // Asigna este conjunto de datos al eje Y
        },
        {
          label: "Salario por Hora ($)",
          data: stats.puestos.map((puesto: any) => puesto.SalarioXHora), // Salario por hora
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
          yAxisID: "y1", // Asigna este conjunto de datos al eje Y1
        },
      ],
    }
  : null;
    console.log(barChartData?.datasets)

    const barChartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: "Estadísticas Salariales por Puesto",
          },
        },
        scales: {
          y: {
            beginAtZero: true, // Asegura que el eje Y comience en 0
            position: "left" as const, // Eje para Gasto Total
            title: {
              display: true,
              text: "Gasto Total ($)",
            },
          },
          y1: {
            beginAtZero: true, // Asegura que el eje Y comience en 0
            position: "right" as const, // Eje para Salario por Hora
            grid: {
              drawOnChartArea: false, // Evita que las líneas del eje Y1 se superpongan con las del eje Y
            },
            title: {
              display: true,
              text: "Salario por Hora ($)",
            },
          },
        },
      };

  return (
    <div className="stats-container">
      <h1>Estadísticas Salariales</h1>
      {error && <p className="error-message">{error}</p>}
      {stats ? (
        <div>
          {/* Totales */}
          <div className="totals">
            <p><strong>Total de Puestos:</strong> {stats.totalPuestos}</p>
            <p><strong>Total de Empleados:</strong> {stats.totalEmpleados}</p>
            <p><strong>Total de Gasto Salarial:</strong> ${stats.totalGasto.toFixed(2)}</p>
            <p><strong>Fecha de Actualización:</strong> {new Date(stats.fecha).toLocaleString()}</p>
          </div>

            {/* Botón para regresar */}
          <button
            onClick={() => router.push("/employee")}
            style={{
              display: "block",
              margin: "20px auto",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Regresar a Empleados
          </button>
          {/* Gráfico de Barras */}
          <div
            className="chart-container"
            style={{
                width: "100%",
                maxWidth: "1200px",
                height: "600px",
                margin: "0 auto",
            }}
            >
            {barChartData ? (
                <Bar
                data={barChartData}
                options={barChartOptions}
                width={1200} // Ancho del gráfico
                height={600} // Altura del gráfico
                />
            ) : (
                <p>Cargando gráfico...</p>
            )}
            </div>
        </div>
      ) : (
        <p>Cargando estadísticas...</p>
      )}
    </div>
  );
};

export default StatsPage;