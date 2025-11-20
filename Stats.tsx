import React from 'react';
import { QuizHistory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsProps {
  history: QuizHistory[];
}

const Stats: React.FC<StatsProps> = ({ history }) => {
  // Calculate accuracy for the chart
  const data = history.map((entry, index) => ({
    name: `${index + 1}`,
    accuracy: entry.totalQuestions > 0 ? Math.round((entry.score / entry.totalQuestions) * 100) : 0,
    total: entry.totalQuestions
  })).slice(-15); 

  return (
    <div className="w-full h-full max-w-2xl mx-auto flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-3 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 text-center">ההתקדמות שלי</h2>
      </div>

      <div className="flex-1 w-full min-h-0 p-2">
        {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p>אין עדיין נתונים.</p>
                <p className="text-sm mt-1">התחל לתרגל!</p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', padding: '8px' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="דיוק (%)" />
                </LineChart>
            </ResponsiveContainer>
        )}
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 shrink-0 bg-gray-50 border-t border-gray-100">
          <div className="text-center">
              <p className="text-blue-600 text-xs font-bold">שאלות שנפתרו</p>
              <p className="text-2xl font-bold text-blue-800">
                  {history.reduce((acc, curr) => acc + curr.totalQuestions, 0)}
              </p>
          </div>
          <div className="text-center">
              <p className="text-green-600 text-xs font-bold">ממוצע דיוק</p>
              <p className="text-2xl font-bold text-green-800">
                  {history.length > 0 
                    ? Math.round(
                        (history.reduce((acc, curr) => acc + curr.score, 0) / 
                         history.reduce((acc, curr) => acc + curr.totalQuestions, 0)) * 100
                      )
                    : 0
                  }%
              </p>
          </div>
      </div>
    </div>
  );
};

export default Stats;