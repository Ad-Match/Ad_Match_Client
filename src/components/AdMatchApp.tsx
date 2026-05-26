'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Bell,
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
import { MOCK_MODELS } from '@/mockData';
import {
  AUTH_TOKEN_KEY,
  type SessionUser,
  type ApiNotification,
  authLogin,
  authMe,
  authRegister,
  campaignsCreate,
  campaignsList,
  campaignsMine,
  chatsCreateOrGetRoom,
  chatsListRooms,
  chatsMarkRead,
  chatsMessages,
  chatsSend,
  modelsList,
  notificationMarkRead,
  notificationsList,
  notificationsUnreadCount,
  offersCreate,
  offersMine,
  offersUpdateStatus,
  profileMe,
  profileUpdate,
  reviewsCreate,
  reviewsMine,
} from '@/lib/api';

// --- Utility ---
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

function mapSessionUser(s: SessionUser): User {
  const seed = encodeURIComponent(s.username);
  return {
    id: s.id,
    email: `${s.username}@local`,
    type: s.role,
    name: s.username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    companyName: s.role === 'ADVERTISER' ? `${s.username} (브랜드)` : undefined,
  };
}

// --- Components ---

const BottomNav = ({
  activeTab,
  setActiveTab,
  chatUnreadTotal,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chatUnreadTotal: number;
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
        {chatUnreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-orange-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white">
            {chatUnreadTotal > 99 ? '99+' : chatUnreadTotal}
          </span>
        )}
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
  token,
  models,
  onBack,
  onRoomsRefresh,
}: {
  room: ChatRoom;
  currentUser: User;
  token: string;
  models: ModelProfile[];
  onBack: () => void;
  onRoomsRefresh: () => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const otherParticipantId = room.participants.find((id) => id !== currentUser.id);
  const otherUser =
    models.find((m) => m.id === otherParticipantId) ?? {
      id: otherParticipantId ?? '',
      email: '',
      type: 'ADVERTISER' as const,
      name: `사용자 ${otherParticipantId ?? ''}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipantId}`,
    };

  const loadMessages = useCallback(async () => {
    try {
      const list = await chatsMessages(token, room.id);
      setMessages(
        list.map((m) => ({
          id: m.id,
          roomId: m.roomId,
          senderId: m.senderId,
          text: m.text,
          timestamp: m.timestamp,
        })),
      );
      setLoadErr(null);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : '메시지를 불러오지 못했습니다.');
    }
  }, [token, room.id]);

  useEffect(() => {
    void chatsMarkRead(token, room.id).catch(() => {});
    void loadMessages();
  }, [token, room.id, loadMessages]);

  useEffect(() => {
    const id = setInterval(() => void loadMessages(), 3000);
    return () => clearInterval(id);
  }, [loadMessages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      const m = await chatsSend(token, room.id, inputText);
      setMessages((prev) => [
        ...prev,
        {
          id: m.id,
          roomId: m.roomId,
          senderId: m.senderId,
          text: m.text,
          timestamp: m.timestamp,
        },
      ]);
      setInputText('');
      onRoomsRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : '전송에 실패했습니다.');
    }
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
        <div className="flex items-center gap-2">
          {currentUser.type === 'ADVERTISER' && (
            <button
              onClick={() => { window.location.href = '/pay'; }}
              className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
            >
              제안 및 결제
            </button>
          )}
          <button>
            <MoreVertical size={20} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 md:max-w-2xl md:mx-auto md:w-full">
        {loadErr && (
          <p className="text-center text-xs text-red-500 bg-red-50 rounded-xl py-2 px-3">{loadErr}</p>
        )}
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
          onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
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

