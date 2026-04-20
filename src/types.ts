/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserType = 'ADVERTISER' | 'MODEL';

export interface User {
  id: string;
  email: string;
  type: UserType;
  name: string;
  avatar: string;
  companyName?: string;
  category?: string[];
  region?: string;
  price?: string;
  description?: string;
}

export interface ModelProfile extends User {
  age: number;
  height: number;
  rating: number;
  reviewCount: number;
  images: string[];
  style: string;
}

export interface Campaign {
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
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface Offer {
  id: string;
  campaignId: string;
  advertiserId: string;
  modelId: string;
  price: string;
  status: OfferStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  matchId?: string;
  participants: string[]; // [userId1, userId2]
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}
