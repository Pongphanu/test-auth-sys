// tests/auth.test.js - ปรับปรุงให้สอดคล้องกับระบบตรวจสอบรหัสผ่านปัจจุบัน
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

// กำหนดค่า JWT Secret สำหรับการทดสอบ
process.env.JWT_SECRET = 'test_jwt_secret_key';

describe('Authentication API', () => {
  let mongoServer;
  
  // เตรียมการก่อนการทดสอบทั้งหมด
  beforeAll(async () => {
    // สร้าง MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // ยกเลิกการเชื่อมต่อที่มีอยู่ (ถ้ามี)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // เชื่อมต่อกับ MongoDB Memory Server
    await mongoose.connect(mongoUri);
  });
  
  // ทำความสะอาดหลังการทดสอบทั้งหมด
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });
  
  // รีเซ็ตข้อมูลก่อนการทดสอบแต่ละรายการ
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  // ทดสอบ Sign-Up Endpoint
  describe('POST /api/auth/signup', () => {
    
    // ทดสอบการสร้างผู้ใช้ใหม่สำเร็จ
    test('should create a new user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        // รหัสผ่านที่ถูกต้องตามเงื่อนไขใหม่ - มีตัวพิมพ์ใหญ่, เล็ก, ตัวเลข และตัวอักษรพิเศษ
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // ตรวจสอบการตอบกลับจาก API
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');

      // ตรวจสอบว่ามีการบันทึกผู้ใช้ในฐานข้อมูลจริง
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);

      // ตรวจสอบว่ารหัสผ่านถูกเข้ารหัสแล้ว
      expect(user.password).not.toBe(userData.password);
      const passwordMatch = await bcrypt.compare(userData.password, user.password);
      expect(passwordMatch).toBe(true);
    });

    // ทดสอบการตรวจสอบฟิลด์ที่จำเป็น
    test('should return error when required fields are missing', async () => {
      const userData = {
        // ไม่ใส่ firstName, lastName, และ password
        email: 'john.doe@example.com'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    // ทดสอบการตรวจสอบความถูกต้องของอีเมล
    test('should return error for invalid email format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    // ทดสอบการตรวจสอบความซ้ำซ้อนของอีเมล
    test('should return error for duplicate email', async () => {
      // สร้างผู้ใช้ด้วย API
      await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!'
        });

      // พยายามสร้างผู้ใช้ใหม่ด้วยอีเมลเดิม
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john.doe@example.com',
        password: 'Password456!'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already in use');
    });

    // ทดสอบการตรวจสอบความแข็งแรงของรหัสผ่าน - ความยาว
    test('should return error for password too short', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Pass1!' // น้อยกว่า 8 ตัวอักษร
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 8 characters');
    });

    // ทดสอบการตรวจสอบความแข็งแรงของรหัสผ่าน - ต้องมีตัวพิมพ์ใหญ่
    test('should return error for password without uppercase letter', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123!' // ไม่มีตัวพิมพ์ใหญ่
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('uppercase letter');
    });

    // ทดสอบการตรวจสอบความแข็งแรงของรหัสผ่าน - ต้องมีตัวพิมพ์เล็ก
    test('should return error for password without lowercase letter', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'PASSWORD123!' // ไม่มีตัวพิมพ์เล็ก
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('lowercase letter');
    });

    // ทดสอบการตรวจสอบความแข็งแรงของรหัสผ่าน - ต้องมีตัวเลข
    test('should return error for password without number', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password!' // ไม่มีตัวเลข
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('number');
    });

    // ทดสอบการตรวจสอบความแข็งแรงของรหัสผ่าน - ต้องมีตัวอักษรพิเศษ
    test('should return error for password without special character', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123' // ไม่มีตัวอักษรพิเศษ
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('special character');
    });
  });

  // ทดสอบ Sign-In Endpoint
  describe('POST /api/auth/signin', () => {
    
    // ทดสอบการเข้าสู่ระบบสำเร็จ
    test('should sign in user with valid credentials and return JWT token', async () => {
      // สร้างผู้ใช้ด้วย API
      await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!'
        });

      // ทดสอบการเข้าสู่ระบบ
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'john.doe@example.com',
          password: 'Password123!'
        });

      console.log('Sign in response:', response.status, response.body);
      
      // ตรวจสอบการตอบกลับ
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sign in successful');
      expect(response.body.token).toBeTruthy();
      
      // ตรวจสอบข้อมูลใน Token
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decodedToken.email).toBe('john.doe@example.com');
      
      // ตรวจสอบข้อมูลผู้ใช้ที่ส่งกลับ
      expect(response.body.user).toBeTruthy();
      expect(response.body.user.firstName).toBe('John');
      expect(response.body.user.lastName).toBe('Doe');
      expect(response.body.user.email).toBe('john.doe@example.com');
    });

    // ทดสอบการอัปเดต lastLogin
    test('should update lastLogin timestamp when signing in', async () => {
      // สร้างผู้ใช้ด้วย API
      await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'Password123!'
        });
      
      // ดึงข้อมูลผู้ใช้
      let user = await User.findOne({ email: 'jane.smith@example.com' });
      const oldLastLogin = new Date(user.lastLogin).getTime();
      
      // รอสักครู่เพื่อให้แน่ใจว่า timestamp จะต่างกัน
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // เข้าสู่ระบบ
      await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'jane.smith@example.com',
          password: 'Password123!'
        });
      
      // ดึงข้อมูลผู้ใช้หลังเข้าสู่ระบบ
      const updatedUser = await User.findOne({ email: 'jane.smith@example.com' });
      const newLastLogin = new Date(updatedUser.lastLogin).getTime();
      
      // ดีบั๊กข้อมูล
      console.log('Old lastLogin:', oldLastLogin);
      console.log('New lastLogin:', newLastLogin);
      console.log('Difference:', newLastLogin - oldLastLogin);
      
      // ตรวจสอบว่า lastLogin มีการเปลี่ยนแปลง
      expect(newLastLogin).toBeGreaterThan(oldLastLogin);
    });

    // ทดสอบการตรวจสอบฟิลด์ที่จำเป็น
    test('should return error when email and password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });

    // ทดสอบการตรวจสอบรูปแบบอีเมล
    test('should return error for invalid email format in signin', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    // ทดสอบกรณีอีเมลไม่มีในระบบ
    test('should return error for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    // ทดสอบกรณีรหัสผ่านไม่ถูกต้อง
    test('should return error for incorrect password', async () => {
      // สร้างผู้ใช้ด้วย API
      await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test.user@example.com',
          password: 'Password123!'
        });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test.user@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});