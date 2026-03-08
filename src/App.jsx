import React, { useEffect, useState, useMemo } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    BarChart3,
    Calendar,
    Layers,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    LayoutGrid,
    PieChart as PieIcon,
    Sun,
    Moon,
    Zap,
    Star,
    Trophy,
    Target,
    Sparkles,
    AlertCircle,
    Lightbulb,
    ArrowRight,
    Bot
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenerativeAI } from "@google/generative-ai";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label, isDark }) => {
    if (active && payload && payload.length) {
        return (
            <div className={cn(
                "p-3 border rounded-xl shadow-xl ring-1 ring-black/5 backdrop-blur-md",
                isDark ? "bg-slate-800/90 border-slate-700 text-white" : "bg-white/95 border-slate-100 text-slate-900"
            )}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isDark ? "text-slate-400" : "text-slate-500")}>{label}</p>
                <p className="text-sm font-black">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const KPICard = ({ title, value, icon: Icon, trend, color, trendLabel, isDark }) => (
    <div className={cn(
        "p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md group",
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
    )}>
        <div className="flex justify-between items-start">
            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 shadow-lg", color)}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tighter",
                    trend > 0
                        ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                        : (isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600")
                )}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="mt-4">
            <p className={cn("text-[10px] font-black uppercase tracking-[0.15em]", isDark ? "text-slate-500" : "text-slate-400")}>{title}</p>
            <h3 className={cn("text-2xl font-black mt-1", isDark ? "text-white" : "text-slate-900")}>{value}</h3>
            {trendLabel && <p className={cn("text-[10px] mt-1 italic font-medium", isDark ? "text-slate-600" : "text-slate-400")}>{trendLabel}</p>}
        </div>
    </div>
);

const InsightChip = ({ title, value, icon: Icon, color, isDark }) => (
    <div className={cn(
        "p-4 rounded-xl border flex items-center gap-4 transition-all hover:shadow-md",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100"
    )}>
        <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
            <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>{title}</p>
            <p className={cn("text-sm font-bold", isDark ? "text-slate-200" : "text-slate-800")}>{value}</p>
        </div>
    </div>
);

