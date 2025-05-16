-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Santiago Valverde>
-- Create date: <19/04/2025>
-- Description:	<Inserta un movimiento>
-- =============================================
CREATE PROCEDURE [sp_insertar_movimiento]
(
    @inValorDocumentoIdentidad VARCHAR(16),
    @inIdTipoMovimiento INT,
    @inMonto FLOAT,
    @inPostByUserId INT,
    @inPostInIP VARCHAR(64),
    @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
	BEGIN TRANSACTION;

    DECLARE @idEmpleado INT;
    DECLARE @saldoActual INT;
    DECLARE @nuevoSaldo FLOAT;
    DECLARE @tipoAccion VARCHAR(16);

    -- Validar que el empleado exista y esté activo
    SELECT 
        @idEmpleado = id,
        @saldoActual = SaldoVacaciones
    FROM dbo.Empleado
    WHERE ValorDocumentoIdentidad = @inValorDocumentoIdentidad
      AND EsActivo = 1;
	IF (@idEmpleado IS NULL)
    BEGIN
        SET @outResultCode = 50008; -- Error de base de datos

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

		ROLLBACK;
        RETURN;
    END

    -- Obtener tipo de acción (Crédito o Débito)
    SELECT 
        @tipoAccion = TipoAccion
    FROM dbo.TipoMovimiento
    WHERE Id = @inIdTipoMovimiento;

    -- Validación: si es débito, verificar que el saldo no quede negativo
    IF (@tipoAccion = 'Debito')
    BEGIN
        SET @nuevoSaldo = @saldoActual - @inMonto;

        IF (@nuevoSaldo < 0)
        BEGIN
            SET @outResultCode = 50011; -- Monto del movimiento rechazado pues si se aplicar el saldo seria negativo.
            
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
			
			ROLLBACK;
			RETURN;
        END
    END
    ELSE IF (@tipoAccion = 'Credito')
    BEGIN
        SET @nuevoSaldo = @saldoActual + @inMonto;
    END
    ELSE
    BEGIN
        SET @outResultCode = 50008; -- Error de base de datos
        
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
		
		ROLLBACK;
		RETURN;
    END

    -- Insertar movimiento
    INSERT INTO dbo.Movimiento (
        IdEmpleado,
        IdTipoMovimiento,
        Fecha,
        Monto,
        NuevoSaldo,
        IdPostByUser,
        PostInIP,
        PostTime
    )
    VALUES (
        @idEmpleado,
        @inIdTipoMovimiento,
        GETDATE(),
        @inMonto,
        @nuevoSaldo,
        @inPostByUserId,
        @inPostInIP,
        GETDATE()
    );

    -- Actualizar saldo del empleado
    UPDATE dbo.Empleado
    SET SaldoVacaciones = @nuevoSaldo
    WHERE id = @idEmpleado;

	SELECT @idEmpleado AS Id;
    SET @outResultCode = 0; -- Éxito
	COMMIT;
  END TRY
  BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK;

    SET @outResultCode = 50008; -- Error en base de datos

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

  END CATCH
  SET NOCOUNT OFF;
END
GO