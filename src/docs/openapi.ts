import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

// Swagger UI em /docs, documento em /docs-json e referência Scalar em /reference.
export function setupOpenApi(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('Devameet API')
        .setDescription(
            'Salas de reunião virtuais: usuários, reuniões e os objetos de cada sala. ' +
            'Fora login e cadastro, as rotas exigem `Authorization: Bearer <token>`. ' +
            'O movimento e o áudio/vídeo da sala trafegam por WebSocket (socket.io), fora deste documento.',
        )
        .setVersion('2.0.0')
        .addBearerAuth()
        .build();

    const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
    SwaggerModule.setup('docs', app, document);
    app.use('/reference', apiReference({ content: document }));
}
