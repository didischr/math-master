import React, { useState, useEffect } from 'react';
import { Question, MathTipResponse } from '../types';
import { getMathTip } from '../services/geminiService';
import { Loader2, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

const Quiz: React.FC<{ onSaveHistory: (score: number, total: number) => void }> = ({ onSaveHistory }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [aiTip, setAiTip] = useState<MathTipResponse | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 18) + 3; 
    const num2 = Math.floor(Math.random() * 18) + 3;
    setQuestion({
      num1,
      num2,
      answer: num1 * num2,
    });
    setInput('');
    setFeedback(null);
    setShowTip(false);
    setAiTip(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question || input === '') return;

    const val = parseInt(input);
    const isCorrect = val === question.answer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      setTimeout(() => {
        generateQuestion();
      }, 800);
    } else {
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNumPad = (num: number) => {
    if (input.length < 4) {
        setInput(prev => prev + num.toString());
    }
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const fetchTip = async () => {
    if (!question) return;
    setShowTip(true);
    if (aiTip) return; 

    setIsLoadingTip(true);
    try {
      const data = await getMathTip(question.num1, question.num2);
      setAiTip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTip(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-md mx-auto pb-2">
      
      {/* Score Bar */}
      <div className="w-full flex justify-between items-center mb-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-sm">
        <div className="flex gap-3">
            <span className="text-green-600 font-bold">נכון: {stats.correct}</span>
            <span className="text-gray-500">סה"כ: {stats.total}</span>
        </div>
        <button 
          onClick={() => {
             onSaveHistory(stats.correct, stats.total);
             setStats({correct:0, total:0});
             generateQuestion();
          }}
          className="text-blue-500 text-xs hover:underline"
        >
          אפס
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col justify-center gap-2 min-h-0">
          {/* Question Card */}
          <div className={`
            w-full bg-white rounded-xl shadow-md p-4 text-center transition-all duration-200 border
            ${feedback === 'correct' ? 'border-green-400 bg-green-50' : feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-gray-100'}
          `}>
            {question && (
                <>
                    <div className="text-4xl font-bold text-gray-800 mb-2 flex justify-center gap-2 items-center" style={{direction: 'ltr'}}>
                        <span>{question.num1}</span>
                        <span className="text-blue-500 text-3xl">×</span>
                        <span>{question.num2}</span>
                        <span className="text-3xl">=</span>
                        <span className="w-20 border-b-2 border-gray-300 min-h-[40px] inline-block text-blue-600">
                            {input}
                            <span className="animate-pulse text-gray-300 ml-1">|</span>
                        </span>
                    </div>
                    
                    <div className="h-6">
                        {feedback === 'correct' && (
                            <div className="text-green-600 font-bold text-sm animate-bounce flex items-center justify-center gap-1">
                                <CheckCircle size={16}/> מעולה!
                            </div>
                        )}
                        {feedback === 'wrong' && (
                            <div className="text-red-500 font-bold text-sm flex items-center justify-center gap-1">
                                <XCircle size={16}/> נסה שוב
                            </div>
                        )}
                    </div>
                </>
            )}
          </div>

          {/* AI Tip Section - Compact */}
          <div className="w-full min-h-[50px] max-h-[120px] overflow-y-auto shrink-0">
              {!showTip ? (
                  <button 
                    onClick={fetchTip}
                    className="w-full flex items-center justify-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 py-2 rounded-lg transition-colors text-sm"
                  >
                      <Lightbulb size={16} />
                      טיפ לפתרון מהיר (AI)
                  </button>
              ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-right text-xs md:text-sm">
                      {isLoadingTip ? (
                          <div className="flex items-center justify-center text-purple-600 gap-2 text-xs">
                              <Loader2 className="animate-spin" size={14} /> חושב...
                          </div>
                      ) : aiTip ? (
                          <div className="space-y-1">
                              <p className="font-semibold text-purple-900 flex items-center gap-1 text-xs"><Lightbulb size={12}/> הסבר:</p>
                              <p className="text-purple-800 leading-tight">{aiTip.tip}</p>
                              {aiTip.trick && (
                                <div className="mt-1 bg-purple-100 p-1 rounded">
                                    <span className="font-bold text-purple-900 text-xs">טריק: </span>
                                    <span className="text-purple-800">{aiTip.trick}</span>
                                </div>
                              )}
                          </div>
                      ) : (
                          <p className="text-red-400">שגיאה</p>
                      )}
                  </div>
              )}
          </div>

          {/* Numpad & Action */}
          <div className="w-full flex flex-col gap-2 mt-auto">
              <div className="grid grid-cols-3 gap-2 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumPad(num)}
                        className="bg-white hover:bg-blue-50 text-blue-600 font-bold text-xl py-2.5 rounded-lg shadow border-b-2 border-gray-200 active:border-b-0 active:translate-y-0.5 transition-all"
                    >
                        {num}
                    </button>
                ))}
                <button 
                    onClick={() => setInput('')}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-base py-2.5 rounded-lg shadow border-b-2 border-red-100 active:border-b-0 active:translate-y-0.5 transition-all"
                >
                    C
                </button>
                <button 
                     onClick={() => handleNumPad(0)}
                     className="bg-white hover:bg-blue-50 text-blue-600 font-bold text-xl py-2.5 rounded-lg shadow border-b-2 border-gray-200 active:border-b-0 active:translate-y-0.5 transition-all"
                >
                    0
                </button>
                <button 
                     onClick={handleBackspace}
                     className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-base py-2.5 rounded-lg shadow border-b-2 border-gray-200 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center"
                >
                    ⌫
                </button>
              </div>

              <button 
                onClick={() => handleSubmit()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-xl shadow-md shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                בדוק תשובה
              </button>
          </div>
      </div>
    </div>
  );
};

export default Quiz;