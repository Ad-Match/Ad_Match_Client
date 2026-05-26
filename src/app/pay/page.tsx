'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type PaymentStatus = 'CREATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
type PaymentScenario = 'auto' | 'force_success' | 'force_fail' | 'pending';

type CreatedPayment = {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: 'KRW' | 'USD';
  orderId: string;
  clientSecret: string;
};

type Payment = {
  id: string;
  orderId: string;
  amount: number;
  currency: 'KRW' | 'USD';
  status: PaymentStatus;
  scenario: PaymentScenario;
  createdAt: string;
  updatedAt: string;
  cardLast4?: string;
  failureCode?: string;
  failureMessage?: string;
};

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

export default function PayPage() {
  const [orderId, setOrderId] = useState(() => `order_${Date.now()}`);
  const [amount, setAmount] = useState(50000);
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [scenario, setScenario] = useState<PaymentScenario>('auto');

  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [cardHolderName, setCardHolderName] = useState('홍길동');
  const [expiry, setExpiry] = useState('12/34');
  const [cvc, setCvc] = useState('123');

  const [created, setCreated] = useState<CreatedPayment | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hints = useMemo(
    () => [
      { label: '성공(자동)', value: '4242 4242 4242 4242' },
      { label: '실패(거절)', value: '4000 0000 0000 0000' },
      { label: '실패(잔액부족)', value: '4000 0000 0000 1111' },
      { label: '실패(만료)', value: '4000 0000 0000 2222' },
    ],
    [],
  );

  async function createPayment() {
    setBusy(true);
    setError(null);
    setCreated(null);
    setPayment(null);
    try {
      const res = await fetch(`${apiBase()}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: Number(amount), currency, scenario }),
      });
      const data = (await res.json()) as CreatedPayment & { message?: string };
      if (!res.ok) throw new Error(data?.message ?? '결제 생성에 실패했습니다.');
      setCreated(data);
      await refreshPayment(data.paymentId);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPayment() {
    if (!created?.paymentId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/payments/${created.paymentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: cardNumber.replace(/\s/g, ''), cardHolderName, expiry, cvc }),
      });
      const data = (await res.json()) as Payment & { message?: string };
      if (!res.ok) throw new Error(data?.message ?? '결제 확정에 실패했습니다.');
      setPayment(data);
      
      if (data.status === 'SUCCEEDED') {
        alert('결제가 성공했습니다!');
        window.location.href = '/';
      } else if (data.status === 'FAILED') {
        alert('결제에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }

  async function refreshPayment(id?: string) {
    const pid = id ?? created?.paymentId;
    if (!pid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/payments/${pid}`);
      const data = (await res.json()) as Payment & { message?: string };
      if (!res.ok) throw new Error(data?.message ?? '상태 조회에 실패했습니다.');
      setPayment(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setBusy(false);
    }
  }

  async function mockWebhook(event: 'payment_succeeded' | 'payment_failed') {
    const pid = created?.paymentId;
    if (!pid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/payments/${pid}/mock-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
      const data = (await res.json()) as Payment & { message?: string };
      if (!res.ok) throw new Error(data?.message ?? '웹훅 흉내 호출에 실패했습니다.');
      setPayment(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setBusy(false);
    }
  }

  const badge = (() => {
    const s = payment?.status ?? created?.status;
    if (!s) return null;
    const styles =
      s === 'SUCCEEDED'
        ? 'bg-green-100 text-green-700 border-green-200'
        : s === 'FAILED'
          ? 'bg-red-100 text-red-700 border-red-200'
          : s === 'PROCESSING'
            ? 'bg-orange-100 text-orange-700 border-orange-200'
            : 'bg-zinc-100 text-zinc-700 border-zinc-200';
    return (
      <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border', styles)}>
        {s}
      </span>
    );
  })();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mock Payment</p>
            <h1 className="text-3xl font-bold tracking-tight">결제 화면 (흉내)</h1>
          </div>
          <Link href="/" className="text-sm font-bold text-zinc-500 hover:text-black">
            홈으로
          </Link>
        </header>

        <div className="p-5 md:p-6 rounded-3xl border border-zinc-100 bg-zinc-50 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">주문 정보</h2>
            <div className="flex items-center gap-3">
              {badge}
              <button
                type="button"
                onClick={() => refreshPayment()}
                className="px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
                disabled={busy || !created?.paymentId}
              >
                상태 새로고침
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Order ID
              </label>
              <input
                className="w-full bg-white border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-white border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Currency
                </label>
                <select
                  className="w-full bg-white border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black appearance-none"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'KRW' | 'USD')}
                >
                  <option value="KRW">KRW</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                결제 시나리오
              </label>
              <select
                className="w-full bg-white border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black appearance-none"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as PaymentScenario)}
              >
                <option value="auto">auto (카드번호 끝자리로 성공/실패)</option>
                <option value="force_success">force_success (무조건 성공)</option>
                <option value="force_fail">force_fail (무조건 실패)</option>
                <option value="pending">pending (PROCESSING 유지)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={createPayment}
                className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-black/10 disabled:opacity-50"
                disabled={busy}
              >
                결제 생성하기
              </button>
            </div>
          </div>

          {created && (
            <div className="text-xs text-zinc-500 space-y-1">
              <div>
                <span className="font-bold text-zinc-700">paymentId</span>: {created.paymentId}
              </div>
              <div>
                <span className="font-bold text-zinc-700">clientSecret</span>: {created.clientSecret}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 rounded-3xl border border-zinc-100 bg-white space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">카드 정보 (흉내)</h2>
            <div className="flex gap-2 flex-wrap justify-end">
              {hints.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setCardNumber(h.value)}
                  className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Card Number
              </label>
              <input
                inputMode="numeric"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Card Holder
              </label>
              <input
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Expiry
                </label>
                <input
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  CVC
                </label>
                <input
                  inputMode="numeric"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={confirmPayment}
              className="bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-black/10 disabled:opacity-50"
              disabled={busy || !created?.paymentId}
            >
              결제하기(확정)
            </button>
            <button
              type="button"
              onClick={() => mockWebhook('payment_succeeded')}
              className="bg-white border border-zinc-200 text-zinc-800 font-bold py-4 rounded-2xl hover:bg-zinc-50 disabled:opacity-50"
              disabled={busy || !created?.paymentId}
            >
              웹훅 흉내: 성공
            </button>
            <button
              type="button"
              onClick={() => mockWebhook('payment_failed')}
              className="bg-white border border-zinc-200 text-zinc-800 font-bold py-4 rounded-2xl hover:bg-zinc-50 disabled:opacity-50"
              disabled={busy || !created?.paymentId}
            >
              웹훅 흉내: 실패
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {payment && (
            <div className="p-5 rounded-3xl border border-zinc-100 bg-zinc-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">결제 상태</h3>
                {badge}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="text-zinc-600">
                  <span className="font-bold text-zinc-800">결제ID</span>: {payment.id}
                </div>
                <div className="text-zinc-600">
                  <span className="font-bold text-zinc-800">주문ID</span>: {payment.orderId}
                </div>
                <div className="text-zinc-600">
                  <span className="font-bold text-zinc-800">금액</span>: {payment.amount} {payment.currency}
                </div>
                <div className="text-zinc-600">
                  <span className="font-bold text-zinc-800">카드</span>:{' '}
                  {payment.cardLast4 ? `**** ${payment.cardLast4}` : '-'}
                </div>
                <div className="text-zinc-600 md:col-span-2">
                  <span className="font-bold text-zinc-800">updatedAt</span>: {payment.updatedAt}
                </div>
                {payment.status === 'FAILED' && (
                  <div className="md:col-span-2 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
                    <div className="font-bold">{payment.failureCode ?? 'failed'}</div>
                    <div className="text-sm mt-1">{payment.failureMessage ?? '결제 실패'}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-zinc-400">
          API Base: <span className="font-mono">{apiBase()}</span> (환경변수{' '}
          <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span>로 변경 가능)
        </div>
      </div>
    </div>
  );
}

