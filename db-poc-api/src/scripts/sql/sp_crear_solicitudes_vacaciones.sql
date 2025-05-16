-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Brian Ramirez Arias
-- Create date: 26/4/2025
-- Description:	SP para crear solicitudes de vacaciones
-- =============================================
CREATE PROCEDURE sp_crear_solicitudes_vacaciones (
	@inValorDocumentoIdentidad VARCHAR(64)
	, @inCantDias INT
	, @inFechaInicio DATE
	, @inFechaFin DATE
	, @outResultCode INT OUTPUT
)
AS
BEGIN

	SET NOCOUNT ON;

	BEGIN TRY 
		-- Validacion documento de identidad
		 IF (@inValorDocumentoIdentidad LIKE '%[^0-9]%')
		 BEGIN
			SET @outResultCode = 50010; -- Valor de documento de identidad no alfabético
      
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
		END

		-- Validacion de cant dias ingresados
		IF (@inCantDias<1)
		BEGIN 
			SET @outResultCode = 50008; --  Error de DB, cant de dias no validos
      
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
		END 



		DECLARE @CantVacaciones INT;
		SELECT @CantVacaciones = E.SaldoVacaciones
		FROM dbo.Empleado AS E 
		WHERE (E.ValorDocumentoIdentidad = @inValorDocumentoIdentidad AND E.EsActivo = 1);

		DECLARE @SaldoValidacion INT;
		SET @SaldoValidacion = @CantVacaciones - @inCantDias;

		-- Validacion de saldo
		IF (@SaldoValidacion<0)
		BEGIN
			SET @outResultCode = 50011; --  Monto invalido
      
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
		END

		-- Validacion emplado no activo
		IF (@CantVacaciones IS NULL)
		BEGIN
			SET @outResultCode = 50008; --  Empleado no activo
      
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
		END

		-- Validacion de fechas
		IF(@inFechaInicio<GETDATE() OR @inFechaFin < GETDATE() OR @inFechaInicio>@inFechaFin)
		BEGIN
			SET @outResultCode = 50016; --  Error de fechas
      
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
		END

		BEGIN TRANSACTION 

			INSERT INTO dbo.Solicitud (
				DNIEmpleado
				, CantidadDias
				, FechaInicio
				, FechaFin
			)
			VALUES (
				@inValorDocumentoIdentidad
				, @inCantDias
				, @inFechaInicio
				, @inFechaFin
			);
		COMMIT TRANSACTION 
		SET @outResultCode = 0;
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT>0)
		BEGIN
			ROLLBACK TRANSACTION;
		END
		SET @outResultCode = 50008; --  Error de DB
      
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
