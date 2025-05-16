import ErrorResponseDTO from "./ErrorResponseDTO";

export interface PuestosStatsDTO {
  Nombre: string;
  SalarioXHora: number;
  CantEmpleados: number;
  GastoTotal: number;
}
export interface GetStatsSuccessResponseDTO {
  success: boolean;
  data: {
    totalPuestos: number;
    totalEmpleados: number;
    totalGasto: number;
    fecha: Date;
    puestos: PuestosStatsDTO[];
  };
}

export interface StatsErrorResponseDTO extends ErrorResponseDTO {}
