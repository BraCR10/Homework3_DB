USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp__verificar_jueves_del_mes]    Script Date: 19/6/2025 00:18:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp__verificar_jueves_del_mes]
(
     @inFecha DATE
    ,@outNumeroJueves INT OUTPUT
    ,@outTotalJueves INT OUTPUT
    ,@outUltimoJuevesMesActual DATE OUTPUT      
    ,@outUltimoJuevesMesSiguiente DATE OUTPUT
    ,@outViernesSiguiente DATE OUTPUT
    ,@outJuevesSiguiente DATE OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Inicializar variables de salida
        SET @outNumeroJueves = 0;
        SET @outTotalJueves = 0;
        SET @outUltimoJuevesMesActual = NULL;
        SET @outUltimoJuevesMesSiguiente = NULL;
        SET @outViernesSiguiente = NULL;
        SET @outJuevesSiguiente = NULL;
        
        -- Variables internas
        DECLARE @PrimerDiaDelMes DATE;
        DECLARE @UltimoDiaDelMes DATE;
        DECLARE @PrimerJueves DATE;
        DECLARE @JuevesActual DATE;
        DECLARE @ContadorJueves INT;
        
        -- Variables para el mes siguiente
        DECLARE @PrimerDiaDelMesSig DATE;
        DECLARE @UltimoDiaDelMesSig DATE;
        DECLARE @PrimerJuevesSig DATE;
        DECLARE @JuevesSig DATE;
        
        -- Verificar si la fecha es jueves (validación interna)
        IF (DATENAME(WEEKDAY, @inFecha) <> 'Thursday')
        BEGIN
            RETURN; -- Salir si no es jueves
        END
        
        --------------------------------------------------------------------------------------------
        -- PROCESAMIENTO DEL MES ACTUAL
        --------------------------------------------------------------------------------------------
        
        -- Obtener primer y último día del mes actual
        SET @PrimerDiaDelMes = DATEFROMPARTS(YEAR(@inFecha), MONTH(@inFecha), 1);
        SET @UltimoDiaDelMes = EOMONTH(@PrimerDiaDelMes);
        
        -- Encontrar el primer jueves del mes actual
        SET @PrimerJueves = @PrimerDiaDelMes;
        WHILE (DATENAME(WEEKDAY, @PrimerJueves) <> 'Thursday')
        BEGIN
            SET @PrimerJueves = DATEADD(DAY, 1, @PrimerJueves);
        END
        
        -- Contar todos los jueves del mes actual y determinar cuál número es la fecha ingresada
        SET @ContadorJueves = 0;
        SET @JuevesActual = @PrimerJueves;
        
        WHILE (@JuevesActual <= @UltimoDiaDelMes)
        BEGIN
            SET @ContadorJueves = @ContadorJueves + 1;
            
            -- Si es la fecha que estamos buscando, guardar el número
            IF (@JuevesActual = @inFecha)
            BEGIN
                SET @outNumeroJueves = @ContadorJueves;
            END
            
            SET @outUltimoJuevesMesActual = @JuevesActual;
            
            SET @JuevesActual = DATEADD(WEEK, 1, @JuevesActual);
        END
        
        -- Asignar total de jueves del mes actual
        SET @outTotalJueves = @ContadorJueves;
        
        --------------------------------------------------------------------------------------------
        -- PROCESAMIENTO DEL MES SIGUIENTE
        --------------------------------------------------------------------------------------------
        
        -- Obtener primer y último día del mes siguiente
        SET @PrimerDiaDelMesSig = DATEFROMPARTS(
            CASE 
                WHEN MONTH(@inFecha) = 12 THEN YEAR(@inFecha) + 1 
                ELSE YEAR(@inFecha) 
            END,
            CASE 
                WHEN MONTH(@inFecha) = 12 THEN 1 
                ELSE MONTH(@inFecha) + 1 
            END,
            1
        );
        SET @UltimoDiaDelMesSig = EOMONTH(@PrimerDiaDelMesSig);
        
        -- Encontrar el primer jueves del mes siguiente
        SET @PrimerJuevesSig = @PrimerDiaDelMesSig;
        WHILE (DATENAME(WEEKDAY, @PrimerJuevesSig) <> 'Thursday')
        BEGIN
            SET @PrimerJuevesSig = DATEADD(DAY, 1, @PrimerJuevesSig);
        END
        
        -- Encontrar el último jueves del mes siguiente
        SET @JuevesSig = @PrimerJuevesSig;
        WHILE (@JuevesSig <= @UltimoDiaDelMesSig)
        BEGIN
            SET @outUltimoJuevesMesSiguiente = @JuevesSig;
            SET @JuevesSig = DATEADD(WEEK, 1, @JuevesSig);
        END
        
        --------------------------------------------------------------------------------------------
        -- CÁLCULOS ADICIONALES
        --------------------------------------------------------------------------------------------
        
        -- Calcular el viernes siguiente al jueves actual
        SET @outViernesSiguiente = DATEADD(DAY, 1, @inFecha);
        
        -- Calcular el jueves siguiente (7 días después)
        SET @outJuevesSiguiente = DATEADD(WEEK, 1, @inFecha);
        
    END TRY
    BEGIN CATCH
        SET @outNumeroJueves = 0;
        SET @outTotalJueves = 0;
        SET @outUltimoJuevesMesActual = NULL;
        SET @outUltimoJuevesMesSiguiente = NULL;
        SET @outViernesSiguiente = NULL;
        SET @outJuevesSiguiente = NULL;
    END CATCH
    
    SET NOCOUNT OFF;
END;