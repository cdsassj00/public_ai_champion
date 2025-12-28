
export enum CertificationType {
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  BLACK = 'BLACK'
}

export type ChampionStatus = 'APPROVED' | 'PENDING';

export interface Champion {
  id: string;
  name: string;
  department: string;
  role: string;
  certType: CertificationType;
  vision: string;
  imageUrl: string;
  registeredAt: string;
  projectUrl?: string;
  achievement?: string;
  status: ChampionStatus;
  viewCount: number;
  email: string;      // 관리용 이메일
  password: string;   // 관리용 비밀번호
}

export type ViewState = 'HOME' | 'HALL_OF_FAME' | 'REGISTER' | 'ABOUT' | 'EDIT_PROFILE';
