'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Pencil,
  Target,
  Calculator,
  Calendar,
  Zap,
  Bug,
  Eye,
  EyeOff,
  TrendingUp,
  BarChart3,
  Sun,
  Moon,
  Palette,
  Gem,
  Download,
  Share2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- Types ---
type ThemeMode = 'light' | 'dark' | 'blue';

interface Movement {
  id: string; concept: string; category: string; amount: number; date: string;
}
interface SavingsGoal { name: string; amount: number; }
interface UpcomingPayment { id: string; name: string; amount: number; dueDate: string; }
interface AntExpense { id: string; name: string; monthlyAmount: number; }

const MOVEMENTS_KEY = 'finance_movements_v2';
const GOAL_KEY = 'finance_goal_v2';
const SIM_KEY = 'finance_sim_v2';
const PAYMENTS_KEY = 'finance_payments_v2';
const ANT_KEY = 'finance_ant_v2';
const PRIVACY_KEY = 'finance_privacy_v2';
const THEME_KEY = 'finance_theme_v2';

// --- Theme Configurations ---
const THEMES = {
  light: {
    bg: 'bg-slate-50',
    card: 'bg-white',
    text: 'text-slate-900',
    subText: 'text-slate-400',
    border: 'border-slate-100',
    chartLine: '#94A3B8',
    cardShadow: 'shadow-xl shadow-slate-100/50',
    inputBg: 'bg-slate-50'
  },
  dark: {
    bg: 'bg-[#0F172A]',
    card: 'bg-slate-800',
    text: 'text-slate-100',
    subText: 'text-slate-400',
    border: 'border-slate-700',
    chartLine: '#64748B',
    cardShadow: 'shadow-2xl shadow-black/20',
    inputBg: 'bg-slate-900'
  },
  blue: {
    bg: 'bg-[#1E3A8A]',
    card: 'bg-blue-800',
    text: 'text-blue-50',
    subText: 'text-blue-300',
    border: 'border-blue-700',
    chartLine: '#93C5FD',
    cardShadow: 'shadow-2xl shadow-blue-950/40',
    inputBg: 'bg-blue-900'
  }
};

const INITIAL_MOVEMENTS: Movement[] = [
  { id: '1', concept: 'Salario', category: 'Ingreso', amount: 3000, date: new Date().toISOString() },
  { id: '2', concept: 'Renta', category: 'Gasto', amount: -800, date: new Date().toISOString() },
  { id: '3', concept: 'Comida', category: 'Gasto', amount: -400, date: new Date().toISOString() },
  { id: '4', concept: 'Freelance', category: 'Ingreso', amount: 500, date: new Date().toISOString() },
];

