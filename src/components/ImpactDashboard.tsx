import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Scale,
  Utensils,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  Layers,
} from 'lucide-react';

interface ImpactDataPoint {
  period: string;
  meals: number;
  weightKg: number;
  donors: number;
  ngos: number;
  totalPartners: number;
}

// Monthly timeline trend data
const monthlyTrendData: ImpactDataPoint[] = [
  { period: 'Nov', meals: 2150, weightKg: 4100, donors: 210, ngos: 55, totalPartners: 265 },
  { period: 'Dec', meals: 2900, weightKg: 5450, donors: 260, ngos: 68, totalPartners: 328 },
  { period: 'Jan', meals: 3450, weightKg: 6600, donors: 315, ngos: 82, totalPartners: 397 },
  { period: 'Feb', meals: 4200, weightKg: 8100, donors: 380, ngos: 96, totalPartners: 476 },
  { period: 'Mar', meals: 5600, weightKg: 10750, donors: 440, ngos: 110, totalPartners: 550 },
  { period: 'Apr', meals: 7120, weightKg: 13500, donors: 500, ngos: 120, totalPartners: 620 },
];

// Quarterly aggregate data
const quarterlyData: ImpactDataPoint[] = [
  { period: 'Q1 2025', meals: 5800, weightKg: 11200, donors: 220, ngos: 60, totalPartners: 280 },
  { period: 'Q2 2025', meals: 8400, weightKg: 16100, donors: 310, ngos: 80, totalPartners: 390 },
  { period: 'Q3 2025', meals: 12200, weightKg: 23500, donors: 410, ngos: 105, totalPartners: 515 },
  { period: 'Q4 2025', meals: 17800, weightKg: 34200, donors: 500, ngos: 120, totalPartners: 620 },
];

// Food categories share by weight
const categoryData = [
  { name: 'Prepared Cooked Meals', value: 20370, percentage: '42%', color: '#3C8D58' },
  { name: 'Fresh Farm Produce', value: 13580, percentage: '28%', color: '#F4A259' },
  { name: 'Bakery & Grains', value: 8730, percentage: '18%', color: '#123D2B' },
  { name: 'Dairy & Chilled Goods', value: 5820, percentage: '12%', color: '#68B984' },
];

