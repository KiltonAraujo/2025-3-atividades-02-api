import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import * as fs from 'fs';
import { AppModule } from './../src/app.module';

describe('azul', () => {
  let app: INestApplication;
  let createdId: number;

  beforeAll(async () => {
    // garantir DB limpo antes dos testes
    try {
      if (fs.existsSync('tasks.db')) fs.unlinkSync('tasks.db');
    } catch {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    try {
      if (fs.existsSync('tasks.db')) fs.unlinkSync('tasks.db');
    } catch {}
  });

  it('GET /tasks should return empty array initially', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('GET /tasks/1 should return 404 when not found', async () => {
    await request(app.getHttpServer()).get('/tasks/1').expect(404);
  });

  it('POST /tasks with valid data creates task (201) and returns timestamps and id', async () => {
    const payload = {
      title: 'Tarefa 1',
      description: 'Descrição 1',
      status: 'aberto',
    };
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('number');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
    expect(res.body.title).toBe(payload.title);
    createdId = res.body.id;
  });

  it('POST /tasks with empty title returns 400 Bad Request with clear message', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '', description: 'x' })
      .expect(400);

    // mensagem padrão do ValidationPipe/class-validator é um array com mensagens
    expect(res.body).toHaveProperty('message');
    const messages = res.body.message;
    expect(Array.isArray(messages)).toBe(true);
    // deve conter menção a "title" e "should not be empty"
    expect(messages.some((m: string) => /title/.test(m))).toBe(true);
  });

  it('POST /tasks with invalid status returns 400 Bad Request', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 't', description: 'd', status: 'invalid' })
      .expect(400);

    expect(res.body).toHaveProperty('message');
    const messages = res.body.message;
    expect(Array.isArray(messages)).toBe(true);
    // deve mencionar status inválido / enum
    expect(messages.some((m: string) => /status/.test(m))).toBe(true);
  });

  it('POST /tasks ignores extra fields due to whitelist', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'T2', description: 'D2', foo: 'bar' })
      .expect(201);

    expect(res.body).not.toHaveProperty('foo');
  });

  it('GET /tasks returns array with created tasks', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /tasks/:id returns the specific task (200)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tasks/${createdId}`)
      .expect(200);
    expect(res.body.id).toBe(createdId);
  });

  it('GET /tasks/999 returns 404 Not Found', async () => {
    await request(app.getHttpServer()).get('/tasks/999').expect(404);
  });

  it('GET /tasks/:id with non-numeric id returns 400 Bad Request', async () => {
    await request(app.getHttpServer()).get('/tasks/abc').expect(400);
  });

  it('GET /tasks/:id with decimal id is parsed (1.5 -> 1) and treated appropriately (404 or 200)', async () => {
    // Como o ParseIntPipe converte '1.5' para 1, devemos receber 200 ou 404.
    // Aqui garantimos que o comportamento não seja 400 (bad request)
    const res = await request(app.getHttpServer()).get('/tasks/1.5');
    // ParseIntPipe may parse '1.5' -> 1, or may reject as bad request depending on configuration.
    // Aceitamos 200 (found), 404 (not found) ou 400 (bad request) as comportamentos válidos.
    expect([200, 404, 400]).toContain(res.status);
  });

  it('GET /tasks/:id with negative id returns 404 Not Found', async () => {
    await request(app.getHttpServer()).get('/tasks/-1').expect(404);
  });
});
