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
  Upload,
  RefreshCw,
  PieChart as PieChartIcon,
  ChevronRight,
  Sparkles,
  Info,
  ShieldAlert,
  Percent,
  CheckCircle2,
  TrendingDown,
  User,
  ArrowRight,
  Briefcase
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
  Pie,
  AreaChart,
  Area
} from 'recharts';
import * as XLSX from 'xlsx';
import initialData from './initial_data.json';

// --- Helper Functions ---
const getDaysUntil = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// --- Types ---
type ThemeMode = 'blue' | 'dark' | 'light';

interface Movement {
  id: string;
  concept: string;
  category: 'Ingreso' | 'Gasto Fijo' | 'Gasto Variable';
  amount: number;
  date: string;
}

interface SavingsGoal {
  name: string;
  amount: number;
  monthlyContribution: number;
}

interface SinkingFund {
  id: string;
  name: string;
  target: number;
  current: number;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  balance: number;
  monthlyContribution: number;
  yieldRate: number;
}

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
}

interface AntExpense {
  id: string;
  name: string;
  monthlyAmount: number;
}

interface UserProfile {
  name: string;
  profession: string;
  onboarded: boolean;
}

// --- LocalStorage Keys ---
const MOVEMENTS_KEY = 'mywealth_movements_v3';
const GOAL_KEY = 'mywealth_goal_v3';
const SINKING_KEY = 'mywealth_sinking_v3';
const DEBT_KEY = 'mywealth_debt_v3';
const PAYMENTS_KEY = 'mywealth_payments_v3';
const ANT_KEY = 'mywealth_ant_v3';
const PRIVACY_KEY = 'mywealth_privacy_v3';
const THEME_KEY = 'mywealth_theme_v3';
const PROFILE_KEY = 'mywealth_profile_v3';
const INVESTMENTS_KEY = 'mywealth_investments_v3';

