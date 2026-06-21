import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  const uniqueEmail = `login-test-${Date.now()}@example.com`;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should register a new user, then login successfully, and fail login with wrong credentials', async () => {
    // 1. Register the user
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Login Test User',
        email: uniqueEmail,
        password: 'correct_password',
      })
      .expect(201)
      .expect({ data: 'Ok' });

    // 2. Login successfully
    const loginResponse = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        email: uniqueEmail,
        password: 'correct_password',
      })
      .expect(200);

    const body = loginResponse.body as { data?: { token?: string } };
    expect(body).toBeDefined();
    expect(body.data).toBeDefined();
    expect(body.data.token).toBeDefined();
    expect(typeof body.data.token).toBe('string');

    // 3. Login fails with incorrect password
    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        email: uniqueEmail,
        password: 'wrong_password',
      })
      .expect(400)
      .expect({ error: 'Email atau password salah' });

    // 4. Login fails with non-existent email
    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(400)
      .expect({ error: 'Email atau password salah' });
  });
});
