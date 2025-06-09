CREATE OR ALTER PROCEDURE sp_generar_json (
    @idUsuario INT,
    @IP VARCHAR(64),
    @TipoEvento INT,
    @Detalle VARCHAR(64),
    @Parametros NVARCHAR(MAX) = NULL,       -- Ej: '["param1", "param2"]'
    @DatosAntes NVARCHAR(MAX) = NULL,       -- Ej: '[{...}]'
    @DatosDespues NVARCHAR(MAX) = NULL,     -- Ej: '[{...}]'
    @outJson NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @jsonBase NVARCHAR(MAX),
        @estampa DATETIME = GETDATE();

    -- Armar objeto base
    SET @jsonBase = JSON_QUERY('{
        "idUsuario": ' + CAST(ISNULL(@idUsuario, -1) AS NVARCHAR) + ',
        "IP": "' + ISNULL(@IP, '') + '",
        "EstampaTiempo": "' + FORMAT(@estampa, 'yyyy-MM-ddTHH:mm:ss') + '",
        "TipoEvento": ' + CAST(@TipoEvento AS NVARCHAR) + ',
        "Detalle": "' + REPLACE(ISNULL(@Detalle, ''), '"', '\"') + '"
    }');

    -- Agregar Parametros si existen
    IF (@Parametros IS NOT NULL AND ISJSON(@Parametros) = 1)
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.Parametros', JSON_QUERY(@Parametros));

    -- Agregar CRUD si se dan antes y después válidos
    IF (
        @DatosAntes IS NOT NULL AND ISJSON(@DatosAntes) = 1 AND 
        @DatosDespues IS NOT NULL AND ISJSON(@DatosDespues) = 1
    )
    BEGIN
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.CRUD', '{}');
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.CRUD.DatosAntes', JSON_QUERY(@DatosAntes));
        SET @jsonBase = JSON_MODIFY(@jsonBase, '$.CRUD.DatosDespues', JSON_QUERY(@DatosDespues));
    END

    SET @outJson = @jsonBase;
END;
GO
