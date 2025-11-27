import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('ROOT Testando o serviço da raiz', () => {
  let service: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getInfo', () => {
    it('deve retornar informações da API com status, version e description', () => {
      const result = service.getInfo();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result.status).toBe('online');
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe('Esta é API de tarefas (todos) da turma de Infoweb 2025.');
    });
  });
});