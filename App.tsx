import React, { useState } from 'react';
import { AppView, QuizHistory } from './types';
import Quiz from './components/Quiz';
import InteractiveGrid from './components/InteractiveGrid';
import Stats from './components/Stats';
import TwoPlayerQuiz from './components/TwoPlayerQuiz';
import { Calculator, Grid3X3, Trophy, LayoutGrid, Users } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [history, setHistory] = useState<QuizHistory[]>([]);

  const saveHistory = (score: number, total: number) => {
    if (total === 0) return;
    const newEntry: QuizHistory = {
      date: new Date().toISOString(),
      score,
      totalQuestions: total
    };
    setHistory(prev => [...prev, newEntry]);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600 drop-shadow-sm">אלוף הכפל</h1>
                <p className="text-lg text-gray-500">למד ותרגל את לוח הכפל עד 20!</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg px-4">
                <button 
                    onClick={() => setCurrentView(AppView.PRACTICE)}
                    className="flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
                >
                    <Calculator size={32} />
                    <span className="text-lg font-bold">התחל תרגול</span>
                </button>

                <button 
                    onClick={() => setCurrentView(AppView.TWO_PLAYER)}
                    className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1"
                >
                    <Users size={32} />
                    <span className="text-lg font-bold">תחרות 1 נגד 1</span>
                </button>

                <button 
                    onClick={() => setCurrentView(AppView.GRID)}
                    className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-900 border border-blue-100 p-4 rounded-xl shadow-md transition-all transform hover:-translate-y-1"
                >
                    <Grid3X3 size={24} className="text-blue-500" />
                    <span className="text-base font-bold">לוח הכפל המלא</span>
                </button>

                <button 
                    onClick={() => setCurrentView(AppView.STATS)}
                    className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-800 border border-green-100 p-4 rounded-xl shadow-md transition-all transform hover:-translate-y-1"
                >
                    <Trophy size={24} className="text-green-500" />
                    <span className="text-base font-bold">ההתקדמות שלי</span>
                </button>
            </div>
          </div>
        );
      case AppView.PRACTICE:
        return <Quiz onSaveHistory={saveHistory} />;
      case AppView.TWO_PLAYER:
        return <TwoPlayerQuiz onBack={() => setCurrentView(AppView.HOME)} />;
      case AppView.GRID:
        return <InteractiveGrid />;
      case AppView.STATS:
        return <Stats history={history} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden">
      {/* Header - Hide in 2 player mode to maximize space */}
      {currentView !== AppView.TWO_PLAYER && (
        <header className="bg-white border-b border-gray-200 shrink-0 h-12 md:h-14 z-50">
            <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
                <div 
                    className="flex items-center gap-2 font-bold text-lg md:text-xl text-blue-600 cursor-pointer"
                    onClick={() => setCurrentView(AppView.HOME)}
                >
                    <LayoutGrid size={20} />
                    <span>אלוף הכפל</span>
                </div>
                
                {currentView !== AppView.HOME && (
                    <nav className="flex gap-1">
                        <button 
                            onClick={() => setCurrentView(AppView.PRACTICE)}
                            className={`p-1.5 rounded-lg ${currentView === AppView.PRACTICE ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="תרגול"
                        >
                            <Calculator size={20} />
                        </button>
                         <button 
                            onClick={() => setCurrentView(AppView.TWO_PLAYER)}
                            className={`p-1.5 rounded-lg ${currentView === AppView.TWO_PLAYER ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="1 נגד 1"
                        >
                            <Users size={20} />
                        </button>
                        <button 
                            onClick={() => setCurrentView(AppView.GRID)}
                            className={`p-1.5 rounded-lg ${currentView === AppView.GRID ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="לוח הכפל"
                        >
                            <Grid3X3 size={20} />
                        </button>
                        <button 
                            onClick={() => setCurrentView(AppView.STATS)}
                            className={`p-1.5 rounded-lg ${currentView === AppView.STATS ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="סטטיסטיקה"
                        >
                            <Trophy size={20} />
                        </button>
                    </nav>
                )}
            </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full ${currentView === AppView.TWO_PLAYER ? '' : 'max-w-5xl mx-auto p-2'} overflow-hidden flex flex-col`}>
        {renderContent()}
      </main>

    </div>
  );
};

export default App;