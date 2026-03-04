import { useState, useRef, useEffect } from "react";
import {
  HugeiconsIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  BubbleChatIcon,
  CheckmarkBadge02Icon,
} from "../../icons";

// ── Question definitions for campaign creation ──

export interface QuestionOption {
  label: string;
  key: string;
}

export interface CampaignQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
  allowCustom?: boolean;
}

export const CAMPAIGN_QUESTIONS: CampaignQuestion[] = [
  {
    id: "lead-source",
    question: "Where should I pull leads from?",
    options: [
      { key: "A", label: "HubSpot CRM" },
      { key: "B", label: "Salesforce" },
      { key: "C", label: "Upload a CSV" },
    ],
    allowCustom: true,
  },
  {
    id: "lead-selection",
    question: "Which leads do you want to target?",
    options: [
      { key: "A", label: "Stalled pipeline deals (30+ days inactive)" },
      { key: "B", label: "Recent inbound leads (last 14 days)" },
      { key: "C", label: "Past customers for re-engagement" },
    ],
    allowCustom: true,
  },
  {
    id: "segmentation",
    question: "How should we segment these leads?",
    options: [
      { key: "A", label: "By engagement level (hot / warm / cold)" },
      { key: "B", label: "By industry or company size" },
      { key: "C", label: "Let AI decide the best segmentation" },
    ],
    allowCustom: true,
  },
  {
    id: "email-sequence",
    question: "How many emails should the sequence have?",
    options: [
      { key: "A", label: "2 emails over 3 days (quick touch)" },
      { key: "B", label: "3 emails over 7 days (standard)" },
      { key: "C", label: "3 emails over 10 days (gentle nurture)" },
    ],
    allowCustom: true,
  },
  {
    id: "tone",
    question: "What tone should the emails have?",
    options: [
      { key: "A", label: "Professional and direct" },
      { key: "B", label: "Friendly and conversational" },
      { key: "C", label: "Technical and detail-oriented" },
    ],
    allowCustom: true,
  },
  {
    id: "cta",
    question: "What call-to-action should emails use?",
    options: [
      { key: "A", label: "Book a meeting / demo link" },
      { key: "B", label: "Case study or content download" },
      { key: "C", label: "Dynamic — AI picks the best CTA per lead" },
    ],
    allowCustom: true,
  },
  {
    id: "urgency",
    question: "How soon do you want to launch?",
    options: [
      { key: "A", label: "Today — let's go" },
      { key: "B", label: "This week, after I review the plan" },
      { key: "C", label: "No rush, just exploring" },
    ],
    allowCustom: true,
  },
];

// ── Answer type ──

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
  isCustom: boolean;
}

// ── Component ──

interface Props {
  onComplete: (answers: QuestionAnswer[]) => void;
  onSkipAll: () => void;
}

