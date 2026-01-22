/**
 * 정산 내역 DTO
 */

/**
 * 정산 내역 항목
 */
export interface SettlementHistoryItemDto {
  /** 정산 ID */
  incomeLogId: string;
  /** 근무 날짜 */
  workDate: string;
  /** 업체명 */
  storeName: string;
  /** 정산 금액 */
  amount: number;
  /** 정산 날짜 */
  incomeDate: string;
}

/**
 * 정산 내역 조회 응답
 */
export interface SettlementHistoryResponseDto {
  /** 정산 내역 목록 */
  settlements: SettlementHistoryItemDto[];
  /** 총 정산 금액 */
  totalAmount: number;
  /** 조회 기간 시작 */
  periodStart: string;
  /** 조회 기간 종료 */
  periodEnd: string;
}

/**
 * 월별 정산 요약
 */
export interface MonthlySettlementSummaryDto {
  /** 년월 (YYYY-MM) */
  month: string;
  /** 총 정산 금액 */
  totalAmount: number;
  /** 정산 건수 */
  count: number;
}
