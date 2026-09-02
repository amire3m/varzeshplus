"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, HelpCircle, CheckCircle, AlertCircle, Coins, Zap, Trophy } from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  question: string;
  options: string[];
  correctOption: number;
  difficulty: string;
  coinReward: number;
  xpReward: number;
  category: string;
}

interface QuizModalProps {
  isOpen: boolean;
  quiz: Quiz | null;
  onClose: () => void;
  onAnswerSubmit: (quizId: number, selectedOption: number) => Promise<{ success: boolean; isCorrect: boolean; coinReward?: number }>;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  quiz,
  onClose,
  onAnswerSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [result, setResult] = useState<{ isCorrect: boolean; reward?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !quiz || result !== null) return;

    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quiz, result]);

  if (!isOpen || !quiz) return null;

  const handleSelect = async (index: number) => {
    if (selectedOption !== null || isSubmitting) return;
    setSelectedOption(index);
    setIsSubmitting(true);

    try {
      const res = await onAnswerSubmit(quiz.id, index);
      setResult({ isCorrect: res.isCorrect, reward: res.coinReward });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141C29] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#5B7FFF]" />
            <h3 className="font-extrabold text-base text-white">{quiz.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Bar */}
        {result === null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>زمان باقی‌مانده</span>
              </span>
              <span className="font-scoreboard font-bold text-amber-400">{timeLeft} ثانیه</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Question text */}
        <div className="bg-[#0B121C] p-4 rounded-2xl border border-slate-800">
          <p className="font-bold text-sm text-slate-100 leading-relaxed">{quiz.question}</p>
        </div>

        {/* Options list */}
        <div className="space-y-2.5">
          {quiz.options.map((option, idx) => {
            let btnStyle = "bg-[#0B121C] border-slate-800 hover:border-[#5B7FFF] text-slate-200";

            if (selectedOption === idx) {
              if (result) {
                btnStyle = result.isCorrect
                  ? "bg-[#2ECC71]/20 border-[#2ECC71] text-[#2ECC71]"
                  : "bg-[#E23B3B]/20 border-[#E23B3B] text-[#E23B3B]";
              } else {
                btnStyle = "bg-indigo-500/20 border-[#5B7FFF] text-[#5B7FFF]";
              }
            } else if (result && idx === quiz.correctOption) {
              btnStyle = "bg-[#2ECC71]/20 border-[#2ECC71] text-[#2ECC71]";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selectedOption !== null || timeLeft === 0}
                className={`w-full p-3 rounded-2xl border text-xs font-extrabold text-right transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <span>{option}</span>
                <span className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center font-scoreboard text-[10px]">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`p-4 rounded-2xl text-center space-y-2 border ${
              result.isCorrect
                ? "bg-[#2ECC71]/10 border-[#2ECC71]/40 text-[#2ECC71]"
                : "bg-[#E23B3B]/10 border-[#E23B3B]/40 text-[#E23B3B]"
            }`}
          >
            {result.isCorrect ? (
              <>
                <CheckCircle className="w-8 h-8 text-[#2ECC71] mx-auto" />
                <h4 className="font-black text-base text-white">پاسخ کاملا صحیح بود! 🎉</h4>
                <p className="text-xs text-slate-200">
                  +{result.reward || quiz.coinReward} سکه + {quiz.xpReward} XP جایزه گرفتید.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-[#E23B3B] mx-auto" />
                <h4 className="font-black text-base text-white">متاسفانه پاسخ اشتباه بود!</h4>
                <p className="text-xs text-slate-300">
                  گزینه صحیح: {quiz.options[quiz.correctOption]}
                </p>
              </>
            )}

            <button
              onClick={onClose}
              className="mt-2 bg-[#2ECC71] text-slate-950 font-black text-xs px-6 py-2 rounded-xl transition-all cursor-pointer"
            >
              بستن و ادامه
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