const LoginView = ({
  onAuthed,
}: {
  onAuthed: (accessToken: string, user: SessionUser) => void;
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserType>('ADVERTISER');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const r = await authLogin(username.trim(), password);
        onAuthed(r.access_token, r.user);
      } else {
        const r = await authRegister({
          username: username.trim(),
          password,
          role,
        });
        onAuthed(r.access_token, r.user);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : '요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center md:max-w-md md:mx-auto">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tighter font-display">AdMatch</h1>
        <p className="text-zinc-400 mt-2 font-medium">브랜드에 완벽한 얼굴을 찾아보세요.</p>
      </div>

      <div className="flex rounded-2xl bg-zinc-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={cn(
            'flex-1 py-3 text-sm font-bold rounded-xl transition-colors',
            mode === 'login' ? 'bg-white shadow-sm text-black' : 'text-zinc-500',
          )}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={cn(
            'flex-1 py-3 text-sm font-bold rounded-xl transition-colors',
            mode === 'register' ? 'bg-white shadow-sm text-black' : 'text-zinc-500',
          )}
        >
          회원가입
        </button>
      </div>

      {mode === 'register' && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setRole('ADVERTISER')}
            className={cn(
              'flex-1 py-3 rounded-2xl text-sm font-bold border-2 flex items-center justify-center gap-2 transition-colors',
              role === 'ADVERTISER' ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-600',
            )}
          >
            <Briefcase size={18} />
            광고주
          </button>
          <button
            type="button"
            onClick={() => setRole('MODEL')}
            className={cn(
              'flex-1 py-3 rounded-2xl text-sm font-bold border-2 flex items-center justify-center gap-2 transition-colors',
              role === 'MODEL' ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-600',
            )}
          >
            <Camera size={18} />
            모델
          </button>
        </div>
      )}

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">아이디</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-black outline-none"
            placeholder="아이디"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">비밀번호</span>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-black outline-none"
            placeholder="비밀번호"
          />
        </label>
      </div>

      {err && <p className="mt-4 text-sm text-red-500 text-center">{err}</p>}

      <button
        type="button"
        disabled={loading || !username.trim() || !password}
        onClick={() => void submit()}
        className="w-full mt-6 bg-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-black/10 disabled:opacity-40 active:scale-[0.99] transition-transform"
      >
        {loading ? '처리 중…' : mode === 'login' ? '로그인' : '가입하기'}
      </button>

      <p className="text-center text-xs text-zinc-400 mt-10">
        계속 진행함으로써 <span className="underline cursor-pointer">이용약관</span> 및{' '}
        <span className="underline cursor-pointer">개인정보 처리방침</span>에 동의하게 됩니다.
      </p>
    </div>
  );
};

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

const mockReviews = [
  {
    id: 'r1',
    rating: 5,
    comment: '정말 멋진 촬영이었습니다. 가이드라인에 맞게 준비를 철저히 해주셨고, 매너도 아주 좋으셨어요. 다음 번에도 또 함께 작업하고 싶습니다!',
    authorname: '포토그래퍼 김민수',
    date: '2026-03-28'
  },
  {
    id: 'r2',
    rating: 4,
    comment: '시간 약속을 잘 지켜주시고 적극적으로 촬영에 임해주셨습니다.',
    authorname: '임동혁',
    date: '2026-03-15'
  }
];

const ReviewListView = ({ onBack, reviews }: { onBack: () => void, reviews: any[] }) => (
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    className="fixed inset-0 bg-white z-[80] p-6 overflow-y-auto md:max-w-2xl md:mx-auto md:shadow-2xl md:rounded-t-[3rem] md:top-10"
  >
    <header className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pt-4 pb-2">
      <button onClick={onBack}>
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-xl font-bold">받은 리뷰</h2>
      <div className="w-6" />
    </header>
    <div className="space-y-4 pb-10">
      {reviews.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">받은 리뷰가 없습니다.</div>
      ) : (
        reviews.map(r => (
          <div key={r.id} className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-orange-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < r.rating ? 'fill-current' : 'text-zinc-200'} />
                ))}
              </div>
              <span className="font-bold text-sm">{r.rating}.0</span>
            </div>
            <p className="text-sm text-zinc-600 mb-3 leading-relaxed">{r.comment}</p>
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>{r.authorname}</span>
              <span>{r.date}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </motion.div>
);

// --- Main App ---

