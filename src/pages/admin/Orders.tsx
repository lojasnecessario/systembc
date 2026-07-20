import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Eye, ShoppingBag, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  number: number;
  customer_id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  customers: {
    name: string;
    email: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  pending: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Pago', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Em Separação', color: 'bg-purple-100 text-purple-800', icon: ShoppingBag },
  shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selected Order for viewing details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(name, email)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      await supabase.from('activity_logs').insert([{ 
        action: 'updated_order_status', 
        entity_type: 'order', 
        entity_id: id, 
        details: { status: newStatus } 
      }]);
      
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      alert(`Erro ao atualizar status: ${error.message}`);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.number.toString().includes(search) || 
    o.customers?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nº do pedido ou cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Pedido</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Carregando pedidos...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <ShoppingBag size={32} className="mx-auto text-slate-300 mb-2" />
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = statusConfig[order.status] || statusConfig['pending'];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        #{order.number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{order.customers?.name}</div>
                        <div className="text-xs text-slate-500">{order.customers?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Order details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Pedido #{selectedOrder.number}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Feito em {format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Cliente</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="font-medium text-slate-900">{selectedOrder.customers?.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{selectedOrder.customers?.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Atualizar Status</h3>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="pending">Aguardando Pagamento</option>
                    <option value="paid">Pago</option>
                    <option value="processing">Em Separação</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* TODO: Listagem de Itens (requer join com order_items) - a ser feito nas próximas iterações */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Resumo do Pedido</h3>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Método de Pagamento</span>
                  <span className="font-medium uppercase text-sm">{selectedOrder.payment_method}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-t border-slate-200 mt-2">
                  <span className="text-base font-bold text-slate-900">Total do Pedido</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
