import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subMonths, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatCard = ({ title, value, icon, trend, trendValue }: any) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
      {trend && (
        <span className={`text-sm font-medium flex items-center ${
          trend === 'up' ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}
        </span>
      )}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at, number, customers(name)')
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
        
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
        
      let totalRevenue = 0;
      let totalOrders = 0;
      const monthlyData: Record<string, number> = {};
      
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthName = format(d, 'MMM', { locale: ptBR });
        monthlyData[monthName] = 0;
      }
      
      const validOrders = orders?.filter(o => o.status !== 'canceled') || [];
      totalOrders = validOrders.length;
      
      validOrders.forEach(order => {
        totalRevenue += order.total_amount || 0;
        
        const orderDate = new Date(order.created_at);
        if (isAfter(orderDate, subMonths(new Date(), 6))) {
           const monthName = format(orderDate, 'MMM', { locale: ptBR });
           if (monthlyData[monthName] !== undefined) {
             monthlyData[monthName] += order.total_amount || 0;
           }
        }
      });
      
      const formattedChartData = Object.entries(monthlyData).map(([name, vendas]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        vendas
      }));
      
      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: customersCount || 0,
        products: productsCount || 0
      });
      setChartData(formattedChartData);
      setRecentOrders(orders?.slice(0, 5) || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)} 
          icon={<TrendingUp size={24} />} 
        />
        <StatCard 
          title="Pedidos" 
          value={stats.orders.toString()} 
          icon={<ShoppingBag size={24} />} 
        />
        <StatCard 
          title="Clientes" 
          value={stats.customers.toString()} 
          icon={<Users size={24} />} 
        />
        <StatCard 
          title="Produtos Ativos" 
          value={stats.products.toString()} 
          icon={<Package size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Faturamento Mensal</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Carregando gráfico...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`R$ ${value}`, 'Faturamento']}
                />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVendas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Últimos Pedidos</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500 text-center py-4">Carregando...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum pedido recente.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.number} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pedido #{order.number}</p>
                    <p className="text-xs text-slate-500">{order.customers?.name || 'Cliente Oculto'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}</p>
                    <p className={`text-xs font-medium ${
                      order.status === 'delivered' || order.status === 'paid' ? 'text-emerald-600' :
                      order.status === 'canceled' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {order.status === 'pending' ? 'Pendente' : 
                       order.status === 'paid' ? 'Pago' : 
                       order.status === 'processing' ? 'Processando' : 
                       order.status === 'shipped' ? 'Enviado' : 
                       order.status === 'delivered' ? 'Entregue' : 
                       order.status === 'canceled' ? 'Cancelado' : order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
