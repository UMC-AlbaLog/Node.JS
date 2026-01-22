import SettlementHistoryRepository from '../repository/settlement_history_repository';
import {
  SettlementHistoryResponseDto,
  SettlementHistoryItemDto,
  MonthlySettlementSummaryDto,
} from '../DTO/settlement_history_dto';
import { bufferToUuid } from '../util/uuid_util';
import { formatDate } from '../util/date_util';

/**
 * Settlement History Service
 * 정산 내역 관련 비즈니스 로직 처리
 */
class SettlementHistoryService {
  /**
   * 정산 내역 조회 (기간별)
   * @param userId - 사용자 ID (Buffer 형식)
   * @param startDate - 조회 시작 날짜
   * @param endDate - 조회 종료 날짜
   * @returns 정산 내역 응답
   */
  async getSettlementHistory(
    userId: Uint8Array,
    startDate: Date,
    endDate: Date,
  ): Promise<SettlementHistoryResponseDto> {
    // 1. Repository에서 정산 내역 가져오기
    const settlements = await SettlementHistoryRepository.findSettlementsByPeriod(
      userId,
      startDate,
      endDate,
    );

    // 2. 총 정산 금액 계산
    const totalAmount = await SettlementHistoryRepository.getTotalAmountByPeriod(
      userId,
      startDate,
      endDate,
    );

    // 3. DTO 형식으로 변환
    const settlementItems: SettlementHistoryItemDto[] = settlements.map((item) => ({
      incomeLogId: bufferToUuid(item.income_log_id),
      workDate: item.user_work_log.work_date ? formatDate(item.user_work_log.work_date) : '',
      storeName: item.user_work_log.alba_posting.store.store_name || '',
      amount: item.amount || 0,
      incomeDate: item.income_date ? formatDate(item.income_date) : '',
    }));

    return {
      settlements: settlementItems,
      totalAmount,
      periodStart: formatDate(startDate),
      periodEnd: formatDate(endDate),
    };
  }

  /**
   * 월별 정산 요약 조회
   * @param userId - 사용자 ID (Buffer 형식)
   * @param year - 조회 연도
   * @returns 월별 정산 요약 목록
   */
  async getMonthlySettlementSummary(
    userId: Uint8Array,
    year: number,
  ): Promise<MonthlySettlementSummaryDto[]> {
    // 1. Repository에서 월별 요약 가져오기
    const monthlySummary = await SettlementHistoryRepository.getMonthlySettlementSummary(
      userId,
      year,
    );

    // 2. DTO 형식으로 변환 (YYYY-MM 포맷)
    return monthlySummary.map((item) => ({
      month: `${year}-${String(item.month).padStart(2, '0')}`,
      totalAmount: item.totalAmount,
      count: item.count,
    }));
  }
}

export default new SettlementHistoryService();