// --- Premium Design Themes ---
const THEMES = {
  blue: {
    bg: 'bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] text-slate-100',
    card: 'bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 shadow-2xl shadow-blue-950/50',
    cardHeader: 'border-b border-blue-500/20 bg-blue-950/30',
    text: 'text-slate-100',
    titleText: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300',
    subText: 'text-blue-300/80',
    border: 'border-blue-500/10',
    inputBg: 'bg-blue-950/50 border border-blue-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400',
    accentText: 'text-cyan-400',
    chartLine: '#38BDF8',
    statsBg: 'bg-blue-950/40 border border-blue-500/10',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
  },
  dark: {
    bg: 'bg-gradient-to-br from-[#020617] via-[#090D1F] to-[#020617] text-slate-100',
    card: 'bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60',
    cardHeader: 'border-b border-emerald-500/20 bg-slate-950/40',
    text: 'text-slate-100',
    titleText: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400',
    subText: 'text-slate-400',
    border: 'border-slate-800',
    inputBg: 'bg-slate-950/70 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
    accentText: 'text-emerald-400',
    chartLine: '#10B981',
    statsBg: 'bg-slate-950/30 border border-slate-800',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  },
  light: {
    bg: 'bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] text-slate-900',
    card: 'bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl shadow-slate-100/70',
    cardHeader: 'border-b border-slate-100 bg-slate-50/50',
    text: 'text-slate-900',
    titleText: 'text-indigo-900 font-extrabold',
    subText: 'text-slate-500',
    border: 'border-slate-200',
    inputBg: 'bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600',
    accentText: 'text-indigo-600',
    chartLine: '#4F46E5',
    statsBg: 'bg-slate-50 border border-slate-150',
    badgeBg: 'bg-indigo-50 text-indigo-600 border border-indigo-150'
  }
};

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function DashboardFinanzas() {
  // --- Core States ---
  const [movements, setMovements] = useState<Movement[]>([]);
  const [goal, setGoal] = useState<SavingsGoal>({ name: '', amount: 0, monthlyContribution: 0 });
  const [sinkingFunds, setSinkingFunds] = useState<SinkingFund[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<UpcomingPayment[]>([]);
  const [antExpenses, setAntExpenses] = useState<AntExpense[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', profession: '', onboarded: false });
  const [isPrivacy, setIsPrivacy] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('blue');
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Onboarding Flow Control ---
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Onboarding Temporary Values
  const [onbName, setOnbName] = useState('');
  const [onbProfession, setOnbProfession] = useState('');
  const [onbIncome, setOnbIncome] = useState('');
  const [onbRent, setOnbRent] = useState('');
  const [onbServicesList, setOnbServicesList] = useState<{ name: string; amount: string }[]>([
    { name: 'Luz', amount: '' },
    { name: 'Internet / Wifi', amount: '' },
    { name: 'Parking', amount: '' }
  ]);
  const [onbFood, setOnbFood] = useState('');
  const [onbCardPayment, setOnbCardPayment] = useState('');
  const [onbLoanPayment, setOnbLoanPayment] = useState('');
  const [onbGoalName, setOnbGoalName] = useState('Fondo Libertad');
  const [onbGoalAmount, setOnbGoalAmount] = useState('');
  const [onbGoalMonthly, setOnbGoalMonthly] = useState('');
  const [onbInvName, setOnbInvName] = useState('');
  const [onbInvBalance, setOnbInvBalance] = useState('');
  const [onbInvMonthly, setOnbInvMonthly] = useState('');
  const [onbVarExpenses, setOnbVarExpenses] = useState('');
  const [onbAntExpensesVal, setOnbAntExpensesVal] = useState('');


  // --- UI Control States ---
  const [activeTab, setActiveTab] = useState<'budget' | 'adviser' | 'simulator'>('budget');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showSinkForm, setShowSinkForm] = useState(false);
  const [showInvForm, setShowInvForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [showAntForm, setShowAntForm] = useState(false);

  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementText, setStatementText] = useState('');
  const [statementParsedList, setStatementParsedList] = useState<{
    id: string;
    concept: string;
    category: 'Ingreso' | 'Gasto Fijo' | 'Gasto Variable';
    amount: number;
    date: string;
    selected: boolean;
  }[]>([]);
  const [isParsingStatement, setIsParsingStatement] = useState(false);

  // --- Form Input States ---

  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState<'Ingreso' | 'Gasto Fijo' | 'Gasto Variable'>('Gasto Fijo');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState('');

  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [editConcept, setEditConcept] = useState('');
  const [editCategory, setEditCategory] = useState<'Ingreso' | 'Gasto Fijo' | 'Gasto Variable'>('Gasto Fijo');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');


  const [tempGoalName, setTempGoalName] = useState('');
  const [tempGoalAmount, setTempGoalAmount] = useState('');
  const [tempGoalContribution, setTempGoalContribution] = useState('');

  const [sinkName, setSinkName] = useState('');
  const [sinkTarget, setSinkTarget] = useState('');
  const [sinkCurrent, setSinkCurrent] = useState('');

  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState('Renta Fija');
  const [invBalance, setInvBalance] = useState('');
  const [invContribution, setInvContribution] = useState('');
  const [invYield, setInvYield] = useState('');

  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtRate, setDebtRate] = useState('');
  const [debtMinPay, setDebtMinPay] = useState('');

  const [payName, setPayName] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState('');

  const [antName, setAntName] = useState('');
  const [antMonthly, setAntMonthly] = useState('');

  // --- Simulator States ---
  const [simRate, setSimRate] = useState(10);
  const [simYears, setSimYears] = useState(10);

  const T = THEMES[theme];

  // --- Load Initial Data / Persistence ---
  useEffect(() => {
    const getStored = (key: string, fallback: any) => {
      if (typeof window === 'undefined') return fallback;
      const data = localStorage.getItem(key);
      if (data === null) return fallback;
      try {
        return JSON.parse(data);
      } catch (err) {
        console.error("Error parsing storage", key, err);
        return fallback;
      }
    };

    const storedProfile = getStored(PROFILE_KEY, null);
    if (storedProfile && storedProfile.onboarded) {
      setProfile(storedProfile);
      setMovements(getStored(MOVEMENTS_KEY, []));
      setGoal(getStored(GOAL_KEY, initialData.goal));
      setSinkingFunds(getStored(SINKING_KEY, []));
      setInvestments(getStored(INVESTMENTS_KEY, []));
      setDebts(getStored(DEBT_KEY, []));
      setPayments(getStored(PAYMENTS_KEY, []));
      setAntExpenses(getStored(ANT_KEY, []));
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
      setGoal(initialData.goal);
      setSinkingFunds(initialData.sinkingFunds);
      setInvestments((initialData as any).investments || []);
      setDebts(initialData.debts);
      setPayments(initialData.payments);
      setAntExpenses(initialData.antExpenses);
    }

    setIsPrivacy(getStored(PRIVACY_KEY, false));
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setTheme(savedTheme as ThemeMode);

    setIsLoaded(true);
  }, []);

  // --- Load PDF.js dynamically ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!document.getElementById('pdf-js-script')) {
      const script = document.createElement('script');
      script.id = 'pdf-js-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        }
      };
      document.body.appendChild(script);
    }
  }, []);


  // --- Save Changes to Persistence ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
      localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
      localStorage.setItem(SINKING_KEY, JSON.stringify(sinkingFunds));
      localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
      localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
      localStorage.setItem(ANT_KEY, JSON.stringify(antExpenses));
      localStorage.setItem(PRIVACY_KEY, JSON.stringify(isPrivacy));
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  }, [movements, goal, sinkingFunds, investments, debts, payments, antExpenses, isPrivacy, theme, profile, isLoaded]);

  // --- Dynamic Financial Calculations (useMemo) ---
  const stats = useMemo(() => {
    let income = 0;
    let fixedExpenses = 0;
    let varExpenses = 0;

    movements.forEach(m => {
      if (m.amount > 0) {
        income += m.amount;
      } else {
        const absVal = Math.abs(m.amount);
        if (m.category === 'Gasto Fijo') {
          fixedExpenses += absVal;
        } else {
          varExpenses += absVal;
        }
      }
    });

    const totalExpenses = fixedExpenses + varExpenses;
    const balance = income - totalExpenses;

    // Savings rates and costs ratios
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    const fixedRatio = income > 0 ? (fixedExpenses / income) * 100 : 0;
    const varRatio = income > 0 ? (varExpenses / income) * 100 : 0;

    // Sinking funds
    const totalSinkingCurrent = sinkingFunds.reduce((sum, f) => sum + f.current, 0);
    const totalSinkingTarget = sinkingFunds.reduce((sum, f) => sum + f.target, 0);
    const sinkingProgress = totalSinkingTarget > 0 ? (totalSinkingCurrent / totalSinkingTarget) * 100 : 0;

    // Investments
    const totalInvestmentsBalance = investments.reduce((sum, inv) => sum + inv.balance, 0);
    const totalInvestmentsContribution = investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0);
    const investmentRate = income > 0 ? (totalInvestmentsContribution / income) * 100 : 0;

    // Debts
    const totalDebtBalance = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinDebtPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);

    // Ant Expenses
    const totalAntMonthly = antExpenses.reduce((sum, a) => sum + a.monthlyAmount, 0);
    const totalAntAnnual = totalAntMonthly * 12;
    const antRatio = income > 0 ? (totalAntAnnual / (income * 12)) * 100 : 0;

    // Goal time calculations
    const goalRemaining = Math.max(0, goal.amount - balance);
    const monthsToGoal = goal.monthlyContribution > 0 ? Math.ceil(goalRemaining / goal.monthlyContribution) : Infinity;
    const progressGoal = goal.amount > 0 ? Math.min((balance / goal.amount) * 100, 100) : 0;

    // Expense breakdowns by specific keywords (Category visualization)
    const breakdown: { [key: string]: number } = {};
    movements.filter(m => m.amount < 0).forEach(m => {
      const label = m.concept.split(' ')[0] || 'Varios';
      breakdown[label] = (breakdown[label] || 0) + Math.abs(m.amount);
    });
    const pieData = Object.entries(breakdown).map(([name, value]) => ({ name, value }));

    // Financial advisory expert grading logic
    let grade = 'C';
    let gradeColor = 'text-amber-500';
    if (income > 0) {
      const positiveSavingsAndInvestments = savingsRate + investmentRate;
      if (positiveSavingsAndInvestments >= 30 && fixedRatio <= 50) {
        grade = 'A+';
        gradeColor = 'text-emerald-500';
      } else if (positiveSavingsAndInvestments >= 20 && fixedRatio <= 55) {
        grade = 'A';
        gradeColor = 'text-emerald-400';
      } else if (positiveSavingsAndInvestments >= 10 && fixedRatio <= 65) {
        grade = 'B';
        gradeColor = 'text-indigo-400';
      } else if (positiveSavingsAndInvestments >= 0 && fixedRatio <= 75) {
        grade = 'C';
        gradeColor = 'text-amber-500';
      } else if (positiveSavingsAndInvestments < 0) {
        grade = 'F';
        gradeColor = 'text-rose-500';
      }
    }

    const totalOutflows = fixedExpenses + varExpenses + totalAntMonthly + goal.monthlyContribution + totalInvestmentsContribution;
    const freeCash = income - totalOutflows;

    const needsRatio = fixedRatio;
    const wantsRatio = income > 0 ? ((varExpenses + totalAntMonthly) / income) * 100 : 0;
    const savingsRatio = income > 0 ? ((goal.monthlyContribution + totalInvestmentsContribution) / income) * 100 : 0;

    return {
      income,
      fixedExpenses,
      varExpenses,
      totalExpenses,
      balance,
      savingsRate,
      fixedRatio,
      varRatio,
      totalSinkingCurrent,
      totalSinkingTarget,
      sinkingProgress,
      totalInvestmentsBalance,
      totalInvestmentsContribution,
      investmentRate,
      totalDebtBalance,
      totalMinDebtPayment,
      totalAntMonthly,
      totalAntAnnual,
      antRatio,
      goalRemaining,
      monthsToGoal,
      progressGoal,
      pieData,
      grade,
      gradeColor,
      totalOutflows,
      freeCash,
      needsRatio,
      wantsRatio,
      savingsRatio
    };
  }, [movements, goal, sinkingFunds, investments, debts, antExpenses]);


  // --- Chart Data Computations ---
  const chartData = useMemo(() => [
    { name: 'Ingresos', v: stats.income, c: '#10B981' },
    { name: 'Gastos Fijos', v: stats.fixedExpenses, c: '#EF4444' },
    { name: 'Gastos Variables', v: stats.varExpenses, c: '#F59E0B' }
  ], [stats]);

  // --- Projections logic (combining savings and direct investments) ---
  const projectionData = useMemo(() => {
    const list = [];
    const r = simRate / 100;
    const monthlyAport = (stats.balance > 0 ? stats.balance : 0) + stats.totalInvestmentsContribution;
    const initialCapital = stats.totalSinkingCurrent + stats.totalInvestmentsBalance;
    let totalInvested = initialCapital;
    let compoundBalance = initialCapital;

    for (let year = 0; year <= simYears; year++) {
      list.push({
        year: `Año ${year}`,
        Ahorrado: Math.round(totalInvested),
        Proyectado: Math.round(compoundBalance)
      });
      for (let month = 0; month < 12; month++) {
        compoundBalance = (compoundBalance + monthlyAport) * (1 + r / 12);
        totalInvested += monthlyAport;
      }
    }
    return list;
  }, [simRate, simYears, stats.totalSinkingCurrent, stats.totalInvestmentsBalance, stats.balance, stats.totalInvestmentsContribution]);

  // --- Formatting Helper ---
  const format = useCallback((v: number) => {
    if (isPrivacy) return '••••';
    return `$${Math.round(v).toLocaleString('es-MX')}`;
  }, [isPrivacy]);

  // --- Handlers ---
  const handleResetExcel = () => {
    if (confirm('¿Restablecer el dashboard con los datos del Excel, PDF e inversiones de ejemplo?')) {
      setProfile({
        name: 'Yamel',
        profession: 'Titular',
        onboarded: true
      });
      setMovements(initialData.movements as Movement[]);
      setGoal(initialData.goal);
      setSinkingFunds(initialData.sinkingFunds);
      setInvestments((initialData as any).investments || []);
      setDebts(initialData.debts);
      setPayments(initialData.payments);
      setAntExpenses(initialData.antExpenses);
      alert('Se han cargado con éxito los datos de la carpeta.');
    }
  };

  const handleClearAll = () => {
    if (confirm('¿Vaciar todo? Se eliminarán todos tus datos y se reiniciará el asistente de configuración.')) {
      localStorage.clear();
      setMovements([]);
      setGoal({ name: 'Fondo Libertad', amount: 10000, monthlyContribution: 200 });
      setSinkingFunds([]);
      setInvestments([]);
      setDebts([]);
      setPayments([]);
      setAntExpenses([]);
      setProfile({ name: '', profession: '', onboarded: false });
      setOnbName(''); setOnbProfession(''); setOnbIncome('');
      setOnbRent(''); setOnbFood('');
      setOnbCardPayment(''); setOnbLoanPayment('');
      setOnbServicesList([
        { name: 'Luz', amount: '' },
        { name: 'Internet / Wifi', amount: '' },
        { name: 'Parking', amount: '' }
      ]);
      setOnbGoalAmount(''); setOnbGoalMonthly('');
      setOnbInvName(''); setOnbInvBalance(''); setOnbInvMonthly('');
      setOnbVarExpenses(''); setOnbAntExpensesVal('');
      setOnboardingStep(1);
      setShowOnboarding(true);

    }
  };

  const handleExportJSON = () => {
    const backup = {
      movements,
      goal,
      sinkingFunds,
      investments,
      debts,
      payments,
      antExpenses,
      profile,
      theme
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mywealth_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (!text) return;
      try {
        const data = JSON.parse(text as string);
        if (data.profile) setProfile(data.profile);
        if (data.movements) setMovements(data.movements);
        if (data.goal) setGoal(data.goal);
        if (data.sinkingFunds) setSinkingFunds(data.sinkingFunds);
        if (data.investments) setInvestments(data.investments);
        if (data.debts) setDebts(data.debts);
        if (data.payments) setPayments(data.payments);
        if (data.antExpenses) setAntExpenses(data.antExpenses);
        if (data.theme) setTheme(data.theme);
        alert("¡Copia de seguridad (backup) cargada con éxito!");
      } catch (err) {
        alert("Error al importar el archivo JSON de copia de seguridad.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const parseStatementTextContent = (text: string) => {
    const lines = text.split('\n');
    const list: typeof statementParsedList = [];
    
    // Regular expressions for standard date formats:
    // e.g. 01/06/2026, 01-06-2026, 2026-06-01, 01 Jun 2026, 1 Jun
    const dateRegex = /(?:(\d{4})[/\-](\d{2})[/\-](\d{2})|(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})|(\d{1,2})\s+([a-zA-Z]{3,4})\s*(\d{2,4})?)/i;

    const monthsMap: { [key: string]: string } = {
      jan: '01', ene: '01', feb: '02', mar: '03', apr: '04', abr: '04',
      may: '05', jun: '06', jul: '07', aug: '08', ago: '08', sep: '09',
      oct: '10', nov: '11', dec: '12', dic: '12'
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Let's try to find a date
      const dateMatch = trimmed.match(dateRegex);
      if (!dateMatch) return;

      // Let's clean the line by removing the date to find description and amount
      let remaining = trimmed.replace(dateMatch[0], ' ');

      // Let's look for amounts in this line
      const matches = [...remaining.matchAll(/([+\-]?\s*\$?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g)];
      
      if (matches.length === 0) return;

      // Take the last amount match
      const lastMatch = matches[matches.length - 1];
      const amountStr = lastMatch[0];
      
      // Let's clean and parse amount
      let cleanAmtStr = amountStr.replace(/\s/g, '').replace(/\$/g, '').replace(/,/g, '');
      let amountVal = parseFloat(cleanAmtStr);

      if (isNaN(amountVal)) return;

      // Let's find description/concept (everything else)
      let concept = remaining.replace(amountStr, ' ').replace(/\s+/g, ' ').trim();
      if (!concept) concept = "Transacción Bancaria";

      // Let's reconstruct date
      let dateStr = new Date().toISOString().split('T')[0];
      if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
        // YYYY-MM-DD
        dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
      } else if (dateMatch[4] && dateMatch[5]) {
        // DD/MM/YYYY
        let day = dateMatch[4].padStart(2, '0');
        let month = dateMatch[5].padStart(2, '0');
        let year = dateMatch[6] || new Date().getFullYear().toString();
        if (year.length === 2) year = "20" + year;
        dateStr = `${year}-${month}-${day}`;
      } else if (dateMatch[7] && dateMatch[8]) {
        // DD MMM (e.g. 02 Jun)
        let day = dateMatch[7].padStart(2, '0');
        let mon = dateMatch[8].toLowerCase().substring(0, 3);
        let month = monthsMap[mon] || '01';
        let year = dateMatch[9] || new Date().getFullYear().toString();
        if (year.length === 2) year = "20" + year;
        dateStr = `${year}-${month}-${day}`;
      }

      list.push({
        id: `statement_parsed_${idx}_${Date.now()}`,
        concept,
        category: amountVal > 0 ? 'Ingreso' : 'Gasto Variable', // default category
        amount: amountVal,
        date: dateStr,
        selected: true
      });
    });

    setStatementParsedList(list);
  };

  const handlePDFUpload = (file: File) => {
    // @ts-ignore
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) {
      alert("La biblioteca PDF.js se está cargando, por favor intenta de nuevo en unos segundos.");
      return;
    }

    setIsParsingStatement(true);
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let textAccumulator = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" \n");
          textAccumulator += pageText + "\n";
        }
        
        setStatementText(textAccumulator);
        parseStatementTextContent(textAccumulator);
      } catch (err) {
        alert("Ocurrió un error leyendo el archivo PDF.");
        console.error(err);
      } finally {
        setIsParsingStatement(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmStatementImport = () => {
    const selectedItems = statementParsedList.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert("No has seleccionado ninguna transacción para importar.");
      return;
    }

    const newMovements: Movement[] = selectedItems.map(item => ({
      id: item.id,
      concept: item.concept,
      category: item.category,
      amount: item.amount,
      date: item.date
    }));

    setMovements(prev => [...newMovements, ...prev]);
    setShowStatementModal(false);
    setStatementText('');
    setStatementParsedList([]);
    alert(`¡Se importaron ${selectedItems.length} movimientos de manera exitosa!`);
  };



  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept || !newAmount) return;
    const amt = parseFloat(newAmount);
    const finalAmt = newCategory === 'Ingreso' ? Math.abs(amt) : -Math.abs(amt);
    const newItem: Movement = {
      id: Date.now().toString(),
      concept: newConcept,
      category: newCategory,
      amount: finalAmt,
      date: newDate || new Date().toISOString().split('T')[0]
    };
    setMovements(prev => [newItem, ...prev]);
    setNewConcept('');
    setNewAmount('');
    setShowAddForm(false);
  };

  useEffect(() => {
    if (editingMovement) {
      setEditConcept(editingMovement.concept);
      setEditCategory(editingMovement.category);
      setEditAmount(Math.abs(editingMovement.amount).toString());
      setEditDate(editingMovement.date);
    }
  }, [editingMovement]);

  const handleEditMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement || !editConcept || !editAmount) return;
    const amt = parseFloat(editAmount);
    const finalAmt = editCategory === 'Ingreso' ? Math.abs(amt) : -Math.abs(amt);
    setMovements(prev => prev.map(m => {
      if (m.id === editingMovement.id) {
        return {
          ...m,
          concept: editConcept,
          category: editCategory,
          amount: finalAmt,
          date: editDate || new Date().toISOString().split('T')[0]
        };
      }
      return m;
    }));
    setEditingMovement(null);
  };


  // --- Onboarding Completion Handler ---
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incomeVal = parseFloat(onbIncome) || 0;
    const rentVal = parseFloat(onbRent) || 0;
    const foodVal = parseFloat(onbFood) || 0;
    const cardVal = parseFloat(onbCardPayment) || 0;
    const loanVal = parseFloat(onbLoanPayment) || 0;
    const goalAmt = parseFloat(onbGoalAmount) || 10000;
    const goalMonthly = parseFloat(onbGoalMonthly) || 200;
    const invBal = parseFloat(onbInvBalance) || 0;
    const invMon = parseFloat(onbInvMonthly) || 0;
    const varExpensesVal = parseFloat(onbVarExpenses) || 0;
    const antExpensesVal = parseFloat(onbAntExpensesVal) || 0;

    const initialMovements: Movement[] = [];
    if (incomeVal > 0) {
      initialMovements.push({
        id: `onb_inc_${Date.now()}`,
        concept: `Ingreso por ${onbProfession || 'Sueldo'}`,
        category: 'Ingreso',
        amount: incomeVal,
        date: new Date().toISOString().split('T')[0]
      });
    }
    if (rentVal > 0) {
      initialMovements.push({
        id: `onb_rent_${Date.now()}`,
        concept: 'Alquiler / Hipoteca',
        category: 'Gasto Fijo',
        amount: -rentVal,
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    // Process services list
    onbServicesList.forEach((s, idx) => {
      const amt = parseFloat(s.amount) || 0;
      if (amt > 0) {
        initialMovements.push({
          id: `onb_serv_${idx}_${Date.now()}`,
          concept: s.name || `Servicio ${idx + 1}`,
          category: 'Gasto Fijo',
          amount: -amt,
          date: new Date().toISOString().split('T')[0]
        });
      }
    });

    if (foodVal > 0) {
      initialMovements.push({
        id: `onb_food_${Date.now()}`,
        concept: 'Alimentación / Comida',
        category: 'Gasto Fijo',
        amount: -foodVal,
        date: new Date().toISOString().split('T')[0]
      });
    }

    if (cardVal > 0) {
      initialMovements.push({
        id: `onb_card_${Date.now()}`,
        concept: 'Pago Tarjeta de Crédito',
        category: 'Gasto Fijo',
        amount: -cardVal,
        date: new Date().toISOString().split('T')[0]
      });
    }

    if (loanVal > 0) {
      initialMovements.push({
        id: `onb_loan_${Date.now()}`,
        concept: 'Pago de Préstamo / Crédito',
        category: 'Gasto Fijo',
        amount: -loanVal,
        date: new Date().toISOString().split('T')[0]
      });
    }

    if (varExpensesVal > 0) {
      initialMovements.push({
        id: `onb_var_${Date.now()}`,
        concept: 'Gastos Variables (Ocio/Salidas)',
        category: 'Gasto Variable',
        amount: -varExpensesVal,
        date: new Date().toISOString().split('T')[0]
      });
    }

    // Populate initial debts for card/loan payments
    const initialDebts: Debt[] = [];
    if (cardVal > 0) {
      initialDebts.push({
        id: `onb_debt_card_${Date.now()}`,
        name: 'Tarjeta de Crédito (Onboarding)',
        balance: cardVal * 10, // placeholder balance
        rate: 28.0, // placeholder rate
        minPayment: cardVal
      });
    }
    if (loanVal > 0) {
      initialDebts.push({
        id: `onb_debt_loan_${Date.now()}`,
        name: 'Préstamo (Onboarding)',
        balance: loanVal * 12, // placeholder balance
        rate: 14.5, // placeholder rate
        minPayment: loanVal
      });
    }
    setDebts(initialDebts);

    setMovements(initialMovements);
    setGoal({
      name: onbGoalName || 'Meta Libertad',
      amount: goalAmt,
      monthlyContribution: goalMonthly
    });

    // Populate initial investment if configured
    if (onbInvName) {
      setInvestments([
        {
          id: `onb_inv_${Date.now()}`,
          name: onbInvName,
          type: 'Renta Variable',
          balance: invBal,
          monthlyContribution: invMon,
          yieldRate: 10.0
        }
      ]);
    } else {
      setInvestments([]);
    }

    setSinkingFunds([
      { id: 'onb_sf_1', name: 'Fondo de Emergencias', target: rentVal * 3 || 3000, current: 0 }
    ]);

    if (antExpensesVal > 0) {
      setAntExpenses([
        { id: `onb_ant_custom_${Date.now()}`, name: 'Gastos Hormiga (Fugas)', monthlyAmount: antExpensesVal }
      ]);
    } else {
      setAntExpenses([
        { id: 'onb_ant_1', name: 'Cafés fuera de casa', monthlyAmount: 40 },
        { id: 'onb_ant_2', name: 'Suscripciones olvidadas', monthlyAmount: 25 }
      ]);
    }

    if (rentVal > 0) {
      setPayments([
        { id: 'onb_pay_1', name: 'Alquiler Mensual', amount: rentVal, dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] }
      ]);
    }

    setProfile({
      name: onbName || 'Yamel',
      profession: onbProfession || 'Emprendedor',
      onboarded: true
    });


    setShowOnboarding(false);
    alert(`¡Bienvenido, ${onbName || 'Yamel'}! Configuración finalizada.`);
  };

  // --- Drag & Drop / File Upload Excel Parser ---
  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheets = workbook.SheetNames;
        
        if (sheets.includes('VARIABLE') || sheets.includes('RECURRING') || sheets.includes('BANK ACCOUNTS')) {
          parseUltimateBudget(workbook);
        } else if (sheets.includes('Sheet1')) {
          parseSimpleBudget(workbook);
        } else {
          parseGeneralExcel(workbook);
        }
      } catch (err) {
        alert('Ocurrió un error leyendo el archivo Excel.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseUltimateBudget = (wb: XLSX.WorkBook) => {
    let importedCount = 0;
    const newItems: Movement[] = [];

    const varSheet = wb.Sheets['VARIABLE'];
    if (varSheet) {
      const rows = XLSX.utils.sheet_to_json(varSheet, { header: 1 }) as any[][];
      if (rows.length > 5) {
        const headers = rows[5].map(h => String(h || '').trim().toUpperCase());
        const amtIdx = headers.findIndex(h => h.includes('AMOUNT'));
        const catIdx = headers.findIndex(h => h.includes('CATEGORY'));
        const subCatIdx = headers.findIndex(h => h.includes('SUB-CATEGORY') || h.includes('SUB_CATEGORY') || h.includes('SUB CATEGORY'));
        const dateIdx = headers.findIndex(h => h.includes('DATE'));

        for (let i = 6; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          const amt = parseFloat(row[amtIdx]);
          if (amt && !isNaN(amt) && amt !== 0) {
            const isInc = row[catIdx]?.toString().toLowerCase().includes('income') || row[catIdx]?.toString().toLowerCase().includes('ingreso') || amt > 0;
            const catType = isInc ? 'Ingreso' : 'Gasto Variable';
            const concept = row[subCatIdx]?.toString() || (isInc ? 'Ingreso XLSB' : 'Gasto XLSB');
            let dateStr = new Date().toISOString().split('T')[0];
            if (row[dateIdx]) {
              const dVal = row[dateIdx];
              if (typeof dVal === 'number') {
                dateStr = new Date((dVal - 25569) * 86400 * 1000).toISOString().split('T')[0];
              } else {
                dateStr = String(dVal);
              }
            }
            newItems.push({
              id: `xlsb_var_${i}_${Date.now()}`,
              concept,
              category: catType,
              amount: isInc ? Math.abs(amt) : -Math.abs(amt),
              date: dateStr
            });
            importedCount++;
          }
        }
      }
    }

    // Try parsing INVESTMENT tab from Ultimate Budget sheet if it exists
    const invSheet = wb.Sheets['INVESTMENT'];
    const newInvs: Investment[] = [];
    if (invSheet) {
      const rows = XLSX.utils.sheet_to_json(invSheet, { header: 1 }) as any[][];
      // Looks for rows with balances and names starting from row 10
      rows.forEach((row, idx) => {
        if (idx > 8 && row && row[1] && typeof row[4] === 'number' && row[4] > 0) {
          newInvs.push({
            id: `xlsb_inv_${idx}_${Date.now()}`,
            name: row[1].toString(),
            type: 'Inversión Externa',
            balance: row[4],
            monthlyContribution: parseFloat(row[8]) || 0,
            yieldRate: parseFloat(row[10]) || 8.0
          });
        }
      });
    }

    if (newItems.length > 0) {
      setMovements(prev => [...newItems, ...prev]);
      if (newInvs.length > 0) setInvestments(newInvs);
      setProfile(prev => ({ ...prev, onboarded: true }));
      alert(`¡Carga exitosa! Se importaron ${importedCount} movimientos y ${newInvs.length} inversiones.`);
    } else {
      alert('No se encontraron transacciones activas.');
    }
  };

  const parseSimpleBudget = (wb: XLSX.WorkBook) => {
    const sheet = wb.Sheets['Sheet1'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const newItems: Movement[] = [];
    let count = 0;

    rows.forEach((row, idx) => {
      if (!row || row.length < 2) return;
      const concept = String(row[0] || '').trim();
      const amountVal = parseFloat(row[1]);

      if (concept && amountVal && !isNaN(amountVal)) {
        let category: 'Ingreso' | 'Gasto Fijo' | 'Gasto Variable' = 'Gasto Fijo';
        if (concept.toLowerCase().includes('ingreso') || concept.toLowerCase().includes('salario')) {
          category = 'Ingreso';
        } else if (concept.toLowerCase().includes('variable') || concept.toLowerCase().includes('ocio')) {
          category = 'Gasto Variable';
        }

        newItems.push({
          id: `simple_${idx}_${Date.now()}`,
          concept,
          category,
          amount: category === 'Ingreso' ? Math.abs(amountVal) : -Math.abs(amountVal),
          date: new Date().toISOString().split('T')[0]
        });
        count++;
      }
    });

    if (newItems.length > 0) {
      setMovements(prev => [...newItems, ...prev]);
      setProfile(prev => ({ ...prev, onboarded: true }));
      alert(`¡Carga exitosa! Se importaron ${count} movimientos desde la Tabla de Finanzas.`);
    }
  };

  const parseGeneralExcel = (wb: XLSX.WorkBook) => {
    const firstSheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const newItems: Movement[] = [];
    let count = 0;

    rows.forEach((row, idx) => {
      if (!row || row.length < 2) return;
      const label = row.find(c => typeof c === 'string');
      const val = row.find(c => typeof c === 'number');

      if (label && val && val !== 0) {
        const cat = val > 0 ? 'Ingreso' : 'Gasto Fijo';
        newItems.push({
          id: `gen_${idx}_${Date.now()}`,
          concept: String(label),
          category: cat,
          amount: val,
          date: new Date().toISOString().split('T')[0]
        });
        count++;
      }
    });

    if (newItems.length > 0) {
      setMovements(prev => [...newItems, ...prev]);
      setProfile(prev => ({ ...prev, onboarded: true }));
      alert(`Se importó la pestaña "${firstSheetName}" con ${count} movimientos.`);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen ${T.bg} transition-colors duration-500 font-sans pb-24`}>
      
      {/* ==================== WELCOME ONBOARDING FLOW OVERLAY ==================== */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900/90 border border-blue-500/20 max-w-xl w-full p-8 md:p-12 rounded-[44px] shadow-2xl relative space-y-8 animate-in fade-in zoom-in duration-300">
            
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg">
                <Gem size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300 tracking-tighter uppercase">
                Personaliza tu Plan
              </h2>
              <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto">
                Diseñemos tu punto de partida financiero. Rellena las preguntas clave a continuación para calibrar tus ratios de ahorro, metas e inversiones.
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex justify-between items-center px-4">
              <OnbStep num={1} title="Identidad" active={onboardingStep >= 1} />
              <div className={`flex-1 h-0.5 mx-2 ${onboardingStep >= 2 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
              <OnbStep num={2} title="Ingresos" active={onboardingStep >= 2} />
              <div className={`flex-1 h-0.5 mx-2 ${onboardingStep >= 3 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
              <OnbStep num={3} title="Egresos" active={onboardingStep >= 3} />
              <div className={`flex-1 h-0.5 mx-2 ${onboardingStep >= 4 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
              <OnbStep num={4} title="Meta e Inv." active={onboardingStep >= 4} />
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              
              {/* STEP 1: IDENTITY */}
              {onboardingStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-250">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">¿Cómo te llamas?</label>
                    <input
                      type="text"
                      placeholder="Tu nombre (ej. Yamel)"
                      value={onbName}
                      onChange={e => setOnbName(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">¿A qué te dedicas profesionalmente?</label>
                    <input
                      type="text"
                      placeholder="Tu profesión (ej. Diseñador, Desarrollador, Inversionista)"
                      value={onbProfession}
                      onChange={e => setOnbProfession(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold"
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: INCOME */}
              {onboardingStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-250">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">¿Cuánto ganas mensualmente (Sueldo principal)?</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="number"
                        placeholder="Monto de ingreso principal (ej. 2600)"
                        value={onbIncome}
                        onChange={e => setOnbIncome(e.target.value)}
                        className="w-full p-4 pl-12 rounded-2xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: OUTGOINGS */}
              {onboardingStep === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-250 max-h-[380px] overflow-y-auto pr-1 scrollbar-hide">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Ingresa tus egresos estimados (Fijos, Variables y Hormiga):</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Vivienda (Renta / Hipoteca)</label>
                      <input
                        type="number"
                        placeholder="Alquiler (ej. 800)"
                        value={onbRent}
                        onChange={e => setOnbRent(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Comida / Despensa</label>
                      <input
                        type="number"
                        placeholder="Mensual (ej. 300)"
                        value={onbFood}
                        onChange={e => setOnbFood(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Tarjeta de Crédito (Pago Mensual)</label>
                      <input
                        type="number"
                        placeholder="Monto de pago (ej. 200)"
                        value={onbCardPayment}
                        onChange={e => setOnbCardPayment(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Préstamos / Deudas (Pago Mensual)</label>
                      <input
                        type="number"
                        placeholder="Monto de pago (ej. 150)"
                        value={onbLoanPayment}
                        onChange={e => setOnbLoanPayment(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Gastos Variables (Salidas, Ocio, Compras)</label>
                      <input
                        type="number"
                        placeholder="Monto mensual (ej. 300)"
                        value={onbVarExpenses}
                        onChange={e => setOnbVarExpenses(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Gastos Hormiga (Cafés, Netflix, Fugas)</label>
                      <input
                        type="number"
                        placeholder="Monto mensual (ej. 80)"
                        value={onbAntExpensesVal}
                        onChange={e => setOnbAntExpensesVal(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                    </div>
                  </div>


                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Servicios Individuales</label>
                      <button
                        type="button"
                        onClick={() => setOnbServicesList(prev => [...prev, { name: '', amount: '' }])}
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <Plus size={12} /> Añadir Servicio
                      </button>
                    </div>

                    <div className="space-y-2">
                      {onbServicesList.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Nombre (ej. Luz, Parking, Wifi)"
                            value={item.name}
                            onChange={e => {
                              const newList = [...onbServicesList];
                              newList[idx].name = e.target.value;
                              setOnbServicesList(newList);
                            }}
                            className="flex-1 p-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                          />
                          <div className="relative w-32">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                            <input
                              type="number"
                              placeholder="Monto"
                              value={item.amount}
                              onChange={e => {
                                const newList = [...onbServicesList];
                                newList[idx].amount = e.target.value;
                                setOnbServicesList(newList);
                              }}
                              className="w-full p-3 pl-7 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                            />
                          </div>
                          {onbServicesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setOnbServicesList(prev => prev.filter((_, i) => i !== idx))}
                              className="p-3 text-slate-500 hover:text-rose-500 transition-colors bg-slate-950/30 rounded-xl border border-slate-800 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: GOALS & INVESTMENTS */}
              {onboardingStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-250 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                  <div className="space-y-3 border-b border-slate-850 pb-4">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider">Meta de Libertad Financiera</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Capital Meta ($)</label>
                        <input
                          type="number"
                          placeholder="Monto total (ej. 15000)"
                          value={onbGoalAmount}
                          onChange={e => setOnbGoalAmount(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Aporte de Ahorro Mensual ($)</label>
                        <input
                          type="number"
                          placeholder="Mensual (ej. 500)"
                          value={onbGoalMonthly}
                          onChange={e => setOnbGoalMonthly(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">¿Tienes alguna Inversión Activa? (Opcional)</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nombre de la inversión (ej. CETES Directo, S&P 500)"
                        value={onbInvName}
                        onChange={e => setOnbInvName(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Saldo actual invertido ($)</label>
                          <input
                            type="number"
                            placeholder="Monto (ej. 1500)"
                            value={onbInvBalance}
                            onChange={e => setOnbInvBalance(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black tracking-wider text-slate-500">Aporte mensual regular ($)</label>
                          <input
                            type="number"
                            placeholder="Mensual (ej. 200)"
                            value={onbInvMonthly}
                            onChange={e => setOnbInvMonthly(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 outline-none text-slate-100 font-bold text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="flex justify-between items-center gap-4 pt-2">
                {onboardingStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(p => p - 1)}
                    className="px-6 py-4 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-extrabold text-sm uppercase tracking-wider transition-all"
                  >
                    Atrás
                  </button>
                ) : (
                  <div></div>
                )}

                {onboardingStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onboardingStep === 1 && (!onbName || !onbProfession)) return alert('Por favor, rellena tu perfil.');
                      if (onboardingStep === 2 && !onbIncome) return alert('Por favor, indica tus ingresos.');
                      setOnboardingStep(p => p + 1);
                    }}
                    className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-lg"
                  >
                    Siguiente
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all shadow-lg"
                  >
                    Finalizar Configuración
                  </button>
                )}
              </div>
            </form>

            {/* Skip Option / Load template */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setProfile({ name: 'Yamel', profession: 'Titular', onboarded: true });
                  setMovements(initialData.movements as Movement[]);
                  setGoal(initialData.goal);
                  setSinkingFunds(initialData.sinkingFunds);
                  setInvestments((initialData as any).investments || []);
                  setDebts(initialData.debts);
                  setPayments(initialData.payments);
                  setAntExpenses(initialData.antExpenses);
                  setShowOnboarding(false);
                }}
                className="text-[10px] text-slate-500 hover:text-emerald-400 font-extrabold uppercase tracking-widest transition-all"
              >
                Omitir y cargar valores del Excel de la carpeta 📂
              </button>
            </div>

          </div>
        </div>
      )}

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700">
        
        {/* --- Top Bar & Executive Controls --- */}
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 md:w-16 md:h-16 ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-slate-950'} rounded-3xl shadow-lg flex items-center justify-center transition-transform active:scale-95`}>
              <Gem size={28} className="animate-pulse" />
            </div>
            <div>
              <h1 className={`text-2xl md:text-4xl font-black ${T.titleText} tracking-tighter uppercase`}>MyWealth Pro</h1>
              <p className={`${T.subText} text-[9px] md:text-[10px] font-black tracking-[0.35em] uppercase`}>
                Intel Financial Advisor System
              </p>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Run Onboarding Welcome Screen again */}
            <button
              onClick={() => {
                setOnboardingStep(1);
                setShowOnboarding(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${T.card} ${T.subText} border ${T.border} hover:text-indigo-400 transition-all`}
              title="Personalizar tu perfil e ingresos nuevamente"
            >
              <User size={12} />
              Configurar Asistente
            </button>

            {/* Excel Uploader Input */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-md">
              <Upload size={14} strokeWidth={2.5} />
              Cargar Excel
              <input
                type="file"
                accept=".xlsx,.xlsb,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleExcelFile(f);
                }}
              />
            </label>

            {/* Bank Statement Importer Button */}
            <button
              onClick={() => {
                setStatementText('');
                setStatementParsedList([]);
                setShowStatementModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-95 transition-all shadow-md"
              title="Cargar PDF de estado de cuenta para extraer y clasificar transacciones"
            >
              <Calculator size={14} strokeWidth={2.5} />
              Importar Estado de Cuenta
            </button>


            {/* Sync default from folder */}
            <button
              onClick={handleResetExcel}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider ${T.card} ${T.subText} border ${T.border} hover:text-emerald-400 hover:border-emerald-500/30 transition-all`}
              title="Cargar los datos preestablecidos del Excel guardado en la carpeta"
            >
              <RefreshCw size={14} />
              Restaurar Carpeta
            </button>

            {/* Privacy Mode */}
            <button
              onClick={() => setIsPrivacy(!isPrivacy)}
              className={`p-3 rounded-2xl transition-all ${isPrivacy ? 'bg-indigo-600 text-white' : `${T.card} ${T.subText} border ${T.border} hover:text-indigo-400`}`}
              title="Ocultar importes numéricos sensibles"
            >
              {isPrivacy ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {/* Theme Selectors */}
            <div className={`flex items-center gap-1 p-1 ${T.card} rounded-2xl border ${T.border}`}>
              <button
                onClick={() => setTheme('blue')}
                className={`p-2 rounded-xl transition-all ${theme === 'blue' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-400 hover:bg-blue-900/10'}`}
              >
                <Palette size={14} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-emerald-600 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Moon size={14} />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Sun size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* --- Profile Personalization Welcome Banner --- */}
        {profile.name && (
          <div className={`${T.card} p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border ${T.border}`}>
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2 bg-blue-500/15 text-blue-400 rounded-2xl hidden sm:block"><Briefcase size={20} /></div>
              <div>
                <h2 className={`font-black text-sm md:text-base ${T.text} tracking-tight`}>
                  Plan Financiero Personalizado de {profile.name}
                </h2>
                <p className={`${T.subText} text-[9px] uppercase tracking-wider font-extrabold`}>
                  Profesión: <strong className={`${T.accentText}`}>{profile.profession}</strong> • Configuración en local activa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase ${T.badgeBg} px-3 py-1 rounded-full`}>
                Perfil Cargado
              </span>
            </div>
          </div>
        )}

        {/* --- Navigation Tabs --- */}
        <div className="flex border-b border-slate-700/20 gap-1 overflow-x-auto pb-1 scrollbar-hide">
          <TabBtn active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={<BarChart3 size={16} />} label="Presupuesto" theme={theme} />
          <TabBtn active={activeTab === 'adviser'} onClick={() => setActiveTab('adviser')} icon={<Sparkles size={16} />} label="Asesor de Salud Financiera" theme={theme} />
          <TabBtn active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} icon={<Calculator size={16} />} label="Simuladores de Riqueza" theme={theme} />
        </div>

        {/* ==================== TAB 1: BUDGET & ACCOUNTS ==================== */}
        {activeTab === 'budget' && (
          <div className="space-y-6 md:space-y-8">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <KPIBadge title="Ingresos Totales" value={stats.income} color="emerald" format={format} theme={T} />
              <KPIBadge title="Gastos Fijos" value={stats.fixedExpenses} color="rose" format={format} theme={T} />
              <KPIBadge title="Gastos Variables" value={stats.varExpenses} color="amber" format={format} theme={T} />
              <KPIBadge title="Inversión Mensual" value={stats.totalInvestmentsContribution} color="blue" format={format} theme={T} />
              <KPIBadge
                title="Tasa de Inversión"
                value={`${stats.investmentRate.toFixed(1)}%`}
                color={stats.investmentRate >= 10 ? 'emerald' : stats.investmentRate >= 5 ? 'blue' : 'rose'}
                isString
                theme={T}
              />
            </div>

            {/* Quick Actions & File Notifications */}
            {movements.length === 0 && (
              <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-4 animate-bounce">
                <ShieldAlert size={24} />
                <div className="text-xs font-bold">
                  El panel está vacío. Sube tu archivo Excel o presiona <button onClick={handleResetExcel} className="underline text-emerald-400 font-extrabold">Restaurar Carpeta</button> para precargar tu plan financiero.
                </div>
              </div>
            )}

            {/* Cash Flow and 50/30/20 Allocator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Card 1: Dinero Libre / Cash Flow Conciliator */}
              <div className={`${T.card} p-6 rounded-[32px] lg:col-span-6 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <h3 className={`font-black ${T.text} text-sm tracking-tight`}>Dinero Libre / Remanente</h3>
                      <p className={`${T.subText} text-[9px] uppercase tracking-wider font-bold`}>Conciliación de Ingresos y Asignaciones</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/10">
                      <span className="text-slate-400 font-semibold">(+) Ingresos Mensuales</span>
                      <span className="font-bold text-emerald-400">{format(stats.income)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/10">
                      <span className="text-slate-400 font-semibold">(-) Gastos Fijos (Servicios, Vivienda, Comida)</span>
                      <span className="font-bold text-rose-400">{format(stats.fixedExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/10">
                      <span className="text-slate-400 font-semibold">(-) Gastos Variables (Ocio, Compras)</span>
                      <span className="font-bold text-amber-500">{format(stats.varExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/10">
                      <span className="text-slate-400 font-semibold">(-) Fugas Hormiga</span>
                      <span className="font-bold text-amber-600">{format(stats.totalAntMonthly)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/10">
                      <span className="text-slate-400 font-semibold">(-) Ahorro Mensual Comprometido</span>
                      <span className="font-bold text-indigo-400">{format(goal.monthlyContribution)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/10">
                      <span className="text-slate-400 font-semibold">(-) Inversión Mensual Regular</span>
                      <span className="font-bold text-blue-400">{format(stats.totalInvestmentsContribution)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/15">
                  <div className={`p-4 rounded-2xl flex flex-col justify-between items-center gap-2 text-center sm:text-left sm:flex-row ${stats.freeCash >= 0 ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'}`}>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Dinero Libre Disponible</span>
                      <p className={`text-2xl font-black tracking-tighter ${stats.freeCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {format(stats.freeCash)}
                      </p>
                    </div>
                    <p className={`text-[10px] max-w-[220px] font-semibold leading-normal ${stats.freeCash >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {stats.freeCash >= 0 
                        ? '¡Excelente! Tienes capital libre para gastar sin culpa o acelerar tus inversiones.'
                        : '⚠️ Tu presupuesto está sobregirado. Debes recortar gastos discrecionales o ajustar tus metas.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Guía de Presupuesto 50/30/20 */}
              <div className={`${T.card} p-6 rounded-[32px] lg:col-span-6 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <Percent size={16} />
                      </div>
                      <div>
                        <h3 className={`font-black ${T.text} text-sm tracking-tight`}>Distribución 50/30/20</h3>
                        <p className={`${T.subText} text-[9px] uppercase tracking-wider font-bold`}>Salud de Ahorro y Ratios Ideales</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-indigo-500/15 text-indigo-400 font-black px-2 py-0.5 rounded-full uppercase border border-indigo-500/20">
                      Regla Estándar
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Needs Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold">
                        <span className={T.text}>Necesidades (Fijos)</span>
                        <span className="text-slate-400">{stats.needsRatio.toFixed(1)}% <span className="text-[10px] text-slate-500">de 50% max</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/40 rounded-full overflow-hidden p-[1px] border border-slate-700/10">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${stats.needsRatio <= 50 ? 'bg-emerald-500' : stats.needsRatio <= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(stats.needsRatio, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Wants Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold">
                        <span className={T.text}>Deseos (Variables + Hormiga)</span>
                        <span className="text-slate-400">{stats.wantsRatio.toFixed(1)}% <span className="text-[10px] text-slate-500">de 30% max</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/40 rounded-full overflow-hidden p-[1px] border border-slate-700/10">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${stats.wantsRatio <= 30 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(stats.wantsRatio, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Savings Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold">
                        <span className={T.text}>Ahorro e Inversión (Metas + Activos)</span>
                        <span className="text-slate-400">{stats.savingsRatio.toFixed(1)}% <span className="text-[10px] text-slate-500">de 20% min</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/40 rounded-full overflow-hidden p-[1px] border border-slate-700/10">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${stats.savingsRatio >= 20 ? 'bg-emerald-500' : stats.savingsRatio >= 10 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(stats.savingsRatio, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/15 text-[11px] leading-relaxed">
                  <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-3 text-indigo-300">
                    <Info size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-indigo-200 block mb-0.5">Asesoría de Ahorro:</span>
                      {stats.savingsRatio >= 20
                        ? `¡Excelente! Destinas el ${stats.savingsRatio.toFixed(1)}% a tu futuro, superando la meta de ahorro saludable (20%). Mantén este ritmo.`
                        : stats.savingsRatio >= 10
                        ? `Buen esfuerzo. Destinas el ${stats.savingsRatio.toFixed(1)}% al ahorro/inversión. Estás cerca del 20% ideal; recortar pequeñas fugas hormiga te ayudará a alcanzarlo.`
                        : `Tu tasa de ahorro del ${stats.savingsRatio.toFixed(1)}% está por debajo del 20% ideal. Considera revisar tus deseos o evaluar reducir tus costos fijos.`}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Visual Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Income vs Expenses Bar Chart */}
              <div className={`${T.card} p-6 rounded-[32px] lg:col-span-7 flex flex-col h-[350px]`}>
                <h3 className={`text-base font-black ${T.text} mb-4 tracking-tight`}>Estructura del Presupuesto Mensual</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme === 'light' ? '#334155' : '#CBD5E1', fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 9 }}
                        hide={isPrivacy}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: theme === 'light' ? '#FFF' : '#0F172A',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                          fontWeight: 'bold',
                          color: theme === 'light' ? '#0F172A' : '#FFF'
                        }}
                        formatter={(val: any) => format(Number(val || 0))}
                      />
                      <Bar dataKey="v" radius={[10, 10, 0, 0]} barSize={45}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.c} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Distribution Pie Chart */}
              <div className={`${T.card} p-6 rounded-[32px] lg:col-span-5 flex flex-col h-[350px]`}>
                <h3 className={`text-base font-black ${T.text} mb-4 tracking-tight`}>Desglose por Rubros</h3>
                <div className="flex-1 min-h-0 relative">
                  {stats.pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'light' ? '#FFF' : '#0F172A',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 'bold'
                          }}
                          formatter={(val: any) => format(Number(val || 0))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-bold text-slate-500">
                      Sin datos de gastos
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-h-[80px] overflow-y-auto scrollbar-hide">
                  {stats.pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 px-2 py-1 bg-slate-800/20 dark:bg-black/20 rounded-lg border border-slate-700/10">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Income & Expenses Detail Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incomes Column */}
              <BudgetColumn
                title="Ingresos"
                data={movements.filter(m => m.amount > 0)}
                color="emerald"
                total={stats.income}
                onDelete={(id: string) => setMovements(p => p.filter(m => m.id !== id))}
                onEdit={(item: any) => setEditingMovement(item)}
                format={format}
                isPrivacy={isPrivacy}
                theme={T}
                onAddClick={() => { setNewCategory('Ingreso'); setShowAddForm(true); }}
              />

              {/* Expenses Column */}
              <BudgetColumn
                title="Gastos (Fijos + Variables)"
                data={movements.filter(m => m.amount < 0)}
                color="rose"
                total={stats.totalExpenses}
                onDelete={(id: string) => setMovements(p => p.filter(m => m.id !== id))}
                onEdit={(item: any) => setEditingMovement(item)}
                format={format}
                isPrivacy={isPrivacy}
                theme={T}
                onAddClick={() => { setNewCategory('Gasto Fijo'); setShowAddForm(true); }}
              />

            </div>

            {/* Investments Section (NEW FEATURE) */}
            <div className={`${T.card} p-6 rounded-[36px]`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl"><TrendingUp size={20} /></div>
                  <div>
                    <h3 className={`font-black text-base md:text-lg ${T.text} tracking-tight`}>Inversiones Activas</h3>
                    <p className={`${T.subText} text-[9px] uppercase tracking-wider font-bold`}>Patrimonio en crecimiento continuo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 transition-all"
                >
                  <Plus size={14} /> Nueva Inversión
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/20 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                      <th className="pb-3 pr-4">Activo / Instrumento</th>
                      <th className="pb-3 pr-4">Categoría</th>
                      <th className="pb-3 pr-4 text-right">Rendimiento (Anual)</th>
                      <th className="pb-3 pr-4 text-right">Aporte Mensual</th>
                      <th className="pb-3 text-right">Saldo de Inversión</th>
                      <th className="pb-3 text-right w-12">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10">
                    {investments.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-850/5 transition-colors group">
                        <td className={`py-4 pr-4 font-black ${T.text}`}>{inv.name}</td>
                        <td className="py-4 pr-4 text-slate-400 font-semibold">{inv.type}</td>
                        <td className="py-4 pr-4 text-right text-emerald-400 font-bold">{inv.yieldRate}%</td>
                        <td className="py-4 pr-4 text-right text-blue-400 font-bold">{format(inv.monthlyContribution)}</td>
                        <td className={`py-4 text-right font-black ${T.text}`}>{format(inv.balance)}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => setInvestments(p => p.filter(x => x.id !== inv.id))}
                            className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {investments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                          No tienes inversiones registradas. Comienza a registrar tu capital activo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total row */}
              <div className="mt-4 pt-4 border-t border-slate-700/20 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-6">
                  <div className="text-xs">
                    <span className="text-slate-400">Total Portafolio:</span>
                    <strong className={`ml-2 font-black ${T.text}`}>{format(stats.totalInvestmentsBalance)}</strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Aportes Inversión Mensuales:</span>
                    <strong className="ml-2 text-blue-400 font-black">{format(stats.totalInvestmentsContribution)}</strong>
                  </div>
                </div>
                <div className="text-xs flex items-center gap-1 text-emerald-400 font-semibold">
                  <Sparkles size={14} />
                  Tu capital invertido genera rendimientos compuestos automáticamente.
                </div>
              </div>
            </div>

            {/* Sinking Funds, Upcoming Payments, and Ant Expenses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Sinking Funds (Metas Especiales) */}
              <div className={`${T.card} p-6 rounded-[32px] flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><Target size={16} /></div>
                      <span className={`font-black ${T.text} text-sm tracking-tight`}>Fondos de Ahorro</span>
                    </div>
                    <button onClick={() => setShowSinkForm(true)} className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"><Plus size={14} /></button>
                  </div>
                  
                  <div className="space-y-3 max-h-[180px] overflow-y-auto scrollbar-hide pr-1">
                    {sinkingFunds.map(fund => (
                      <div key={fund.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-black ${T.text}`}>{fund.name}</span>
                          <span className="font-extrabold text-indigo-400">{format(fund.current)} / {format(fund.target)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/40 rounded-full overflow-hidden p-[1px] border border-slate-700/10">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((fund.current / fund.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {sinkingFunds.length === 0 && <span className="text-[10px] text-slate-500 block text-center font-bold uppercase py-6">Sin fondos activos</span>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/10 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-400">Total Ahorrado</span>
                  <span className="font-black text-indigo-400 text-sm">{format(stats.totalSinkingCurrent)}</span>
                </div>
              </div>

              {/* Upcoming Recurring Bills */}
              <div className={`${T.card} p-6 rounded-[32px] flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl"><Calendar size={16} /></div>
                      <span className={`font-black ${T.text} text-sm tracking-tight`}>Pagos Próximos</span>
                    </div>
                    <button onClick={() => setShowPaymentForm(true)} className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Plus size={14} /></button>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-hide">
                    {payments.map(pay => {
                      const days = getDaysUntil(pay.dueDate);
                      const isUrgent = days <= 3;
                      return (
                        <div key={pay.id} className="flex justify-between items-center p-2.5 bg-slate-800/10 rounded-xl border border-slate-700/10 group">
                          <div>
                            <p className={`font-black text-xs ${T.text}`}>{pay.name}</p>
                            <span className={`text-[8px] font-extrabold ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-slate-400'} uppercase tracking-wider`}>
                              {days === 0 ? 'Hoy' : days < 0 ? `Venció hace ${Math.abs(days)}d` : `En ${days} días`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-rose-400">{format(pay.amount)}</span>
                            <button onClick={() => setPayments(prev => prev.filter(p => p.id !== pay.id))} className="text-slate-500 hover:text-rose-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      );
                    })}
                    {payments.length === 0 && <span className="text-[10px] text-slate-500 block text-center font-bold uppercase py-6">Sin pagos agendados</span>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/10 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-400">Total Compromisos</span>
                  <span className="font-black text-rose-400 text-sm">{format(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                </div>
              </div>

              {/* Ant Expenses Calculator */}
              <div className={`${T.card} p-6 rounded-[32px] flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Bug size={16} /></div>
                      <span className={`font-black ${T.text} text-sm tracking-tight`}>Fugas Hormiga</span>
                    </div>
                    <button onClick={() => setShowAntForm(true)} className="p-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"><Plus size={14} /></button>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-hide">
                    {antExpenses.map(ant => (
                      <div key={ant.id} className="flex justify-between items-center p-2.5 bg-slate-800/10 rounded-xl border border-slate-700/10">
                        <span className={`font-black text-xs ${T.text}`}>{ant.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-400">{format(ant.monthlyAmount)} / mes</span>
                          <button onClick={() => setAntExpenses(prev => prev.filter(a => a.id !== ant.id))} className="text-slate-500 hover:text-rose-500"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                    {antExpenses.length === 0 && <span className="text-[10px] text-slate-500 block text-center font-bold uppercase py-6">Sin microgastos registrados</span>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/10 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-400">Impacto Anualizado</span>
                  <span className="font-black text-rose-500 text-sm">{format(stats.totalAntAnnual)}</span>
                </div>
              </div>

            </div>

            {/* Libertad Financiera Tracker */}
            <div className={`${T.card} p-6 md:p-8 rounded-[36px]`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl"><Target size={20} /></div>
                  <div>
                    <h3 className={`font-black text-base md:text-lg ${T.text} tracking-tight`}>{goal.name || 'Meta de Libertad Financiera'}</h3>
                    <p className={`${T.subText} text-[9px] uppercase tracking-wider font-bold`}>Aporte mensual enfocado</p>
                  </div>
                </div>
                <button
                  onClick={() => { setTempGoalName(goal.name); setTempGoalAmount(goal.amount.toString()); setTempGoalContribution(goal.monthlyContribution.toString()); setShowGoalForm(true); }}
                  className={`p-2 rounded-xl bg-slate-800/20 border ${T.border} text-slate-400 hover:text-indigo-400`}
                >
                  <Pencil size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Progress Bar & Ratios */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-end text-sm font-extrabold">
                    <span className="text-2xl font-black text-indigo-400">{stats.progressGoal.toFixed(1)}% Alcanzado</span>
                    <span className={T.subText}>Objetivo: {format(goal.amount)}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-800/40 rounded-full p-[2px] border border-slate-700/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-indigo-600 rounded-full shadow-lg"
                      style={{ width: `${stats.progressGoal}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-slate-800/10 rounded-xl border border-slate-700/5 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Balance Actual</span>
                      <span className={`text-xs font-black ${T.text}`}>{format(stats.balance)}</span>
                    </div>
                    <div className="p-3 bg-slate-800/10 rounded-xl border border-slate-700/5 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Aporte Mensual</span>
                      <span className="text-xs font-black text-indigo-400">{format(goal.monthlyContribution)}</span>
                    </div>
                    <div className="p-3 bg-slate-800/10 rounded-xl border border-slate-700/5 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Tiempo Restante</span>
                      <span className="text-xs font-black text-emerald-400">
                        {stats.monthsToGoal === Infinity ? 'N/A' : stats.monthsToGoal >= 12 ? `${(stats.monthsToGoal / 12).toFixed(1)} años` : `${stats.monthsToGoal} meses`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compound wealth tip */}
                <div className="lg:col-span-4 p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
                  <Info size={20} className="text-indigo-400 flex-shrink-0" />
                  <div className="text-[11px] leading-relaxed text-indigo-300">
                    <span className="font-extrabold block text-indigo-200 mb-0.5">El poder del ahorro enfocado:</span>
                    Si inviertes tu aporte mensual de {format(goal.monthlyContribution)} a una tasa conservadora del 8.0% anual, en 10 años habrás acumulado <strong className="text-emerald-400 font-extrabold">{format(goal.monthlyContribution * 182)}</strong> gracias al interés compuesto.
                  </div>
                </div>
              </div>
            </div>

            {/* Debt avalanche helper */}
            {debts.length > 0 && (
              <div className={`${T.card} p-6 rounded-[32px]`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl"><TrendingDown size={16} /></div>
                    <span className={`font-black ${T.text} text-sm tracking-tight`}>Estrategia de Liquidación de Deudas</span>
                  </div>
                  <button onClick={() => setShowDebtForm(true)} className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Plus size={14} /></button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-3">
                    {debts.map(d => (
                      <div key={d.id} className="flex justify-between items-center p-3 bg-slate-800/10 rounded-2xl border border-slate-700/10">
                        <div>
                          <p className={`font-black text-xs ${T.text}`}>{d.name}</p>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Tasa: {d.rate}% • Pago mín: {format(d.minPayment)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-rose-400">{format(d.balance)}</span>
                          <button onClick={() => setDebts(p => p.filter(x => x.id !== d.id))} className="text-slate-500 hover:text-rose-500"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-5 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-300 leading-relaxed">
                    <span className="font-extrabold block text-rose-200 mb-1">Recomendación de Bola de Nieve (Snowball):</span>
                    Para liquidar tu deuda total de <strong>{format(stats.totalDebtBalance)}</strong>, enfoca cualquier ahorro extra en pagar la deuda de menor saldo (<strong>{debts.slice().sort((a,b) => a.balance - b.balance)[0]?.name || ''}</strong>) mientras pagas el mínimo en las demás. Esto te dará victorias psicológicas rápidas y liberará flujo de caja pronto.
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 2: VIRTUAL HEALTH ADVISOR ==================== */}
        {activeTab === 'adviser' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            
            {/* Grade Card */}
            <div className={`${T.card} p-8 rounded-[44px] flex flex-col md:flex-row justify-between items-center gap-8`}>
              <div className="text-center md:text-left space-y-3">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs uppercase tracking-widest border border-indigo-500/20">
                  Calificación del Asesor Financiero
                </div>
                <h2 className={`text-3xl md:text-5xl font-black ${T.text} tracking-tighter`}>Tus Finanzas Personales</h2>
                <p className={`${T.subText} text-xs md:text-sm leading-relaxed max-w-xl`}>
                  Nuestra IA de asesoría ha auditado tu presupuesto, inversiones y tus gastos hormiga en base a los estándares de la regla 50/30/20. Tu estado actual refleja un comportamiento financiero estratégico.
                </p>
              </div>

              {/* Large Grade Circle */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-slate-950 flex flex-col items-center justify-center border-4 border-slate-800 shadow-2xl shadow-emerald-500/10">
                <span className={`text-6xl md:text-7xl font-black ${stats.gradeColor} tracking-tighter`}>{stats.grade}</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black mt-1">Salud Financiera</span>
              </div>
            </div>

            {/* Financial Ratios Rulers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Ahorro Ruler */}
              <RatioGauge
                title="Tasa de Inversión Mensual"
                ratio={stats.investmentRate}
                ideal="> 10%"
                desc="Determina qué porcentaje de tus ingresos destinas a crear riqueza futura a través de CETES, ETFs o Cripto."
                colorClass={stats.investmentRate >= 10 ? 'bg-emerald-500' : stats.investmentRate >= 5 ? 'bg-indigo-500' : 'bg-rose-500'}
                theme={T}
                formatValue={() => `${stats.investmentRate.toFixed(1)}%`}
              />

              {/* Costo Fijo Ruler */}
              <RatioGauge
                title="Ratio de Costos Fijos"
                ratio={stats.fixedRatio}
                ideal="< 50%"
                desc="Representa las obligaciones ineludibles (renta, servicios, comida esencial). Un ratio alto reduce tu flexibilidad."
                colorClass={stats.fixedRatio <= 50 ? 'bg-emerald-500' : stats.fixedRatio <= 65 ? 'bg-indigo-500' : 'bg-rose-500'}
                theme={T}
                formatValue={() => `${stats.fixedRatio.toFixed(1)}%`}
              />

              {/* Gasto Variable Ruler */}
              <RatioGauge
                title="Ratio de Gastos Variables"
                ratio={stats.varRatio}
                ideal="30% máximo"
                desc="Gastos en entretenimiento, salidas y compras discrecionales. Es el rubro más fácil de recortar ante emergencias."
                colorClass={stats.varRatio <= 30 ? 'bg-emerald-500' : 'bg-rose-500'}
                theme={T}
                formatValue={() => `${stats.varRatio.toFixed(1)}%`}
              />

            </div>

            {/* AI Advisor Recommendations (Acciones Recomendadas) */}
            <div className={`${T.card} p-6 md:p-10 rounded-[44px]`}>
              <h3 className={`text-xl md:text-2xl font-black ${T.text} mb-6 tracking-tighter flex items-center gap-3`}>
                <Sparkles className="text-emerald-400" />
                Acciones Financieras Recomendadas
              </h3>

              <div className="space-y-4">
                <AdvisorRecommendation
                  title="Diversificación de Inversiones y Activos"
                  status={stats.investmentRate >= 10 ? 'success' : 'warn'}
                  text={`Tu tasa de inversión actual es de ${stats.investmentRate.toFixed(1)}% con un aporte mensual de ${format(stats.totalInvestmentsContribution)}. ${stats.investmentRate >= 10 ? `Cumples de manera sobresaliente el objetivo de inversión. ${profile.name ? 'Excelente, ' + profile.name + '.' : ''} Mantén esta constancia para acelerar tu Libertad Financiera.` : 'Te sugerimos incrementar tus aportes de inversión al 10% mensual de tus ingresos. Esto generará un colchón patrimonial robusto y pasivo.'}`}
                />

                <AdvisorRecommendation
                  title="Análisis de Estructura de Gastos Fijos"
                  status={stats.fixedRatio <= 50 ? 'success' : 'warn'}
                  text={`Tus gastos fijos ($${stats.fixedExpenses.toLocaleString()}) representan el ${stats.fixedRatio.toFixed(1)}% de tus ingresos. ${stats.fixedRatio <= 50 ? 'Mantienes un estilo de vida saludable que te protege en caso de pérdida de ingresos o imprevistos.' : 'Superas el límite recomendado del 50%. Esto reduce tu margen de maniobra. Intenta renegociar planes de telefonía o evaluar si tu costo de vivienda es idóneo para tus ingresos actuales.'}`}
                />

                <AdvisorRecommendation
                  title="Mitigación de Fugas Hormiga"
                  status={stats.totalAntAnnual > 500 ? 'warn' : 'success'}
                  text={`Tus gastos hormiga registrados suman un impacto anual de ${format(stats.totalAntAnnual)}. ${stats.totalAntAnnual > 500 ? 'Esto representa un drenaje importante de capital que podría acelerar el pago de tus metas. Reducir solo el 30% de estos microgastos te ahorraría ' + format(stats.totalAntAnnual * 0.3) + ' al año.' : 'Mantienes tus fugas hormiga bajo un control impecable. ¡Felicidades!'}`}
                />
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: WEALTH SIMULATOR ==================== */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            
            {/* Compound Interest Simulator & Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Simulator Inputs & Form */}
              <div className={`${T.card} p-6 md:p-8 rounded-[32px] lg:col-span-4 flex flex-col justify-between`}>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Calculator size={20} /></div>
                    <div>
                      <h4 className={`font-black ${T.text} text-base`}>Simulación de Riqueza</h4>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Interés Compuesto Pro</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Rate Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={T.subText}>Tasa de Retorno Anual</span>
                        <span className={T.accentText}>{simRate}% Anual</span>
                      </div>
                      <input
                        type="range" min="1" max="25" step="0.5"
                        value={simRate} onChange={e => setSimRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Years Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={T.subText}>Plazo del Proyecto</span>
                        <span className={T.accentText}>{simYears} Años</span>
                      </div>
                      <input
                        type="range" min="1" max="40"
                        value={simYears} onChange={e => setSimYears(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/20 rounded-2xl border border-slate-700/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capital Inicial (Ahorros + Inversiones):</span>
                      <span className={T.text}>{format(stats.totalSinkingCurrent + stats.totalInvestmentsBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Aportación Mensual Total:</span>
                      <span className={T.text}>{format((stats.balance > 0 ? stats.balance : 0) + stats.totalInvestmentsContribution)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/10">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Riqueza al final del plazo</p>
                  <p className="text-3xl font-black text-emerald-400 tracking-tighter">
                    {format(projectionData[projectionData.length - 1]?.Proyectado || 0)}
                  </p>
                </div>
              </div>

              {/* Area Chart visualization */}
              <div className={`${T.card} p-6 rounded-[32px] lg:col-span-8 flex flex-col h-[350px]`}>
                <h3 className={`text-base font-black ${T.text} mb-4 tracking-tight`}>Crecimiento del Capital en el Tiempo</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorProyectado" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAhorrado" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 9 }}
                        hide={isPrivacy}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'light' ? '#FFF' : '#0F172A',
                          border: 'none',
                          borderRadius: '16px',
                          fontWeight: 'bold',
                          color: theme === 'light' ? '#000' : '#FFF'
                        }}
                        formatter={(val: any) => format(Number(val || 0))}
                      />
                      <Area type="monotone" dataKey="Proyectado" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProyectado)" name="Balance Proyectado" />
                      <Area type="monotone" dataKey="Ahorrado" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorAhorrado)" name="Solo Aportaciones" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Compounding Multipliers info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiplierCard year={5} rate={simRate} contribution={(stats.balance > 0 ? stats.balance : 0) + stats.totalInvestmentsContribution} format={format} theme={T} />
              <MultiplierCard year={10} rate={simRate} contribution={(stats.balance > 0 ? stats.balance : 0) + stats.totalInvestmentsContribution} format={format} theme={T} />
              <MultiplierCard year={20} rate={simRate} contribution={(stats.balance > 0 ? stats.balance : 0) + stats.totalInvestmentsContribution} format={format} theme={T} />
              <MultiplierCard year={30} rate={simRate} contribution={(stats.balance > 0 ? stats.balance : 0) + stats.totalInvestmentsContribution} format={format} theme={T} />
            </div>

          </div>
        )}

        {/* Global Footer Actions */}
        <footer className="mt-12 pt-8 border-t border-slate-700/10 text-center space-y-6">
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={handleExportJSON}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border ${T.border} ${T.card} ${T.subText} font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all`}
            >
              <Download size={14} /> Exportar Backup JSON
            </button>
            <label
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border ${T.border} ${T.card} ${T.subText} font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer`}
            >
              <Upload size={14} /> Importar Backup JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportJSON(f);
                }}
              />
            </label>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white active:scale-95 transition-all"
            >
              <Trash2 size={14} /> Limpiar Todo
            </button>
          </div>
          <p className={`text-[9px] leading-relaxed ${T.subText} font-medium opacity-65 px-6 max-w-xl mx-auto italic`}>
            Seguridad local: Tus datos se almacenan en tu localStorage y no viajan a ningún servidor externo.
          </p>
        </footer>

      </main>

      {/* ==================== GLOBAL MODALS ==================== */}

      {/* Add Transaction Modal */}
      {showAddForm && (
        <Modal title="Nuevo Movimiento" onClose={() => setShowAddForm(false)} theme={T}>
          <form onSubmit={handleAddMovement} className="space-y-4">
            <input
              type="text"
              placeholder="Concepto (ej. Comida, Freelance, Sueldo)"
              value={newConcept}
              onChange={e => setNewConcept(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Gasto Fijo">Gasto Fijo</option>
                <option value="Gasto Variable">Gasto Variable</option>
              </select>
              <input
                type="number"
                placeholder="Monto"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
                required
              />
            </div>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
            />
            <button type="submit" className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Confirmar
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Transaction Modal */}
      {editingMovement && (
        <Modal title="Editar Movimiento" onClose={() => setEditingMovement(null)} theme={T}>
          <form onSubmit={handleEditMovementSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Concepto (ej. Comida, Freelance, Sueldo)"
              value={editConcept}
              onChange={e => setEditConcept(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value as any)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Gasto Fijo">Gasto Fijo</option>
                <option value="Gasto Variable">Gasto Variable</option>
              </select>
              <input
                type="number"
                placeholder="Monto"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
                required
              />
            </div>
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
            />
            <button type="submit" className="w-full py-4 rounded-2xl bg-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Guardar Cambios
            </button>
          </form>
        </Modal>
      )}

      {/* Bank Statement Importer Modal */}
      {showStatementModal && (
        <Modal title="Importar Estado de Cuenta" onClose={() => setShowStatementModal(false)} theme={T} size="lg">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            
            {statementParsedList.length === 0 ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300 leading-normal">
                  <span className="font-black uppercase tracking-wider block mb-1">💡 ¿Cómo funciona?</span>
                  Carga tu estado de cuenta en formato **PDF** (ej. de tu banco) o copia y pega el texto bruto de las transacciones. Nuestra IA local analizará las fechas y montos para que puedas revisarlos y clasificarlos antes de importarlos.
                </div>

                {/* PDF Drag & Drop / File Select */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Opción A: Subir PDF de tu Banco</label>
                  <div className="border-2 border-dashed border-slate-700/50 hover:border-cyan-500/50 rounded-2xl p-8 text-center bg-slate-950/20 transition-all relative">
                    {isParsingStatement ? (
                      <div className="space-y-2 py-4">
                        <RefreshCw size={24} className="animate-spin mx-auto text-cyan-400" />
                        <p className="text-xs font-bold text-slate-300">Extrayendo texto y transacciones del PDF bancario...</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Calculator className="mx-auto text-slate-400" size={32} />
                        <span className="text-xs font-black text-slate-200 block">Selecciona o arrastra el archivo PDF</span>
                        <span className="text-[10px] text-slate-500 block">El análisis se realiza localmente en tu PC</span>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handlePDFUpload(f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-1 h-0.5 bg-slate-800/40"></div>
                  <span className="text-[9px] font-black uppercase text-slate-500 px-3">O</span>
                  <div className="flex-1 h-0.5 bg-slate-800/40"></div>
                </div>

                {/* Paste raw text block */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Opción B: Pegar texto del estado de cuenta</label>
                  <textarea
                    placeholder="Pega aquí el texto de las transacciones (ej: &#10;02/06/2026 SPEI TRANSFERENCIA RECIBIDA +2500.00 &#10;02-06-2026 COMPRA EN SUPERMERCADO -320.50)"
                    value={statementText}
                    onChange={e => setStatementText(e.target.value)}
                    className={`w-full h-32 p-4 rounded-2xl text-xs font-bold ${T.inputBg} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => parseStatementTextContent(statementText)}
                    disabled={!statementText.trim()}
                    className="w-full py-4 rounded-2xl bg-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Analizar Texto Pegado
                  </button>
                </div>
              </div>
            ) : (
              // Preview List Table
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/10 pb-3">
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">Transacciones Encontradas</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setStatementText('');
                      setStatementParsedList([]);
                    }}
                    className="text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ← Volver a Cargar
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/20 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="pb-2 pr-3 w-8">Selec.</th>
                        <th className="pb-2 pr-3">Fecha</th>
                        <th className="pb-2 pr-3">Concepto/Descripción</th>
                        <th className="pb-2 pr-3">Categoría</th>
                        <th className="pb-2 text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/5">
                      {statementParsedList.map((item, idx) => {
                        const isIncome = item.amount > 0;
                        return (
                          <tr key={item.id} className={`hover:bg-slate-850/5 transition-colors ${!item.selected ? 'opacity-40' : ''}`}>
                            <td className="py-3 pr-3">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => {
                                  const newList = [...statementParsedList];
                                  newList[idx].selected = !newList[idx].selected;
                                  setStatementParsedList(newList);
                                }}
                                className="w-4 h-4 rounded cursor-pointer accent-cyan-500"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <input
                                type="text"
                                value={item.date}
                                onChange={(e) => {
                                  const newList = [...statementParsedList];
                                  newList[idx].date = e.target.value;
                                  setStatementParsedList(newList);
                                }}
                                className={`p-1.5 rounded-lg text-[11px] font-bold w-24 ${T.inputBg}`}
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <input
                                type="text"
                                value={item.concept}
                                onChange={(e) => {
                                  const newList = [...statementParsedList];
                                  newList[idx].concept = e.target.value;
                                  setStatementParsedList(newList);
                                }}
                                className={`p-1.5 rounded-lg text-[11px] font-bold w-full ${T.inputBg}`}
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <select
                                value={item.category}
                                onChange={(e) => {
                                  const newList = [...statementParsedList];
                                  newList[idx].category = e.target.value as any;
                                  setStatementParsedList(newList);
                                }}
                                className={`p-1.5 rounded-lg text-[10px] font-bold ${T.inputBg}`}
                              >
                                <option value="Ingreso">Ingreso</option>
                                <option value="Gasto Fijo">Gasto Fijo</option>
                                <option value="Gasto Variable">Gasto Variable</option>
                              </select>
                            </td>
                            <td className={`py-3 text-right font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isIncome ? `+$${item.amount.toLocaleString()}` : `-$${Math.abs(item.amount).toLocaleString()}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-700/15">
                  <button
                    type="button"
                    onClick={() => setShowStatementModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStatementImport}
                    className="flex-1 py-4 rounded-2xl bg-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                  >
                    Confirmar Importación ({statementParsedList.filter(x => x.selected).length})
                  </button>
                </div>
              </div>
            )}

          </div>
        </Modal>
      )}



      {/* Sinking Fund Add Modal */}
      {showSinkForm && (
        <Modal title="Nueva Bolsa de Ahorro" onClose={() => setShowSinkForm(false)} theme={T}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!sinkName || !sinkTarget) return;
            const newItem: SinkingFund = {
              id: Date.now().toString(),
              name: sinkName,
              target: parseFloat(sinkTarget),
              current: parseFloat(sinkCurrent) || 0
            };
            setSinkingFunds(prev => [...prev, newItem]);
            setSinkName('');
            setSinkTarget('');
            setSinkCurrent('');
            setShowSinkForm(false);
          }} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de la bolsa (ej. Fondo de Viaje)"
              value={sinkName}
              onChange={e => setSinkName(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Meta $"
                value={sinkTarget}
                onChange={e => setSinkTarget(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
                required
              />
              <input
                type="number"
                placeholder="Saldo inicial $"
                value={sinkCurrent}
                onChange={e => setSinkCurrent(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              />
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Crear Bolsa
            </button>
          </form>
        </Modal>
      )}

      {/* Add Investment Modal (NEW FEATURE) */}
      {showInvForm && (
        <Modal title="Nueva Inversión Activa" onClose={() => setShowInvForm(false)} theme={T}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!invName || !invBalance) return;
            const newItem: Investment = {
              id: Date.now().toString(),
              name: invName,
              type: invType,
              balance: parseFloat(invBalance),
              monthlyContribution: parseFloat(invContribution) || 0,
              yieldRate: parseFloat(invYield) || 8.0
            };
            setInvestments(prev => [...prev, newItem]);
            setInvName('');
            setInvBalance('');
            setInvContribution('');
            setInvYield('');
            setShowInvForm(false);
          }} className="space-y-4">
            <input
              type="text"
              placeholder="Instrumento (ej. CETES, S&P 500, Fibras)"
              value={invName}
              onChange={e => setInvName(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={invType}
                onChange={e => setInvType(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              >
                <option value="Renta Fija">Renta Fija</option>
                <option value="Renta Variable">Renta Variable</option>
                <option value="Criptomonedas">Criptomonedas</option>
                <option value="Bienes Raíces">Bienes Raíces</option>
                <option value="Otros">Otros</option>
              </select>
              <input
                type="number"
                placeholder="Rendimiento Anual % (ej. 11)"
                value={invYield}
                onChange={e => setInvYield(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Saldo Actual $"
                value={invBalance}
                onChange={e => setInvBalance(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
                required
              />
              <input
                type="number"
                placeholder="Aporte Mensual $"
                value={invContribution}
                onChange={e => setInvContribution(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              />
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Añadir Inversión
            </button>
          </form>
        </Modal>
      )}

      {/* Debt Add Modal */}
      {showDebtForm && (
        <Modal title="Registrar Deuda" onClose={() => setShowDebtForm(false)} theme={T}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!debtName || !debtBalance) return;
            const newItem: Debt = {
              id: Date.now().toString(),
              name: debtName,
              balance: parseFloat(debtBalance),
              rate: parseFloat(debtRate) || 0,
              minPayment: parseFloat(debtMinPay) || 0
            };
            setDebts(prev => [...prev, newItem]);
            setDebtName('');
            setDebtBalance('');
            setDebtRate('');
            setDebtMinPay('');
            setShowDebtForm(false);
          }} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del acreedor (ej. Tarjeta de Crédito)"
              value={debtName}
              onChange={e => setDebtName(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Saldo $"
                value={debtBalance}
                onChange={e => setDebtBalance(e.target.value)}
                className={`p-3 rounded-2xl text-xs font-bold ${T.inputBg}`}
                required
              />
              <input
                type="number"
                placeholder="Tasa %"
                value={debtRate}
                onChange={e => setDebtRate(e.target.value)}
                className={`p-3 rounded-2xl text-xs font-bold ${T.inputBg}`}
              />
              <input
                type="number"
                placeholder="Mínimo $"
                value={debtMinPay}
                onChange={e => setDebtMinPay(e.target.value)}
                className={`p-3 rounded-2xl text-xs font-bold ${T.inputBg}`}
              />
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-rose-600 text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Registrar Deuda
            </button>
          </form>
        </Modal>
      )}

      {/* Goals Edit Modal */}
      {showGoalForm && (
        <Modal title="Editar Meta Libertad" onClose={() => setShowGoalForm(false)} theme={T}>
          <form onSubmit={e => {
            e.preventDefault();
            setGoal({
              name: tempGoalName || 'Meta Libertad Financiera',
              amount: parseFloat(tempGoalAmount) || 0,
              monthlyContribution: parseFloat(tempGoalContribution) || 0
            });
            setShowGoalForm(false);
          }} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del Objetivo"
              value={tempGoalName}
              onChange={e => setTempGoalName(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Monto total $"
                value={tempGoalAmount}
                onChange={e => setTempGoalAmount(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              />
              <input
                type="number"
                placeholder="Aporte mensual $"
                value={tempGoalContribution}
                onChange={e => setTempGoalContribution(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              />
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Guardar Objetivo
            </button>
          </form>
        </Modal>
      )}

      {/* Upcoming Payments Modal */}
      {showPaymentForm && (
        <Modal title="Nuevo Recordatorio" onClose={() => setShowPaymentForm(false)} theme={T}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!payName || !payAmount || !payDate) return;
            const newItem: UpcomingPayment = {
              id: Date.now().toString(),
              name: payName,
              amount: parseFloat(payAmount),
              dueDate: payDate
            };
            setPayments(prev => [...prev, newItem]);
            setPayName('');
            setPayAmount('');
            setPayDate('');
            setShowPaymentForm(false);
          }} className="space-y-4">
            <input
              type="text"
              placeholder="Servicio u Obligación (ej. Renta)"
              value={payName}
              onChange={e => setPayName(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Monto $"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
                required
              />
              <input
                type="date"
                value={payDate}
                onChange={e => setPayDate(e.target.value)}
                className={`p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
                required
              />
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Agendar
            </button>
          </form>
        </Modal>
      )}

      {/* Ant Expense Modal */}
      {showAntForm && (
        <Modal title="Registrar Gasto Hormiga" onClose={() => setShowAntForm(false)} theme={T}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!antName || !antMonthly) return;
            const newItem: AntExpense = {
              id: Date.now().toString(),
              name: antName,
              monthlyAmount: parseFloat(antMonthly)
            };
            setAntExpenses(prev => [...prev, newItem]);
            setAntName('');
            setAntMonthly('');
            setShowAntForm(false);
          }} className="space-y-4">
            <input
              type="text"
              placeholder="Descripción (ej. Café)"
              value={antName}
              onChange={e => setAntName(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <input
              type="number"
              placeholder="Costo mensual aproximado $"
              value={antMonthly}
              onChange={e => setAntMonthly(e.target.value)}
              className={`w-full p-4 rounded-2xl text-sm font-bold ${T.inputBg}`}
              required
            />
            <button type="submit" className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all">
              Registrar
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}

// --- Micro components ---

const OnbStep = ({ num, title, active }: { num: number; title: string; active: boolean }) => (
  <div className="flex flex-col items-center space-y-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
      {num}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-wider ${active ? 'text-blue-400' : 'text-slate-600'}`}>{num === 4 ? 'Meta/Inv.' : title}</span>
  </div>
);

const TabBtn = ({ active, onClick, icon, label, theme }: any) => {
  const activeClass = theme === 'light'
    ? 'border-indigo-600 text-indigo-600 font-extrabold'
    : 'border-emerald-500 text-emerald-400 font-extrabold';
  const inactiveClass = 'border-transparent text-slate-500 hover:text-slate-400';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${active ? activeClass : inactiveClass}`}
    >
      {icon}
      {label}
    </button>
  );
};

const KPIBadge = ({ title, value, color, isString, format, theme }: any) => {
  const colorMap: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    blue: 'text-sky-500 bg-sky-500/10'
  };

  return (
    <div className={`${theme.card} p-4 rounded-3xl border ${theme.border} flex items-center justify-between group hover:shadow-lg transition-all duration-300`}>
      <div>
        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">{title}</p>
        <p className={`text-base md:text-xl font-black tracking-tight text-white`}>
          {isString ? value : format(value)}
        </p>
      </div>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color] || 'text-slate-400 bg-slate-800'} group-hover:scale-110 transition-transform`}>
        {color === 'emerald' ? <ArrowUpCircle size={18} /> : color === 'rose' ? <ArrowDownCircle size={18} /> : <DollarSign size={18} />}
      </div>
    </div>
  );
};

const BudgetColumn = ({ title, data, color, total, onDelete, onEdit, format, isPrivacy, theme, onAddClick }: any) => {
  const isInc = color === 'emerald';
  const titleColor = isInc ? 'text-emerald-400' : 'text-rose-400';
  const totalColor = isInc ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className={`${theme.card} rounded-[36px] overflow-hidden flex flex-col h-[400px] border ${theme.border}`}>
      <div className={`px-6 py-4 ${theme.cardHeader} flex justify-between items-center`}>
        <span className={`font-black text-sm uppercase tracking-wider ${titleColor}`}>{title}</span>
        <button onClick={onAddClick} className={`p-1.5 rounded-lg bg-slate-800/40 text-slate-400 hover:text-emerald-400 border border-slate-700/30`}><Plus size={14} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/10 scrollbar-hide">
        {data.map((item: any) => (
          <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-800/5 group transition-all">
            <div>
              <p className={`font-extrabold text-xs tracking-tight ${isPrivacy ? 'blur-sm' : theme.text}`}>{item.concept}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{item.category} • {item.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black ${titleColor}`}>
                {isPrivacy ? '••••' : (isInc ? `+$${item.amount.toLocaleString()}` : `-$${Math.abs(item.amount).toLocaleString()}`)}
              </span>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="text-slate-500 hover:text-cyan-400" title="Editar"><Pencil size={12} /></button>
                <button onClick={() => onDelete(item.id)} className="text-slate-600 hover:text-rose-500" title="Eliminar"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase tracking-widest py-12">
            Sin movimientos registrados
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-800/15 border-t border-slate-800/10 flex justify-between items-center mt-auto">
        <span className="text-[9px] font-black uppercase text-slate-400">Total</span>
        <span className={`text-lg font-black ${totalColor}`}>{format(total)}</span>
      </div>
    </div>
  );
};


const RatioGauge = ({ title, ratio, ideal, desc, colorClass, theme, formatValue }: any) => {
  return (
    <div className={`${theme.card} p-6 rounded-[32px] border ${theme.border} space-y-4 flex flex-col justify-between`}>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className={`font-black text-xs ${theme.text}`}>{title}</span>
          <span className="text-[10px] bg-slate-800/40 text-slate-400 font-black px-2 py-0.5 rounded-full uppercase border border-slate-700/10">Ideal: {ideal}</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">{desc}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-3xl font-black text-white tracking-tighter">{formatValue()}</span>
        </div>
        <div className="h-2 w-full bg-slate-800/50 rounded-full p-[1px] border border-slate-700/10">
          <div
            className={`h-full rounded-full ${colorClass} transition-all duration-1000`}
            style={{ width: `${Math.min(ratio, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const AdvisorRecommendation = ({ title, status, text }: any) => {
  const isSuccess = status === 'success';
  const bgClass = isSuccess ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20';
  const iconColor = isSuccess ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className={`p-4 rounded-3xl border ${bgClass} flex gap-4`}>
      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-900/60 ${iconColor} border border-slate-800/30`}>
        {isSuccess ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
      </div>
      <div>
        <h4 className="text-xs font-black text-slate-200 tracking-tight mb-0.5">{title}</h4>
        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">{text}</p>
      </div>
    </div>
  );
};

const MultiplierCard = ({ year, rate, contribution, format, theme }: any) => {
  const r = rate / 100;
  const fv = contribution > 0 ? contribution * ((Math.pow(1 + r / 12, year * 12) - 1) / (r / 12)) : 0;

  return (
    <div className={`${theme.card} p-4 rounded-2xl border ${theme.border} text-center space-y-2`}>
      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">En {year} Años</span>
      <p className="text-xl font-black text-emerald-400 tracking-tighter">{format(fv)}</p>
      <span className="text-[8px] text-slate-400 font-bold block">Tasa: {rate}% • Aporte: {format(contribution)}</span>
    </div>
  );
};

const Modal = ({ title, children, onClose, theme, size = 'md' }: any) => {
  const sizeClass = size === 'lg' ? 'max-w-4xl w-full' : 'max-w-md w-full';
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in slide-in-from-bottom duration-300">
      <div className={`${theme.card} rounded-t-[32px] md:rounded-[36px] p-6 md:p-8 ${sizeClass} shadow-2xl relative overflow-hidden`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-black ${theme.text} tracking-tighter uppercase italic`}>{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-rose-500 transition-all active:scale-75">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