export function CampaignQuestions({ onComplete, onSkipAll }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; isCustom: boolean }>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [editingCustom, setEditingCustom] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const questions = CAMPAIGN_QUESTIONS;
  const totalPages = questions.length;
  const currentQuestion = questions[currentPage];

  useEffect(() => {
    if (editingCustom && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [editingCustom]);

  const handleOptionSelect = (questionId: string, option: QuestionOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answer: option.label, isCustom: false },
    }));
    setEditingCustom(null);
  };

  const handleCustomClick = (questionId: string) => {
    setEditingCustom(questionId);
    // Clear the pre-set answer if switching to custom
    if (answers[questionId] && !answers[questionId].isCustom) {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleCustomSubmit = (questionId: string) => {
    const value = customInputs[questionId]?.trim();
    if (value) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { answer: value, isCustom: true },
      }));
      setEditingCustom(null);
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent, questionId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomSubmit(questionId);
    }
    if (e.key === "Escape") {
      setEditingCustom(null);
    }
  };

  const handleContinue = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      // All done — compile answers
      finishQuestions();
    }
  };

  const handleSkip = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      finishQuestions();
    }
  };

  const finishQuestions = () => {
    const compiled: QuestionAnswer[] = questions
      .filter((q) => answers[q.id])
      .map((q) => ({
        questionId: q.id,
        question: q.question,
        answer: answers[q.id].answer,
        isCustom: answers[q.id].isCustom,
      }));
    setIsCompleted(true);
    onComplete(compiled);
  };

  const hasCurrentAnswer = !!answers[currentQuestion.id];

  // ── Completed summary view ──
  if (isCompleted) {
    const answeredQuestions = questions.filter((q) => answers[q.id]);
    if (answeredQuestions.length === 0) return null;

    return (
      <div className="border border-[#e9e9e7] rounded-2xl bg-[#fafaf9] overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e9e9e7]">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkBadge02Icon} size={14} color="#22c55e" />
            <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
              Answers
            </span>
          </div>
          <span className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            {answeredQuestions.length} of {totalPages}
          </span>
        </div>

        {/* Answer list */}
        <div className="px-4 py-3 space-y-3">
          {answeredQuestions.map((q) => (
            <div key={q.id}>
              <p className="text-[12px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 400 }}>
                {q.question}
              </p>
              <p className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
                {answers[q.id].answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Active question view ──
  return (
    <div className="border border-[#e9e9e7] rounded-2xl bg-[#fafaf9] overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e9e9e7]">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={BubbleChatIcon} size={14} className="text-[#646464]" />
          <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
            Questions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="disabled:opacity-30 transition-opacity"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={14} className="text-[#b0b0b0] rotate-[-90deg]" />
          </button>
          <span className="text-[12px] text-foreground tabular-nums" style={{ fontWeight: 400 }}>
            {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="disabled:opacity-30 transition-opacity"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={14} className="text-foreground rotate-[90deg]" />
          </button>
        </div>
      </div>

      {/* Question body */}
      <div className="px-4 py-4">
        <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 500 }}>
          {currentQuestion.question}
        </p>

        {/* Options */}
        <div className="space-y-1.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id]?.answer === opt.label && !answers[currentQuestion.id]?.isCustom;
            return (
              <button
                key={opt.key}
                onClick={() => handleOptionSelect(currentQuestion.id, opt)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isSelected
                    ? "bg-foreground text-white"
                    : "bg-white border border-[#e9e9e7] hover:border-[#c8c8c6] hover:bg-[#f7f7f5] text-foreground"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[11px] shrink-0 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#f0f0ee] text-[#9b9a97]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {opt.key}
                </span>
                <span className="text-[12px]" style={{ fontWeight: isSelected ? 500 : 400 }}>
                  {opt.label}
                </span>
              </button>
            );
          })}

          {/* Custom "Type something else" option */}
          {currentQuestion.allowCustom && (
            <>
              {editingCustom === currentQuestion.id ? (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-foreground/20">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[11px] shrink-0 bg-[#f0f0ee] text-[#9b9a97]"
                    style={{ fontWeight: 600 }}
                  >
                    D
                  </span>
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customInputs[currentQuestion.id] || ""}
                    onChange={(e) =>
                      setCustomInputs((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                    }
                    onKeyDown={(e) => handleCustomKeyDown(e, currentQuestion.id)}
                    onBlur={() => {
                      if (customInputs[currentQuestion.id]?.trim()) {
                        handleCustomSubmit(currentQuestion.id);
                      } else {
                        setEditingCustom(null);
                      }
                    }}
                    placeholder="Type your answer..."
                    className="flex-1 text-[12px] text-foreground placeholder:text-[#b0b0b0] outline-none bg-transparent"
                    style={{ fontWeight: 400 }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => handleCustomClick(currentQuestion.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    answers[currentQuestion.id]?.isCustom
                      ? "bg-foreground text-white"
                      : "bg-white border border-[#e9e9e7] hover:border-[#c8c8c6] hover:bg-[#f7f7f5] text-foreground"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[11px] shrink-0 ${
                      answers[currentQuestion.id]?.isCustom
                        ? "bg-white/20 text-white"
                        : "bg-[#f0f0ee] text-[#9b9a97]"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    D
                  </span>
                  <span className="text-[12px]" style={{ fontWeight: answers[currentQuestion.id]?.isCustom ? 500 : 400 }}>
                    {answers[currentQuestion.id]?.isCustom
                      ? answers[currentQuestion.id].answer
                      : "Type something else"}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#e9e9e7]">
        <button
          onClick={currentPage === 0 ? onSkipAll : handleSkip}
          className="text-[12px] px-4 py-2 rounded-lg border border-[#e9e9e7] text-[#646464] hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
          style={{ fontWeight: 400 }}
        >
          {currentPage === 0 ? "Skip all" : "Skip"}
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasCurrentAnswer}
          className="text-[12px] px-4 py-2 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity disabled:opacity-30"
          style={{ fontWeight: 500 }}
        >
          {currentPage === totalPages - 1 ? "Done" : "Continue"}
        </button>
      </div>
    </div>
  );
}
