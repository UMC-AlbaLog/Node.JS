import prisma from '../config/prisma';

/**
 * Settlement History Repository
 * 정산 내역 데이터베이스 접근 계층
 */
class SettlementHistoryRepository {
  /**
   * 사용자의 정산 내역 조회 (기간별)
   * @param userId - 사용자 ID
   * @param startDate - 조회 시작 날짜
   * @param endDate - 조회 종료 날짜
   * @returns 정산 내역 목록
   */
  async findSettlementsByPeriod(
    userId: Uint8Array,
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      income_log_id: Uint8Array;
      amount: number | null;
      income_date: Date | null;
      user_work_log: {
        work_date: Date | null;
        alba_posting: {
          store: {
            store_name: string | null;
          };
        };
      };
    }[]
  > {
    return await prisma.income_log.findMany({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        income_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user_work_log: {
          include: {
            alba_posting: {
              include: {
                store: true,
              },
            },
          },
        },
      },
      orderBy: {
        income_date: 'desc',
      },
    });
  }

  /**
   * 사용자의 월별 정산 요약 조회
   * @param userId - 사용자 ID
   * @param year - 조회 연도
   * @returns 월별 정산 요약
   */
  async getMonthlySettlementSummary(
    userId: Uint8Array,
    year: number,
  ): Promise<
    {
      month: number;
      totalAmount: number;
      count: number;
    }[]
  > {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const result = await prisma.income_log.groupBy({
      by: ['income_date'],
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        income_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // 월별로 그룹화
    const monthlyData = new Map<number, { totalAmount: number; count: number }>();

    for (const item of result) {
      if (item.income_date) {
        const month = item.income_date.getMonth() + 1;
        const existing = monthlyData.get(month) || { totalAmount: 0, count: 0 };
        monthlyData.set(month, {
          totalAmount: existing.totalAmount + (item._sum.amount || 0),
          count: existing.count + item._count,
        });
      }
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      totalAmount: data.totalAmount,
      count: data.count,
    }));
  }

  /**
   * 사용자의 총 정산 금액 조회 (기간별)
   * @param userId - 사용자 ID
   * @param startDate - 조회 시작 날짜
   * @param endDate - 조회 종료 날짜
   * @returns 총 정산 금액
   */
  async getTotalAmountByPeriod(
    userId: Uint8Array,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await prisma.income_log.aggregate({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        income_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }
}

export default new SettlementHistoryRepository();
