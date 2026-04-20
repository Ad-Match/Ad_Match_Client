'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageCircle,
  User as UserIcon,
  Home,
  Filter,
  ChevronRight,
  Star,
  MapPin,
  ArrowLeft,
  X,
  Send,
  MoreVertical,
  Plus,
  Briefcase,
  History,
  Settings,
  LogOut,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ModelProfile,
  Campaign,
  Offer,
  ChatRoom,
  ChatMessage,
  UserType,
} from '@/types';
import {
  MOCK_USER_ADVERTISER,
  MOCK_MODELS,
  MOCK_CAMPAIGNS,
  MOCK_OFFERS,
  MOCK_CHATS,
  MOCK_MESSAGES,
} from '@/mockData';

// --- Utility ---
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// --- Components ---

const BottomNav = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 py-3 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:left-0 md:w-20 md:h-screen md:flex-col md:border-t-0 md:border-r md:py-12">
    <div className="hidden md:block mb-12">
      <h1 className="text-2xl font-bold tracking-tighter font-display">AM</h1>
    </div>
    <button
      onClick={() => setActiveTab('home')}
      className={cn(
        'flex flex-col items-center gap-1 transition-colors',
        activeTab === 'home' ? 'text-black' : 'text-zinc-400',
      )}
    >
      <Home size={24} />
      <span className="text-[10px] font-bold md:hidden">홈</span>
    </button>
    <button
      onClick={() => setActiveTab('search')}
      className={cn(
        'flex flex-col items-center gap-1 transition-colors',
        activeTab === 'search' ? 'text-black' : 'text-zinc-400',
      )}
    >
      <Search size={24} />
      <span className="text-[10px] font-bold md:hidden">탐색</span>
    </button>
    <button
      onClick={() => setActiveTab('chat')}
      className={cn(
        'flex flex-col items-center gap-1 transition-colors',
        activeTab === 'chat' ? 'text-black' : 'text-zinc-400',
      )}
    >
      <div className="relative">
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white">
          2
        </span>
      </div>
      <span className="text-[10px] font-bold md:hidden">채팅</span>
    </button>
    <button
      onClick={() => setActiveTab('profile')}
      className={cn(
        'flex flex-col items-center gap-1 transition-colors',
        activeTab === 'profile' ? 'text-black' : 'text-zinc-400',
      )}
    >
      <UserIcon size={24} />
      <span className="text-[10px] font-bold md:hidden">프로필</span>
    </button>
    <div className="hidden md:block mt-auto">
      <Settings size={24} className="text-zinc-400" />
    </div>
  </nav>
);

