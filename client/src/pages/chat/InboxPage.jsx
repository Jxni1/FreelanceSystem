import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import { useContracts } from '../../hooks/useContracts';
import { useMilestones } from '../../hooks/useMilestones';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';

const normalizeId = (value) => (value == null ? '' : String(value).trim().toLowerCase());

function clockTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function relativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d`;
}

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : '—';
}

export default function InboxPage() {
  const { user } = useAuth();
  const {
    conversations,
    pendingRequests,
    messages,
    fetchMyConversations,
    fetchPendingRequests,
    fetchMessages,
    sendMessage,
    markAsRead,
    setMessages,
  } = useConversations();
  const { selectedContract, fetchContractById } = useContracts();
  const { milestones, fetchMilestonesByContract } = useMilestones();

  const [selectedId, setSelectedId] = useState(null);
  const [content, setContent] = useState('');
  const [query, setQuery] = useState('');
  const [threadOpenMobile, setThreadOpenMobile] = useState(false);
  const bottomRef = useRef(null);

  const myId = normalizeId(user?.id);

  useEffect(() => {
    fetchMyConversations().catch(() => {});
    fetchPendingRequests().catch(() => {});
  }, [fetchMyConversations, fetchPendingRequests]);

  const listItems = useMemo(() => {
    const merged = [...pendingRequests, ...conversations];
    const seen = new Set();
    return merged
      .filter((c) => {
        if (!c?.conversationID || seen.has(c.conversationID)) return false;
        seen.add(c.conversationID);
        return true;
      })
      .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0))
      .map((c) => ({
        id: c.conversationID,
        raw: c,
        name: normalizeId(c.clientUserID) === myId ? c.freelancerUsername : c.clientUsername,
        preview: c.lastMessage || 'No messages yet',
        time: relativeTime(c.lastMessageAt || c.updatedAt),
        pending: c.status === 'Pending',
      }));
  }, [conversations, pendingRequests, myId]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listItems;
    return listItems.filter(
      (item) => item.name?.toLowerCase().includes(q) || item.preview?.toLowerCase().includes(q),
    );
  }, [listItems, query]);

  const activeId = selectedId ?? listItems[0]?.id ?? null;
  const selected = listItems.find((item) => item.id === activeId) || null;

  useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId, { page: 1, pageSize: 50 }).catch(() => {});
    markAsRead(activeId).catch(() => {});
  }, [activeId, fetchMessages, markAsRead]);

  const activeContractId = selected?.raw?.contractID || null;

  useEffect(() => {
    if (!activeContractId) return;
    fetchContractById(activeContractId).catch(() => {});
    fetchMilestonesByContract(activeContractId).catch(() => {});
  }, [activeContractId, fetchContractById, fetchMilestonesByContract]);

  const thread = useMemo(
    () =>
      (messages.items ?? []).map((m) => ({
        id: m.messageID ?? m.id,
        mine: m.isMine ?? normalizeId(m.senderUserID) === myId,
        content: m.content,
        time: clockTime(m.sentAt),
      })),
    [messages, myId],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setThreadOpenMobile(true);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const text = content.trim();
    if (!text || !selected) return;
    setContent('');
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => ({
      ...prev,
      items: [
        ...(prev?.items || []),
        { messageID: tempId, senderUserID: user?.id, content: text, sentAt: new Date().toISOString(), isMine: true },
      ],
    }));
    try {
      await sendMessage({ conversationID: selected.id, content: text });
      await fetchMessages(selected.id, { page: 1, pageSize: 50 });
    } catch {
      setMessages((prev) => ({
        ...prev,
        items: (prev?.items || []).filter((m) => m.messageID !== tempId),
      }));
      setContent(text);
    }
  };

  const railContract =
    selectedContract && String(selectedContract.contractID) === String(activeContractId) ? selectedContract : null;
  const railMilestones = milestones.filter((m) => String(m.contractID) === String(activeContractId));
  const railTotal = Number(railContract?.agreedPrice) || 0;
  const railEarned = railMilestones
    .filter((m) => m.status === 'Approved')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const railApproved = railMilestones.filter((m) => m.status === 'Approved').length;
  const railPct = railTotal > 0 ? (railEarned / railTotal) * 100 : 0;

  return (
    <div className="flex h-[calc(100dvh-7rem)] gap-4">
      <div
        className={`w-full flex-col rounded-2xl border border-line bg-white shadow-sm sm:flex sm:w-80 sm:shrink-0 ${
          threadOpenMobile ? 'hidden' : 'flex'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
          <h1 className="text-base font-bold text-slate-900">Messages</h1>
        </div>

        <div className="border-b border-line px-3 py-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations..."
              className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-slate-700">No conversations yet</p>
              <p className="text-xs text-slate-500">Start a chat from a contract or a freelancer's profile.</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">No conversations match “{query}”.</p>
          ) : (
            visibleItems.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full items-start gap-3 border-b border-line px-3 py-3 text-left transition-colors ${
                    active ? 'bg-brand-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <Avatar name={item.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{item.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{item.preview}</p>
                  </div>
                  {item.pending ? (
                    <span className="mt-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      New
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div
        className={`min-w-0 flex-1 flex-col rounded-2xl border border-line bg-white shadow-sm sm:flex ${
          threadOpenMobile ? 'flex' : 'hidden'
        }`}
      >
        {selected ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setThreadOpenMobile(false)}
                  className="text-slate-500 sm:hidden"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <Avatar name={selected.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{selected.name}</p>
                  <p className="text-xs text-slate-400">{selected.pending ? 'Pending request' : 'Active conversation'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-canvas/40 px-4 py-4">
              {thread.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No messages yet — say hello.
                </div>
              ) : (
                thread.map((message) => (
                  <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[78%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          message.mine
                            ? 'rounded-br-md bg-brand-600 text-white'
                            : 'rounded-bl-md border border-line bg-white text-slate-700'
                        }`}
                      >
                        {message.content}
                      </div>
                      <p className={`mt-1 text-xs text-slate-400 ${message.mine ? 'text-right' : 'text-left'}`}>{message.time}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-line p-3">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5">
                <input
                  type="text"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent py-1.5 text-sm placeholder:text-slate-400 focus:outline-none"
                />
                <Button as="button" type="submit" size="sm" icon={Send} disabled={!content.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Select a conversation</div>
        )}
      </div>

      {railContract ? (
        <div className="hidden w-72 shrink-0 flex-col gap-4 xl:flex">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Linked contract</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{railContract.projectTitle || 'Contract'}</p>
            <p className="text-xs text-slate-500">{formatMoney(railTotal)}</p>
            {railMilestones.length > 0 ? (
              <>
                <ProgressBar value={railPct} tone="emerald" className="mt-3" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {railApproved} / {railMilestones.length} milestones paid
                  </span>
                  <span className="font-semibold text-slate-900">{formatMoney(railEarned)}</span>
                </div>
              </>
            ) : null}
            <Button to={`/contracts/${railContract.contractID}`} variant="soft" size="sm" className="mt-3 w-full">
              View contract
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
