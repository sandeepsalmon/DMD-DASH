import { useState } from "react";
import { X } from "lucide-react";
import { HugeiconsIcon, ArrowUp01Icon } from "../campaigns/icons";
import { DocketMessage, UserMessage } from "../campaigns/v2/shared/ChatMessage";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import { useAiAssistant } from "./AiAssistantContext";

export function AiAssistantPanel() {
  const {
    isOpen,
    close,
    messages,
    pageLabel,
    welcomeMessage,
    availableQuestions,
    handleQuestionClick,
    handleFreeText,
    scrollRef,
    bottomRef,
  } = useAiAssistant();

  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const onSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    handleFreeText(text);
  };

  return (
    <div className="w-[380px] shrink-0 h-full flex flex-col border-l border-black/[0.04] bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-black/[0.04] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
            <span
              className="text-white text-[9px]"
              style={{ fontWeight: 700 }}
            >
              D
            </span>
          </div>
          <span
            className="text-[13px] text-foreground"
            style={{ fontWeight: 500 }}
          >
            Docket AI
          </span>
          <span className="text-[10px] text-[#9b9a97] bg-[#f4f4f2] px-1.5 py-0.5 rounded-full">
            {pageLabel}
          </span>
        </div>
        <button
          onClick={close}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          <X size={14} className="text-[#9b9a97]" />
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Welcome message */}
        <DocketMessage>
          <p
            className="text-[12px] text-foreground"
            style={{ fontWeight: 400, lineHeight: 1.5 }}
          >
            {welcomeMessage}
          </p>
        </DocketMessage>

        {/* Conversation thread */}
        {messages.map((msg) =>
          msg.role === "user" ? (
            <UserMessage key={msg.id} content={msg.content} />
          ) : (
            <DocketMessage key={msg.id}>
              <div
                className="text-[12px] text-foreground prose-sm"
                style={{ fontWeight: 400, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{
                  __html: formatResponse(msg.content),
                }}
              />
            </DocketMessage>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested question chips */}
      {availableQuestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {availableQuestions.map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuestionClick(q)}
              className="text-[11px] px-3 py-1.5 rounded-full border border-[#e9e9e7] bg-[#fafaf9] text-foreground hover:bg-[#f0f0ee] hover:border-[#c8c8c6] transition-colors cursor-pointer"
              style={{ fontWeight: 400 }}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-3 pt-1 shrink-0">
        <PromptInput
          value={inputValue}
          onValueChange={setInputValue}
          onSubmit={onSubmit}
        >
          <PromptInputTextarea placeholder="Ask Docket..." />
          <PromptInputActions className="flex items-center justify-end pt-1.5">
            <PromptInputAction tooltip="Send">
              <button
                disabled={!inputValue.trim()}
                onClick={onSubmit}
                className="w-6 h-6 rounded bg-foreground text-white flex items-center justify-center disabled:opacity-20 transition-opacity cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} size={12} />
              </button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}

/** Simple markdown-like formatting for AI responses */
function formatResponse(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n- /g, "<br/>• ")
    .replace(/\n(\d+)\. /g, "<br/>$1. ")
    .replace(/\n/g, "<br/>");
}