function App() {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    // AI State
    const [aiModel, setAiModel] = useState("gemini-2.5-flash");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    // Filters state
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedProduct, setSelectedProduct] = useState('All Products');
    const [selectedChannel, setSelectedChannel] = useState('All Channels');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/sales');
                const rows = await response.json();

                if (response.ok) {
                    setRawData(rows);
                    if (rows.length > 0) {
                        const dates = rows.map(r => r.date).sort();
                        setDateRange({ start: dates[0], end: dates[dates.length - 1] });
                    }
                } else {
                    console.error("API Error:", rows.error);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    const filteredData = useMemo(() => {
        return rawData.filter(row => {
            const matchDate = (!dateRange.start || row.date >= dateRange.start) &&
                (!dateRange.end || row.date <= dateRange.end);
            const matchProduct = selectedProduct === 'All Products' || row.product === selectedProduct;
            const matchChannel = selectedChannel === 'All Channels' || row.channel === selectedChannel;
            const matchSearch = !searchQuery ||
                row.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                row.channel?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchDate && matchProduct && matchChannel && matchSearch;
        });
    }, [rawData, dateRange, selectedProduct, selectedChannel, searchQuery]);

    // Derived Summary
    const summary = useMemo(() => {
        const revenue = filteredData.reduce((acc, row) => acc + (row.revenue || 0), 0);
        const orders = filteredData.reduce((acc, row) => acc + (row.orders || 0), 0);
        const cost = filteredData.reduce((acc, row) => acc + (row.cost || 0), 0);
        const profit = revenue - cost;
        const aov = orders > 0 ? revenue / orders : 0;
        return { revenue, orders, profit, aov };
    }, [filteredData]);

    // Insights Logic
    const businessInsights = useMemo(() => {
        if (filteredData.length === 0) return null;

        // Top Product
        const pMap = filteredData.reduce((acc, row) => {
            acc[row.product] = (acc[row.product] || 0) + (row.revenue || 0);
            return acc;
        }, {});
        const bestProduct = Object.entries(pMap).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Top Channel
        const cMap = filteredData.reduce((acc, row) => {
            acc[row.channel] = (acc[row.channel] || 0) + (row.revenue || 0);
            return acc;
        }, {});
        const bestChannel = Object.entries(cMap).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Peak Day
        const dMap = filteredData.reduce((acc, row) => {
            acc[row.date] = (acc[row.date] || 0) + (row.revenue || 0);
            return acc;
        }, {});
        const peakDay = Object.entries(dMap).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Best Conversion Channel (orders / visitors)
        const convMap = filteredData.reduce((acc, row) => {
            if (!acc[row.channel]) acc[row.channel] = { orders: 0, visitors: 0 };
            acc[row.channel].orders += (row.orders || 0);
            acc[row.channel].visitors += (row.visitors || 0);
            return acc;
        }, {});
        const bestConv = Object.entries(convMap)
            .map(([name, stats]) => ({ name, rate: stats.visitors > 0 ? stats.orders / stats.visitors : 0 }))
            .sort((a, b) => b.rate - a.rate)[0]?.[name];

        return { bestProduct, bestChannel, peakDay, bestConv };
    }, [filteredData]);

    // AI Logic
    const generateAIInsights = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            alert("Please add your VITE_GEMINI_API_KEY to the .env file first!");
            return;
        }

        setAiLoading(true);
        setAiResponse(null);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: aiModel });

            const prompt = `
        You are a senior business analyst. Analyze this sales data summary and provide very short, clear insights.
        
        Metrics:
        - Total Revenue: ${summary.revenue}
        - Total Orders: ${summary.orders}
        - Total Profit: ${summary.profit}
        - Best Product: ${businessInsights?.bestProduct}
        - Best Channel: ${businessInsights?.bestChannel}
        
        Please return a JSON object with exactly three headers: 
        "alerts" (urgent things to note), 
        "opportunities" (where to grow), 
        "suggestions" (actionable next steps).
        Keep each bullet point under 10 words. Return only the JSON.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Attempt to parse JSON from response
            const cleanJson = text.replace(/```json|```/g, "").trim();
            setAiResponse(JSON.parse(cleanJson));
        } catch (error) {
            console.error("AI Generation failed:", error);
            const errorMessage = error.message || "Unknown error";
            if (errorMessage.includes("API key")) {
                alert("Invalid API Key. Please double check your .env file.");
            } else if (errorMessage.includes("quota") || errorMessage.includes("429")) {
                alert("Quota exceeded! The free tier is currently busy. Try again in a minute.");
            } else {
                alert(`AI Failed: ${errorMessage}`);
            }
        } finally {
            setAiLoading(false);
        }
    };

    // Chart Datas
    const trendData = useMemo(() => {
        const dailyMap = filteredData.reduce((acc, row) => {
            acc[row.date] = (acc[row.date] || 0) + (row.revenue || 0);
            return acc;
        }, {});
        return Object.keys(dailyMap).sort().map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dailyMap[date]
        }));
    }, [filteredData]);

    const productData = useMemo(() => {
        const pMap = filteredData.reduce((acc, row) => {
            acc[row.product] = (acc[row.product] || 0) + (row.revenue || 0);
            return acc;
        }, {});
        return Object.entries(pMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);

    const channelData = useMemo(() => {
        const cMap = filteredData.reduce((acc, row) => {
            acc[row.channel] = (acc[row.channel] || 0) + (row.revenue || 0);
            return acc;
        }, {});
        return Object.entries(cMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);

    const products = useMemo(() => ['All Products', ...new Set(rawData.map(r => r.product))], [rawData]);
    const channels = useMemo(() => ['All Channels', ...new Set(rawData.map(r => r.channel))], [rawData]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const COLORS = isDark
        ? ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#a855f7', '#ec4899']
        : ['#4f46e5', '#d97706', '#059669', '#e11d48', '#8b5cf6', '#db2777'];

    if (loading) {
        return (
            <div className={cn("flex flex-col items-center justify-center w-full h-screen gap-4 transition-colors duration-500", isDark ? "bg-slate-900" : "bg-slate-50")}>
                <div className={cn("animate-spin rounded-full h-12 w-12 border-[3px]", isDark ? "border-slate-800 border-t-indigo-500" : "border-slate-200 border-t-indigo-600")}></div>
                <p className={cn("font-black text-[10px] uppercase tracking-[0.3em]", isDark ? "text-slate-600" : "text-slate-400")}>Synthesizing Insights</p>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen w-full p-4 md:p-8 lg:p-10 font-sans transition-colors duration-500", isDark ? "bg-slate-900 text-white selection:bg-indigo-500/30 selection:text-indigo-200" : "bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-700")}>
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Header Block */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2.5 rounded-xl shadow-xl transition-all", isDark ? "bg-indigo-500 shadow-indigo-500/20" : "bg-indigo-600 shadow-indigo-200")}>
                                <LayoutGrid className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">Executive Dashboard</h1>
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className={cn(
                                    "ml-4 p-2 rounded-xl border transition-all active:scale-90",
                                    isDark ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className={cn("font-medium ml-14", isDark ? "text-slate-500" : "text-slate-400")}>Intelligent insights from your sales ecosystem.</p>
                    </div>

                    <div className={cn("flex flex-wrap items-center gap-4 p-3 rounded-2xl shadow-sm border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors", isDark ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-500")}>
                            <Filter className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Filters</span>
                        </div>

                        <div className="relative group">
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className={cn(
                                    "appearance-none pl-4 pr-10 py-2 border rounded-xl text-xs font-black transition-all cursor-pointer focus:outline-none focus:ring-4",
                                    isDark ? "bg-slate-900 border-slate-700 text-slate-300 focus:ring-indigo-500/10" : "bg-slate-50 border-slate-100 text-slate-700 focus:ring-indigo-500/10"
                                )}
                            >
                                {products.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <select
                                value={selectedChannel}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                                className={cn(
                                    "appearance-none pl-4 pr-10 py-2 border rounded-xl text-xs font-black transition-all cursor-pointer focus:outline-none focus:ring-4",
                                    isDark ? "bg-slate-900 border-slate-700 text-slate-300 focus:ring-indigo-500/10" : "bg-slate-50 border-slate-100 text-slate-700 focus:ring-indigo-500/10"
                                )}
                            >
                                {channels.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className={cn("px-3 py-2 border rounded-xl text-[10px] font-black focus:outline-none transition-all", isDark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600")}
                            />
                            <span className="text-slate-500 font-bold">→</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className={cn("px-3 py-2 border rounded-xl text-[10px] font-black focus:outline-none transition-all", isDark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600")}
                            />
                        </div>
                    </div>
                </div>

                {/* Top Automated Insights */}
                {businessInsights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InsightChip title="Best Product" value={businessInsights.bestProduct} icon={Star} color="bg-amber-500" isDark={isDark} />
                        <InsightChip title="High Value Channel" value={businessInsights.bestChannel} icon={Trophy} color="bg-indigo-500" isDark={isDark} />
                        <InsightChip title="Revenue Peak" value={new Date(businessInsights.peakDay).toLocaleDateString()} icon={Zap} color="bg-rose-500" isDark={isDark} />
                        <InsightChip title="Top Conversion" value={businessInsights.bestConv || 'Direct'} icon={Target} color="bg-emerald-500" isDark={isDark} />
                    </div>
                )}

                {/* AI Integration Section */}
                <div className={cn("p-8 rounded-3xl border shadow-lg transition-all", isDark ? "bg-slate-800/40 border-indigo-500/20 shadow-indigo-500/5" : "bg-white border-indigo-50 shadow-indigo-100/20")}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                                <div className="relative p-3 bg-indigo-500 rounded-2xl">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black italic">Gemini AI Engine</h2>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Strategic analysis & Next steps</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative group">
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    className={cn(
                                        "appearance-none pl-4 pr-10 py-2.5 border rounded-xl text-xs font-black transition-all cursor-pointer focus:outline-none focus:ring-4",
                                        isDark ? "bg-slate-900 border-slate-700 text-slate-300 focus:ring-indigo-500/10 border-indigo-500/30" : "bg-slate-50 border-indigo-100 text-slate-700 focus:ring-indigo-500/10"
                                    )}
                                >
                                    <optgroup label="Stable Models (Free Tier)">
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    </optgroup>
                                    <optgroup label="Latest Previews (Experimental)">
                                        <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite</option>
                                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                                    </optgroup>
                                    <optgroup label="Pro Models (Quota limited)">
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                    </optgroup>
                                </select>
                            </div>

                            <button
                                onClick={generateAIInsights}
                                disabled={aiLoading}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50",
                                    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-indigo-500/20"
                                )}
                            >
                                {aiLoading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Thinking...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Generate Strategic Insights</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* AI Response Grid */}
                    {aiResponse ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Alerts */}
                            <div className={cn("p-6 rounded-2xl border flex flex-col gap-4", isDark ? "bg-slate-900/50 border-rose-500/20" : "bg-rose-50/30 border-rose-100")}>
                                <div className="flex items-center gap-2 text-rose-500">
                                    <AlertCircle className="w-5 h-5" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Urgent Alerts</h4>
                                </div>
                                <ul className="space-y-3">
                                    {aiResponse.alerts?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <ArrowRight className="w-3 h-3 mt-1 text-rose-400 shrink-0" />
                                            <span className="text-sm font-bold tracking-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Opportunities */}
                            <div className={cn("p-6 rounded-2xl border flex flex-col gap-4", isDark ? "bg-slate-900/50 border-indigo-500/20" : "bg-indigo-50/30 border-indigo-100")}>
                                <div className="flex items-center gap-2 text-indigo-500">
                                    <Lightbulb className="w-5 h-5" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Growth Opportunities</h4>
                                </div>
                                <ul className="space-y-3">
                                    {aiResponse.opportunities?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <ArrowRight className="w-3 h-3 mt-1 text-indigo-400 shrink-0" />
                                            <span className="text-sm font-bold tracking-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Suggestions */}
                            <div className={cn("p-6 rounded-2xl border flex flex-col gap-4", isDark ? "bg-slate-900/50 border-emerald-500/20" : "bg-emerald-50/30 border-emerald-100")}>
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <Target className="w-5 h-5" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Tactical Suggestions</h4>
                                </div>
                                <ul className="space-y-3">
                                    {aiResponse.suggestions?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <ArrowRight className="w-3 h-3 mt-1 text-emerald-400 shrink-0" />
                                            <span className="text-sm font-bold tracking-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : !aiLoading && (
                        <div className={cn("mt-8 p-6 text-center border-2 border-dashed rounded-2xl", isDark ? "border-slate-800 text-slate-600" : "border-indigo-100 text-indigo-300")}>
                            <p className="text-xs font-black uppercase tracking-widest">Connect Gemini Engine to unlock professional AI analysis</p>
                        </div>
                    )}
                </div>

                {/* KPI Cards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Gross Revenue" value={formatCurrency(summary.revenue)} icon={TrendingUp} trend={12.4} color="bg-indigo-500" trendLabel="vs previous cycle" isDark={isDark} />
                    <KPICard title="Total Orders" value={summary.orders.toLocaleString()} icon={ShoppingCart} trend={8.2} color="bg-amber-500" trendLabel="market volume" isDark={isDark} />
                    <KPICard title="Net Profit" value={formatCurrency(summary.profit)} icon={DollarSign} trend={15.1} color="bg-emerald-500" trendLabel="operational efficiency" isDark={isDark} />
                    <KPICard title="Avg Transaction" value={formatCurrency(summary.aov)} icon={BarChart3} trend={-2.4} color="bg-rose-500" trendLabel="ticket variance" isDark={isDark} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={cn("lg:col-span-2 p-8 rounded-3xl shadow-sm border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn("p-2 rounded-xl", isDark ? "bg-indigo-500/10" : "bg-indigo-50")}>
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic tracking-tight">Revenue Trajectory</h3>
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Time-series performance</p>
                            </div>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={isDark ? 0.3 : 0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ stroke: isDark ? '#475569' : '#e2e8f0', strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={cn("p-8 rounded-3xl shadow-sm border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn("p-2 rounded-xl", isDark ? "bg-rose-500/10" : "bg-rose-50")}>
                                <PieIcon className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic tracking-tight">Channel Weights</h3>
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Market share split</p>
                            </div>
                        </div>
                        <div className="h-[260px] w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={channelData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="value" stroke="none">
                                        {channelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "text-slate-600" : "text-slate-300")}>Gross</p>
                                <p className="text-xl font-black leading-none mt-1">{formatCurrency(summary.revenue)}</p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                            {channelData.map((channel, i) => (
                                <div key={channel.name} className={cn("flex justify-between items-center p-2.5 rounded-xl border transition-colors", isDark ? "bg-slate-900/50 border-slate-700" : "bg-slate-50/50 border-white")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className={cn("text-xs font-black uppercase tracking-tighter", isDark ? "text-slate-400" : "text-slate-600")}>{channel.name}</span>
                                    </div>
                                    <span className="text-xs font-black">{formatCurrency(channel.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn("lg:col-span-3 p-8 rounded-3xl shadow-sm border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className={cn("p-2 rounded-xl", isDark ? "bg-amber-500/10" : "bg-amber-50")}>
                                <ShoppingCart className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic tracking-tight">Product Dominance</h3>
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Ranked by gross revenue</p>
                            </div>
                        </div>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productData} layout="vertical" barSize={36} margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11, fontWeight: 900 }} width={120} />
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }} />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} animationDuration={1500}>
                                        {productData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className={cn("rounded-[2.5rem] shadow-sm border overflow-hidden transition-colors", isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-100 text-slate-900")}>
                    <div className={cn("p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6", isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-50 bg-slate-50/20")}>
                        <div className="flex items-center gap-5">
                            <div className={cn("p-3 rounded-2xl shadow-inner", isDark ? "bg-slate-900" : "bg-indigo-50")}>
                                <Layers className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black italic">Raw Ecosystem Feed</h2>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-600" : "text-slate-400")}>Synchronized transaction data</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-500" />
                            <input
                                type="text"
                                placeholder="Search metrics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    "pl-12 pr-6 py-3 border rounded-2xl text-sm font-bold transition-all w-full md:w-80 shadow-inner focus:outline-none focus:ring-4",
                                    isDark ? "bg-slate-900 border-slate-700 text-slate-300 focus:ring-indigo-500/10 placeholder:text-slate-700" : "bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500/10 placeholder:text-slate-300"
                                )}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={cn("border-b", isDark ? "bg-slate-900/40 border-slate-700" : "bg-slate-50/30 border-slate-50")}>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Asset Class</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Acquisition</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Volume</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Revenue</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Overheads</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Growth</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDark ? "divide-slate-700/50" : "divide-slate-50")}>
                                {filteredData.map((row, idx) => (
                                    <tr key={idx} className={cn("transition-all group cursor-default", isDark ? "hover:bg-slate-900/40" : "hover:bg-slate-50/80")}>
                                        <td className={cn("px-8 py-5 whitespace-nowrap text-xs font-black", isDark ? "text-slate-500 group-hover:text-indigo-400" : "text-slate-500 group-hover:text-indigo-600")}>{row.date}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm transition-colors", isDark ? "bg-slate-900 border-slate-700 text-slate-400 group-hover:border-indigo-500/50 group-hover:text-white" : "bg-white border-slate-100 text-slate-700 group-hover:border-indigo-100 group-hover:text-indigo-600")}>
                                                {row.product}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.15em]",
                                                row.channel === 'Facebook Ads' ? (isDark ? 'text-blue-400' : 'text-blue-600') :
                                                    row.channel === 'Google Ads' ? (isDark ? 'text-rose-400' : 'text-rose-500') : (isDark ? 'text-slate-600' : 'text-slate-500')
                                            )}>
                                                {row.channel}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-xs font-black">{row.orders}</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-xs font-black font-mono tracking-tighter">{formatCurrency(row.revenue)}</td>
                                        <td className={cn("px-8 py-5 whitespace-nowrap text-xs font-bold font-mono italic", isDark ? "text-slate-700" : "text-slate-300")}>{formatCurrency(row.cost)}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1.5">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className={cn("w-4 h-4 rounded-full border-2", isDark ? "border-slate-800 bg-slate-700" : "border-white bg-slate-200")} />
                                                    ))}
                                                </div>
                                                <span className={cn("text-[10px] font-black uppercase tracking-tighter", isDark ? "text-slate-600" : "text-slate-400")}>+{row.customers}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={cn("p-8 bg-slate-900/10 flex items-center justify-between", isDark ? "bg-slate-900/20" : "bg-slate-50/20")}>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-700" : "text-slate-400")}>Active Asset Count: {filteredData.length}</p>
                        <div className="flex gap-4">
                            <button className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 border shadow-sm", isDark ? "bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50")}>Prev</button>
                            <button className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 text-white shadow-lg", isDark ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100")}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
