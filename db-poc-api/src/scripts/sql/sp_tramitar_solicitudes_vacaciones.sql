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
-- Description:	SP para tramitar solicitudes de vacaciones
-- =============================================
CREATE PROCEDURE sp_tramitar_solicitudes_vacaciones(
	@inIdUsuario INT
	, @inPostInIP VARCHAR(64)
	, @inIdSolicitud INT
	, @inNuevoEstado VARCHAR(32)
	, @outResultCode INT OUTPUT
)
AS
BEGIN

	SET NOCOUNT ON;

	BEGIN TRY
		
		--Declaramos tipo de movimiento en caso a tramitar en caso de aprovado
		DECLARE @TipoMovimiento INT = 4;

		-- Declarando tabla para guardar usuarios autorizados
		DECLARE  @AuthUsuarios TABLE (
			Id INT IDENTITY(1,1) PRIMARY KEY
			, IdUserAuth INT UNIQUE
		);

		INSERT INTO @AuthUsuarios(IdUserAuth)
		VALUES (4); -- FRANCO

		IF EXISTS ( 
			SELECT 1 
			FROM @AuthUsuarios AS A 
			WHERE (A.IdUserAuth = @inIdUsuario)
		)
		BEGIN 
			DECLARE @DNIEmpleado VARCHAR(32), @CantDias INT;
			SELECT 
				@DNIEmpleado = S.DNIEmpleado
				, @CantDias = S.CantidadDias
			FROM
				dbo.Solicitud AS S
			WHERE
				(S.Id = @inIdSolicitud);

			DECLARE @SaldoActual Int;
			SELECT  @SaldoActual = E.SaldoVacaciones
			FROM dbo.Empleado AS E
			WHERE (E.ValorDocumentoIdentidad=@DNIEmpleado   AND E.EsActivo = 1);

			IF( @SaldoActual-@CantDias = 0)
			BEGIN 
				SET @outResultCode = 50011; --  saldo menor error
      
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
				WHERE (Codigo = @outResultCode);
				RETURN;
			END

			IF( @SaldoActual IS NULL)
			BEGIN 
				SET @outResultCode = 50008; --  Emplado borrado
      
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
				WHERE (Codigo = @outResultCode);
				RETURN;
			END

			
			IF(@inNuevoEstado='Rechazado')
				BEGIN 
				BEGIN TRANSACTION
					UPDATE dbo.Solicitud
					SET Estado = @inNuevoEstado
					WHERE (Id = @inIdSolicitud);
				COMMIT TRANSACTION
				SET @outResultCode = 0;
				RETURN;
			END
			ELSE IF (@inNuevoEstado='Aprobado')
			BEGIN

				DECLARE @DNICasteado VARCHAR(16) = CAST(@DNIEmpleado AS VARCHAR(16));
                DECLARE @MontoCasteado FLOAT = CAST(@CantDias AS FLOAT);

                DECLARE @ResultMovimiento INT;
                EXEC dbo.sp_insertar_movimiento 
                    @inValorDocumentoIdentidad = @DNICasteado,
                    @inIdTipoMovimiento = @TipoMovimiento,
                    @inMonto = @MontoCasteado,
                    @inPostByUserId = @inIdUsuario,
                    @inPostInIP = @inPostInIP,
                    @outResultCode = @ResultMovimiento OUTPUT;

                IF (@ResultMovimiento = 0)
                BEGIN
                    BEGIN TRANSACTION;
                        UPDATE dbo.Solicitud 
                        SET Estado = @inNuevoEstado
                        WHERE (Id = @inIdSolicitud);
                    COMMIT TRANSACTION;

                    SET @outResultCode = 0;
                END
                ELSE
                BEGIN
                    -- Error en movimiento, hacer rollback si hay transacción activa
                    IF (@@TRANCOUNT > 0)
                        ROLLBACK TRANSACTION;

                    SET @outResultCode = @ResultMovimiento;

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
						, 'Error al insertar movimiento'
						, GETDATE()
                    );

                    SELECT Descripcion AS detail
                    FROM dbo.Error
                    WHERE (Codigo = @outResultCode);

                    RETURN;
                END
            END
		END
		ELSE
		BEGIN
			SET @outResultCode = 50015; --  Usuario no Auth
      
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
		END

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