export default function DashboardFinanzas() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [goal, setGoal] = useState<SavingsGoal>({ name: 'Libertad Financiera', amount: 15000 });
  const [payments, setPayments] = useState<UpcomingPayment[]>([]);
  const [antExpenses, setAntExpenses] = useState<AntExpense[]>([]);
  const [isPrivacy, setIsPrivacy] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAntForm, setShowAntForm] = useState(false);

  // Logic States
  const [simRate, setSimRate] = useState(10);
  const [simYears, setSimYears] = useState(5);
  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState('Gasto');
  const [newAmount, setNewAmount] = useState('');
  const [tempGoalName, setTempGoalName] = useState('');
  const [tempGoalAmount, setTempGoalAmount] = useState('');
  const [payName, setPayName] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState('');
  const [antName, setAntName] = useState('');
  const [antMonthly, setAntMonthly] = useState('');

  const T = THEMES[theme];

  // --- Persistence ---
  useEffect(() => {
    const load = (k: string, d: any) => {
      if (typeof window === 'undefined') return d;
      const s = localStorage.getItem(k);
      if (s === null) return d;
      try {
        return JSON.parse(s);
      } catch (e) {
        console.error(`Error parsing localStorage key ${k}`, e);
        return d;
      }
    };

    const savedMovements = load(MOVEMENTS_KEY, null);
    setMovements(savedMovements !== null ? savedMovements : INITIAL_MOVEMENTS);

    setGoal(load(GOAL_KEY, { name: 'Libertad Financiera', amount: 15000 }));
    setPayments(load(PAYMENTS_KEY, []));
    setAntExpenses(load(ANT_KEY, []));
    setIsPrivacy(load(PRIVACY_KEY, false));

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setTheme(savedTheme as ThemeMode);

    const savedSim = localStorage.getItem(SIM_KEY);
    if (savedSim) {
      try {
        const p = JSON.parse(savedSim);
        setSimRate(p.rate); setSimYears(p.years);
      } catch (e) { }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
      localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
      localStorage.setItem(SIM_KEY, JSON.stringify({ rate: simRate, years: simYears }));
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
      localStorage.setItem(ANT_KEY, JSON.stringify(antExpenses));
      localStorage.setItem(PRIVACY_KEY, JSON.stringify(isPrivacy));
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [movements, goal, simRate, simYears, payments, antExpenses, isPrivacy, theme, isLoaded]);

  // --- Analytics ---
  const stats = useMemo(() => {
    let income = 0; let expenses = 0;
    movements.forEach(m => m.amount > 0 ? income += m.amount : expenses += Math.abs(m.amount));
    const balance = income - expenses;
    const eff = income > 0 ? (balance / income) * 100 : 0;
    const progress = Math.min((balance / goal.amount) * 100, 100);
    const r = simRate / 100; const t = simYears;
    const fvInvestment = balance > 0 ? balance * Math.pow(1 + r, t) : 0;
    let antM = 0; antExpenses.forEach(a => {
      const val = (a as any).monthlyAmount ?? (a as any).dailyAmount ?? 0;
      antM += val;
    });

    // Category breakdown for expenses
    const categories: { [key: string]: number } = {};
    movements.filter(m => m.amount < 0).forEach(m => {
      const concept = m.concept.split(' ')[0] || 'Otros';
      categories[concept] = (categories[concept] || 0) + Math.abs(m.amount);
    });
    const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));

    return { income, expenses, balance, eff, progress, fvInvestment, totalAnt: antM * 12, antM, pieData };
  }, [movements, goal, simRate, simYears, antExpenses]);

  const chartData = useMemo(() => [
    { name: 'Ingresos', v: stats.income, c: '#10B981' },
    { name: 'Gastos', v: stats.expenses, c: '#F87171' }
  ], [stats]);

  const incomes = useMemo(() => movements.filter(m => m.amount > 0), [movements]);
  const outcomes = useMemo(() => movements.filter(m => m.amount < 0), [movements]);

  const format = useCallback((v: number) => {
    if (isPrivacy) return '••••';
    return `$${Math.round(v).toLocaleString()}`;
  }, [isPrivacy]);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [payments]);

  // --- Handlers ---
  const handleReset = () => {
    if (confirm('¿Estás seguro? Esta acción borrará permanentemente todos tus ingresos, gastos y metas.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = {
      movements,
      goal,
      payments,
      antExpenses,
      theme,
      isPrivacy,
      sim: { rate: simRate, years: simYears }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethereal_assets_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept || !newAmount) return;
    const amt = parseFloat(newAmount);
    const final = newCategory === 'Ingreso' ? Math.abs(amt) : -Math.abs(amt);
    setMovements(p => [{ id: Date.now().toString(), concept: newConcept, category: newCategory, amount: final, date: new Date().toISOString() }, ...p]);
    setNewConcept(''); setNewAmount(''); setShowForm(false);
  };

  if (!isLoaded) return null;

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

  return (
    <div className={`min-h-screen ${T.bg} transition-colors duration-500 font-sans`}>
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-24">

        {/* Top Bar - Mobile Optimized */}
        <header className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 md:w-14 md:h-14 ${theme === 'light' ? 'bg-indigo-600' : 'bg-emerald-500'} rounded-2xl shadow-lg flex items-center justify-center text-white transition-transform active:scale-90`}>
                <Gem size={24} className="md:w-8 md:h-8" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className={`text-xl md:text-5xl font-black ${T.text} tracking-tighter`}>Ethereal Assets</h1>
                <p className={`${T.subText} font-bold uppercase text-[8px] md:text-[10px] tracking-[0.3em]`}>Financial Intel System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrivacy(!isPrivacy)}
                className={`p-3 md:p-4 rounded-2xl transition-all active:scale-95 ${isPrivacy ? 'bg-indigo-600 text-white' : `${T.card} ${T.subText} border ${T.border}`}`}
              >
                {isPrivacy ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className={`hidden md:flex items-center gap-1 p-1.5 ${T.card} rounded-2xl border ${T.border}`}>
                <ThemeBtn active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={20} />} />
                <ThemeBtn active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={20} />} />
                <ThemeBtn active={theme === 'blue'} onClick={() => setTheme('blue')} icon={<Palette size={20} />} />
              </div>
            </div>
          </div>

          {/* Mobile Quick Actions Slider */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setShowForm(true)} className="flex-shrink-0 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2">
              <Plus size={18} strokeWidth={3} /> Nuevo
            </button>
            <ThemeBtn active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={18} />} />
            <ThemeBtn active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={18} />} />
            <ThemeBtn active={theme === 'blue'} onClick={() => setTheme('blue')} icon={<Palette size={18} />} />
            <button onClick={handleExport} className={`flex-shrink-0 p-3 rounded-2xl ${T.card} ${T.subText} border ${T.border}`}><Download size={18} /></button>
          </div>
        </header>

        {/* Hero Cards - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <StatCard title="Ingresos" value={stats.income} icon={<ArrowUpCircle />} color="emerald" theme={T} format={format} />
          <StatCard title="Gastos" value={stats.expenses} icon={<ArrowDownCircle />} color="coral" theme={T} format={format} isNeg />
          <StatCard title="Balance" value={stats.balance} icon={<DollarSign />} color="indigo" theme={T} format={format} isNeg={stats.balance < 0} />
          <StatCard title="Proyectado" value={stats.fvInvestment} icon={<TrendingUp />} color="blue" theme={T} format={format} />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* compound interest slider */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className={`${T.card} p-6 md:p-10 rounded-[32px] md:rounded-[48px] border ${T.border} ${theme === 'dark' ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'shadow-xl shadow-slate-200/50'} h-full flex flex-col`}>
              <div className="flex items-center gap-4 mb-6 md:mb-10">
                <div className={`p-3 md:p-4 ${theme === 'light' ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/40 text-emerald-400'} rounded-2xl md:rounded-3xl`}><BarChart3 size={24} className="md:w-8 md:h-8" /></div>
                <div>
                  <h3 className={`text-lg md:text-2xl font-black ${T.text} tracking-tighter`}>Proyección</h3>
                  <p className={`${T.subText} text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1`}>Calculador de Interés Compuesto</p>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8 mb-8 md:mb-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className={`text-[10px] md:text-[11px] font-black ${T.subText} uppercase tracking-widest`}>Tasa Anual</label>
                    <span className={`text-xs md:text-sm font-black ${theme === 'light' ? 'text-indigo-600' : 'text-emerald-400'}`}>{simRate}% Anual</span>
                  </div>
                  <input
                    type="range" min="0" max="30" step="0.5"
                    value={simRate} onChange={e => setSimRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className={`text-[10px] md:text-[11px] font-black ${T.subText} uppercase tracking-widest`}>Tiempo</label>
                    <span className={`text-xs md:text-sm font-black ${theme === 'light' ? 'text-indigo-600' : 'text-emerald-400'}`}>{simYears} Años</span>
                  </div>
                  <input
                    type="range" min="1" max="50"
                    value={simYears} onChange={e => setSimYears(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              <div className={`mt-auto p-6 md:p-8 rounded-[24px] md:rounded-[36px] ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-slate-700/50'} border relative overflow-hidden transition-all duration-300`}>
                <div className="relative z-10">
                  <p className={`text-[8px] md:text-[10px] font-black ${T.subText} uppercase tracking-widest mb-1 md:mb-2`}>Capital Final Estimado</p>
                  <p className={`text-3xl md:text-5xl font-black text-emerald-500 tracking-tighter tabular-nums`}>
                    {format(stats.fvInvestment)}
                  </p>
                  <div className="mt-2 md:mt-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className={`text-[8px] md:text-[9px] font-bold ${T.subText} uppercase tracking-wider`}>
                      Iniciando con {format(stats.balance)}
                    </p>
                  </div>
                </div>
                <TrendingUp className={`absolute -right-4 md:-right-6 -bottom-4 md:-bottom-6 ${theme === 'light' ? 'text-emerald-500/5' : 'text-emerald-500/10'}`} size={100} />
              </div>
            </div>
          </div>

          {/* Desktop Charts - Hidden on very small mobile if necessary, or just responsive */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className={`${T.card} p-6 md:p-10 rounded-[32px] md:rounded-[48px] border ${T.border} ${T.cardShadow} h-[300px] md:h-[450px] flex flex-col`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg md:text-2xl font-black ${T.text} tracking-tighter`}>Flujo Mensual</h2>
                <button onClick={handleExport} className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-600 transition-all">
                  <Download size={14} /> Exportar Backup
                </button>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme === 'light' ? '#475569' : '#94A3B8', fontSize: 11, fontWeight: 800 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme === 'light' ? '#64748B' : '#64748B', fontSize: 10, fontWeight: 600 }}
                      hide={isPrivacy}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: theme === 'light' ? '#F1F5F9' : '#1E293B' }}
                      contentStyle={{
                        backgroundColor: theme === 'light' ? '#FFFFFF' : '#0F172A',
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        color: theme === 'light' ? '#1E293B' : '#F8FAFC',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="v" radius={[8, 8, 8, 8]} barSize={40}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.c} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* New Features: Category Distribution (Mobile Friendly) */}
        {stats.pieData.length > 0 && (
          <div className={`${T.card} p-6 md:p-8 rounded-[32px] border ${T.border} ${T.cardShadow}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 ${theme === 'light' ? 'bg-indigo-50 text-indigo-500' : 'bg-indigo-900/30 text-indigo-400'} rounded-xl`}><PieChartIcon size={20} /></div>
              <h2 className={`font-black ${T.text} tracking-tight`}>Distribución de Gastos</h2>
            </div>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => format(val)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
              {stats.pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className={`text-[9px] font-bold ${T.text} truncate`}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movements - Mobile Optimized Tabs or Scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Column title="Ingresos" data={incomes} color="emerald" icon={<ArrowUpCircle />} theme={T} format={format} isPrivacy={isPrivacy} onDel={(id: string) => setMovements(p => p.filter(x => x.id !== id))} total={stats.income} />
          <Column title="Gastos" data={outcomes} color="rose" icon={<ArrowDownCircle />} theme={T} format={format} isPrivacy={isPrivacy} onDel={(id: string) => setMovements(p => p.filter(x => x.id !== id))} total={stats.expenses} />
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${T.card} p-6 md:p-8 rounded-[32px] border ${T.border} ${T.cardShadow}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 md:p-3 ${theme === 'light' ? 'bg-amber-50 text-amber-500' : 'bg-amber-900/30 text-amber-500'} rounded-xl md:rounded-2xl`}><Bug size={20} /></div>
                <div className={`font-black ${T.text} tracking-tight`}>Fugas Hormiga</div>
              </div>
              <button onClick={() => setShowAntForm(true)} className={`p-2 ${T.inputBg} ${T.subText} hover:text-amber-500 rounded-xl transition-all`}><Plus size={16} /></button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[150px] scrollbar-hide">
              {antExpenses.map(a => (
                <div key={a.id} className={`flex justify-between items-center p-3 ${T.inputBg} rounded-xl group`}>
                  <span className={`text-[11px] font-bold ${T.text}`}>{a.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-rose-500">{format(a.monthlyAmount * 12)}</span>
                    <button onClick={() => setAntExpenses(p => p.filter(x => x.id !== a.id))} className="md:opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className={`text-[8px] font-black ${T.subText} uppercase tracking-widest`}>Impacto Anual</span>
              <span className={`text-lg font-black text-rose-500`}>{format(stats.totalAnt)}</span>
            </div>
          </div>

          <div className={`${T.card} p-6 md:p-8 rounded-[32px] border ${T.border} ${T.cardShadow} flex flex-col justify-between`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 md:p-3.5 ${theme === 'light' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'bg-emerald-500/20 text-emerald-400'} rounded-xl md:rounded-[20px]`}>
                  <Target size={20} strokeWidth={2.5} />
                </div>
                <h3 className={`font-black ${T.text} tracking-tight text-sm md:text-base`}>{goal.name}</h3>
              </div>
              <button
                onClick={() => { setTempGoalName(goal.name); setTempGoalAmount(goal.amount.toString()); setShowGoalForm(true); }}
                className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-slate-700 text-slate-500'}`}
              >
                <Pencil size={14} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className={`text-2xl md:text-3xl font-black ${T.text} tracking-tighter tabular-nums`}>{stats.progress.toFixed(1)}%</p>
                <p className={`text-[10px] md:text-xs font-black text-indigo-500`}>{format(goal.amount)}</p>
              </div>
              <div className={`h-3 w-full ${theme === 'light' ? 'bg-slate-100 shadow-inner' : 'bg-slate-900/50'} rounded-full p-0.5`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/20 transition-all duration-1000 ease-out"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-[8px] font-black ${T.subText} uppercase tracking-widest text-[8px]`}>Faltan: {format(Math.max(0, goal.amount - stats.balance))}</span>
                <Gem size={12} className="text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${theme === 'light' ? 'from-indigo-600 to-indigo-800' : 'from-indigo-800 to-black'} p-6 md:p-8 rounded-[32px] text-white flex flex-col min-h-[220px] md:min-h-0 relative overflow-hidden group`}>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl"><Calendar size={20} /></div>
                  <div className="font-black tracking-tight">Pagos Próximos</div>
                </div>
                <button onClick={() => setShowPaymentForm(true)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Plus size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide max-h-[140px]">
                {sortedPayments.length > 0 ? sortedPayments.map(p => {
                  const days = getDaysUntil(p.dueDate);
                  const isUrgent = days <= 3;
                  return (
                    <div key={p.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl group/pay">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-xs tracking-tight truncate pr-2">{p.name}</p>
                        <p className={`text-[8px] ${isUrgent ? 'text-rose-400 font-black' : 'text-indigo-200'} uppercase tracking-widest`}>
                          {days === 0 ? 'Hoy' : days < 0 ? `Venció: ${Math.abs(days)}d` : `En ${days}d`}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className={`font-black text-xs ${isUrgent ? 'text-rose-400' : ''}`}>{isPrivacy ? '••••' : format(p.amount)}</span>
                        <button onClick={() => setPayments(prev => prev.filter(x => x.id !== p.id))} className="md:opacity-0 group-hover/pay:opacity-100 text-white/50 hover:text-white"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  );
                }) : <p className="text-[10px] text-indigo-300 font-bold text-center mt-4">Sin pendientes ⚡</p>}
              </div>
            </div>
            <Zap className="text-white/5 absolute -right-4 -bottom-4 pointer-events-none" size={80} fill="currentColor" />
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="mt-12 pt-8 border-t border-slate-200/5 text-center space-y-6">
          <div className="flex justify-center gap-4">
            <button onClick={handleExport} className={`flex items-center gap-2 px-6 py-3 rounded-xl border ${T.border} ${T.card} ${T.subText} font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all`}>
              <Download size={14} /> Exportar JSON
            </button>
            <button onClick={handleReset} className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white active:scale-95 transition-all`}>
              <Trash2 size={14} /> Limpiar Todo
            </button>
          </div>
          <p className={`text-[9px] leading-relaxed ${T.subText} font-medium opacity-60 px-6 max-w-2xl mx-auto italic`}>
            Control local: Tus datos se guardan estrictamente en este dispositivo.
          </p>
        </footer>

      </main>

      {/* Fix Floating Navigation Style Action for Thumb Access */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button
          onClick={() => setShowForm(true)}
          className="w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 active:rotate-90 transition-all ring-4 ring-white/10"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      {/* --- Modals - Adjusted for Mobile View --- */}
      {showForm && <Modal title="Registro Rápido" onClose={() => setShowForm(false)} theme={T}>
        <form onSubmit={handleAdd} className="space-y-4">
          <Input val={newConcept} set={setNewConcept} ph="Concepto (ej. Almuerzo)" theme={T} />
          <div className="grid grid-cols-2 gap-3">
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className={`w-full p-4 md:p-6 ${T.inputBg} ${T.text} rounded-2xl font-bold border-none outline-none shadow-inner`}>
              <option>Ingreso</option><option>Gasto</option>
            </select>
            <Input val={newAmount} set={setNewAmount} ph="0.00" type="number" theme={T} />
          </div>
          <Btn type="submit" label="Confirmar" color="emerald" />
        </form>
      </Modal>}

      {showAntForm && <Modal title="Fuga Hormiga 🐜" onClose={() => setShowAntForm(false)} theme={T}>
        <form onSubmit={e => {
          e.preventDefault();
          setAntExpenses(p => [...p, { id: Date.now().toString(), name: antName, monthlyAmount: parseFloat(antMonthly) }]);
          setAntName('');
          setAntMonthly('');
          setShowAntForm(false);
        }} className="space-y-4">
          <Input val={antName} set={setAntName} ph="Nombre (ej. Netflix)" theme={T} />
          <Input val={antMonthly} set={setAntMonthly} ph="Mensual ($)" type="number" theme={T} />
          <Btn type="submit" label="Registrar Impacto" color="amber" />
        </form>
      </Modal>}

      {showGoalForm && <Modal title="Ajustar Meta" onClose={() => setShowGoalForm(false)} theme={T}>
        <form onSubmit={e => { e.preventDefault(); setGoal({ name: tempGoalName, amount: parseFloat(tempGoalAmount) }); setShowGoalForm(false); }} className="space-y-4">
          <Input val={tempGoalName} set={setTempGoalName} ph="Nombre de meta" theme={T} />
          <Input val={tempGoalAmount} set={setTempGoalAmount} ph="Monto $" type="number" theme={T} />
          <Btn type="submit" label="Actualizar Meta" color="indigo" />
        </form>
      </Modal>}

      {showPaymentForm && <Modal title="Agendar Pago" onClose={() => setShowPaymentForm(false)} theme={T}>
        <form onSubmit={e => {
          e.preventDefault();
          setPayments(p => [...p, { id: Date.now().toString(), name: payName, amount: parseFloat(payAmount), dueDate: payDate }]);
          setPayName('');
          setPayAmount('');
          setPayDate('');
          setShowPaymentForm(false);
        }} className="space-y-4">
          <Input val={payName} set={setPayName} ph="Concepto del pago" theme={T} />
          <div className="grid grid-cols-2 gap-3">
            <Input val={payAmount} set={setPayAmount} ph="Monto $" type="number" theme={T} />
            <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className={`w-full p-4 md:p-6 ${T.inputBg} ${T.text} font-bold rounded-2xl border-none outline-none shadow-inner`} />
          </div>
          <Btn type="submit" label="Guardar Recordatorio" color="rose" />
        </form>
      </Modal>}

    </div>
  );
}

// --- Components ---

const ThemeBtn = ({ active, onClick, icon }: any) => (
  <button onClick={onClick} className={`p-3 md:p-2.5 rounded-2xl transition-all active:scale-95 ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
    {icon}
  </button>
);

const StatCard = ({ title, value, icon, color, isNeg, theme, format }: any) => {
  const c: any = { emerald: 'text-emerald-500 bg-emerald-500/10', coral: 'text-rose-500 bg-rose-500/10', indigo: 'text-indigo-500 bg-indigo-500/10', blue: 'text-blue-500 bg-blue-500/10' };
  return (
    <div className={`${theme.card} p-4 md:p-8 rounded-3xl md:rounded-[44px] shadow-sm border ${theme.border} hover:shadow-lg transition-all group`}>
      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${c[color]} flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <p className={`${theme.subText} font-black text-[8px] md:text-[10px] uppercase tracking-widest`}>{title}</p>
      <p className={`text-sm md:text-2xl font-black mt-1 tracking-tighter ${isNeg ? 'text-rose-500' : theme.text}`}>{format(value)}</p>
    </div>
  );
};

const Column = ({ title, data, color, icon, theme, format, isPrivacy, onDel, total }: any) => {
  const headColor = color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500';
  const amtColor = color === 'emerald' ? 'text-emerald-500' : 'text-rose-500';
  return (
    <div className={`${theme.card} rounded-[32px] md:rounded-[48px] border ${theme.border} ${theme.cardShadow} overflow-hidden flex flex-col h-[400px] md:h-[500px]`}>
      <div className={`p-6 md:p-8 border-b ${theme.border} flex justify-between items-center ${headColor.split(' ')[0]}`}>
        <div className="flex items-center gap-4">
          <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${headColor}`}>{icon}</div>
          <h2 className={`text-lg md:text-2xl font-black ${theme.text} tracking-tight`}>{title}</h2>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        <table className="w-full">
          <tbody className={`divide-y ${theme.border}`}>
            {data.map((m: any) => (
              <tr key={m.id} className="hover:opacity-70 transition-all group">
                <td className="px-6 md:px-8 py-4">
                  <p className={`font-black text-xs md:text-sm tracking-tight ${isPrivacy ? 'blur-sm' : theme.text}`}>{m.concept}</p>
                  <p className={`text-[8px] md:text-[9px] font-bold ${amtColor} uppercase tracking-widest mt-0.5`}>{m.category}</p>
                </td>
                <td className={`px-4 py-4 text-right font-black ${amtColor} text-sm md:text-lg`}>
                  {isPrivacy ? '••••' : (color === 'emerald' ? `+$${m.amount.toLocaleString()}` : `-$${Math.abs(m.amount).toLocaleString()}`)}
                </td>
                <td className="px-6 md:px-8 py-4 text-right w-10">
                  <button onClick={() => onDel(m.id)} className={`${theme.subText} hover:text-rose-500 transition-all`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className={`text-center py-10 ${theme.subText} text-[10px] font-bold uppercase tracking-widest`}>Sin movimientos</p>}
      </div>
      <div className={`p-6 md:p-8 ${theme.inputBg} border-t ${theme.border} flex justify-between items-center mt-auto`}>
        <span className={`text-[8px] md:text-[10px] font-black ${theme.subText} uppercase tracking-widest`}>Total {title}</span>
        <span className={`text-lg md:text-2xl font-black ${amtColor} tracking-tighter`}>{format(total)}</span>
      </div>
    </div>
  );
};

const Modal = ({ title, children, onClose, theme }: any) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in slide-in-from-bottom duration-300">
    <div className={`${theme.card} rounded-t-[32px] md:rounded-[48px] p-8 md:p-12 max-w-md w-full shadow-2xl relative overflow-hidden`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className={`text-2xl md:text-3xl font-black ${theme.text} tracking-tighter italic`}>{title}</h3>
        <button onClick={onClose} className={`${theme.inputBg} p-2 rounded-full ${theme.subText} hover:text-rose-500 transition-all active:scale-75`}><Plus size={24} className="rotate-45" /></button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ val, set, ph, type = "text", theme }: any) => (
  <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type} className={`w-full p-4 md:p-6 ${theme.inputBg} ${theme.text} rounded-2xl border-none font-bold outline-none shadow-inner focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base`} required />
);

const Btn = ({ label, color, onClick, type = "button" }: any) => {
  const c: any = { emerald: 'bg-emerald-500 shadow-emerald-500/20', indigo: 'bg-indigo-600 shadow-indigo-600/20', amber: 'bg-amber-500 shadow-amber-500/20', rose: 'bg-rose-500 shadow-rose-500/20' };
  return (
    <button type={type} onClick={onClick} className={`w-full ${c[color]} text-white p-4 md:p-6 rounded-2xl font-black text-base md:text-xl transition-all shadow-xl active:scale-95`}>{label}</button>
  );
};
