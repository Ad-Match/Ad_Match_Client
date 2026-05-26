const API_BASE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : 'http://localhost:4000';

export const AUTH_TOKEN_KEY = 'admatch_token';

export function getApiBase(): string {
  return API_BASE.replace(/\/$/, '');
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers: hdr, ...rest } = options;
  const headers = new Headers(hdr);
  if (!headers.has('Content-Type') && rest.body && typeof rest.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${getApiBase()}${path}`, { ...rest, headers });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = (await res.json()) as { message?: string | string[] };
      if (typeof j.message === 'string') msg = j.message;
      else if (Array.isArray(j.message)) msg = j.message.join(', ');
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type SessionUser = {
  id: string;
  username: string;
  role: 'ADVERTISER' | 'MODEL';
};

export async function authRegister(body: {
  username: string;
  password: string;
  role: 'ADVERTISER' | 'MODEL';
}): Promise<{ access_token: string; user: SessionUser }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function authLogin(
  username: string,
  password: string,
): Promise<{ access_token: string; user: SessionUser }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function authMe(token: string): Promise<SessionUser> {
  return apiFetch('/auth/me', { token });
}

export type ApiChatRoom = {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
};

export type ApiChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: string;
};

export async function chatsListRooms(token: string): Promise<ApiChatRoom[]> {
  return apiFetch('/chats/rooms', { token });
}

export async function chatsCreateOrGetRoom(
  token: string,
  participantId: string,
): Promise<ApiChatRoom> {
  return apiFetch('/chats/rooms', {
    method: 'POST',
    token,
    body: JSON.stringify({ participantId }),
  });
}

export async function chatsMessages(
  token: string,
  roomId: string,
): Promise<ApiChatMessage[]> {
  return apiFetch(`/chats/rooms/${roomId}/messages`, { token });
}

export async function chatsSend(
  token: string,
  roomId: string,
  text: string,
): Promise<ApiChatMessage> {
  return apiFetch(`/chats/rooms/${roomId}/messages`, {
    method: 'POST',
    token,
    body: JSON.stringify({ text }),
  });
}

export async function chatsMarkRead(
  token: string,
  roomId: string,
): Promise<void> {
  await apiFetch(`/chats/rooms/${roomId}/read`, { method: 'POST', token });
}

export type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export async function notificationsList(
  token: string,
): Promise<ApiNotification[]> {
  return apiFetch('/notifications', { token });
}

export async function notificationsUnreadCount(
  token: string,
): Promise<{ count: number }> {
  return apiFetch('/notifications/unread-count', { token });
}

export async function notificationMarkRead(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token });
}

// --- Models / Profiles ---

export type ApiModelProfile = {
  id: string;
  email: string;
  type: 'MODEL';
  name: string;
  age: number;
  height: number;
  category: string[];
  region: string;
  price: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  images: string[];
  description: string;
  style: string;
};

export async function modelsList(params?: {
  q?: string;
  style?: string;
  region?: string;
  maxAge?: number;
}): Promise<ApiModelProfile[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.style) qs.set('style', params.style);
  if (params?.region) qs.set('region', params.region);
  if (params?.maxAge != null) qs.set('maxAge', String(params.maxAge));
  const q = qs.toString();
  return apiFetch(`/models${q ? `?${q}` : ''}`);
}

export async function profileMe(
  token: string,
): Promise<ApiModelProfile | { id: string; type: 'ADVERTISER'; name: string; avatar: string; companyName?: string }> {
  return apiFetch('/profiles/me', { token });
}

export async function profileUpdate(
  token: string,
  body: Partial<
    Pick<
      ApiModelProfile,
      | 'name'
      | 'age'
      | 'height'
      | 'category'
      | 'region'
      | 'price'
      | 'images'
      | 'style'
      | 'description'
    >
  >,
): Promise<ApiModelProfile> {
  return apiFetch('/profiles/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

// --- Campaigns ---

export type ApiCampaign = {
  id: string;
  advertiserId: string;
  title: string;
  brand: string;
  budget: string;
  requirements: string;
  goals?: string;
  contentStyle?: string;
  brandGuidelines?: string;
  productDetails?: string;
  benefits?: string;
  status: 'OPEN' | 'CLOSED';
  type: string;
  createdAt: string;
};

export async function campaignsList(
  status?: 'OPEN' | 'CLOSED',
): Promise<ApiCampaign[]> {
  const q = status ? `?status=${status}` : '';
  return apiFetch(`/campaigns${q}`);
}

export async function campaignsMine(token: string): Promise<ApiCampaign[]> {
  return apiFetch('/campaigns/mine', { token });
}

export async function campaignsCreate(
  token: string,
  body: Omit<ApiCampaign, 'id' | 'advertiserId' | 'status' | 'createdAt'>,
): Promise<ApiCampaign> {
  return apiFetch('/campaigns', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

// --- Offers ---

export type ApiOffer = {
  id: string;
  campaignId: string;
  advertiserId: string;
  modelId: string;
  price: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
};

export async function offersMine(token: string): Promise<ApiOffer[]> {
  return apiFetch('/offers/mine', { token });
}

export async function offersCreate(
  token: string,
  body: { campaignId: string; modelId?: string; price: string },
): Promise<ApiOffer> {
  return apiFetch('/offers', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export async function offersUpdateStatus(
  token: string,
  id: string,
  status: ApiOffer['status'],
): Promise<ApiOffer> {
  return apiFetch(`/offers/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}

// --- Reviews ---

export type ApiReview = {
  id: string;
  rating: number;
  comment: string;
  authorname: string;
  date: string;
};

export async function reviewsMine(token: string): Promise<ApiReview[]> {
  return apiFetch('/reviews/mine', { token });
}

export async function reviewsCreate(
  token: string,
  body: { modelId: string; rating: number; comment: string },
): Promise<ApiReview> {
  return apiFetch('/reviews', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}
