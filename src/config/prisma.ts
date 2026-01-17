import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

// DATABASE_URL 파싱하여 connection pool 생성
const databaseUrl = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL 또는 LOCAL_DATABASE_URL 환경 변수가 설정되지 않았습니다.');
}

// MariaDB connection pool 생성
const pool = mariadb.createPool(databaseUrl);

// Prisma adapter 생성
const adapter = new PrismaMariaDb(pool);

// PrismaClient 생성
const prisma = new PrismaClient({ adapter });

export default prisma;
