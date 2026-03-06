import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import {
  PAGE_CONFIGS,
  getPageContext,
  type PageContext,
  type SuggestedQuestion,
} from "./aiAssistantData";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiAssistantContextType {
  isOpen: boolean;
  toggleOpen: () => void;
  close: () => void;
  messages: ChatMessage[];
  currentPage: PageContext;
  pageLabel: string;
  welcomeMessage: string;
  availableQuestions: SuggestedQuestion[];
  handleQuestionClick: (question: SuggestedQuestion) => void;
  handleFreeText: (text: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

const AiAssistantContext = createContext<AiAssistantContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

let msgId = 0;
function nextId() {
  return `ai-msg-${++msgId}`;
}

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const currentPage = getPageContext(location.pathname);
  const config = PAGE_CONFIGS[currentPage];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set());
  const [currentFollowUps, setCurrentFollowUps] = useState<string[] | null>(
    null,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevPage = useRef(currentPage);

  // Reset conversation when page changes
  useEffect(() => {
    if (prevPage.current !== currentPage) {
      setMessages([]);
      setAskedIds(new Set());
      setCurrentFollowUps(null);
      prevPage.current = currentPage;
    }
  }, [currentPage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Compute available question chips
  const availableQuestions = useMemo(() => {
    const ids =
      currentFollowUps ?? config.initialQuestions;
    return ids
      .filter((id) => !askedIds.has(id) && config.questions[id])
      .map((id) => config.questions[id]);
  }, [currentFollowUps, config, askedIds]);

  const toggleOpen = useCallback(() => setIsOpen((o) => !o), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleQuestionClick = useCallback(
    (question: SuggestedQuestion) => {
      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: question.fullQuestion,
      };

      setMessages((prev) => [...prev, userMsg]);
      setAskedIds((prev) => new Set(prev).add(question.id));

      // Add AI response after a short delay
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: question.response,
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Update follow-ups
        if (question.followUps && question.followUps.length > 0) {
          setCurrentFollowUps(question.followUps);
        } else {
          setCurrentFollowUps(null);
        }
      }, 400);
    },
    [],
  );

  const handleFreeText = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: `I can help with that. For now, try one of the suggested questions to see how I can assist with your ${config.pageLabel} insights.`,
        };
        setMessages((prev) => [...prev, aiMsg]);
        // Show remaining initial questions
        setCurrentFollowUps(null);
      }, 600);
    },
    [config.pageLabel],
  );

  const value = useMemo<AiAssistantContextType>(
    () => ({
      isOpen,
      toggleOpen,
      close,
      messages,
      currentPage,
      pageLabel: config.pageLabel,
      welcomeMessage: config.welcomeMessage,
      availableQuestions,
      handleQuestionClick,
      handleFreeText,
      scrollRef,
      bottomRef,
    }),
    [
      isOpen,
      toggleOpen,
      close,
      messages,
      currentPage,
      config.pageLabel,
      config.welcomeMessage,
      availableQuestions,
      handleQuestionClick,
      handleFreeText,
    ],
  );

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) throw new Error("useAiAssistant must be used within AiAssistantProvider");
  return ctx;
}
