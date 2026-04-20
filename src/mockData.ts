import { ModelProfile, ChatRoom, User, Campaign, Offer, ChatMessage } from '@/types';

export const MOCK_USER_ADVERTISER: User = {
  id: 'adv1',
  email: 'alex@nike.com',
  type: 'ADVERTISER',
  name: '알렉스 리베라',
  companyName: '나이키 코리아',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
};

export const MOCK_MODELS: ModelProfile[] = [
  {
    id: 'm1',
    email: 'seoyeon@model.com',
    type: 'MODEL',
    name: '김서연',
    age: 24,
    height: 168,
    category: ['패션', '뷰티'],
    region: '서울',
    price: '300,000원+',
    rating: 4.9,
    reviewCount: 124,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
    ],
    description: '미니멀 패션과 클린 뷰티 컨셉 전문 모델입니다. 커머셜 촬영 분야에서 5년의 경력을 보유하고 있습니다.',
    style: '미니멀'
  },
  {
    id: 'm2',
    email: 'minho@model.com',
    type: 'MODEL',
    name: '이민호',
    age: 27,
    height: 185,
    category: ['스포츠', '커머셜'],
    region: '경기',
    price: '500,000원+',
    rating: 4.8,
    reviewCount: 89,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492562080023-ab3dbdf5bb3d?auto=format&fit=crop&q=80&w=800'
    ],
    description: '피트니스 및 라이프스타일 브랜드에 최적화된 스포츠 모델입니다. 전문적인 태도와 넘치는 에너지를 약속드립니다.',
    style: '애슬레틱'
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp1',
    advertiserId: 'adv1',
    title: '여름 러닝 컬렉션',
    brand: '나이키',
    budget: '5,000,000원',
    requirements: '야외 촬영이 가능한 스포티한 모델을 찾습니다.',
    goals: '새로운 여름 컬렉션의 브랜드 인지도 향상.',
    contentStyle: '역동적이고 에너지가 넘치는 야외 도심 배경.',
    brandGuidelines: '진정성 있고 퍼포먼스 중심적인 느낌. 미니멀한 배경 선호.',
    productDetails: '새로운 통기성 메쉬 러닝화 및 경량 의류.',
    benefits: '교통비 지원, 전문 포토그래퍼의 포트폴리오 컷 제공.',
    status: 'OPEN',
    type: '커머셜',
    createdAt: '2026-03-20'
  }
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'off1',
    campaignId: 'camp1',
    advertiserId: 'adv1',
    modelId: 'm1',
    price: '400,000원',
    status: 'PENDING',
    createdAt: '2026-03-30'
  }
];

export const MOCK_CHATS: ChatRoom[] = [
  {
    id: 'room1',
    participants: ['adv1', 'm1'],
    lastMessage: '여름 캠페인 촬영을 진행하고 싶습니다.',
    timestamp: '오후 2:30',
    unreadCount: 2
  }
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg1',
    roomId: 'room1',
    senderId: 'adv1',
    text: '안녕하세요 서연님! 포트폴리오를 보고 연락드렸습니다.',
    timestamp: '오후 2:25'
  },
  {
    id: 'msg2',
    roomId: 'room1',
    senderId: 'adv1',
    text: '여름 캠페인 촬영을 진행하고 싶습니다.',
    timestamp: '오후 2:30'
  }
];
