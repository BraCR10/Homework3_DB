-- Desactiva las restricciones
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Elimina los datos
EXEC sp_MSforeachtable 'DELETE FROM ?';

-- Reinicia los contadores de identidad
EXEC sp_MSforeachtable '
    IF EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(''?'') 
        AND is_identity = 1
    )
    BEGIN
        DBCC CHECKIDENT (''?'', RESEED, 0);
    END
';

-- Reactiva las restricciones
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