// Custom Tooltip component for Recharts with Dark & Light theme styling
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#123D2B] dark:bg-[#1A2A20] text-white p-3.5 rounded-2xl shadow-xl border border-white/15 text-xs space-y-1.5 min-w-[170px] backdrop-blur-md">
        <div className="font-bold text-[#F4A259] border-b border-white/10 pb-1 font-display">
          {label}
        </div>
        {payload.map((entry: any, index: number) => {
          const isWeight = entry.dataKey === 'weightKg';
          const isMeals = entry.dataKey === 'meals';
          const isPartners = entry.dataKey === 'totalPartners' || entry.dataKey === 'donors' || entry.dataKey === 'ngos';
          
          let unit = '';
          if (isWeight) unit = ' kg';
          else if (isMeals) unit = ' meals';
          else if (isPartners) unit = ' partners';

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-white/80">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white tabular-nums">
                {entry.value.toLocaleString()}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

interface ImpactDashboardProps {
  onOpenDonate?: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ onOpenDonate }) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');
  const [activeChartTab, setActiveChartTab] = useState<'trends' | 'partners' | 'categories'>('trends');

  const activeData = timeframe === 'monthly' ? monthlyTrendData : quarterlyData;
  const xDataKey = 'period';

  return (
    <section id="impact-dashboard" className="py-20 lg:py-28 bg-[#F2EDE0] dark:bg-[#0B140E] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123D2B]/8 dark:bg-[#1B3626] text-[#123D2B] dark:text-[#4EBE73] text-xs font-bold uppercase tracking-wider border border-[#123D2B]/10 dark:border-[#3C8D58]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#F4A259]" />
              <span>Real-Time Network Analytics</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#123D2B] dark:text-white tracking-tight text-balance">
              Impact Dashboard
            </h2>
            <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-sm sm:text-base leading-relaxed">
              Transparent, measurable data tracking food weight rescued, hot meals delivered to community
              tables, and our expanding partner ecosystem across neighborhoods.
            </p>
          </div>

          {/* Timeframe Filter Controls */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#16221A] rounded-2xl border border-[#123D2B]/10 dark:border-white/10 shadow-sm shrink-0 self-start md:self-auto">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                timeframe === 'monthly'
                  ? 'bg-[#123D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B] dark:hover:text-white'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeframe('quarterly')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                timeframe === 'quarterly'
                  ? 'bg-[#123D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B] dark:hover:text-white'
              }`}
            >
              Quarterly View
            </button>
          </div>
        </div>

        {/* 3 Marquee KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* KPI 1: Food Weight Saved */}
          <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-7 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#202820]/50 dark:text-white/45">
                Total Weight Saved
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#3C8D58]/15 dark:bg-[#4EBE73]/20 text-[#3C8D58] dark:text-[#4EBE73] flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#123D2B] dark:text-white tracking-tight tabular-nums mb-1">
              48,500 <span className="text-lg font-semibold text-[#3C8D58] dark:text-[#4EBE73]">kg</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#3C8D58] dark:text-[#4EBE73] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+28% month-over-month rescue rate</span>
            </div>
            <p className="text-[11px] text-[#202820]/60 dark:text-white/50 mt-2">
              Equivalent to 48.5 tonnes diverted from organic waste landfills.
            </p>
          </div>

          {/* KPI 2: Meals Distributed */}
          <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-7 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#202820]/50 dark:text-white/45">
                Meals Distributed
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#F4A259]/15 dark:bg-[#F4A259]/20 text-[#F4A259] flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#123D2B] dark:text-white tracking-tight tabular-nums mb-1">
              25,420 <span className="text-lg font-semibold text-[#F4A259]">+</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#F4A259] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% delivered free of cost</span>
            </div>
            <p className="text-[11px] text-[#202820]/60 dark:text-white/50 mt-2">
              Served fresh to community members, shelters, and care centers.
            </p>
          </div>

          {/* KPI 3: Active Partners */}
          <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-7 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#202820]/50 dark:text-white/45">
                Active Partners
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#123D2B]/10 dark:bg-white/10 text-[#123D2B] dark:text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#123D2B] dark:text-white tracking-tight tabular-nums mb-1">
              620 <span className="text-lg font-semibold text-[#3C8D58] dark:text-[#4EBE73]">Verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#202820]/75 dark:text-white/75 font-semibold">
              <span className="text-[#3C8D58] dark:text-[#4EBE73]">500 Food Donors</span>
              <span>·</span>
              <span className="text-[#F4A259]">120 NGO Hubs</span>
            </div>
            <p className="text-[11px] text-[#202820]/60 dark:text-white/50 mt-2">
              Spanning restaurants, hotels, corporate kitchens, and non-profits.
            </p>
          </div>
        </div>

        {/* Interactive Chart Container Card */}
        <div className="bg-white dark:bg-[#152018] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
          {/* Chart View Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#123D2B]/10 dark:border-white/10 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveChartTab('trends')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeChartTab === 'trends'
                    ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                    : 'bg-[#123D2B]/5 dark:bg-white/5 text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B] dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-[#F4A259]" />
                <span>Food Saved & Meals Distributed</span>
              </button>

              <button
                onClick={() => setActiveChartTab('partners')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeChartTab === 'partners'
                    ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                    : 'bg-[#123D2B]/5 dark:bg-white/5 text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B] dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-[#3C8D58]" />
                <span>Active Partner Network Growth</span>
              </button>

              <button
                onClick={() => setActiveChartTab('categories')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeChartTab === 'categories'
                    ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                    : 'bg-[#123D2B]/5 dark:bg-white/5 text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B] dark:hover:text-white'
                }`}
              >
                <PieIcon className="w-4 h-4 text-[#F4A259]" />
                <span>Rescue Categories Share</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#202820]/55 dark:text-white/50 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#3C8D58] dark:bg-[#4EBE73]" />
              <span>Live verified distribution data</span>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="w-full">
            {activeChartTab === 'trends' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                      Food Weight Rescued (kg) & Meal Portions Delivered
                    </h3>
                    <p className="text-xs text-[#202820]/65 dark:text-white/60">
                      Comparing the total kilograms of surplus food kept out of waste with direct meal portions served.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#3C8D58] dark:text-[#4EBE73]">
                      <span className="w-3 h-3 rounded-full bg-[#3C8D58] dark:bg-[#4EBE73]" />
                      Food Weight (kg)
                    </span>
                    <span className="flex items-center gap-1.5 text-[#F4A259]">
                      <span className="w-3 h-3 rounded-full bg-[#F4A259]" />
                      Meals Distributed
                    </span>
                  </div>
                </div>

                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3C8D58" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3C8D58" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="mealsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F4A259" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#F4A259" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 61, 43, 0.08)" vertical={false} />
                      <XAxis
                        dataKey={xDataKey}
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        className="text-[#202820]/60 dark:text-white/60"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        className="text-[#202820]/60 dark:text-white/60"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="weightKg"
                        name="Food Weight Saved"
                        stroke="#3C8D58"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#weightGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="meals"
                        name="Meals Distributed"
                        stroke="#F4A259"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#mealsGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeChartTab === 'partners' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                      Active Partner Network Breakdown
                    </h3>
                    <p className="text-xs text-[#202820]/65 dark:text-white/60">
                      Tracking commercial food donors (restaurants, hotels, retailers) and distribution non-profits (shelters, community kitchens).
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#123D2B] dark:text-white">
                      <span className="w-3 h-3 rounded-md bg-[#123D2B] dark:bg-white" />
                      Food Donors
                    </span>
                    <span className="flex items-center gap-1.5 text-[#F4A259]">
                      <span className="w-3 h-3 rounded-md bg-[#F4A259]" />
                      NGO Partners
                    </span>
                  </div>
                </div>

                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 61, 43, 0.08)" vertical={false} />
                      <XAxis
                        dataKey={xDataKey}
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        className="text-[#202820]/60 dark:text-white/60"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        className="text-[#202820]/60 dark:text-white/60"
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="donors" name="Food Donors" fill="#123D2B" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="ngos" name="NGO Partners" fill="#F4A259" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeChartTab === 'categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <h3 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
                    What Kind of Food Gets Rescued?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#202820]/75 dark:text-white/70 leading-relaxed">
                    Surplus food covers diverse nutritional profiles—from wholesome restaurant mains packed
                    with protein to fresh surplus greens from urban markets and bakeries.
                  </p>

                  <div className="space-y-3 pt-2">
                    {categoryData.map((cat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5EB] dark:bg-[#1C2A20] border border-[#123D2B]/5 dark:border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs font-bold text-[#123D2B] dark:text-white">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                          <span className="font-bold text-[#123D2B] dark:text-white">
                            {cat.value.toLocaleString()} kg
                          </span>
                          <span className="text-xs text-[#202820]/50 dark:text-white/50">
                            ({cat.percentage})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Insights Strip */}
          <div className="mt-8 pt-6 border-t border-[#123D2B]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#202820]/70 dark:text-white/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#123D2B] dark:text-[#4EBE73]">Verification Integrity:</span>
              <span>All weights verified via digital courier scale logs during pickup.</span>
            </div>
            {onOpenDonate && (
              <button
                onClick={onOpenDonate}
                className="inline-flex items-center gap-1.5 font-bold text-[#3C8D58] dark:text-[#4EBE73] hover:underline cursor-pointer"
              >
                <span>Contribute food to next month's rescue pool</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
