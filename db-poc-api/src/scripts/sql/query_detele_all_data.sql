-- Desactiva las restricciones
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Elimina los datos
EXEC sp_MSforeachtable 'DELETE FROM ?';

-- Reactiva las restricciones
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
