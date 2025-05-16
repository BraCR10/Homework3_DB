-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Santiago Valverde>
-- Create date: <19/04/2025>
-- Description:	<Listar movimientos>
-- =============================================
CREATE PROCEDURE [dbo].[sp_listar_movimientos]
(
    @inValorDocumentoIdentidad VARCHAR(16),
    @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY

    DECLARE @empleadoId INT;

    -- Validar que el empleado existe y está activo
    SELECT @empleadoId = Id
    FROM dbo.Empleado 
    WHERE ValorDocumentoIdentidad = @inValorDocumentoIdentidad AND EsActivo = 1;

    SELECT 
		-- Información general del empleado
        E.Id AS IdEmpleado,
        E.IdPuesto,
        E.ValorDocumentoIdentidad,
        E.Nombre,
        E.FechaContratacion,
        E.SaldoVacaciones,
        E.EsActivo,
		P.Nombre AS NombrePuesto,
		-- Movimientos del empleado, ordenados por fecha descendente
		TM.Id AS IdTipoMovimiento,
		TM.Nombre AS NombreTipoMovimiento,
		M.Id ,
        M.Fecha,
        M.Monto,
        M.NuevoSaldo,
        M.IdPostByUser,
        U.Username AS UsuarioPostByUser,
        M.PostInIP,
        M.PostTime
    FROM 
        dbo.Movimiento M
        INNER JOIN dbo.TipoMovimiento TM ON M.IdTipoMovimiento = TM.Id
        INNER JOIN dbo.Usuario U ON M.IdEmpleado  = U.Id
		INNER JOIN dbo.Empleado E ON M.IdEmpleado  = E.Id
		INNER JOIN dbo.Puesto P ON M.IdEmpleado  = P.Id
    WHERE 
        M.IdEmpleado = @empleadoId
    ORDER BY 
        M.Fecha DESC;

    SET @outResultCode = 0;

  END TRY
  BEGIN CATCH
      SET @outResultCode = 50008; -- Error: Empleado no existe o está inactivo

      INSERT INTO dbo.DBError (
                UserName
                , Number
                , Estado
                , Severidad
                , Linea
                , ProcedureError
                , Mensaje
				, FechaHora
            )
            VALUES (
                SUSER_NAME()
                , ERROR_NUMBER()
                , ERROR_STATE()
                , ERROR_SEVERITY()
                , ERROR_LINE()
                , ERROR_PROCEDURE()
                , ERROR_MESSAGE()
				, GETDATE()
            );

      SELECT Descripcion AS detail
      FROM dbo.Error
      WHERE Codigo = @outResultCode;

      RETURN;
  END CATCH
  SET NOCOUNT OFF;
END
GO