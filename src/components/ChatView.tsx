import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Pill, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  Loader2, 
  X,
  PhoneCall,
  Utensils,
  Apple
} from "lucide-react";
import { ChatMessage, MedicineAnalysis, FoodAnalysis, SupportedLanguage } from "@/types";
import { TRANSLATIONS } from "@/lib/languages";
import { askHealthAi } from "@/lib/medicalAnalysis";
import { speakText, stopSpeaking } from "@/lib/speech";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatViewProps {
  language: SupportedLanguage;
  activeMedicineContext?: MedicineAnalysis | null;
  onClearMedicineContext?: () => void;
  activeFoodContext?: FoodAnalysis | null;
  onClearFoodContext?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  language,
  activeMedicineContext,
  onClearMedicineContext,
  activeFoodContext,
  onClearFoodContext,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const defaultGreeting: ChatMessage = {
    id: "msg_welcome",
    role: "assistant",
    content: language === "hi"
      ? "नमस्ते! मैं Healthy AI स्वास्थ्य सलाहकार हूँ। आप किसी भी दवाई, लक्षण, उपयोग या सावधानी के बारे में पूछ सकते हैं।"
      : language === "hinglish"
      ? "Namaste! Main Healthy AI Health Assistant hoon. Aap medicines, side effects, precautions ya general health par sawaal pooch sakte hain."
      : "Hello! I am your Healthy AI Medical Assistant. Feel free to ask about any medicine, uses, active ingredients, or general health information.",
    timestamp: Date.now(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = activeFoodContext
    ? [
        language === "hi" ? "क्या यह वजन घटाने के लिए सही है?" : "Is this healthy for weight loss?",
        language === "hi" ? "डायबिटीज के मरीज खा सकते हैं?" : "Is this safe for diabetics?",
        language === "hi" ? "जिम वर्कआउट के लिए प्रोटीन कितना है?" : "Is this good for muscle & fitness?",
        language === "hi" ? "इसे और हेल्दी कैसे बना सकते हैं?" : "How to make this dish healthier?",
      ]
    : [
        t.chatQuick1,
        t.chatQuick2,
        t.chatQuick3,
        t.chatQuick4,
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const historyForApi = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponse = await askHealthAi(
        query,
        language,
        activeMedicineContext,
        historyForApi,
        undefined,
        undefined,
        activeFoodContext
      );

      const assistantMsg: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat response error:", error);
      toast.error(t.errAiFailed);
      const errorMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: language === "hi"
          ? "माफ़ कीजिए, उत्तर प्राप्त नहीं हो सका। कृपया दोबारा पूछें।"
          : "Sorry, I couldn't process that. Please try asking again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      const success = speakText(
        text,
        language,
        () => setSpeakingMsgId(msgId),
        () => setSpeakingMsgId(null),
        () => setSpeakingMsgId(null)
      );
      if (!success) {
        toast.error("Audio playback not supported.");
      }
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.btnCopied);
  };

  const handleClearChat = () => {
    stopSpeaking();
    setSpeakingMsgId(null);
    setMessages([defaultGreeting]);
  };

  return (
    <div id="chat-view-container" className="space-y-4 max-w-4xl mx-auto pb-20">
      {/* Header with Title & Clear Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>{t.chatTitle}</span>
          </h2>
          <p className="text-xs text-muted-foreground">{t.chatSubtitle}</p>
        </div>

        <Button
          id="btn-clear-chat-history"
          variant="outline"
          size="sm"
          onClick={handleClearChat}
          className="rounded-full text-xs font-semibold h-8 gap-1 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </Button>
      </div>

      {/* Active Medicine Context Banner */}
      {activeMedicineContext && (
        <div 
          id="chat-active-medicine-context"
          className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  {language === "hi" ? "सक्रिय दवा प्रसंग:" : "Active Medicine Context:"}
                </span>
                <span className="font-extrabold text-primary">
                  {activeMedicineContext.brandName}
                </span>
                <Badge variant="secondary" className="text-[10px] py-0">
                  {activeMedicineContext.strength}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-md">
                {activeMedicineContext.genericName}
              </p>
            </div>
          </div>

          <Button
            id="btn-clear-medicine-context"
            variant="ghost"
            size="sm"
            onClick={onClearMedicineContext}
            className="h-7 px-2 text-xs font-semibold rounded-full hover:bg-primary/20 text-primary"
            title="Clear context"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Active Food Nutrition Context Banner */}
      {activeFoodContext && (
        <div 
          id="chat-active-food-context"
          className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground">
                  {language === "hi" ? "सक्रिय भोजन प्रसंग:" : "Food Nutrition Context:"}
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {activeFoodContext.foodName}
                </span>
                <Badge variant="secondary" className="text-[10px] py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  {activeFoodContext.estimatedPortion}
                </Badge>
                <Badge variant="outline" className="text-[10px] py-0 border-emerald-300 text-emerald-700 dark:text-emerald-300">
                  Score: {activeFoodContext.nutritionScore}/100
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-md">
                {activeFoodContext.nutrition.calories} • {activeFoodContext.nutrition.protein} Protein • {activeFoodContext.nutrition.carbohydrates} Carbs • {activeFoodContext.nutrition.fat} Fat
              </p>
            </div>
          </div>

          <Button
            id="btn-clear-food-context"
            variant="ghost"
            size="sm"
            onClick={onClearFoodContext}
            className="h-7 px-2 text-xs font-semibold rounded-full hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            title="Clear food context"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Safety Notice in Chat */}
      <div 
        id="chat-safety-disclaimer"
        className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2"
      >
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-relaxed">{t.chatDisclaimer}</span>
      </div>

      {/* Messages Feed */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden flex flex-col h-[520px]">
        <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                id={`chat-message-${msg.id}`}
                className={`flex items-start gap-3 ${
                  isAi ? "justify-start" : "justify-end"
                }`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isAi
                      ? "bg-muted/60 text-foreground border border-border/60"
                      : "bg-primary text-primary-foreground font-medium rounded-br-xs"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Actions for Assistant Message */}
                  {isAi && (
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 text-muted-foreground text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className="hover:text-primary p-1 rounded-md transition-colors flex items-center gap-1"
                          title="Listen"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>{speakingMsgId === msg.id ? "Stop" : "Listen"}</span>
                        </button>
                        <span className="opacity-40">•</span>
                        <button
                          onClick={() => handleCopyText(msg.content)}
                          className="hover:text-primary p-1 rounded-md transition-colors flex items-center gap-1"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <span className="opacity-60 text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-muted/60 border border-border/60 rounded-3xl p-3.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>
                  {language === "hi" ? "AI उत्तर लिख रहा है..." : "AI Health Assistant is replying..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-muted/30 border-t border-border/50 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{language === "hi" ? "सुझाव:" : "Suggestions:"}</span>
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-background hover:bg-muted text-foreground text-[11px] font-medium border border-border/80 shrink-0 transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-background border-t border-border/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              id="chat-user-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chatPlaceholder}
              disabled={isLoading}
              className="h-11 rounded-full px-4 text-xs sm:text-sm bg-muted/40 border-border/80 focus-visible:ring-primary"
            />

            <Button
              id="btn-send-chat-message"
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 p-0 shadow-md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
