// income_dashboard_repository.ts
import  prisma  from '../config/prisma'; // 너희 prisma import 경로에 맞춰 수정

export const incomeDashboardRepository = {
  async findWorkLogsForMonth(userId: Buffer, start: Date, end: Date) {
    return prisma.user_work_log.findMany({
      where: {
        user_id: userId,
        work_date: { gte: start, lt: end },
      },
      include: {
        alba_posting: {
          include: {
            store: {
              include: { store_category: true },
            },
          },
        },
      },
    });
  },

  async findUserAlbaSettlementStatuses(userId: Buffer) {
    return prisma.user_alba.findMany({
      where: { user_id: userId },
      select: { alba_id: true, settlement_status: true },
    });
  },
};
