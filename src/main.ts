import { applyGlobalFilter } from '@common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { EnvironmentService } from './config/environment/environment.service'
import { AppModule } from './model/app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const envService = app.get(EnvironmentService)

  // Enable CORS
  app.enableCors({ origin: '*', credentials: true })

  // Enable helmet
  app.use(helmet())

  // Set global prefix
  app.setGlobalPrefix('/simple/api/v1')

  // Global filter
  applyGlobalFilter(app)

  await app.listen(envService.get('PORT'))
}
bootstrap()
