import UserRepository from '../repository/UserRepository';
import { ProfileResponseDto, UpdateProfileRequestDto } from '../dto/ProfileDto';

/**
 * Profile Service
 * 프로필 관련 비즈니스 로직 처리
 */
class ProfileService {
  /**
   * 프로필 조회
   * @param userId - 사용자 ID (Buffer 형식)
   * @returns 프로필 정보
   */
  async getProfile(userId: Buffer): Promise<ProfileResponseDto> {
    // 1. Repository에서 사용자 정보 가져오기
    const user = await UserRepository.findUserById(userId);

    // 2. 총 근무 횟수 가져오기
    const totalWorkCount = await UserRepository.getUserWorkCount(userId);

    // 3. 평균 평점 (신뢰 지표) 가져오기
    const trustScore = await UserRepository.getUserAverageRating(userId);

    // 4. 생년월일에서 나이 계산
    const age = this.calculateAge(user.user_birth);

    // 5. DTO 형식으로 변환해서 반환
    return {
      userId: this.bufferToUuid(user.user_id),
      userName: user.user_name || '',
      userBirth: user.user_birth ? this.formatDate(user.user_birth) : '',
      age,
      gender: user.gender || 'male',
      profileImage: user.profile_image || undefined,
      address: undefined, // TODO: 주요 활동 지역 연결
      totalWorkCount,
      trustScore,
      badges: [], // TODO: 배지 기능 구현 시 추가
      representativeHistory: undefined, // TODO: 대표 이력 기능 구현 시 추가
    };
  }

  /**
   * 프로필 수정
   * @param userId - 사용자 ID
   * @param data - 수정할 데이터
   * @returns 수정된 프로필 정보
   */
  async updateProfile(
    userId: Buffer,
    data: UpdateProfileRequestDto,
  ): Promise<ProfileResponseDto> {
    // 1. 데이터 변환 (DTO → DB 형식)
    const updateData: any = {};

    if (data.userName) {
      updateData.user_name = data.userName;
    }
    if (data.userBirth) {
      updateData.user_birth = new Date(data.userBirth);
    }
    if (data.gender) {
      updateData.gender = data.gender;
    }
    if (data.profileImage) {
      updateData.profile_image = data.profileImage;
    }

    // 2. Repository를 통해 DB 업데이트
    await UserRepository.updateUser(userId, updateData);

    // 3. 업데이트된 프로필 조회 후 반환
    return this.getProfile(userId);
  }

  /**
   * 생년월일에서 나이 계산
   * @param birthDate - 생년월일
   * @returns 나이
   */
  private calculateAge(birthDate: Date | null): number {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // 생일이 아직 안 지났으면 -1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Date를 "YYYY-MM-DD" 문자열로 변환
   * @param date - 날짜
   * @returns 포맷된 문자열
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Buffer(Binary UUID)를 문자열 UUID로 변환
   * @param buffer - Buffer 형식의 UUID
   * @returns 문자열 UUID
   */
  private bufferToUuid(buffer: Buffer): string {
    const hex = buffer.toString('hex');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }
}

export default new ProfileService();
