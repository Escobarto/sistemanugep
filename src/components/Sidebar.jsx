import React from 'react';
import { 
  LayoutDashboard, BookOpen, Box, GalleryVerticalEnd, 
  Truck, Stethoscope, PlusCircle, BarChart3, History, 
  LogIn, Landmark 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, currentUser, onLogout, setIsEditing, resetForm }) => {
  
  // Função auxiliar para renderizar botões de menu
  const MenuButton = ({ id, icon: Icon, label, colorClass, activeColor }) => (
    <button 
      onClick={() => {
        setActiveTab(id);
        if (id === 'add' && resetForm) resetForm(); // Reseta form se for criar novo
      }} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all 
        ${activeTab === id 
          ? `${activeColor} text-white shadow-md` 
          : `hover:${activeColor.replace('bg-', 'bg-')}/50 hover:text-white` // Ajuste simples para hover
        }`}
    >
      <Icon size={18} className={activeTab === id ? "text-white" : colorClass}/> 
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 shadow-xl no-print z-20 h-screen">
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg text-white">
          <Landmark size={24} />
        </div>
        <div>
          <span className="block text-xl font-bold text-white tracking-tight">NUGEP</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400">Patrimônio & Museus</span>
        </div>
      </div>
      
      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <MenuButton id="dashboard" icon={LayoutDashboard} label="Painel Geral" colorClass="text-blue-300" activeColor="bg-blue-700" setActiveTab={setActiveTab} activeTab={activeTab} />
        
        <div className="pt-4 pb-1 px-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gestão do Acervo</div>
        <MenuButton id="collection" icon={BookOpen} label="Acervo" colorClass="text-green-500" activeColor="bg-green-700" setActiveTab={setActiveTab} activeTab={activeTab} />
        <MenuButton id="spaces" icon={Box} label="Espaços & Inventário" colorClass="text-purple-400" activeColor="bg-purple-700" setActiveTab={setActiveTab} activeTab={activeTab} />
        <MenuButton id="exhibitions" icon={GalleryVerticalEnd} label="Exposições" colorClass="text-blue-400" activeColor="bg-blue-600" setActiveTab={setActiveTab} activeTab={activeTab} />
        <MenuButton id="movements" icon={Truck} label="Movimentação" colorClass="text-yellow-500" activeColor="bg-yellow-600" setActiveTab={setActiveTab} activeTab={activeTab} />
        <MenuButton id="conservation" icon={Stethoscope} label="Conservação" colorClass="text-red-500" activeColor="bg-red-700" setActiveTab={setActiveTab} activeTab={activeTab} />
        
        <div className="pt-4 pb-1 px-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Operacional</div>
        <MenuButton id="add" icon={PlusCircle} label="Cadastrar Ficha" colorClass="text-orange-500" activeColor="bg-orange-600" setActiveTab={setActiveTab} activeTab={activeTab} />
        <MenuButton id="analysis" icon={BarChart3} label="Análise & IA" colorClass="text-indigo-400" activeColor="bg-indigo-600" setActiveTab={setActiveTab} activeTab={activeTab} />
        <MenuButton id="audit" icon={History} label="Auditoria" colorClass="text-slate-400" activeColor="bg-slate-700" setActiveTab={setActiveTab} activeTab={activeTab} />
      </nav>

      {/* Footer do Usuário */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center gap-3 mb-3 px-1">
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
             {currentUser?.name?.substring(0,2).toUpperCase() || 'US'}
           </div>
           <div className="overflow-hidden">
             <p className="text-xs text-white font-medium truncate">{currentUser?.name}</p>
             <p className="text-[10px] text-slate-400 truncate">{currentUser?.role}</p>
           </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-200 rounded-lg text-xs transition-colors">
          <LogIn size={12} className="rotate-180"/> Encerrar Sessão
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
