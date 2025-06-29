USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_actualizar_empleado]    Script Date: 15/06/2025 22:36:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_actualizar_empleado]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@inIdEmpleado INT,
	@inNombre VARCHAR(64),
	@inIdDocTipo INT,
	@inValorDoc VARCHAR(64),
	@inFechaNacimiento DATE,
	@inIdPuesto INT,
	@inIdDepartamento INT,
	@outResultCode INT OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		-- Variables para la bitacora
		DECLARE @jsonEventLog NVARCHAR(MAX);
		DECLARE @DatosAntes NVARCHAR(MAX);
		DECLARE @DatosDespues NVARCHAR(MAX);
		SET @DatosAntes = (
			SELECT 
				'{
					"Nombre": "' + ISNULL(E.Nombre, '') + '",
					"ValorDNI": "' + ISNULL(E.ValorDNI, '') + '",
					"FechaNacimiento": "' + ISNULL(CONVERT(VARCHAR, E.FechaNacimiento, 120), '') + '",
					"Activo": "' + ISNULL(CAST(E.Activo AS VARCHAR), '') + '",
					"IdDepartamento": "' + ISNULL(CAST(E.IdDepartamento AS VARCHAR), '') + '",
					"IdTipoDocumentoIdentidad": "' + ISNULL(CAST(E.IdTipoDocumentoIdentidad AS VARCHAR), '') + '",
					"IdUsuario": "' + ISNULL(CAST(E.IdUsuario AS VARCHAR), '') + '",
					"IdPuesto": "' + ISNULL(CAST(E.IdPuesto AS VARCHAR), '') + '"
				}'
			FROM 
				dbo.Empleado E
			WHERE 
				E.Id = @inIdEmpleado
		);
		-- Validación: que el empleado exista
		IF NOT EXISTS (SELECT 1 FROM dbo.Empleado WHERE Id = @inIdEmpleado AND Activo = 1)
		BEGIN
				SET @outResultCode = 50008; -- No se encontro el empleado
				SELECT 'No se encontro el empleado' AS 'message'; -- recordset
				RETURN;
			END
		-- Validación: no exista empleado con mismo tipo de documento ni valor de documento
		IF (@inValorDoc IS NOT NULL AND @inIdDocTipo IS NOT NULL) -- Comprobar si existe alguien con el ValorDoc y el tipo de documento a cambiar 
			IF EXISTS (
				SELECT 1 FROM dbo.Empleado 
				WHERE ValorDNI = @inValorDoc AND IdTipoDocumentoIdentidad = @inIdDocTipo 
			)
			BEGIN
				SET @outResultCode = 50008; -- Empleado con ValorDocumentoIdentidad ya existe en inserción
				SELECT 'Ya existe un empleado con el mismo valor y tipo de documento de identidad' AS 'message'; -- recordset
				RETURN;
			END

		IF (@inValorDoc IS NULL AND @inIdDocTipo IS NOT NULL) -- Comprobar si existe alguien con el ValorDoc del empleado actual y el tipo de documento a cambiar
			DECLARE @ValorDocActual VARCHAR(64) = (
				SELECT E.ValorDNI
				FROM dbo.EMpleado E
				WHERE E.Id = @inIdEmpleado
			)

			IF EXISTS (
				SELECT 1 FROM dbo.Empleado 
				WHERE IdTipoDocumentoIdentidad = @inIdDocTipo AND ValorDNI = @ValorDocActual
			)
			BEGIN
				SET @outResultCode = 50008; -- Empleado con ValorDocumentoIdentidad ya existe en inserción
				SELECT 'Ya existe un empleado con el mismo valor y tipo de documento de identidad' AS 'message'; -- recordset
				RETURN;
			END

		IF (@inValorDoc IS NOT NULL AND @inIdDocTipo IS NULL) -- Comprobar si existe alguien con el ValorDoc a cambiar y el tipo de documento del empleado actual
			DECLARE @TipoDocActual VARCHAR(64) = (
				SELECT E.IdTipoDocumentoIdentidad
				FROM dbo.EMpleado E
				WHERE E.Id = @inIdEmpleado
			)

			IF EXISTS (
				SELECT 1 FROM dbo.Empleado 
				WHERE IdTipoDocumentoIdentidad = @TipoDocActual AND ValorDNI = @inValorDoc
			)
			BEGIN
				SET @outResultCode = 50008; -- Empleado con ValorDocumentoIdentidad ya existe en inserción
				SELECT 'Ya existe un empleado con el mismo valor y tipo de documento de identidad' AS 'message'; -- recordset
				RETURN;
			END

		BEGIN TRANSACTION
			-- Cambiar nombre
			IF @inNombre IS NOT NULL
			BEGIN
				UPDATE dbo.Empleado
				SET Nombre = @inNombre
				WHERE Id = @inIdEmpleado
			END
			-- Cambiar Tipo de doc
			IF @inIdDocTipo IS NOT NULL
			BEGIN

				UPDATE dbo.Empleado
				SET IdTipoDocumentoIdentidad = @inIdDocTipo
				WHERE Id = @inIdEmpleado
			END
			--Cambiar valor de doc
			IF @inValorDoc IS NOT NULL
			BEGIN
				UPDATE dbo.Empleado
				SET ValorDNI = @inValorDoc
				WHERE Id = @inIdEmpleado
			END
			-- Cambiar fecha de nacimiento
			IF @inFechaNacimiento IS NOT NULL
			BEGIN
				UPDATE dbo.Empleado
				SET FechaNacimiento = @inFechaNacimiento
				WHERE Id = @inIdEmpleado
			END
			-- Cambiar puesto
			IF @inIdPuesto IS NOT NULL
			BEGIN
				UPDATE dbo.Empleado
				SET IdPuesto = @inIdPuesto
				WHERE Id = @inIdEmpleado
			END
			-- Cambiar departamento
			IF @inIdDepartamento IS NOT NULL
			BEGIN
				UPDATE dbo.Empleado
				SET IdDepartamento = @inIdDepartamento
				WHERE Id = @inIdEmpleado
			END

			-- Registrar en EventLog
			SET @DatosDespues = (
				SELECT 
					'{
						"Nombre": "' + ISNULL(E.Nombre, '') + '",
						"ValorDNI": "' + ISNULL(E.ValorDNI, '') + '",
						"FechaNacimiento": "' + ISNULL(CONVERT(VARCHAR, E.FechaNacimiento, 120), '') + '",
						"Activo": "' + ISNULL(CAST(E.Activo AS VARCHAR), '') + '",
						"IdDepartamento": "' + ISNULL(CAST(E.IdDepartamento AS VARCHAR), '') + '",
						"IdTipoDocumentoIdentidad": "' + ISNULL(CAST(E.IdTipoDocumentoIdentidad AS VARCHAR), '') + '",
						"IdUsuario": "' + ISNULL(CAST(E.IdUsuario AS VARCHAR), '') + '",
						"IdPuesto": "' + ISNULL(CAST(E.IdPuesto AS VARCHAR), '') + '"
					}'
				FROM dbo.Empleado E
				WHERE E.Id = @inIdEmpleado
			);

			EXEC dbo.sp_generar_json
					@inIdUsuario = @inIdUsuario,
					@inIP = @inIP,
					@inIdTipoEvento = 7,
					@inDetalle = 'Intento de actualizar empleado exitoso',
					@inParametros = '{}',
					@inDatosAntes = @DatosAntes,
					@inDatosDespues = @DatosDespues,
					@outJson = @jsonEventLog OUTPUT;

			INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 7 = editar EMPLEADO
			VALUES (@jsonEventLog, 7);
		COMMIT TRANSACTION
	-- recordset
	SET @outResultCode = 0; -- Éxito
	SELECT E.Id AS Id  
	, E.Nombre AS 'Name'
	FROM dbo.Empleado AS E 
	WHERE (E.Id = @inIdEmpleado);

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