export default function AdMatchApp() {
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
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
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifItems, setNotifItems] = useState<ApiNotification[]>([]);
  const [appNotifUnread, setAppNotifUnread] = useState(0);
  const prevNotifUnread = useRef<number | null>(null);

  const [models, setModels] = useState<ModelProfile[]>(MOCK_MODELS);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myReviews, setMyReviews] = useState<
    { id: string; rating: number; comment: string; authorname: string; date: string }[]
  >([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      const t =
        typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!t) {
        if (!cancel) setHydrated(true);
        return;
      }
      try {
        const u = await authMe(t);
        if (!cancel) {
          setToken(t);
          const base = mapSessionUser(u);
          setCurrentUser(base);
          if (u.role === 'MODEL') {
            try {
              const p = await profileMe(t);
              if (!cancel && p.type === 'MODEL') {
                const profile: ModelProfile = {
                  id: p.id,
                  email: p.email,
                  type: 'MODEL',
                  name: p.name,
                  age: p.age,
                  height: p.height,
                  category: p.category,
                  region: p.region,
                  price: p.price,
                  rating: p.rating,
                  reviewCount: p.reviewCount,
                  avatar: p.avatar,
                  images: p.images,
                  description: p.description,
                  style: p.style,
                };
                setCurrentUser(profile);
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        if (!cancel) setToken(null);
      } finally {
        if (!cancel) setHydrated(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const refreshRooms = useCallback(async () => {
    if (!token) return;
    try {
      const rooms = await chatsListRooms(token);
      setChatRooms(
        rooms.map((r) => ({
          id: r.id,
          participants: r.participants,
          lastMessage: r.lastMessage,
          timestamp: r.timestamp,
          unreadCount: r.unreadCount,
        })),
      );
    } catch {
      /* 서버 미기동 등 */
    }
  }, [token]);

  const loadAppData = useCallback(async () => {
    if (!token || !currentUser) return;
    try {
      const modelRows = await modelsList();
      setModels(
        modelRows.map((m) => ({
          id: m.id,
          email: m.email,
          type: 'MODEL',
          name: m.name,
          age: m.age,
          height: m.height,
          category: m.category,
          region: m.region,
          price: m.price,
          rating: m.rating,
          reviewCount: m.reviewCount,
          avatar: m.avatar,
          images: m.images,
          description: m.description,
          style: m.style,
        })),
      );
    } catch {
      /* API 미연결 시 목 데이터 유지 */
    }

    try {
      const camps =
        currentUser.type === 'ADVERTISER'
          ? await campaignsMine(token)
          : await campaignsList('OPEN');
      setCampaigns(camps);
    } catch {
      setCampaigns([]);
    }

    try {
      const mine = await offersMine(token);
      setOffers(mine);
    } catch {
      setOffers([]);
    }

    if (currentUser.type === 'MODEL') {
      try {
        const rev = await reviewsMine(token);
        setMyReviews(rev);
      } catch {
        setMyReviews([]);
      }
    }
  }, [token, currentUser]);

  useEffect(() => {
    void loadAppData();
  }, [loadAppData]);

  useEffect(() => {
    if (!token) {
      setChatRooms([]);
      return;
    }
    void refreshRooms();
    const id = setInterval(() => void refreshRooms(), 5000);
    return () => clearInterval(id);
  }, [token, refreshRooms]);

  const refreshNotifCount = useCallback(async () => {
    if (!token) return;
    try {
      const { count } = await notificationsUnreadCount(token);
      setAppNotifUnread(count);
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAppNotifUnread(0);
      return;
    }
    void refreshNotifCount();
    const id = setInterval(() => void refreshNotifCount(), 8000);
    return () => clearInterval(id);
  }, [token, refreshNotifCount]);

  useEffect(() => {
    if (
      prevNotifUnread.current !== null &&
      appNotifUnread > prevNotifUnread.current &&
      typeof document !== 'undefined' &&
      document.hidden &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      new Notification('AdMatch', { body: '새 알림이 있습니다.' });
    }
    prevNotifUnread.current = appNotifUnread;
  }, [appNotifUnread]);

  const openNotifPanel = async () => {
    if (!token) return;
    setShowNotifPanel(true);
    try {
      const list = await notificationsList(token);
      setNotifItems(list);
    } catch {
      setNotifItems([]);
    }
    void refreshNotifCount();
  };

  const handleAuthSuccess = async (accessToken: string, user: SessionUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    setToken(accessToken);
    setCurrentUser(mapSessionUser(user));
    if (user.role === 'MODEL') {
      try {
        const p = await profileMe(accessToken);
        if (p.type === 'MODEL') {
          const profile: ModelProfile = {
            id: p.id,
            email: p.email,
            type: 'MODEL',
            name: p.name,
            age: p.age,
            height: p.height,
            category: p.category,
            region: p.region,
            price: p.price,
            rating: p.rating,
            reviewCount: p.reviewCount,
            avatar: p.avatar,
            images: p.images,
            description: p.description,
            style: p.style,
          };
          setCurrentUser(profile);
        }
      } catch {
        /* ignore */
      }
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  };

  const chatUnreadTotal = useMemo(
    () => chatRooms.reduce((s, r) => s + (r.unreadCount || 0), 0),
    [chatRooms],
  );

  const mergeServerRoom = (apiRoom: {
    id: string;
    participants: string[];
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
  }, matchId?: string) => {
    const row: ChatRoom = {
      id: apiRoom.id,
      participants: apiRoom.participants,
      lastMessage: apiRoom.lastMessage || '대화를 시작해 보세요.',
      timestamp: apiRoom.timestamp || '방금',
      unreadCount: apiRoom.unreadCount,
      matchId,
    };
    setChatRooms((prev) => {
      const rest = prev.filter((r) => r.id !== row.id);
      return [row, ...rest];
    });
  };

  const handleSendOffer = async (modelId: string) => {
    if (!currentUser || !token) return;
    const camp =
      campaigns.find((c) => c.advertiserId === currentUser.id) ?? campaigns[0];
    if (!camp) {
      alert('먼저 캠페인을 등록해 주세요.');
      return;
    }

    try {
      const offer = await offersCreate(token, {
        campaignId: camp.id,
        modelId,
        price: '₩500,000',
      });
      setOffers((prev) => [...prev, offer]);
      const apiRoom = await chatsCreateOrGetRoom(token, modelId);
      mergeServerRoom(apiRoom, offer.id);
      setSelectedModel(null);
      alert('제안이 전송되었습니다. 채팅에서 이어가실 수 있습니다.');
    } catch (e) {
      alert(e instanceof Error ? e.message : '제안 전송에 실패했습니다.');
    }
  };

  const handleApplyCampaign = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign || !currentUser || !token) return;

    try {
      const offer = await offersCreate(token, {
        campaignId,
        price: '협의',
      });
      setOffers((prev) => [...prev, offer]);
      const apiRoom = await chatsCreateOrGetRoom(token, campaign.advertiserId);
      mergeServerRoom(apiRoom, offer.id);
      setSelectedCampaign(null);
      alert('지원이 완료되었습니다. 채팅에서 확인해 주세요.');
    } catch (e) {
      alert(e instanceof Error ? e.message : '지원에 실패했습니다.');
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!token) return;
    const offer = offers.find((o) => o.id === offerId);
    try {
      const updated = await offersUpdateStatus(token, offerId, 'ACCEPTED');
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: updated.status } : o)),
      );
      if (offer) {
        const apiRoom = await chatsCreateOrGetRoom(token, offer.advertiserId);
        mergeServerRoom(apiRoom, offer.id);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '수락 처리에 실패했습니다.');
    }
  };

  const resolveParticipant = (participantId: string | undefined): User | ModelProfile | undefined => {
    if (!participantId) return undefined;
    if (participantId === currentUser?.id) return currentUser;
    const model = models.find((m) => m.id === participantId);
    if (model) return model;
    return {
      id: participantId,
      email: `${participantId}@local`,
      type: 'ADVERTISER',
      name: `사용자 ${participantId}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${participantId}`,
    };
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-400 text-sm">
        불러오는 중…
      </div>
    );
  }

  if (!currentUser || !token) {
    return <LoginView onAuthed={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black md:pl-20">
      <>
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chatUnreadTotal={chatUnreadTotal}
        />

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
                                      onClick={() => void handleAcceptOffer(offer.id)}
                                      className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-xl"
                                    >
                                      수락
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void offersUpdateStatus(token!, offer.id, 'REJECTED').then(
                                          (updated) => {
                                            setOffers((prev) =>
                                              prev.map((o) =>
                                                o.id === offer.id ? { ...o, status: updated.status } : o,
                                              ),
                                            );
                                          },
                                        ).catch((e) =>
                                          alert(e instanceof Error ? e.message : '거절 처리에 실패했습니다.'),
                                        )
                                      }
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
                                  onClick={() => void handleApplyCampaign(camp.id)}
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  {models
                    .filter(
                      (m) =>
                        !searchQuery ||
                        m.name.includes(searchQuery) ||
                        (m.category || []).some((c) => c.includes(searchQuery))
                    )
                    .map((model) => (
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
                  const otherUser = resolveParticipant(otherParticipant);

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
                  onClick={() => setShowMyReviews(true)}
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
                onClick={() => void openNotifPanel()}
                className="w-full flex justify-between items-center p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors mb-2"
              >
                <span className="font-medium flex items-center gap-2">
                  <Bell size={18} className="text-zinc-500" />
                  알림
                </span>
                <span className="flex items-center gap-2">
                  {appNotifUnread > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {appNotifUnread > 99 ? '99+' : appNotifUnread}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-zinc-400" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(AUTH_TOKEN_KEY);
                  setToken(null);
                  setCurrentUser(null);
                  setChatRooms([]);
                }}
                className="w-full mt-8 py-4 text-red-500 font-bold flex items-center justify-center gap-2"
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
                onClick={() => void handleApplyCampaign(selectedCampaign.id)}
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
                onClick={() => void handleSendOffer(selectedModel.id)}
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
          <ChatRoomView
            room={selectedRoom}
            currentUser={currentUser}
            token={token}
            models={models}
            onBack={() => setSelectedRoom(null)}
            onRoomsRefresh={() => void refreshRooms()}
          />
        )}

        {showNotifPanel && token && (
          <motion.div
            key="notif-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 bg-white z-[85] overflow-y-auto"
          >
            <header className="px-6 py-6 border-b border-zinc-100 flex items-center gap-4 sticky top-0 bg-white z-10">
              <button type="button" onClick={() => setShowNotifPanel(false)}>
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold">알림</h2>
            </header>
            <div className="p-6 space-y-3 md:max-w-2xl md:mx-auto">
              {notifItems.length === 0 ? (
                <p className="text-center text-zinc-400 py-16 text-sm">알림이 없습니다.</p>
              ) : (
                notifItems.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      void notificationMarkRead(token, n.id).then(() => {
                        setNotifItems((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
                        );
                        void refreshNotifCount();
                      });
                    }}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border transition-colors',
                      n.isRead ? 'bg-zinc-50 border-zinc-100' : 'bg-orange-50/40 border-orange-100',
                    )}
                  >
                    <p className="font-bold text-sm">{n.title}</p>
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-3">{n.body}</p>
                    <p className="text-[10px] text-zinc-400 mt-2">
                      {new Date(n.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {showCampaignForm && token && (
          <CampaignForm
            onBack={() => setShowCampaignForm(false)}
            onSave={async (camp) => {
              try {
                const created = await campaignsCreate(token, {
                  title: camp.title,
                  brand: camp.brand,
                  budget: camp.budget,
                  requirements: camp.requirements,
                  goals: camp.goals,
                  contentStyle: camp.contentStyle,
                  brandGuidelines: camp.brandGuidelines,
                  productDetails: camp.productDetails,
                  benefits: camp.benefits,
                  type: camp.type,
                });
                setCampaigns([created, ...campaigns]);
                setShowCampaignForm(false);
                alert('캠페인이 생성되었습니다!');
              } catch (e) {
                alert(e instanceof Error ? e.message : '캠페인 생성에 실패했습니다.');
              }
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

        {showPortfolioEdit && currentUser.type === 'MODEL' && token && (
          <PortfolioEditView
            profile={currentUser as ModelProfile}
            onBack={() => setShowPortfolioEdit(false)}
            onSave={async (p) => {
              try {
                const updated = await profileUpdate(token, {
                  name: p.name,
                  age: p.age,
                  height: p.height,
                  description: p.description,
                  images: p.images,
                });
                const mapped: ModelProfile = {
                  ...p,
                  name: updated.name,
                  age: updated.age,
                  height: updated.height,
                  description: updated.description,
                  images: updated.images,
                  avatar: updated.avatar,
                };
                setModels(models.map((m) => (m.id === mapped.id ? mapped : m)));
                setCurrentUser(mapped);
                setShowPortfolioEdit(false);
                alert('포트폴리오가 업데이트되었습니다!');
              } catch (e) {
                alert(e instanceof Error ? e.message : '저장에 실패했습니다.');
              }
            }}
          />
        )}

        {showFilters && (
          <FilterOverlay onBack={() => setShowFilters(false)} onApply={() => setShowFilters(false)} />
        )}

        {showReviewForm && token && (
          <ReviewForm
            onBack={() => setShowReviewForm(false)}
            onSave={async ({ rating, comment }) => {
              const accepted = offers.find(
                (o) =>
                  o.advertiserId === currentUser.id && o.status === 'ACCEPTED',
              );
              if (!accepted) {
                alert('리뷰를 작성할 매칭이 없습니다.');
                return;
              }
              try {
                await reviewsCreate(token, {
                  modelId: accepted.modelId,
                  rating,
                  comment,
                });
                setShowReviewForm(false);
                alert('리뷰가 제출되었습니다!');
              } catch (e) {
                alert(e instanceof Error ? e.message : '리뷰 제출에 실패했습니다.');
              }
            }}
          />
        )}

        {showMyReviews && (
          <ReviewListView
            onBack={() => setShowMyReviews(false)}
            reviews={myReviews.length > 0 ? myReviews : mockReviews}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
