import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const objectId = z.string('Id não é válido').regex(/^[a-f0-9]{24}$/i, 'Id não é válido');

export const idParamSchema = z.object({ id: objectId });

export class IdParamDto extends createZodDto(idParamSchema) {}

// Posição no mapa da sala: grade de 0 a 8 nos dois eixos.
export const gridPosition = z
    .number('Eixo x e y do objeto deve ser entre 0 e 8')
    .min(0, 'Eixo x e y do objeto deve ser entre 0 e 8')
    .max(8, 'Eixo x e y do objeto deve ser entre 0 e 8');

export const orientation = z.string('Orientação inválida').max(20, 'Orientação inválida');
