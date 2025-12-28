
import { Champion, CertificationType } from './types';

export const SAMPLE_CHAMPIONS: Champion[] = [
  {
    id: 'a1',
    name: '김혁신',
    department: '행정안전부 디지털정부국',
    role: 'AI 서비스 기획관',
    certType: CertificationType.BLACK,
    vision: "데이터로 일하는 행정, AI로 체감하는 국민 행복을 꿈꿉니다.",
    imageUrl: 'https://i.pravatar.cc/600?u=a1',
    registeredAt: '2025.01.15',
    projectUrl: 'https://vibecoding.com/example-1',
    achievement: '범정부 초거대 AI 공통 인프라 아키텍처 설계 및 구축 주도',
    status: 'APPROVED',
    viewCount: 1240
  },
  {
    id: 'a2',
    name: '이도전',
    department: '서울특별시 디지털정책관',
    role: '데이터 분석관',
    certType: CertificationType.BLUE,
    vision: "현장의 문제를 AI 기술로 해결하는 실천적 전문가가 되겠습니다.",
    imageUrl: 'https://i.pravatar.cc/600?u=a2',
    registeredAt: '2025.02.01',
    achievement: 'AI 기반 실시간 교통 최적화 알고리즘 서울시 전역 확대 적용',
    status: 'APPROVED',
    viewCount: 856
  },
  {
    id: 'a3',
    name: '박미래',
    department: '과학기술정보통신부',
    role: 'AI 정책 사무관',
    certType: CertificationType.GREEN,
    vision: "AI 거버넌스의 초석을 다지고 국가 경쟁력을 강화하겠습니다.",
    imageUrl: 'https://i.pravatar.cc/600?u=a3',
    registeredAt: '2025.02.10',
    achievement: '국가 AI 윤리 가이드라인 제정 및 공공 가이드 보급',
    status: 'APPROVED',
    viewCount: 432
  },
  {
    id: 'a4',
    name: '최지능',
    department: '한국지능정보사회진흥원(NIA)',
    role: 'AI 인프라 팀장',
    certType: CertificationType.BLACK,
    vision: "모두가 누리는 안전하고 따뜻한 AI 생태계를 구축합니다.",
    imageUrl: 'https://i.pravatar.cc/600?u=a4',
    registeredAt: '2025.02.12',
    projectUrl: 'https://vibecoding.com/example-nia',
    achievement: '세계 최초 공공부문 특화 LLM 평가 지표 개발 및 적용',
    status: 'APPROVED',
    viewCount: 2105
  }
];

export const CERT_DETAILS = {
  [CertificationType.GREEN]: {
    title: 'GREEN EXPERT',
    desc: '공공 AI 실무 기획 전문가',
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
    border: 'border-emerald-500/40',
    bg: 'from-emerald-900/40 to-transparent',
    accent: 'bg-emerald-500',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  [CertificationType.BLUE]: {
    title: 'BLUE PROFESSIONAL',
    desc: 'AI 알고리즘 및 구현 마스터',
    color: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    border: 'border-blue-500/40',
    bg: 'from-blue-900/40 to-transparent',
    accent: 'bg-blue-500',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  [CertificationType.BLACK]: {
    title: 'BLACK MASTER',
    desc: '대한민국 국가 대표 AI 마스터',
    color: 'text-yellow-500',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    border: 'border-yellow-600/50',
    bg: 'from-yellow-900/40 to-transparent',
    accent: 'bg-yellow-500',
    gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 45%, #b38728 100%)'
  }
};
