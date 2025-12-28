
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
  passcode: string; // 본인 확인용 PIN (4자리)
}

export type ViewState = 'HOME' | 'HALL_OF_FAME' | 'REGISTER' | 'ABOUT' | 'EDIT_PROFILE';
