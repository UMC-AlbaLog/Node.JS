import { Controller, Get, Route, Tags, Path, Query, SuccessResponse, Response } from 'tsoa';
import SettlementHistoryService from '../service/settlement_history_service';
import {
  SettlementHistoryResponseDto,
  MonthlySettlementSummaryDto,
} from '../DTO/settlement_history_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Settlement History Controller
 * 정산 내역 조회 API
 */
@Route('api/settlement-history')
@Tags('Settlement History')
export class SettlementHistoryController extends Controller {
  /**
   * 정산 내역 조회 (기간별)
   * @param userId - 사용자 ID (UUID 문자열)
   * @param startDate - 조회 시작 날짜 (YYYY-MM-DD)
   * @param endDate - 조회 종료 날짜 (YYYY-MM-DD)
   * @returns 정산 내역 목록
   */
  @Get('{userId}')
  @SuccessResponse('200', '정산 내역 조회 성공')
  @Response(400, 'Bad Request')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getSettlementHistory(
    @Path() userId: string,
    @Query() startDate: string,
    @Query() endDate: string,
  ): Promise<TsoaSuccessResponse<SettlementHistoryResponseDto>> {
    // UUID 문자열을 Buffer로 변환
    const userIdBuffer = uuidToBuffer(userId);

    // 날짜 문자열을 Date 객체로 변환
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Service 호출
    const history = await SettlementHistoryService.getSettlementHistory(
      userIdBuffer,
      start,
      end,
    );

    // 성공 응답 반환
    return new TsoaSuccessResponse(history);
  }

  /**
   * 월별 정산 요약 조회
   * @param userId - 사용자 ID (UUID 문자열)
   * @param year - 조회 연도 (예: 2025)
   * @returns 월별 정산 요약 목록
   */
  @Get('{userId}/monthly')
  @SuccessResponse('200', '월별 정산 요약 조회 성공')
  @Response(400, 'Bad Request')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getMonthlySettlementSummary(
    @Path() userId: string,
    @Query() year: number,
  ): Promise<TsoaSuccessResponse<MonthlySettlementSummaryDto[]>> {
    // UUID 문자열을 Buffer로 변환
    const userIdBuffer = uuidToBuffer(userId);

    // Service 호출
    const summary = await SettlementHistoryService.getMonthlySettlementSummary(
      userIdBuffer,
      year,
    );

    // 성공 응답 반환
    return new TsoaSuccessResponse(summary);
  }
}
