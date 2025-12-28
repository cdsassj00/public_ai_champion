
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
    viewCount: 1240,
    email: 'admin@example.com',
    password: '0000'
  }
];

export const CERT_DETAILS = {
  [CertificationType.GREEN]: {
    title: 'AI 챔피언 그린 (Green)',
    label: '트랙2: AI 융합 실무자',
    desc: '노코드 기반의 AI 실무 적용 역량 인증',
    criteria: [
      '생성형 AI를 활용한 행정 문서 및 홍보물 기획',
      '노코드 도구를 활용한 정책 인사이트 도출 및 시각화',
      '민원 매뉴얼 기반 응답형 챗봇 서비스 구현'
    ],
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.1)]',
    border: 'border-emerald-500/20',
    bg: 'from-emerald-950/20 to-black',
    accent: 'bg-emerald-500',
    icon: '◈'
  },
  [CertificationType.BLUE]: {
    title: 'AI 챔피언 블루 (Blue)',
    label: '트랙3: AI 전환 실행자',
    desc: '개발·모델링 기반의 AI 실행 역량 인증',
    criteria: [
      '머신러닝 알고리즘 기반 에너지 사용량 예측 모델 설계',
      'LLM 및 파이썬 자동화를 통한 업무 프로세스 개선',
      '데이터 분석 및 모델링을 통한 공공 서비스 최적화'
    ],
    color: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.1)]',
    border: 'border-blue-500/20',
    bg: 'from-blue-950/20 to-black',
    accent: 'bg-blue-500',
    icon: '✦'
  },
  [CertificationType.BLACK]: {
    title: 'AI 챔피언 블랙 (Black)',
    label: '트랙4: AI 마스터 (예정)',
    desc: '고급 AI 기술 이해 및 혁신 리딩 전문가',
    criteria: [
      '범정부 AI 인프라 및 정책 수립 리딩',
      '고급 분석 기술 및 생성형 AI 기술 전략 수립',
      '2026년 도입 예정인 최고 등급 마스터 과정'
    ],
    color: 'text-yellow-500',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    border: 'border-yellow-600/30',
    bg: 'from-yellow-950/20 to-black',
    accent: 'bg-yellow-500',
    icon: '★'
  }
};
