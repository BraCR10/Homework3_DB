USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_generar_json]    Script Date: 13/6/2025 15:17:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_generar_json] (
    @inIdUsuario INT,
    @inIP VARCHAR(64),
    @inIdTipoEvento INT,
    @inDetalle VARCHAR(64),
	@inFecha DATE = NULL ,
    @inParametros NVARCHAR(MAX) = NULL,       -- Ej: '{"Param": "value"}'
    @inDatosAntes NVARCHAR(MAX) = NULL,       -- Ej: '{"Dato": "value"}'
    @inDatosDespues NVARCHAR(MAX) = NULL,     -- Ej: '{"Dato": "value"}'
    @outJson NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @jsonBase NVARCHAR(MAX),
		@evento VARCHAR(64);

		SELECT @evento = E.Nombre
		FROM dbo.TipoEvento AS E
		WHERE (E.Id = @inIdTipoEvento);

		SET @inFecha=ISNULL(@inFecha, GETDATE());

    -- Armar objeto base
    SET @jsonBase = JSON_QUERY('{
		"idUsuario": ' + CAST(ISNULL(@inIdUsuario, -1) AS NVARCHAR) + ',
		"IP": "' + ISNULL(@inIP, '') + '",
		"EstampaTiempo": "' + FORMAT(@inFecha, 'yyyy-MM-ddTHH:mm:ss') + '",
		"idTipoEvento": ' + CAST(@inIdTipoEvento AS NVARCHAR) + ',
		"TipoEvento": "' + ISNULL(@evento, '') + '",
		"Detalle": "' + REPLACE(ISNULL(@inDetalle, ''), '"', '\"') + '"
	}');

    -- Agregar Parametros si existen y son JSON válidos
    IF (@inParametros IS NOT NULL AND ISJSON(@inParametros) = 1)
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.Parametros', JSON_QUERY(@inParametros));
	

    -- Agregar CRUD si se dan DatosAntes y DatosDespues válidos
    IF (
        @inDatosAntes IS NOT NULL AND ISJSON(@inDatosAntes) = 1 AND 
        @inDatosDespues IS NOT NULL AND ISJSON(@inDatosDespues) = 1
    )
    BEGIN		
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.CRUD', JSON_QUERY('{}'));
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.CRUD.DatosAntes', JSON_QUERY(@inDatosAntes));
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.CRUD.DatosDespues', JSON_QUERY(@inDatosDespues));
    END

    SET @outJson = @jsonBase;
END;
