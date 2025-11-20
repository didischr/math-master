import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, RotateCw, Trophy, ArrowLeft, Smartphone, MonitorSmartphone, Wifi, Copy, Loader2, XCircle, User, Terminal } from 'lucide-react';
import Peer, { DataConnection } from 'peerjs';

// --- Types ---

type GameMode = 'MENU' | 'LOCAL' | 'REMOTE_LOBBY' | 'REMOTE_GAME';

interface Question {
  n1: number;
  n2: number;
  ans: number;
}

// --- PeerJS Configuration ---
// Using public STUN servers to help traverse NATs/Firewalls
const PEER_CONFIG = {
    debug: 1,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ]
    },
    secure: true
};

// --- Components for Reuse ---

const Keypad = ({ disabled, onClick }: { disabled?: boolean, onClick: (v: string) => void }) => (
  <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mx-auto">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
      <button
        key={n}
        disabled={disabled}
        onClick={() => onClick(n.toString())}
        className={`bg-white hover:bg-gray-50 text-blue-900 font-bold text-xl py-3 rounded-xl shadow-sm border-b-4 border-blue-100 active:border-b-0 active:translate-y-1 transition-all ${n === 0 ? 'col-start-2' : ''}`}
      >
        {n}
      </button>
    ))}
    <button disabled={disabled} onClick={() => onClick('C')} className="bg-red-50 text-red-600 font-bold py-3 rounded-xl shadow-sm border-b-4 border-red-100 active:border-b-0 active:translate-y-1 col-start-1 row-start-4">C</button>
    <button disabled={disabled} onClick={() => onClick('BS')} className="bg-gray-100 text-gray-600 font-bold py-3 rounded-xl shadow-sm border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 col-start-3 row-start-4">⌫</button>
  </div>
);

// --- LOCAL SPLIT SCREEN IMPLEMENTATION ---

const LocalGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [question, setQuestion] = useState<Question>({ n1: 0, n2: 0, ans: 0 });
    const [p1, setP1] = useState({ score: 0, input: '', wrong: false });
    const [p2, setP2] = useState({ score: 0, input: '', wrong: false });
    const [isFaceToFace, setIsFaceToFace] = useState(false);
    const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);
  
    const generateQuestion = () => {
      const n1 = Math.floor(Math.random() * 18) + 3;
      const n2 = Math.floor(Math.random() * 18) + 3;
      setQuestion({ n1, n2, ans: n1 * n2 });
      setP1(prev => ({ ...prev, input: '', wrong: false }));
      setP2(prev => ({ ...prev, input: '', wrong: false }));
      setWinner(null);
    };
  
    useEffect(() => { generateQuestion(); }, []);
  
    const handleInput = (player: 'p1' | 'p2', val: string) => {
      if (winner) return;
      const setter = player === 'p1' ? setP1 : setP2;
      setter(prev => {
        if (val === 'C') return { ...prev, input: '' };
        if (val === 'BS') return { ...prev, input: prev.input.slice(0, -1) };
        if (prev.input.length >= 4) return prev;
        return { ...prev, input: prev.input + val };
      });
    };
  
    const checkAnswer = (player: 'p1' | 'p2') => {
      if (winner) return;
      const state = player === 'p1' ? p1 : p2;
      const val = parseInt(state.input);
      if (isNaN(val)) return;
  
      if (val === question.ans) {
        setWinner(player);
        const setter = player === 'p1' ? setP1 : setP2;
        setter(prev => ({ ...prev, score: prev.score + 1 }));
        setTimeout(generateQuestion, 1500);
      } else {
        const setter = player === 'p1' ? setP1 : setP2;
        setter(prev => ({ ...prev, input: '', wrong: true }));
        setTimeout(() => setter(prev => ({ ...prev, wrong: false })), 500);
      }
    };
  
    const renderPlayer = (id: 'p1' | 'p2') => {
       const isP1 = id === 'p1';
       const state = isP1 ? p1 : p2;
       const baseColor = isP1 ? 'blue' : 'red';
       return (
         <div className={`flex-1 flex flex-col p-2 ${isP1 ? 'bg-blue-50' : 'bg-red-50'} ${(!isP1 && isFaceToFace) ? 'rotate-180' : ''} relative transition-all duration-300`}>
             {(winner && winner === id) && <div className="absolute inset-0 bg-green-100/80 z-10 flex items-center justify-center text-4xl font-bold text-green-700 animate-bounce">ניצחון!</div>}
             {(winner && winner !== id) && <div className="absolute inset-0 bg-gray-100/80 z-10 flex items-center justify-center text-2xl font-bold text-gray-500">השני ניצח...</div>}
             
             <div className="flex justify-between items-center mb-2">
                 <span className={`font-bold text-${baseColor}-700`}>שחקן {isP1 ? '1' : '2'}</span>
                 <span className="bg-white px-3 py-1 rounded-full font-bold shadow">{state.score}</span>
             </div>
             <div className="flex-1 flex flex-col justify-center items-center gap-2">
                 <div className={`h-12 w-32 bg-white border-2 rounded-lg flex items-center justify-center text-2xl font-bold ${state.wrong ? 'border-red-500 animate-shake' : `border-${baseColor}-200`}`}>{state.input}</div>
                 <button onClick={() => checkAnswer(id)} className={`w-32 py-2 rounded-lg font-bold text-white shadow ${state.input ? `bg-${baseColor}-500` : 'bg-gray-300'}`}>שלח</button>
             </div>
             <Keypad onClick={(v) => handleInput(id, v)} />
         </div>
       );
    };
  
    return (
      <div className="h-full flex flex-col relative bg-white overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex gap-2 bg-white p-2 rounded-full shadow-lg border">
             <button onClick={onBack}><ArrowLeft size={20} className="text-gray-500"/></button>
             <div className="px-2 font-bold text-xl bg-yellow-50 border border-yellow-200 rounded flex gap-1">
                 <span>{question.n1}</span><span>×</span><span>{question.n2}</span><span className="text-blue-500">= ?</span>
             </div>
             <button onClick={() => setIsFaceToFace(!isFaceToFace)}><RotateCw size={20} className="text-blue-500"/></button>
         </div>
         {renderPlayer('p2')}
         <div className="h-0.5 bg-gray-300 w-full shrink-0" />
         {renderPlayer('p1')}
      </div>
    );
};

// --- REMOTE ONLINE IMPLEMENTATION ---

const RemoteGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState<'LOBBY' | 'WAITING' | 'GAME'>('LOBBY');
    const [role, setRole] = useState<'HOST' | 'GUEST' | null>(null);
    
    // Refs to prevent stale closures
    const roleRef = useRef<'HOST' | 'GUEST' | null>(null);
    const isConnectedRef = useRef(false);
    const questionRef = useRef<Question>({ n1: 0, n2: 0, ans: 0 });
    const myNameRef = useRef('');
    
    const [gameId, setGameId] = useState('');
    const [joinInput, setJoinInput] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [error, setError] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);
    
    // Debug Logs
    const [logs, setLogs] = useState<string[]>([]);
    
    // Names
    const [myName, setMyName] = useState('');
    const [opponentName, setOpponentName] = useState('');

    // Game State
    const [question, setQuestion] = useState<Question>({ n1: 0, n2: 0, ans: 0 });
    const [myScore, setMyScore] = useState(0);
    const [opScore, setOpScore] = useState(0);
    const [input, setInput] = useState('');
    const [winner, setWinner] = useState<'ME' | 'OP' | null>(null);
    const [wrongAnim, setWrongAnim] = useState(false);
    
    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);

    // Sync state to refs
    useEffect(() => { myNameRef.current = myName; }, [myName]);
    useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
    useEffect(() => { questionRef.current = question; }, [question]);
    useEffect(() => { roleRef.current = role; }, [role]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString().split(' ')[0]} - ${msg}`]);
    };

    const cleanup = () => {
        if (connRef.current) connRef.current.close();
        if (peerRef.current) peerRef.current.destroy();
        connRef.current = null;
        peerRef.current = null;
        setIsConnected(false);
        setOpponentName('');
        roleRef.current = null;
        isConnectedRef.current = false;
        setIsTimeout(false);
        setLogs([]);
    };

    useEffect(() => {
        return cleanup;
    }, []);

    // Unified message handler
    const handleDataMessage = (data: any, conn: DataConnection) => {
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'HELLO':
                if (roleRef.current === 'HOST') {
                    if (!opponentName) {
                        setOpponentName(data.name || 'יריב');
                        addLog(`יריב זוהה: ${data.name}`);
                    }
                    
                    let qToSend = questionRef.current;
                    
                    if (!isConnectedRef.current) {
                        const n1 = Math.floor(Math.random() * 18) + 3;
                        const n2 = Math.floor(Math.random() * 18) + 3;
                        qToSend = { n1, n2, ans: n1 * n2 };
                        setQuestion(qToSend);
                        questionRef.current = qToSend;
                        setIsConnected(true);
                        addLog('משחק מתחיל (Host)');
                    }
                    
                    if (conn.open) {
                        try {
                            conn.send({ type: 'WELCOME', name: myNameRef.current, q: qToSend });
                        } catch (e) { console.error("Send failed", e); }
                    }
                }
                break;
                
            case 'WELCOME':
                if (roleRef.current === 'GUEST') {
                    setOpponentName(data.name || 'יריב');
                    setQuestion(data.q);
                    setIsConnected(true);
                    setStep('GAME'); // <--- FIX: Transition state to GAME
                    addLog('התקבל אישור WELCOME');
                }
                break;
                
            case 'NEW_ROUND':
                setQuestion(data.q);
                setWinner(null);
                setInput('');
                break;
                
            case 'OP_WON':
                setWinner('OP');
                setOpScore(s => s + 1);
                break;
        }
    };

    const setupConn = (conn: DataConnection) => {
        connRef.current = conn;
        conn.on('data', (data) => handleDataMessage(data, conn));
        
        conn.on('close', () => {
            setError('היריב התנתק');
            setIsConnected(false);
            setStep('LOBBY');
            addLog('Connection Closed');
        });
        
        conn.on('error', (err) => {
            console.error('Conn error:', err);
            addLog(`Conn Err: ${err}`);
        });

        // For ICE state monitoring
        // @ts-ignore
        if(conn.peerConnection) {
            // @ts-ignore
            conn.peerConnection.oniceconnectionstatechange = () => {
                // @ts-ignore
                addLog(`ICE State: ${conn.peerConnection.iceConnectionState}`);
            };
        }
    };

    const createGame = () => {
        if (!myName.trim()) { setError('אנא הכנס שם'); return; }
        
        cleanup();
        setRole('HOST');
        roleRef.current = 'HOST';
        myNameRef.current = myName;

        setStep('WAITING');
        setStatusMsg('יוצר חדר משחק...');
        setError('');
        addLog('מאתחל שרת Peer...');
        
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGameId(code);
        const peerId = `math-master-v1-${code}`;
        
        try {
            const peer = new Peer(peerId, PEER_CONFIG);
            peerRef.current = peer;

            peer.on('open', (id) => {
                addLog(`Server Open: ${id}`);
                setStep('GAME'); 
            });

            peer.on('connection', (conn) => {
                addLog('אורח מנסה להתחבר...');
                setupConn(conn);
            });

            peer.on('error', (err) => {
                console.error('Peer error:', err);
                addLog(`Peer Error: ${err.type}`);
                if (err.type === 'unavailable-id') setError('קוד תפוס, נסה שוב');
                else setError('שגיאת תקשורת');
                setStep('LOBBY');
            });
            
            peer.on('disconnected', () => {
                 setError('התנתק מהשרת');
                 addLog('Disconnected from Signaling Server');
            });

        } catch (e) {
            console.error(e);
            setError('שגיאה ביצירת משחק');
            setStep('LOBBY');
        }
    };

    const joinGame = () => {
        if (!myName.trim()) { setError('אנא הכנס שם'); return; }
        const codeInput = joinInput.trim();
        if (codeInput.length !== 4) return;
        
        cleanup();
        setRole('GUEST');
        roleRef.current = 'GUEST';
        myNameRef.current = myName;

        setStep('WAITING');
        setStatusMsg('מתחבר למארח...');
        setError('');
        setIsTimeout(false);
        addLog('מאתחל לקוח Peer...');
        
        const hostId = `math-master-v1-${codeInput}`;
        
        try {
            const peer = new Peer(PEER_CONFIG); // Let server assign random ID
            peerRef.current = peer;

            peer.on('open', (id) => {
                addLog(`My ID: ${id}`);
                addLog(`Connecting to: ${hostId}`);
                
                const conn = peer.connect(hostId, { serialization: 'json' });
                setupConn(conn);
                
                const timeoutTimer = setTimeout(() => {
                    if (!isConnectedRef.current) setIsTimeout(true);
                }, 12000);
                
                conn.on('open', () => {
                    addLog('Connection OPEN! Sending HELLO...');
                    
                    const sendHello = () => {
                        if (isConnectedRef.current || !conn.open) return;
                        try {
                            conn.send({ type: 'HELLO', name: myNameRef.current });
                        } catch (e) { console.error("Send failed", e); }
                    };

                    sendHello(); 
                    
                    const interval = setInterval(() => {
                        if (isConnectedRef.current || !conn.open) {
                            clearInterval(interval);
                            clearTimeout(timeoutTimer);
                        } else {
                            addLog('Retrying HELLO...');
                            sendHello();
                        }
                    }, 1000);
                });
                
                conn.on('error', (err) => {
                    addLog(`Conn Error: ${err}`);
                });
            });

            peer.on('error', (err) => {
                console.error('Peer error:', err);
                addLog(`Error: ${err.type}`);
                if (err.type === 'peer-unavailable') {
                    setError('הקוד שגוי או שהמארח לא מחובר');
                } else {
                    setError('שגיאת חיבור: ' + (err.type || 'Unknown'));
                }
                // setStep('LOBBY'); // Keep waiting to see logs
            });

        } catch (e) {
            console.error(e);
            setError('שגיאה בהצטרפות');
            setStep('LOBBY');
        }
    };

    const startNewRound = () => {
        const conn = connRef.current;
        if (!conn) return;
        const n1 = Math.floor(Math.random() * 18) + 3;
        const n2 = Math.floor(Math.random() * 18) + 3;
        const q = { n1, n2, ans: n1 * n2 };
        setQuestion(q);
        setWinner(null);
        setInput('');
        if (conn.open) conn.send({ type: 'NEW_ROUND', q });
    };

    const handleInput = (val: string) => {
        if (winner) return;
        if (val === 'C') setInput('');
        else if (val === 'BS') setInput(prev => prev.slice(0, -1));
        else if (input.length < 4) setInput(prev => prev + val);
    };

    const submitAnswer = () => {
        if (winner) return;
        const val = parseInt(input);
        if (val === question.ans) {
            setWinner('ME');
            setMyScore(s => s + 1);
            if (connRef.current?.open) connRef.current.send({ type: 'OP_WON' });
            if (role === 'HOST') setTimeout(() => startNewRound(), 2000);
        } else {
            setWrongAnim(true);
            setInput('');
            setTimeout(() => setWrongAnim(false), 500);
        }
    };

    const handleCancel = () => {
        cleanup();
        setStep('LOBBY');
    };

    // -- RENDER LOGIC --

    if (step === 'WAITING') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 text-center animate-fade-in relative">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Wifi className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{statusMsg}</h3>
                    <p className="text-gray-500 mt-2">אנא המתן...</p>
                    {isTimeout && (
                        <div className="mt-4 text-red-500 text-sm bg-red-50 p-2 rounded animate-pulse">
                            החיבור לוקח זמן... בדוק את חיבור האינטרנט או נסה שוב.
                        </div>
                    )}
                </div>
                
                <button onClick={handleCancel} className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-colors">
                    ביטול
                </button>

                {/* Debug Logs Box */}
                <div className="mt-8 w-full max-w-xs bg-black/80 text-green-400 p-2 rounded text-[10px] font-mono text-left h-32 overflow-y-auto">
                    <div className="flex items-center gap-1 border-b border-gray-700 pb-1 mb-1 text-gray-400">
                        <Terminal size={10}/> LOGS
                    </div>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                    {logs.length === 0 && <div>Waiting for logs...</div>}
                </div>
            </div>
        );
    }

    if (step === 'LOBBY') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 text-center relative overflow-y-auto">
                <button onClick={onBack} className="absolute top-4 right-4 p-2 text-gray-400"><ArrowLeft/></button>
                <h2 className="text-2xl font-bold text-blue-800 mb-2">משחק אונליין</h2>
                
                <div className="w-full max-w-sm space-y-6">
                    {/* Name Input */}
                    <div className="bg-white p-4 rounded-xl shadow border border-blue-100">
                         <label className="block text-sm font-bold text-gray-600 mb-2 text-right">השם שלך:</label>
                         <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-200">
                             <User className="text-gray-400" size={20}/>
                             <input 
                                type="text"
                                value={myName}
                                onChange={e => setMyName(e.target.value)}
                                placeholder="הכנס שם..."
                                className="flex-1 outline-none font-bold text-gray-800"
                                maxLength={12}
                             />
                         </div>
                    </div>

                    {/* Actions */}
                    <div className="grid gap-4 opacity-100 transition-opacity duration-200">
                        <button 
                            onClick={createGame}
                            disabled={!myName.trim()}
                            className="bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-5 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:bg-blue-700 transition-transform hover:-translate-y-1"
                        >
                            <Wifi size={28}/>
                            <span className="text-lg font-bold">צור משחק חדש</span>
                        </button>
                        
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">או</span></div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-2 text-sm">הצטרף למשחק קיים</h3>
                            <div className="flex gap-2">
                                <input 
                                    type="tel" 
                                    value={joinInput}
                                    onChange={(e) => setJoinInput(e.target.value)}
                                    placeholder="קוד (4 ספרות)"
                                    className="flex-1 p-3 border rounded-lg text-center text-lg font-bold tracking-widest outline-blue-500"
                                    maxLength={4}
                                />
                                <button 
                                    onClick={joinGame}
                                    disabled={joinInput.length !== 4 || !myName.trim()}
                                    className="bg-green-600 disabled:bg-gray-300 text-white px-4 rounded-lg font-bold"
                                >
                                    הצטרף
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm animate-shake flex items-center gap-2 justify-center">
                        <XCircle size={16} /> {error}
                    </div>
                )}
            </div>
        );
    }

    // Waiting for Guest (HOST ONLY)
    if (step === 'GAME' && role === 'HOST' && !isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6 p-6 animate-fade-in relative">
                 <button onClick={handleCancel} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"><XCircle/></button>
                 <div className="text-center space-y-2">
                     <h2 className="text-xl text-gray-600">קוד המשחק שלך:</h2>
                     <div className="text-6xl font-black text-blue-600 tracking-widest bg-blue-50 px-8 py-4 rounded-2xl border-2 border-blue-100 select-all">
                         {gameId}
                     </div>
                     <p className="text-gray-500 mt-4">תן את הקוד לחבר כדי שיתחבר</p>
                 </div>
                 <div className="flex items-center gap-2 text-blue-500 animate-pulse bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100">
                     <Loader2 className="animate-spin" size={20}/> 
                     <span className="font-bold">ממתין לחיבור האורח...</span>
                 </div>
                 
                 {/* Debug Logs for Host */}
                 <div className="mt-8 w-full max-w-xs bg-black/80 text-green-400 p-2 rounded text-[10px] font-mono text-left h-24 overflow-y-auto">
                    <div className="flex items-center gap-1 border-b border-gray-700 pb-1 mb-1 text-gray-400">
                        <Terminal size={10}/> HOST LOGS
                    </div>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
        );
    }

    // Actual Game View (Both connected)
    if (step === 'GAME' && isConnected) {
        return (
            <div className="h-full flex flex-col bg-gray-50 relative">
                <button onClick={handleCancel} className="absolute top-2 left-2 p-1 bg-red-100 text-red-600 rounded z-50"><XCircle size={20}/></button>
                
                {/* Opponent Status Bar */}
                <div className="bg-white border-b p-2 flex justify-between items-center shadow-sm shrink-0 pl-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                           {role === 'HOST' ? '2' : '1'}
                        </div>
                        <div className="flex flex-col">
                             <span className="text-xs text-gray-400 leading-none">יריב</span>
                             <span className="font-bold text-gray-700">{opponentName}</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({length: opScore}).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-green-500"></div>
                        ))}
                        <span className="text-lg font-bold text-gray-800 ml-2">{opScore}</span>
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto">
                    
                    {/* Question Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs mb-6 text-center border-2 border-blue-50">
                        {winner === 'ME' ? (
                            <div className="text-green-600 animate-bounce">
                                <Trophy size={48} className="mx-auto mb-2"/>
                                <h3 className="text-2xl font-bold">כל הכבוד!</h3>
                            </div>
                        ) : winner === 'OP' ? (
                            <div className="text-red-500">
                                <div className="text-4xl mb-2">😓</div>
                                <h3 className="text-xl font-bold">{opponentName} ענה קודם</h3>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3 text-5xl font-bold text-gray-800" dir="ltr">
                                <span>{question.n1}</span>
                                <span className="text-blue-400 text-3xl">×</span>
                                <span>{question.n2}</span>
                            </div>
                        )}
                    </div>

                    {/* Input & Controls */}
                    <div className="w-full max-w-xs space-y-4">
                        <div className="flex gap-2">
                             <div className={`flex-1 h-16 bg-white rounded-xl border-2 flex items-center justify-center text-3xl font-bold tracking-widest shadow-inner ${wrongAnim ? 'border-red-400 bg-red-50 animate-shake' : 'border-blue-200'}`}>
                                 {input}
                             </div>
                             <button 
                                onClick={submitAnswer}
                                disabled={!input || !!winner}
                                className="bg-blue-600 disabled:bg-gray-300 text-white w-20 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                             >
                                 שלח
                             </button>
                        </div>
                        
                        <Keypad disabled={!!winner} onClick={handleInput} />
                    </div>
                </div>

                {/* My Status Bar */}
                <div className="bg-white border-t p-3 flex justify-between items-center text-blue-900">
                     <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                           {role === 'HOST' ? '1' : '2'}
                        </div>
                        <div className="flex flex-col">
                             <span className="text-xs text-blue-400 leading-none">אני</span>
                             <span className="font-bold">{myName}</span>
                        </div>
                     </div>
                     <span className="text-3xl font-bold">{myScore}</span>
                </div>
            </div>
        );
    }
    
    return null;
};

// --- MAIN COMPONENT ---

const TwoPlayerQuiz: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<GameMode>('MENU');

  if (mode === 'LOCAL') {
    return <LocalGame onBack={() => setMode('MENU')} />;
  }

  if (mode === 'REMOTE' || mode === 'REMOTE_LOBBY' || mode === 'REMOTE_GAME') {
    return <RemoteGame onBack={() => setMode('MENU')} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 animate-fade-in relative">
        <button onClick={onBack} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
        </button>
        
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-indigo-800">משחק לשני שחקנים</h2>
            <p className="text-gray-500">בחר את סוג המשחק שברצונך לשחק</p>
        </div>

        <div className="grid gap-4 w-full max-w-md">
            <button 
                onClick={() => setMode('LOCAL')}
                className="flex items-center gap-4 bg-white hover:bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl shadow-sm transition-all group text-right"
            >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                    <MonitorSmartphone size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-indigo-900">מסך מפוצל</h3>
                    <p className="text-sm text-gray-500">שחקו יחד על אותו מכשיר</p>
                </div>
            </button>

            <button 
                onClick={() => setMode('REMOTE_LOBBY')}
                className="flex items-center gap-4 bg-white hover:bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl shadow-sm transition-all group text-right"
            >
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Wifi size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-blue-900">משחק אונליין</h3>
                    <p className="text-sm text-gray-500">שחקו מול חבר מרחוק (2 מכשירים)</p>
                </div>
            </button>
        </div>
    </div>
  );
};

export default TwoPlayerQuiz;