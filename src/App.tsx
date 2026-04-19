/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Activity, Clock, Users, ShieldAlert, Heart, MessageSquare, TrendingUp, TrendingDown, 
  Minus, RefreshCw, LogIn, LogOut, LayoutDashboard, BrainCircuit, Sparkles, AlertCircle,
  Menu, Info, FileText, Download, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { auth, signIn, logOut, db, onAuthStateChanged, User } from './lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeKPIs } from './lib/gemini';
import { DashboardData, KPIBase, AIInsight } from './types';
import { INITIAL_DATA } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const StatCard: React.FC<{ kpi: KPIBase; labelAr: string }> = ({ kpi, labelAr }) => {
  const isUp = kpi.trend === 'up';
  const isDown = kpi.trend === 'down';
  
  const statusColors = {
    good: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    critical: 'text-rose-600 bg-rose-50 border-rose-100'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.name}</p>
          <p className="text-sm font-medium text-slate-400 font-arabic" dir="rtl">{labelAr}</p>
        </div>
        <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border", statusColors[kpi.status])}>
          {kpi.status}
        </div>
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
          {kpi.value}
          <span className="text-lg font-normal text-slate-400 ml-1">{kpi.unit}</span>
        </h3>
        <div className={cn(
          "flex items-center text-sm font-medium mb-1.5",
          isUp ? "text-emerald-500" : isDown ? "text-rose-500" : "text-slate-400"
        )}>
          {isUp ? <TrendingUp size={16} className="mr-1" /> : isDown ? <TrendingDown size={16} className="mr-1" /> : <Minus size={16} className="mr-1" />}
          {isUp ? '+2.4%' : isDown ? '-1.8%' : 'Stable'}
        </div>
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={kpi.history}>
            <defs>
              <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#10b981" : "#f59e0b"} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={isUp ? "#10b981" : "#f59e0b"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={isUp ? "#10b981" : "#f59e0b"} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${kpi.id})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const InsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
  const iconMap = {
    alert: <ShieldAlert className="text-rose-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="mt-0.5">{iconMap[insight.severity]}</div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-1">{insight.title}</h4>
        <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{insight.category}</span>
          {insight.actionable && (
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold uppercase">Action Required</span>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailedTrendSection: React.FC<{ 
  data: DashboardData; 
  dateRange: {start: string, end: string}; 
  onRangeChange: (range: {start: string, end: string}) => void 
}> = ({ data, dateRange, onRangeChange }) => {
  
  const allKpis = [
    data.operational.waitingTime,
    data.operational.workflowEfficiency,
    data.operational.resourceUtilization,
    data.clinical.medicationErrors,
    data.clinical.treatmentAdherence,
    data.clinical.clinicalOutcomes,
    data.satisfaction.surveyScore,
    data.satisfaction.serviceResponsiveness,
    data.satisfaction.engagement,
  ];

  const filteredHistory = (history: {date: string, value: number}[]) => {
    return history.filter(h => h.date >= dateRange.start && h.date <= dateRange.end);
  };

  return (
    <section className="mt-16 pt-16 border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-indigo-600" size={20} />
            <h3 className="text-2xl font-bold text-slate-900">Historical Analytics</h3>
          </div>
          <p className="text-slate-500">Long-term trend analysis for all quality indicators</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-0.5">Start Date</label>
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => onRangeChange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1 text-sm bg-transparent focus:outline-none"
            />
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-0.5">End Date</label>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => onRangeChange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1 text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {allKpis.map(kpi => (
          <div key={kpi.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-slate-900">{kpi.name}</h4>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{kpi.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">{kpi.value} <span className="text-sm font-normal text-slate-400">{kpi.unit}</span></p>
              </div>
            </div>
            
            <div className="h-48 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistory(kpi.history)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '2026-04-12', end: '2026-04-18' });
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signIn();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please keep the window open to log in.');
      } else {
        setAuthError('An unexpected error occurred during sign-in.');
        console.error('Sign-in error:', error);
      }
      setTimeout(() => setAuthError(null), 5000);
    }
  };

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'dashboards', user.uid);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as DashboardData);
      } else {
        // Initialize with mock data for new user
        const initial = { ...INITIAL_DATA, ownerId: user.uid, facilityName: 'General Hospital' };
        setDoc(docRef, initial);
        setData(initial);
      }
    });

    return () => unsub();
  }, [user]);

  const handleAIAnalysis = async () => {
    if (!data) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeKPIs(data);
      setInsights(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc' // slate-50 color
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`TQM-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;

    const allKpis = [
      data.operational.waitingTime,
      data.operational.workflowEfficiency,
      data.operational.resourceUtilization,
      data.clinical.medicationErrors,
      data.clinical.treatmentAdherence,
      data.clinical.clinicalOutcomes,
      data.satisfaction.surveyScore,
      data.satisfaction.serviceResponsiveness,
      data.satisfaction.engagement,
    ];

    // CSV Headers and KPI Data
    let csvContent = "Category,KPI Name,Current Value,Unit,Target,Status\n";
    allKpis.forEach(kpi => {
      csvContent += `${kpi.category},"${kpi.name}",${kpi.value},"${kpi.unit}",${kpi.target},${kpi.status}\n`;
    });

    // AI Insights Section in CSV
    if (insights.length > 0) {
      csvContent += "\nAI Insights\nTitle,Description,Severity,Category\n";
      insights.forEach(insight => {
        csvContent += `"${insight.title}","${insight.description.replace(/"/g, '""')}",${insight.severity},"${insight.category}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `TQM-Data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="animate-spin text-slate-300" size={40} />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-200"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-indigo-200 shadow-lg">
          <LayoutDashboard className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">HealthQuality Pro</h1>
        <p className="text-slate-500 mb-8">Digital TQM Framework for Healthcare Quality Management.</p>
        
        <button 
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white rounded-xl py-4 font-semibold hover:bg-slate-800 transition-all group"
        >
          <LogIn size={20} className="group-hover:translate-x-0.5 transition-transform" />
          Access Dashboard
        </button>

        <AnimatePresence>
          {authError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium"
            >
              {authError}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-1 items-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Research Study By</p>
          <p className="text-sm font-medium text-slate-600">Aya Adel Kamel Elbayomi</p>
          <p className="text-[10px] text-slate-400">Suez Canal University | TQM in Healthcare</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="glass-header px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-100 shadow-lg">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">HealthQuality Pro</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">TQM Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900">{user.displayName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Quality Manager</p>
            </div>
            <button 
              onClick={logOut}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Facility Overview</h2>
            <p className="text-slate-500">Monitoring real-time quality indicators for <span className="font-semibold text-indigo-600">{data?.facilityName}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              disabled={!data}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <FileSpreadsheet size={18} />
              Export CSV
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting || !data}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
              Export PDF
            </button>
            <button 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !data}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
              Generate AI Insights
            </button>
          </div>
        </div>

        {data ? (
          <div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 -m-4">
            {/* Main Metrics Column */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Operational KPIs */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                  <Clock className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Operational KPIs</h3>
                  <span className="text-sm text-slate-400 font-arabic ml-auto" dir="rtl">مؤشرات الأداء التشغيلية</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard kpi={data.operational.waitingTime} labelAr="أوقات انتظار المرضى" />
                  <StatCard kpi={data.operational.workflowEfficiency} labelAr="كفاءة سير العمل" />
                  <StatCard kpi={data.operational.resourceUtilization} labelAr="استخدام الموارد" />
                </div>
              </section>

              {/* Clinical KPIs */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                  <Heart className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Clinical KPIs</h3>
                  <span className="text-sm text-slate-400 font-arabic ml-auto" dir="rtl">مؤشرات الأداء السريرية</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard kpi={data.clinical.medicationErrors} labelAr="معدلات الأخطاء الدوائية" />
                  <StatCard kpi={data.clinical.treatmentAdherence} labelAr="الالتزام بالعلاج" />
                  <StatCard kpi={data.clinical.clinicalOutcomes} labelAr="مقاييس النتائج السريرية" />
                </div>
              </section>

              {/* Satisfaction KPIs */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                  <MessageSquare className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Satisfaction & Engagement</h3>
                  <span className="text-sm text-slate-400 font-arabic ml-auto" dir="rtl">مؤشرات رضا المستخدمين</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard kpi={data.satisfaction.surveyScore} labelAr="نتائج استطلاعات الرأي" />
                  <StatCard kpi={data.satisfaction.serviceResponsiveness} labelAr="الاستجابة للخدمة" />
                  <StatCard kpi={data.satisfaction.engagement} labelAr="المشاركة" />
                </div>
              </section>

              {/* Historical Trends Section */}
              <DetailedTrendSection 
                data={data} 
                dateRange={dateRange} 
                onRangeChange={setDateRange} 
              />
            </div>

            {/* Sidebar / Insights Column */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="text-indigo-500" size={20} />
                  <h3 className="font-bold text-slate-900">Digital TQM Insights</h3>
                </div>
                
                <AnimatePresence mode="wait">
                  {insights.length > 0 ? (
                    <motion.div 
                      key="insights"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {insights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                      ))}
                      <button 
                        onClick={() => setInsights([])}
                        className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                      >
                        Clear Insights
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 px-4"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BrainCircuit className="text-slate-300" size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No active insights. Use "Generate AI Insights" to analyze current patterns.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="font-bold mb-2">Study Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Researcher</p>
                      <p className="text-sm">Aya Adel Kamel Elbayomi</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">University</p>
                      <p className="text-sm">Suez Canal University</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Developer</p>
                      <p className="text-sm text-indigo-400">Dr. Ahmed Hamdy Ashour</p>
                    </div>
                  </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
             <RefreshCw className="animate-spin text-slate-300 mb-4" size={32} />
             <p className="text-slate-400 font-medium">Syncing with HealthQuality Cloud...</p>
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t border-slate-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-400">© 2026 HealthQuality Pro - Continuous Quality Improvement</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Research Paper</a>
            <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
