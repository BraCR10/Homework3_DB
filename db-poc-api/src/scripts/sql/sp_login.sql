USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_login]    Script Date: 15/06/2025 22:33:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_login]
    @inUsuario VARCHAR(64),
    @inPassword VARCHAR(64),
    @inIP VARCHAR(64),
    @outResultCode INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
	BEGIN TRY
		-- Variables para bitacora
		DECLARE @jsonEventLog NVARCHAR(MAX);
		DECLARE @ParametrosBitacora NVARCHAR(MAX);


		-- Verificar si el usuario existe
		DECLARE @userId INT;
		SELECT @userId = U.Id
		FROM dbo.Usuario AS U
		WHERE U.Nombre = @inUsuario; -- AND E.Activo = 1;


		-- Definiendo los parametro requeridos para la bitacora de este SP
		SET @ParametrosBitacora = '{
			"Usuario": "' + ISNULL(@inUsuario, '') + '",
			"UsuarioId": "' + ISNULL(CAST(@userId AS VARCHAR), '') + '"
		}';


		IF (@userId IS NULL) -- No existe
		BEGIN
			SET @outResultCode = 50001; -- Usuario inválido
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- Recordset

			-- Registrar intento fallido en EventLog
			EXEC dbo.sp_generar_json
					@inIdUsuario = '',
					@inIP = @inIP,
					@inIdTipoEvento = 1,
					@inDetalle = 'Intento de login fallido',
					@inParametros = @ParametrosBitacora,
					@inDatosAntes = NULL,
					@inDatosDespues = NULL,
					@outJson = @jsonEventLog OUTPUT;

			INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 1 = Login
			VALUES (@jsonEventLog, 1);

			RETURN;
		END

		-- Validar contraseña
		DECLARE @passwordCorrecta VARCHAR(64);
		SELECT @passwordCorrecta = Contraseña
		FROM dbo.Usuario
		WHERE Id = @userId;

		IF (@passwordCorrecta <> @inPassword) -- Contraseña incorrecta
		BEGIN
			-- Registrar intento fallido en EventLog
			SET @outResultCode = 50002; -- contraseña incorrecta
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- RecordSet

			-- Registrar intento fallido en EventLog
			EXEC dbo.sp_generar_json
					@inIdUsuario = @userId,
					@inIP = @inIP,
					@inIdTipoEvento = 1,
					@inDetalle = 'Intento de login fallido',
					@inParametros = @ParametrosBitacora,
					@inDatosAntes = NULL,
					@inDatosDespues = NULL,
					@outJson = @jsonEventLog OUTPUT;

			INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 1 = Login
			VALUES (@jsonEventLog, 1);

			RETURN;
		END


		-- Login exitoso
		-- Registrar en EventLog
		EXEC dbo.sp_generar_json
				@inIdUsuario = @userId,
				@inIP = @inIP,
				@inIdTipoEvento = 1,
				@inDetalle = 'Login exitoso',
				@inParametros = @ParametrosBitacora,
				@inDatosAntes = NULL,
				@inDatosDespues = NULL,
				@outJson = @jsonEventLog OUTPUT;

		INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 1 = Login
		VALUES (@jsonEventLog, 1);

		SET @outResultCode = 0; 
		-- Recordset
		SELECT U.Id AS Id
			, U.Nombre AS Username
			, T.Nombre AS 'Role'
		FROM dbo.Usuario AS U
		INNER JOIN dbo.TipoUsuario AS T ON (U.IdTipoUsuario = T.Id)
		WHERE(@inUsuario=U.Nombre);

	END TRY
	BEGIN CATCH

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