USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_crear_empleado]    Script Date: 15/06/2025 22:35:51 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_crear_empleado]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@inNombre VARCHAR(64),
	@inEmpleadoUsuario VARCHAR(64),
	@inEmpleadoContraseña VARCHAR(64),
	@inIdDocTipo INT,
	@inValorDoc VARCHAR(64),
	@inFechaNacimiento DATE,
	@inIdPuesto INT,
	@inIdDepartamento INT,
	@inFecha DATE = NULL,
	@outResultCode INT OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		-- Variables para bitacora
		DECLARE @jsonEventLog NVARCHAR(MAX);
		DECLARE @ParametrosBitacora NVARCHAR(MAX);

		DECLARE @IdUsuarioCreado INT;

		-- Validación: no exista empleado con mismo tipo de documento ni valor de documento
		IF EXISTS (
			SELECT 1 FROM dbo.Empleado 
			WHERE ValorDNI = @inValorDoc AND IdTipoDocumentoIdentidad = @inIdDocTipo
		)
		BEGIN
			SET @outResultCode = 50008; -- Empleado con ValorDocumentoIdentidad ya existe en inserción
			SELECT 'Ya existe un empleado con el mismo valor y tipo de documento de identidad' AS 'message'; -- recordset
			RETURN;
		END

		-- Validación: no exista el usuario
		IF EXISTS (
			SELECT 1 FROM dbo.Usuario
			WHERE Nombre = @inEmpleadoUsuario
		)
		BEGIN
			SET @outResultCode = 50008; -- Empleado con ValorDocumentoIdentidad ya existe en inserción
			SELECT 'Ya existe un empleado con el usuario' AS 'message'; -- recordset
			RETURN;
		END

		BEGIN TRANSACTION
			--Creacion de usuario
			INSERT INTO dbo.Usuario (
				Nombre,
				Contraseña,
				IdTipoUsuario
			)
			VALUES (
				@inEmpleadoUsuario,
				@inEmpleadoContraseña,
				2
			)

			-- Inserción del nuevo empleado
			SET @IdUsuarioCreado = ( -- OBTENER EL ID DEL NUEVO USUARIO CREADO
			SELECT U.Id
			FROM dbo.Usuario U
			WHERE U.Nombre = @inEmpleadoUsuario
			)

			INSERT INTO dbo.Empleado (	
				Nombre,
				ValorDNI,
				FechaNacimiento,
				Activo,
				IdDepartamento,
				IdTipoDocumentoIdentidad,
				IdUsuario,
				IdPuesto
			)
			VALUES
			(
				@inNombre,
				@inValorDoc,
				@inFechaNacimiento,
				1,
				@inIdDepartamento,
				@inIdDocTipo,
				@IdUsuarioCreado,
				@inIdPuesto
			);

			-- Definiendo los parametro requeridos para la bitacora de este SP
			SET @ParametrosBitacora = '{
					"Nombre": "' + ISNULL(@inNombre, '') + '",
					"ValorDoc": "' + ISNULL(@inValorDoc, '') + '",
					"FechaNacimiento": "' + ISNULL(CONVERT(VARCHAR, @inFechaNacimiento, 120), '') + '",
					"Activo": "1",
					"IdDepartamento": "' + ISNULL(CAST(@inIdDepartamento AS VARCHAR), '') + '",
					"IdDocTipo": "' + ISNULL(CAST(@inIdDocTipo AS VARCHAR), '') + '",
					"IdUsuario": "' + ISNULL(CAST(@IdUsuarioCreado AS VARCHAR), '') + '",
					"IdPuesto": "' + ISNULL(CAST(@inIdPuesto AS VARCHAR), '') + '"
				}'
			-- Registrar en EventLog
			EXEC dbo.sp_generar_json
					@inIdUsuario = @inIdUsuario,
					@inIP = @inIP,
					@inIdTipoEvento = 5,
					@inDetalle = 'Intento de insertar empleado exitoso',
					@inFecha=@inFecha,
					@inParametros = @ParametrosBitacora,
					@inDatosAntes = NULL,
					@inDatosDespues = NULL,
					@outJson = @jsonEventLog OUTPUT;

			INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 5 = INSERTAR EMPLEADO
			VALUES (@jsonEventLog, 5);
		COMMIT TRANSACTION

		-- recordset
		SET @outResultCode = 0; -- Éxito
		SELECT E.Id AS Id  
		, E.Nombre AS 'Name'
		FROM dbo.Empleado AS E 
		WHERE (E.ValorDNI = @inValorDoc AND E.IdTipoDocumentoIdentidad = @inIdDocTipo);

	END TRY

	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK;
		SET @outResultCode = 50008; -- Error general de base de datos
		SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- recordset

		INSERT INTO dbo.DBErrors (
					UserNombre
					, Numero
					, Estado
					, Severidad
					, Linea
					, ProcedureError
					, Mensaje
				)
				VALUES (
					SUSER_NAME()
					, ERROR_NUMBER()
					, ERROR_STATE()
					, ERROR_SEVERITY()
					, ERROR_LINE()
					, ERROR_PROCEDURE()
					, ERROR_MESSAGE()
				);
	END CATCH
	SET NOCOUNT OFF;
END