const MatchHistoryView = ({
  offers,
  campaigns,
  models,
  currentUser,
  onBack,
  onWriteReview,
}: {
  offers: Offer[];
  campaigns: Campaign[];
  models: ModelProfile[];
  currentUser: User;
  onBack: () => void;
  onWriteReview: () => void;
}) => {
  const myOffers = offers.filter(
    (o) => o.advertiserId === currentUser.id || o.modelId === currentUser.id,
  );

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-white z-[60] overflow-y-auto"
    >
      <header className="px-6 py-6 border-b border-zinc-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <button onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">매칭 히스토리</h2>
      </header>
      <div className="p-6 space-y-4 md:max-w-2xl md:mx-auto">
        {myOffers.map((offer) => {
          const campaign = campaigns.find((c) => c.id === offer.campaignId);
          const model = models.find((m) => m.id === offer.modelId);

          return (
            <div key={offer.id} className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{campaign?.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {currentUser.type === 'ADVERTISER'
                      ? `모델: ${model?.name}`
                      : `브랜드: ${campaign?.brand}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-1 rounded-lg',
                    offer.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-600'
                      : offer.status === 'PENDING'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-zinc-200 text-zinc-500',
                  )}
                >
                  {offer.status === 'ACCEPTED'
                    ? '매칭 완료'
                    : offer.status === 'PENDING'
                      ? '대기 중'
                      : '거절됨'}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-bold">{offer.price}</span>
                <span className="text-[10px] text-zinc-400">{offer.createdAt}</span>
              </div>
              {offer.status === 'ACCEPTED' && currentUser.type === 'ADVERTISER' && (
                <button
                  onClick={onWriteReview}
                  className="w-full mt-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-100"
                >
                  리뷰 작성
                </button>
              )}
            </div>
          );
        })}
        {myOffers.length === 0 && (
          <div className="text-center py-20 text-zinc-300">활동 내역이 없습니다.</div>
        )}
      </div>
    </motion.div>
  );
};

const ChatRoomView = ({
  room,
  currentUser,
  onBack,
}: {
  room: ChatRoom;
  currentUser: User;
  onBack: () => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_MESSAGES.filter((m) => m.roomId === room.id),
  );
  const [inputText, setInputText] = useState('');

  const otherParticipantId = room.participants.find((id) => id !== currentUser.id);
  const otherUser =
    MOCK_MODELS.find((m) => m.id === otherParticipantId) || MOCK_USER_ADVERTISER;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      roomId: room.id,
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-white z-[70] flex flex-col"
    >
      <header className="px-4 py-4 border-b border-zinc-100 flex items-center gap-4 md:max-w-2xl md:mx-auto md:w-full">
        <button onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <img
            src={otherUser.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-bold text-sm">{otherUser.name}</h3>
            <p className="text-[10px] text-green-500 font-medium">온라인</p>
          </div>
        </div>
        <button>
          <MoreVertical size={20} className="text-zinc-400" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 md:max-w-2xl md:mx-auto md:w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.senderId === currentUser.id ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm',
                msg.senderId === currentUser.id
                  ? 'bg-black text-white rounded-tr-none'
                  : 'bg-white text-zinc-900 rounded-tl-none',
              )}
            >
              <p>{msg.text}</p>
              <p
                className={cn(
                  'text-[10px] mt-1',
                  msg.senderId === currentUser.id ? 'text-zinc-400' : 'text-zinc-400',
                )}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-zinc-100 flex gap-3 items-center pb-safe md:max-w-2xl md:mx-auto md:w-full">
        <button className="text-zinc-400">
          <Plus size={24} />
        </button>
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-zinc-100 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
};

const CampaignForm = ({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (camp: Campaign) => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    budget: '',
    requirements: '',
    goals: '',
    contentStyle: '',
    brandGuidelines: '',
    productDetails: '',
    benefits: '',
    type: '커머셜',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: Campaign = {
      id: Date.now().toString(),
      advertiserId: 'adv1',
      ...formData,
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0],
    };
    onSave(newCamp);
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-white z-[60] overflow-y-auto p-6 md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack}>
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold">새 캠페인 등록</h2>
        <div className="w-6" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            캠페인 제목
          </label>
          <input
            required
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none"
            placeholder="예: 2026 여름 러닝 컬렉션"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            브랜드명
          </label>
          <input
            required
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none"
            placeholder="예: 나이키"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              예산
            </label>
            <input
              required
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none"
              placeholder="5,000,000원"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              유형
            </label>
            <select
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none appearance-none"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option>커머셜</option>
              <option>UGC</option>
              <option>에디토리얼</option>
              <option>소셜 미디어</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            요구사항
          </label>
          <textarea
            required
            rows={4}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
            placeholder="모델에게 바라는 점을 상세히 적어주세요..."
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            캠페인 목표
          </label>
          <textarea
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
            placeholder="예: 브랜드 인지도 향상, 매출 증대..."
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            콘텐츠 스타일
          </label>
          <textarea
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
            placeholder="예: 미니멀, 역동적, 시네마틱..."
            value={formData.contentStyle}
            onChange={(e) => setFormData({ ...formData, contentStyle: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            브랜드 가이드라인
          </label>
          <textarea
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
            placeholder="예: 과한 메이크업 지양, 진정성 있는 모습..."
            value={formData.brandGuidelines}
            onChange={(e) => setFormData({ ...formData, brandGuidelines: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            제품/서비스 상세 정보
          </label>
          <textarea
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
            placeholder="홍보할 제품이나 서비스에 대해 설명해주세요..."
            value={formData.productDetails}
            onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            기타 혜택
          </label>
          <textarea
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
            placeholder="예: 교통비 지원, 숙박 제공, 제품 증정..."
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-transform mt-8"
        >
          캠페인 생성하기
        </button>
      </form>
    </motion.div>
  );
};

const ReviewForm = ({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (review: { rating: number; comment: string }) => void;
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-white z-[80] p-6 md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack}>
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold">리뷰 작성</h2>
        <div className="w-6" />
      </header>
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">평점</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)}>
                <Star
                  size={32}
                  className={cn(
                    s <= rating ? 'fill-orange-400 text-orange-400' : 'text-zinc-200',
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            내용
          </label>
          <textarea
            rows={5}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 resize-none"
            placeholder="모델과의 협업 경험을 공유해주세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => onSave({ rating, comment })}
          className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-xl"
        >
          리뷰 제출하기
        </button>
      </div>
    </motion.div>
  );
};

const FilterOverlay = ({
  onBack,
  onApply,
}: {
  onBack: () => void;
  onApply: (filters: Record<string, unknown>) => void;
}) => {
  const [filters, setFilters] = useState({
    height: [160, 190],
    age: [18, 35],
    style: 'All',
    region: 'All',
  });

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-white z-[60] p-6 overflow-y-auto md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack}>
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold">필터 설정</h2>
        <button
          type="button"
          onClick={() =>
            setFilters({ height: [160, 190], age: [18, 35], style: 'All', region: 'All' })
          }
          className="text-sm text-zinc-400"
        >
          초기화
        </button>
      </header>

      <div className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            스타일 카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'All', label: '전체' },
              { id: 'Streetwear', label: '스트릿' },
              { id: 'Luxury', label: '럭셔리' },
              { id: 'Minimalist', label: '미니멀' },
              { id: 'Athleisure', label: '애슬레저' },
              { id: 'Vintage', label: '빈티지' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilters({ ...filters, style: s.id })}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                  filters.style === s.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-600 border-zinc-100',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            지역
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'All', label: '전체' },
              { id: 'Seoul', label: '서울' },
              { id: 'Busan', label: '부산' },
              { id: 'Incheon', label: '인천' },
              { id: 'Daegu', label: '대구' },
              { id: 'Gwangju', label: '광주' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFilters({ ...filters, region: r.id })}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                  filters.region === r.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-600 border-zinc-100',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            연령대
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="18"
              max="50"
              className="flex-1 accent-black"
              value={filters.age[1]}
              onChange={(e) =>
                setFilters({ ...filters, age: [18, parseInt(e.target.value, 10)] })
              }
            />
            <span className="text-sm font-bold w-12 text-right">~{filters.age[1]}</span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <button
          type="button"
          onClick={() => onApply(filters)}
          className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-xl"
        >
          필터 적용하기
        </button>
      </div>
    </motion.div>
  );
};

const LoginView = ({ onLogin }: { onLogin: (type: UserType) => void }) => (
  <div className="min-h-screen bg-white p-8 flex flex-col justify-center md:max-w-md md:mx-auto">
    <div className="mb-12">
      <h1 className="text-5xl font-bold tracking-tighter font-display">AdMatch</h1>
      <p className="text-zinc-400 mt-2 font-medium">브랜드에 완벽한 얼굴을 찾아보세요.</p>
    </div>

    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onLogin('ADVERTISER')}
        className="w-full bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-black/10 active:scale-95 transition-transform"
      >
        <Briefcase size={20} />
        광고주로 시작하기
      </button>
      <button
        type="button"
        onClick={() => onLogin('MODEL')}
        className="w-full bg-white text-black border-2 border-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <Camera size={20} />
        모델로 시작하기
      </button>
    </div>

    <p className="text-center text-xs text-zinc-400 mt-12">
      계속 진행함으로써 <span className="underline cursor-pointer">이용약관</span> 및{' '}
      <span className="underline cursor-pointer">개인정보 처리방침</span>에 동의하게 됩니다.
    </p>
  </div>
);

const PortfolioEditView = ({
  profile,
  onBack,
  onSave,
}: {
  profile: ModelProfile;
  onBack: () => void;
  onSave: (p: ModelProfile) => void;
}) => {
  const [data, setData] = useState(profile);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-white z-[60] overflow-y-auto p-6 md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
    >
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack}>
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold">포트폴리오 수정</h2>
        <button type="button" onClick={() => onSave(data)} className="text-orange-600 font-bold">
          저장
        </button>
      </header>

      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={data.avatar}
              alt=""
              className="w-24 h-24 rounded-3xl object-cover"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl border-4 border-white"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              이름
            </label>
            <input
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              소개
            </label>
            <textarea
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 resize-none"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                키
              </label>
              <input
                type="number"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4"
                value={data.height}
                onChange={(e) => setData({ ...data, height: parseInt(e.target.value, 10) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                나이
              </label>
              <input
                type="number"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4"
                value={data.age}
                onChange={(e) => setData({ ...data, age: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            포트폴리오 이미지
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {data.images.map((img, i) => (
              <div key={i} className="relative aspect-square">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-lg"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function AdMatchApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPortfolioEdit, setShowPortfolioEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [models, setModels] = useState<ModelProfile[]>(MOCK_MODELS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(MOCK_CHATS);

  const handleLogin = (type: UserType) => {
    if (type === 'ADVERTISER') {
      setCurrentUser(MOCK_USER_ADVERTISER);
    } else {
      setCurrentUser(MOCK_MODELS[0]);
    }
  };

  const handleSendOffer = (modelId: string) => {
    const newOffer: Offer = {
      id: Date.now().toString(),
      campaignId: campaigns[0].id,
      advertiserId: currentUser?.id || '',
      modelId,
      price: '₩500,000',
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOffers([...offers, newOffer]);
    setSelectedModel(null);
    alert('제안이 성공적으로 전송되었습니다!');
  };

  const handleAcceptOffer = (offerId: string) => {
    setOffers(offers.map((o) => (o.id === offerId ? { ...o, status: 'ACCEPTED' as const } : o)));
    const offer = offers.find((o) => o.id === offerId);
    if (offer) {
      const newRoom: ChatRoom = {
        id: `room-${Date.now()}`,
        matchId: offer.id,
        participants: [offer.advertiserId, offer.modelId],
        lastMessage: '제안이 수락되었습니다! 상세 내용을 논의해보세요.',
        timestamp: '방금 전',
        unreadCount: 0,
      };
      setChatRooms([newRoom, ...chatRooms]);
    }
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black md:pl-20">
      <>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 pb-24 overflow-y-auto md:max-w-5xl md:mx-auto md:w-full md:pb-12">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pt-4">
              {currentUser.type === 'ADVERTISER' ? (
                <div className="px-6 space-y-8">
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">내 캠페인</h2>
                      <button
                        type="button"
                        onClick={() => setShowCampaignForm(true)}
                        className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-black"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaigns
                        .filter((c) => c.advertiserId === currentUser.id)
                        .map((camp) => {
                          const activeOffers = offers.filter(
                            (o) => o.campaignId === camp.id && o.status === 'ACCEPTED',
                          ).length;
                          const pendingOffers = offers.filter(
                            (o) => o.campaignId === camp.id && o.status === 'PENDING',
                          ).length;

                          return (
                            <div key={camp.id} className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-lg">{camp.title}</h3>
                                  <p className="text-sm text-zinc-500">{camp.brand}</p>
                                </div>
                                <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                                  진행중
                                </span>
                              </div>
                              <div className="mt-4 flex gap-6">
                                <div>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase">매칭됨</p>
                                  <p className="text-sm font-bold">{activeOffers}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase">대기중</p>
                                  <p className="text-sm font-bold">{pendingOffers}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase">예산</p>
                                  <p className="text-sm font-bold">{camp.budget}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold mb-4">추천 모델</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {models.slice(0, 4).map((model) => (
                        <div
                          key={model.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedModel(model)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedModel(model);
                          }}
                          className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group"
                        >
                          <img
                            src={model.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h3 className="text-sm font-bold truncate">{model.name}</h3>
                            <p className="text-[10px] opacity-80">{model.region}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="px-6 space-y-8">
                  <section className="bg-black text-white p-6 rounded-[2.5rem] shadow-2xl shadow-black/20 relative overflow-hidden md:max-w-2xl md:mx-auto">
                    <div className="relative z-10">
                      <div className="flex items-center gap-4">
                        <img
                          src={currentUser.avatar}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h3 className="text-lg font-bold">{(currentUser as ModelProfile).name}</h3>
                          <p className="text-xs text-zinc-400">전문 모델</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                            키
                          </p>
                          <p className="text-sm font-bold mt-1">
                            {(currentUser as ModelProfile).height}cm
                          </p>
                        </div>
                        <div className="text-center border-x border-white/10">
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                            나이
                          </p>
                          <p className="text-sm font-bold mt-1">
                            {(currentUser as ModelProfile).age}세
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                            평점
                          </p>
                          <p className="text-sm font-bold mt-1 flex items-center justify-center gap-1">
                            4.9{' '}
                            <Star size={10} className="fill-orange-400 text-orange-400" />
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full" />
                  </section>

                  {offers.filter((o) => o.modelId === currentUser.id && o.status === 'PENDING').length >
                    0 && (
                    <section>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">새로운 제안</h2>
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          {
                            offers.filter((o) => o.modelId === currentUser.id && o.status === 'PENDING')
                              .length
                          }{' '}
                          NEW
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offers
                          .filter((o) => o.modelId === currentUser.id && o.status === 'PENDING')
                          .map((offer) => {
                            const campaign = campaigns.find((c) => c.id === offer.campaignId);
                            return (
                              <div
                                key={offer.id}
                                className="p-5 bg-orange-50/50 rounded-3xl border border-orange-100"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-sm">{campaign?.title}</h3>
                                    <p className="text-xs text-zinc-500">{campaign?.brand}</p>
                                  </div>
                                  <p className="text-sm font-bold text-orange-600">{offer.price}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptOffer(offer.id)}
                                    className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-xl"
                                  >
                                    수락
                                  </button>
                                  <button
                                    type="button"
                                    className="flex-1 bg-white border border-zinc-200 text-zinc-400 text-xs font-bold py-2.5 rounded-xl"
                                  >
                                    거절
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </section>
                  )}

                  <section>
                    <h2 className="text-xl font-bold mb-4">진행 중인 프로젝트</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {offers
                        .filter((o) => o.modelId === currentUser.id && o.status === 'ACCEPTED')
                        .map((offer) => {
                          const campaign = campaigns.find((c) => c.id === offer.campaignId);
                          return (
                            <div
                              key={offer.id}
                              className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center gap-4"
                            >
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-100 shadow-sm">
                                <Briefcase size={20} className="text-zinc-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-sm">{campaign?.title}</h3>
                                <p className="text-xs text-zinc-500">{campaign?.brand} • 진행중</p>
                              </div>
                              <ChevronRight size={18} className="text-zinc-300" />
                            </div>
                          );
                        })}
                      {offers.filter((o) => o.modelId === currentUser.id && o.status === 'ACCEPTED')
                        .length === 0 && (
                        <div className="py-8 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 text-zinc-400 text-sm">
                          현재 진행 중인 프로젝트가 없습니다.
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold mb-4">지원 가능한 캠페인</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaigns
                        .filter((c) => c.status === 'OPEN')
                        .map((camp) => (
                          <div
                            key={camp.id}
                            className="p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{camp.title}</h3>
                                <p className="text-sm text-zinc-500">{camp.brand}</p>
                              </div>
                              <span className="text-[10px] font-bold text-zinc-400">{camp.type}</span>
                            </div>
                            <p className="mt-3 text-sm text-zinc-600 line-clamp-2">{camp.requirements}</p>
                            <div className="mt-4 pt-4 border-t border-zinc-50 flex justify-between items-center">
                              <span className="text-sm font-bold">{camp.budget}</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCampaign(camp)}
                                  className="px-4 py-2 bg-zinc-100 text-black text-xs font-bold rounded-xl"
                                >
                                  상세보기
                                </button>
                                <button
                                  type="button"
                                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
                                >
                                  지원하기
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <div className="px-6 pt-8 space-y-8">
              <div className="flex gap-3 md:max-w-2xl md:mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    className="w-full bg-zinc-100 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600"
                >
                  <Filter size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    추천 카테고리
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['패션', '뷰티', '스포츠', 'UGC', '커머셜', '라이프스타일'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="px-5 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedModel(model)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedModel(model);
                      }}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
                    >
                      <img
                        src={model.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold">{model.name}</h3>
                        <div className="flex items-center gap-1 mt-1 opacity-80 text-[10px]">
                          <MapPin size={10} />
                          <span>{model.region}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="px-6 pt-8 space-y-6">
              <h2 className="text-2xl font-bold">채팅</h2>
              <div className="space-y-2 md:max-w-2xl md:mx-auto">
                {chatRooms.map((room) => {
                  const otherParticipant = room.participants.find((p) => p !== currentUser.id);
                  const otherUser =
                    otherParticipant === 'adv1'
                      ? MOCK_USER_ADVERTISER
                      : MOCK_MODELS.find((m) => m.id === otherParticipant);

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-zinc-50 transition-colors text-left"
                    >
                      <img
                        src={otherUser?.avatar}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold truncate">{otherUser?.name}</h3>
                          <span className="text-[10px] text-zinc-400">{room.timestamp}</span>
                        </div>
                        <p className="text-sm text-zinc-500 truncate">{room.lastMessage}</p>
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                          {room.unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="px-6 pt-8 space-y-8 md:max-w-2xl md:mx-auto">
              <div className="flex items-center gap-6">
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-20 h-20 rounded-3xl object-cover border-4 border-zinc-50"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                  <p className="text-zinc-500">
                    {currentUser.type === 'ADVERTISER'
                      ? (currentUser as User).companyName
                      : '전문 모델'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="p-6 bg-zinc-50 rounded-3xl text-left hover:bg-zinc-100 transition-colors"
                >
                  <History className="text-zinc-400 mb-3" size={24} />
                  <p className="font-bold">매칭 히스토리</p>
                  <p className="text-xs text-zinc-400 mt-1">과거 활동 내역</p>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="p-6 bg-zinc-50 rounded-3xl text-left hover:bg-zinc-100 transition-colors"
                >
                  <Star className="text-zinc-400 mb-3" size={24} />
                  <p className="font-bold">리뷰 관리</p>
                  <p className="text-xs text-zinc-400 mt-1">받은 평가 확인</p>
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-4 mb-2">
                  설정
                </h3>
                {currentUser.type === 'MODEL' && (
                  <button
                    type="button"
                    onClick={() => setShowPortfolioEdit(true)}
                    className="w-full flex justify-between items-center p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors"
                  >
                    <span className="font-medium">포트폴리오 수정</span>
                    <ChevronRight size={18} className="text-zinc-400" />
                  </button>
                )}
                {['계정 설정', '결제 수단', '알림 설정', '고객 센터'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="w-full flex justify-between items-center p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors"
                  >
                    <span className="font-medium">{item}</span>
                    <ChevronRight size={18} className="text-zinc-400" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                className="w-full mt-12 py-4 text-red-500 font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </div>
          )}
        </main>
      </>

      <AnimatePresence>
        {selectedCampaign && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-white z-[60] overflow-y-auto p-6 md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
          >
            <header className="flex justify-between items-center mb-8">
              <button type="button" onClick={() => setSelectedCampaign(null)}>
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold">캠페인 상세 정보</h2>
              <div className="w-6" />
            </header>

            <div className="space-y-8 pb-24">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{selectedCampaign.title}</h1>
                <p className="text-zinc-500 mt-1">
                  {selectedCampaign.brand} • {selectedCampaign.type}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">예산</p>
                  <p className="text-lg font-bold mt-1">{selectedCampaign.budget}</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    등록일
                  </p>
                  <p className="text-lg font-bold mt-1">{selectedCampaign.createdAt}</p>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    요구사항
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">{selectedCampaign.requirements}</p>
                </section>

                {selectedCampaign.goals && (
                  <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      캠페인 목표
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">{selectedCampaign.goals}</p>
                  </section>
                )}

                {selectedCampaign.contentStyle && (
                  <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      콘텐츠 스타일
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">{selectedCampaign.contentStyle}</p>
                  </section>
                )}

                {selectedCampaign.brandGuidelines && (
                  <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      브랜드 가이드라인
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">{selectedCampaign.brandGuidelines}</p>
                  </section>
                )}

                {selectedCampaign.productDetails && (
                  <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      제품/서비스 상세 정보
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">{selectedCampaign.productDetails}</p>
                  </section>
                )}

                {selectedCampaign.benefits && (
                  <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      기타 혜택
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">{selectedCampaign.benefits}</p>
                  </section>
                )}
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 md:max-w-2xl md:mx-auto md:w-full md:rounded-b-[3rem] md:bottom-10">
              <button
                type="button"
                className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-black/10 active:scale-95 transition-transform"
              >
                이 캠페인에 지원하기
              </button>
            </div>
          </motion.div>
        )}

        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-white z-[60] overflow-y-auto pb-24 md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
          >
            <div className="relative h-[60vh]">
              <img
                src={selectedModel.images[0]}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="px-6 py-8">
              <h1 className="text-3xl font-bold">{selectedModel.name}</h1>
              <p className="text-zinc-500 mt-1">{selectedModel.category?.join(' • ')}</p>
              <div className="mt-6 p-4 bg-zinc-50 rounded-2xl">
                <p className="text-xs text-zinc-400 uppercase font-bold">소개</p>
                <p className="mt-2 text-zinc-600 leading-relaxed">{selectedModel.description}</p>
              </div>
              <div className="mt-8">
                <h2 className="text-xl font-bold">포트폴리오</h2>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {selectedModel.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-full aspect-square object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 flex gap-3 md:max-w-2xl md:mx-auto md:w-full md:rounded-b-[3rem] md:bottom-10">
              <button
                type="button"
                onClick={() => handleSendOffer(selectedModel.id)}
                className="flex-1 bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-black/10"
              >
                제안 보내기
              </button>
              <button
                type="button"
                className="w-14 h-14 border border-zinc-200 rounded-2xl flex items-center justify-center"
              >
                <MessageCircle size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {selectedRoom && (
          <ChatRoomView room={selectedRoom} currentUser={currentUser} onBack={() => setSelectedRoom(null)} />
        )}

        {showCampaignForm && (
          <CampaignForm
            onBack={() => setShowCampaignForm(false)}
            onSave={(camp) => {
              setCampaigns([camp, ...campaigns]);
              setShowCampaignForm(false);
              alert('캠페인이 생성되었습니다!');
            }}
          />
        )}

        {showHistory && (
          <MatchHistoryView
            offers={offers}
            campaigns={campaigns}
            models={models}
            currentUser={currentUser}
            onBack={() => setShowHistory(false)}
            onWriteReview={() => setShowReviewForm(true)}
          />
        )}

        {showPortfolioEdit && currentUser.type === 'MODEL' && (
          <PortfolioEditView
            profile={currentUser as ModelProfile}
            onBack={() => setShowPortfolioEdit(false)}
            onSave={(p) => {
              setModels(models.map((m) => (m.id === p.id ? p : m)));
              setCurrentUser(p);
              setShowPortfolioEdit(false);
              alert('포트폴리오가 업데이트되었습니다!');
            }}
          />
        )}

        {showFilters && (
          <FilterOverlay onBack={() => setShowFilters(false)} onApply={() => setShowFilters(false)} />
        )}

        {showReviewForm && (
          <ReviewForm
            onBack={() => setShowReviewForm(false)}
            onSave={() => {
              setShowReviewForm(false);
              alert('리뷰가 제출되었습니다!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
