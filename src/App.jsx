import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Search, 
  Settings, 
  Landmark, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  MessageSquare, 
  Send,
  Loader2,
  FileText,
  Upload,
  Map,
  X,
  Maximize2,
  Download,
  Filter,
  LogIn,
  History,
  User,
  ShieldCheck,
  Mail,
  ArrowLeft,
  CheckCircle,
  Lock,
  BarChart3,
  PieChart,
  Printer,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  FileSpreadsheet,
  QrCode,
  Truck,
  Stethoscope,
  Eye,
  Camera,
  Copyright,
  Archive,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  GalleryVerticalEnd,
  Calendar,
  MapPin,
  MoveRight,
  MoveLeft
} from 'lucide-react';

// --- Configuração da API do Gemini ---
const apiKey = ""; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- Estilos de Impressão (PDF) ---
const printStyles = `
  @media print {
    @page { margin: 15mm; size: A4; }
    body * { visibility: hidden; }
    #printable-area, #printable-area * { visibility: visible; }
    #printable-area { position: absolute; left: 0; top: 0; width: 100%; background: white; color: black; }
    .no-print { display: none !important; }
    .catalog-card { border: 1px solid #000; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
    .catalog-header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  }
`;

// --- Componente de Login ---
const LoginScreen = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); 
  const [formData, setFormData] = useState({ username: '', password: '', email: '', regName: '', regPassword: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleLogin = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      const role = formData.username.toLowerCase().includes('admin') ? 'Administrador' : 'Usuário';
      onLogin({ name: formData.username, role: role, loginTime: new Date() });
    } else { setError('Preencha todos os campos.'); }
  };

  const handleRegisterStart = async (e) => {
    e.preventDefault();
    if (!formData.regName || !formData.email || !formData.regPassword) { setError('Todos os campos são obrigatórios.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setIsLoading(false);
      setAuthMode('verification');
      alert(`🔐 SIMULAÇÃO DE EMAIL\n\nOlá, ${formData.regName}!\nSeu código de verificação do Nugep é: ${code}`);
    }, 1500);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (inputCode === verificationCode) {
      onLogin({ name: formData.regName, role: 'Usuário', loginTime: new Date(), email: formData.email });
    } else { setError('Código incorreto.'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header Colorido Nugep */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-500 p-1">
           <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="mx-auto bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm relative z-10 border-2 border-white/20">
              <Landmark size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white relative z-10 tracking-tight">NUGEP</h1>
            <p className="text-slate-300 text-xs uppercase tracking-widest mt-2 relative z-10 font-medium">Gestão do Patrimônio & Museus</p>
          </div>
        </div>
        
        <div className="p-8">
          {authMode === 'login' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="username" type="text" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="Usuário Institucional" value={formData.username} onChange={handleChange} /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="password" type="password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="Senha" value={formData.password} onChange={handleChange} /></div>
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button type="submit" className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-wide"><LogIn size={18} /> Acessar Sistema</button>
              </form>
              <div className="text-center pt-4 border-t border-slate-100"><button onClick={() => { setAuthMode('register'); setError(''); }} className="text-green-600 font-semibold hover:underline text-sm">Solicitar Acesso (Usuário)</button></div>
            </div>
          )}
          {authMode === 'register' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
               <button onClick={() => { setAuthMode('login'); setError(''); }} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 uppercase tracking-wide"><ArrowLeft size={14} /> Voltar</button>
              <form onSubmit={handleRegisterStart} className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="regName" type="text" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-600" placeholder="Usuário" value={formData.regName} onChange={handleChange} /></div>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="email" type="email" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-600" placeholder="Email Institucional" value={formData.email} onChange={handleChange} /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="regPassword" type="password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-600" placeholder="Definir Senha" value={formData.regPassword} onChange={handleChange} /></div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors text-sm uppercase">{isLoading ? <Loader2 className="animate-spin" /> : 'Verificar Identidade'}</button>
              </form>
            </div>
          )}
          {authMode === 'verification' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <h3 className="text-lg font-bold text-slate-800">Segurança Institucional</h3>
              <p className="text-sm text-slate-500">Insira o código enviado para <br/><strong>{formData.email}</strong></p>
              <form onSubmit={handleVerifyCode} className="space-y-6 mt-6">
                <input type="text" maxLength="6" className="w-48 text-center text-3xl font-mono py-2 border-b-2 border-green-600 outline-none mx-auto block bg-transparent" placeholder="000000" value={inputCode} onChange={(e) => { setInputCode(e.target.value.replace(/[^0-9]/g, '')); setError(''); }} />
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button type="submit" className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-700/20"><CheckCircle size={20} /> Validar Acesso</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function NugepSys() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '', artist: '', status: '' });
  const [systemLogs, setSystemLogs] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [detailTab, setDetailTab] = useState('geral');

  // Estados Movimentação
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({ artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', date: new Date().toISOString().slice(0,10) });

  // Estados Conservação
  const [selectedForConservation, setSelectedForConservation] = useState([]);

  // Estados Exposições (NOVO)
  const [exhibitions, setExhibitions] = useState([
    { id: 1, name: "Pós-Impressionismo Hoje", startDate: "2023-01-15", endDate: "2023-06-30", location: "Galeria Principal", curator: "Maria Costa" },
    { id: 2, name: "Modernismo Brasileiro", startDate: "2023-05-10", endDate: "2023-12-20", location: "Sala 2", curator: "João Silva" }
  ]);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [newExhibition, setNewExhibition] = useState({ name: '', startDate: '', endDate: '', location: '', curator: '' });
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);

  // Estados IA
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [tempCustomField, setTempCustomField] = useState({ label: '', value: '' });

  // Dados do Acervo (com queue de conservação)
  const [artifacts, setArtifacts] = useState([
    { 
      id: 1, regNumber: "P-1889-001", title: "A Noite Estrelada", artist: "Vincent van Gogh", year: 1889, type: "Pintura", 
      status: "Exposto", condition: "Bom", location: "Galeria Principal", exhibition: "Pós-Impressionismo Hoje", conservationQueue: null,
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
      description: "Uma das obras mais famosas da arte ocidental, retratando a vista da janela do quarto do asilo.",
      observations: "Vidro antirreflexo instalado em 2022.", createdBy: "Sistema", createdAt: new Date("2023-01-15").toISOString(),
      customFields: [{ label: "Seguro", value: "Allianz Art" }, { label: "Valor Estimado", value: "$100M" }],
      relatedTo: null, provenance: "Doado pela família do artista em 1950.", copyright: "Domínio Público", audioDesc: "Pintura a óleo com pinceladas espirais em azul e amarelo.",
      movements: [{ date: "2023-01-10", type: "Entrada", from: "Reserva A", to: "Galeria Principal", responsible: "João Silva" }],
      interventions: [{ date: "2022-05-20", type: "Limpeza", description: "Remoção de verniz oxidado.", responsible: "Lab. Restauro" }]
    },
    { 
      id: 2, regNumber: "E-1902-045", title: "O Pensador", artist: "Auguste Rodin", year: 1902, type: "Escultura", 
      status: "Armazenado", condition: "Bom", location: "Reserva Técnica A", exhibition: "", conservationQueue: null,
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/The_Thinker%2C_Rodin.jpg/450px-The_Thinker%2C_Rodin.jpg",
      description: "Uma escultura em bronze que retrata um homem em meditação sóbria.",
      observations: "Limpeza semestral.", createdBy: "Sistema", createdAt: new Date("2023-02-20").toISOString(),
      customFields: [{ label: "Material", value: "Bronze" }, { label: "Peso", value: "700kg" }],
      relatedTo: null, provenance: "Adquirido em leilão, 1980.", copyright: "Domínio Público", audioDesc: "Escultura de bronze de um homem sentado.",
      movements: [], interventions: []
    }
  ]);

  const [newArtifact, setNewArtifact] = useState({ 
    regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '',
    image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: ''
  });

  // --- Funções Auxiliares ---
  const addLog = (action, details) => { setSystemLogs(prev => [{ id: Date.now(), timestamp: new Date(), user: currentUser ? currentUser.name : 'Sistema', role: currentUser ? currentUser.role : 'System', action, details }, ...prev]); };
  const handleUserLogin = (user) => { setCurrentUser(user); addLog("LOGIN", "Usuário acessou o sistema"); };
  
  const callGemini = async (prompt) => {
    try {
      const response = await fetch(GEMINI_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json(); return data.candidates[0].content.parts[0].text;
    } catch (error) { console.error("Erro API:", error); return null; }
  };

  const exportToCSV = () => {
    addLog("EXPORT", "Exportou planilha completa do acervo");
    const headers = ["ID", "Nº Registro", "Título", "Artista", "Ano", "Tipo", "Status", "Localização", "Exposição"];
    const csvContent = [headers.join(","), ...artifacts.map(a => [a.id, `"${a.regNumber}"`, `"${a.title}"`, `"${a.artist}"`, a.year, a.type, a.status, `"${a.location}"`, `"${a.exhibition || ''}"`].join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })); link.download = `nugep_acervo_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // --- LÓGICA DE EXPOSIÇÕES ---
  const handleCreateExhibition = (e) => {
    e.preventDefault();
    const exhibition = { ...newExhibition, id: Date.now() };
    setExhibitions([...exhibitions, exhibition]);
    setIsExhibitionModalOpen(false);
    setNewExhibition({ name: '', startDate: '', endDate: '', location: '', curator: '' });
    addLog("EXPOSICAO", `Criou exposição: ${exhibition.name}`);
  };

  const addArtifactToExhibition = (artifactId, exhibitionName, exhibitionLocation) => {
    const updated = artifacts.map(art => {
      if (art.id === artifactId) {
        return { 
          ...art, 
          exhibition: exhibitionName, 
          status: 'Exposto', 
          location: exhibitionLocation,
          movements: [{ id: Date.now(), date: new Date().toISOString().slice(0,10), type: "Montagem Exposição", from: art.location, to: exhibitionLocation, responsible: currentUser.name }, ...art.movements]
        };
      }
      return art;
    });
    setArtifacts(updated);
    addLog("EXPOSICAO", `Adicionou obra ${artifactId} à exposição ${exhibitionName}`);
  };

  const removeArtifactFromExhibition = (artifactId) => {
    const updated = artifacts.map(art => {
      if (art.id === artifactId) {
        return { 
          ...art, 
          exhibition: '', 
          status: 'Armazenado', 
          location: 'Reserva Técnica A', // Padrão de retorno, idealmente seria dinâmico
          movements: [{ id: Date.now(), date: new Date().toISOString().slice(0,10), type: "Desmontagem Exposição", from: art.location, to: 'Reserva Técnica A', responsible: currentUser.name }, ...art.movements]
        };
      }
      return art;
    });
    setArtifacts(updated);
    addLog("EXPOSICAO", `Removeu obra ${artifactId} de exposição`);
  };

  // --- LÓGICA DE MOVIMENTAÇÃO ---
  const handleRegisterMovement = (e) => {
    e.preventDefault();
    if (!newMovement.artifactId) return alert("Selecione uma obra.");
    const updatedArtifacts = artifacts.map(art => {
      if (art.id == newMovement.artifactId) {
        let newLocation = art.location;
        let newStatus = art.status;
        if (newMovement.type === 'Trânsito Interno') newLocation = newMovement.to;
        if (newMovement.type === 'Saída' || newMovement.type === 'Empréstimo (Saída)') { newLocation = 'Externo'; newStatus = 'Empréstimo'; }
        if (newMovement.type === 'Entrada' || newMovement.type === 'Empréstimo (Entrada)') newLocation = newMovement.to;
        return { ...art, location: newLocation, status: newStatus, movements: [{ ...newMovement, id: Date.now() }, ...art.movements] };
      }
      return art;
    });
    setArtifacts(updatedArtifacts);
    addLog("MOVIMENTACAO", `${newMovement.type} da obra ID ${newMovement.artifactId}`);
    setIsMovementModalOpen(false);
    setNewMovement({ artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', date: new Date().toISOString().slice(0,10) });
    alert("Movimentação registrada com sucesso.");
  };

  // --- LÓGICA DE CONSERVAÇÃO ---
  const toggleConservationSelection = (id) => {
    if (selectedForConservation.includes(id)) setSelectedForConservation(selectedForConservation.filter(itemId => itemId !== id));
    else setSelectedForConservation([...selectedForConservation, id]);
  };

  const moveToConservationQueue = (queueName) => {
    if (selectedForConservation.length === 0) return alert("Selecione pelo menos uma obra.");
    const updatedArtifacts = artifacts.map(art => {
      if (selectedForConservation.includes(art.id)) {
        return { ...art, conservationQueue: queueName, status: queueName === 'Em Tratamento' ? 'Em Restauração' : art.status };
      }
      return art;
    });
    setArtifacts(updatedArtifacts);
    addLog("CONSERVACAO", `Moveu ${selectedForConservation.length} obras para ${queueName}`);
    setSelectedForConservation([]);
    alert(`Obras encaminhadas para: ${queueName}`);
  };

  // --- Demais Funções ---
  const handlePrintCard = () => { addLog("EXPORT_FICHA", `Imprimiu ficha: ${selectedArtifact.regNumber}`); window.print(); };
  const handleRunAnalysis = async (e) => {
    e.preventDefault(); if (!analysisInput.trim()) return; setIsAnalyzing(true);
    const context = JSON.stringify(artifacts.map(a => ({ title: a.title, year: a.year, type: a.type, status: a.status, condition: a.condition })));
    const prompt = `Analista NUGEP. Acervo JSON: ${context}. Pergunta: "${analysisInput}". JSON: {"text": "texto corrido", "chartData": [{"label": "A", "value": 10, "color": "bg-orange-500"}], "chartTitle": "Titulo"}.`;
    try { let resultText = await callGemini(prompt); resultText = resultText.replace(/```json/g, '').replace(/```/g, ''); setAnalysisResult(JSON.parse(resultText)); } catch (err) { alert("Erro ao gerar análise."); } setIsAnalyzing(false);
  };
  const addCustomField = () => { if (tempCustomField.label && tempCustomField.value) { setNewArtifact(prev => ({ ...prev, customFields: [...prev.customFields, tempCustomField] })); setTempCustomField({ label: '', value: '' }); } };
  const removeCustomField = (idx) => setNewArtifact(prev => ({ ...prev, customFields: prev.customFields.filter((_, i) => i !== idx) }));
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewArtifact(prev => ({ ...prev, image: reader.result })); reader.readAsDataURL(file); } };
  const handleAddArtifact = (e) => { e.preventDefault(); const artifact = { ...newArtifact, id: Date.now(), createdBy: currentUser.name, createdAt: new Date().toISOString(), movements: [{ date: new Date().toISOString().slice(0,10), type: "Entrada Inicial", from: "Externo", to: newArtifact.location, responsible: currentUser.name }], interventions: [] }; setArtifacts([...artifacts, artifact]); addLog("CADASTRO", `Nova ficha: ${artifact.title}`); setNewArtifact({ regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '', image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '' }); setActiveTab('collection'); alert("Ficha catalogada com sucesso!"); };
  const handleDelete = (id, title) => { if (currentUser.role !== 'Administrador') { return alert("Apenas Administradores podem arquivar."); } if (window.confirm("Arquivar?")) { setArtifacts(artifacts.filter(a => a.id !== id)); setSelectedArtifact(null); addLog("REMOCAO", `Arquivou: ${title}`); } };
  const handleGenerateDescription = async () => { if (!newArtifact.title) return alert("Preencha o título."); setIsGeneratingDesc(true); const desc = await callGemini(`Descrição técnica (PT-BR) para: "${newArtifact.title}" de "${newArtifact.artist}".`); if (desc) setNewArtifact(prev => ({ ...prev, description: desc })); setIsGeneratingDesc(false); };
  
  const uniqueLocations = [...new Set(artifacts.map(a => a.location))];
  const uniqueTypes = [...new Set(artifacts.map(a => a.type))];

  const filteredArtifacts = artifacts.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.regNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filters.location ? art.location === filters.location : true;
    const matchesType = filters.type ? art.type === filters.type : true;
    return matchesSearch && matchesLocation && matchesType;
  });
  const locationData = {}; artifacts.forEach(a => { locationData[a.location] = (locationData[a.location] || 0) + 1; });

  if (!currentUser) return (<><style>{printStyles}</style><LoginScreen onLogin={handleUserLogin} /></>);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <style>{printStyles}</style>
      
      {/* Sidebar - Nugep Theme */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 shadow-xl no-print z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg text-white"><Landmark size={24} /></div>
          <div><span className="block text-xl font-bold text-white tracking-tight">NUGEP</span><span className="text-[9px] uppercase tracking-widest text-slate-400">Patrimônio & Museus</span></div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-700 text-white shadow-md' : 'hover:bg-blue-900/50 hover:text-white'}`}>
            <LayoutDashboard size={18} className="text-blue-300"/> <span className="text-sm font-medium">Painel Geral</span>
          </button>
          
          <div className="pt-4 pb-1 px-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gestão do Acervo</div>
          <button onClick={() => setActiveTab('collection')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'collection' ? 'bg-green-700 text-white shadow-md' : 'hover:bg-green-900/50 hover:text-white'}`}>
            <BookOpen size={18} className={activeTab === 'collection' ? "text-white" : "text-green-500"}/> <span className="text-sm font-medium">Acervo</span>
          </button>
          <button onClick={() => setActiveTab('exhibitions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'exhibitions' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-900/50 hover:text-white'}`}>
            <GalleryVerticalEnd size={18} className={activeTab === 'exhibitions' ? "text-white" : "text-blue-400"}/> <span className="text-sm font-medium">Exposições</span>
          </button>
          <button onClick={() => setActiveTab('movements')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'movements' ? 'bg-yellow-600 text-white shadow-md' : 'hover:bg-yellow-900/50 hover:text-white'}`}>
            <Truck size={18} className={activeTab === 'movements' ? "text-white" : "text-yellow-500"}/> <span className="text-sm font-medium">Movimentação</span>
          </button>
          <button onClick={() => setActiveTab('conservation')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'conservation' ? 'bg-red-700 text-white shadow-md' : 'hover:bg-red-900/50 hover:text-white'}`}>
            <Stethoscope size={18} className={activeTab === 'conservation' ? "text-white" : "text-red-500"}/> <span className="text-sm font-medium">Conservação</span>
          </button>
          
          <div className="pt-4 pb-1 px-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Operacional</div>
          <button onClick={() => setActiveTab('add')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'add' ? 'bg-orange-600 text-white shadow-md' : 'hover:bg-orange-900/50 hover:text-white'}`}>
            <PlusCircle size={18} className={activeTab === 'add' ? "text-white" : "text-orange-500"}/> <span className="text-sm font-medium">Cadastrar Ficha</span>
          </button>
          <button onClick={() => setActiveTab('analysis')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-900/50 hover:text-white'}`}>
            <BarChart3 size={18} className={activeTab === 'analysis' ? "text-white" : "text-indigo-400"}/> <span className="text-sm font-medium">Análise & IA</span>
          </button>
          <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'audit' ? 'bg-slate-700 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <History size={18} className={activeTab === 'audit' ? "text-white" : "text-slate-400"}/> <span className="text-sm font-medium">Auditoria</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-3 px-1">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">{currentUser.name.substring(0,2).toUpperCase()}</div>
             <div className="overflow-hidden"><p className="text-xs text-white font-medium truncate">{currentUser.name}</p><p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p></div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-200 rounded-lg text-xs transition-colors"><LogIn size={12} className="rotate-180"/> Encerrar Sessão</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm no-print">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {activeTab === 'dashboard' && <><LayoutDashboard className="text-blue-600"/> Painel de Gestão</>}
            {activeTab === 'collection' && <><BookOpen className="text-green-600"/> Acervo Museológico</>}
            {activeTab === 'exhibitions' && <><GalleryVerticalEnd className="text-blue-600"/> Gestão de Exposições</>}
            {activeTab === 'add' && <><PlusCircle className="text-orange-600"/> Catalogação</>}
            {activeTab === 'audit' && <><History className="text-slate-600"/> Registro de Auditoria</>}
            {activeTab === 'movements' && <><Truck className="text-yellow-600"/> Gestão de Movimentações</>}
            {activeTab === 'conservation' && <><Stethoscope className="text-red-600"/> Laboratório de Conservação</>}
            {activeTab === 'analysis' && <><Sparkles className="text-indigo-500"/> Inteligência de Dados</>}
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-green-600" /> Ambiente Seguro
          </div>
        </header>

        <div className="p-8 flex-1">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex justify-between items-center">
                  <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total de Fichas</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{artifacts.length}</h3></div>
                  <div className="p-3 bg-blue-50 rounded-full text-blue-700"><Landmark size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600 flex justify-between items-center">
                  <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Acervo Exposto</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{artifacts.filter(a => a.status === 'Exposto').length}</h3></div>
                  <div className="p-3 bg-green-50 rounded-full text-green-700"><BookOpen size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex justify-between items-center">
                  <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Emprestados</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{artifacts.filter(a => a.location === 'Externo' || a.status === 'Empréstimo').length}</h3></div>
                  <div className="p-3 bg-yellow-50 rounded-full text-yellow-600"><Truck size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600 flex justify-between items-center">
                  <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Conservação</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{artifacts.filter(a => a.conservationQueue).length}</h3></div>
                  <div className="p-3 bg-red-50 rounded-full text-red-600"><AlertTriangle size={24} /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide"><Map size={18} className="text-blue-600"/> Mapa de Distribuição do Acervo</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-64">
                   <div className="md:col-span-2 md:row-span-2 bg-blue-50 border-2 border-blue-100 border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative group hover:bg-blue-100 transition-colors">
                     <span className="absolute top-2 left-3 text-[10px] font-bold text-blue-400 uppercase">Galeria Principal</span>
                     <span className="text-4xl font-bold text-blue-800">{locationData["Galeria Principal"] || 0}</span>
                     <span className="text-xs text-blue-400 mt-1">Obras</span>
                   </div>
                   <div className="bg-green-50 border-2 border-green-100 border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative hover:bg-green-100">
                     <span className="absolute top-2 left-3 text-[10px] font-bold text-green-500 uppercase">Reserva A</span>
                     <span className="text-2xl font-bold text-green-700">{locationData["Reserva Técnica A"] || 0}</span>
                   </div>
                   <div className="bg-green-50 border-2 border-green-100 border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative hover:bg-green-100">
                      <span className="absolute top-2 left-3 text-[10px] font-bold text-green-500 uppercase">Reserva B</span>
                      <span className="text-2xl font-bold text-green-700">{locationData["Reserva Técnica B"] || 0}</span>
                   </div>
                   <div className="md:col-span-2 bg-red-50 border-2 border-red-100 border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative hover:bg-red-100">
                      <span className="absolute top-2 left-3 text-[10px] font-bold text-red-500 uppercase">Laboratório de Restauro</span>
                      <span className="text-2xl font-bold text-red-700">{locationData["Laboratório de Restauro"] || 0}</span>
                      <span className="text-xs text-red-500 mt-1">Em tratamento</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* EXPOSIÇÕES (NOVO) */}
          {activeTab === 'exhibitions' && (
            <div className="space-y-6">
              {!selectedExhibition ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start justify-between shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600"><GalleryVerticalEnd size={24}/></div>
                      <div>
                        <h2 className="text-lg font-bold text-blue-900">Exposições e Mostras</h2>
                        <p className="text-sm text-blue-700 mb-2">Gerencie exposições temporárias e permanentes e as obras associadas.</p>
                      </div>
                    </div>
                    <button onClick={() => setIsExhibitionModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2">
                      <Plus size={18}/> Criar Nova Exposição
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exhibitions.map(ex => (
                      <div key={ex.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedExhibition(ex)}>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Exposição</span>
                          <GalleryVerticalEnd size={20} className="text-slate-400 group-hover:text-blue-600"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{ex.name}</h3>
                        <div className="space-y-2 text-sm text-slate-500 mb-4">
                          <p className="flex items-center gap-2"><Calendar size={14}/> {ex.startDate} - {ex.endDate}</p>
                          <p className="flex items-center gap-2"><MapPin size={14}/> {ex.location}</p>
                          <p className="flex items-center gap-2"><User size={14}/> Curadoria: {ex.curator}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600">{artifacts.filter(a => a.exhibition === ex.name).length} Obras</span>
                          <span className="text-xs text-blue-600 font-bold group-hover:underline">Gerenciar Obras →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedExhibition(null)} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft size={24}/></button>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedExhibition.name}</h2>
                      <p className="text-sm text-slate-500">{selectedExhibition.location} • {selectedExhibition.startDate} a {selectedExhibition.endDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                    {/* Lista de Obras na Exposição */}
                    <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
                      <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2"><GalleryVerticalEnd size={18}/> Obras na Exposição</h3>
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{artifacts.filter(a => a.exhibition === selectedExhibition.name).length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
                        {artifacts.filter(a => a.exhibition === selectedExhibition.name).map(art => (
                          <div key={art.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                {art.image ? <img src={art.image} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-slate-400 m-auto mt-2"/>}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{art.title}</p>
                                <p className="text-xs text-slate-500">{art.regNumber}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeArtifactFromExhibition(art.id)}
                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                              title="Remover da exposição"
                            >
                              <MoveRight size={16}/>
                            </button>
                          </div>
                        ))}
                        {artifacts.filter(a => a.exhibition === selectedExhibition.name).length === 0 && (
                          <div className="text-center p-8 text-slate-400 italic">Nenhuma obra nesta exposição.</div>
                        )}
                      </div>
                    </div>

                    {/* Lista de Obras Disponíveis */}
                    <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Archive size={18}/> Acervo Disponível</h3>
                        <div className="relative">
                          <Search size={14} className="absolute left-2 top-1.5 text-slate-400"/>
                          <input className="pl-6 pr-2 py-1 text-xs border rounded-md" placeholder="Filtrar..." />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
                        {artifacts.filter(a => !a.exhibition && a.location !== 'Externo').map(art => (
                          <div key={art.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center group opacity-80 hover:opacity-100">
                            <button 
                              onClick={() => addArtifactToExhibition(art.id, selectedExhibition.name, selectedExhibition.location)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 mr-2"
                              title="Adicionar à exposição"
                            >
                              <MoveLeft size={16}/>
                            </button>
                            <div className="flex items-center gap-3 flex-1 text-right justify-end">
                              <div>
                                <p className="text-sm font-bold text-slate-700">{art.title}</p>
                                <p className="text-xs text-slate-500">{art.artist} ({art.year})</p>
                              </div>
                              <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                {art.image ? <img src={art.image} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-slate-400 m-auto mt-2"/>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de Criação de Exposição */}
              {isExhibitionModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Nova Exposição</h2>
                    <form onSubmit={handleCreateExhibition} className="space-y-4">
                      <div><label className="text-sm font-bold text-slate-600">Nome da Exposição</label><input required className="w-full border p-2 rounded" value={newExhibition.name} onChange={e=>setNewExhibition({...newExhibition, name: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-bold text-slate-600">Data Início</label><input type="date" required className="w-full border p-2 rounded" value={newExhibition.startDate} onChange={e=>setNewExhibition({...newExhibition, startDate: e.target.value})} /></div>
                        <div><label className="text-sm font-bold text-slate-600">Data Fim</label><input type="date" required className="w-full border p-2 rounded" value={newExhibition.endDate} onChange={e=>setNewExhibition({...newExhibition, endDate: e.target.value})} /></div>
                      </div>
                      <div><label className="text-sm font-bold text-slate-600">Local</label><input required className="w-full border p-2 rounded" placeholder="Ex: Galeria Principal" value={newExhibition.location} onChange={e=>setNewExhibition({...newExhibition, location: e.target.value})} /></div>
                      <div><label className="text-sm font-bold text-slate-600">Curador Responsável</label><input required className="w-full border p-2 rounded" value={newExhibition.curator} onChange={e=>setNewExhibition({...newExhibition, curator: e.target.value})} /></div>
                      <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={()=>setIsExhibitionModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Criar Exposição</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACERVO */}
          {activeTab === 'collection' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Buscar por título, artista ou registro..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-600" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
                  <option value="">Todas Localizações</option>
                  {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-600" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                  <option value="">Todos Tipos</option>
                  {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => {setFilters({location:'', type:'', artist:'', status:''}); setSearchTerm('')}} className="text-slate-400 hover:text-red-500 text-sm font-medium flex items-center justify-center transition-colors"><X size={16}/> Limpar</button>
                <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                   <FileSpreadsheet size={16} /> Exportar
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr><th className="px-6 py-4">Obra</th><th className="px-6 py-4">Localização & Tipo</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredArtifacts.map((art) => (
                        <tr key={art.id} className="hover:bg-green-50/50 cursor-pointer group transition-colors" onClick={() => { setSelectedArtifact(art); setDetailTab('geral'); }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 relative">
                                {art.image ? <img src={art.image} alt={art.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-slate-400"/></div>}
                                {art.condition !== 'Bom' && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm group-hover:text-green-700">{art.title}</p>
                                <p className="text-xs text-slate-500">{art.artist} • {art.year}</p>
                                {art.relatedTo && <p className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit mt-1.5 flex items-center gap-1 font-medium"><LinkIcon size={8}/> Ficha Vinculada</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700">{art.location}</span>
                              <span className="text-xs text-slate-400">{art.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${art.status === 'Exposto' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {art.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedArtifact(art); setDetailTab('geral'); }} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"><Maximize2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MOVIMENTAÇÕES - Funcional */}
          {activeTab === 'movements' && (
            <div className="space-y-6">
              {!isMovementModalOpen ? (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl flex items-start justify-between shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Truck size={24}/></div>
                    <div>
                      <h2 className="text-lg font-bold text-yellow-900">Gestão de Movimentações</h2>
                      <p className="text-sm text-yellow-700 mb-2">Registre empréstimos, entradas e trânsito interno.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMovementModalOpen(true)} className="bg-yellow-600 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-yellow-700 flex items-center gap-2">
                    <Plus size={18}/> Nova Movimentação
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-lg animate-in fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Registrar Movimentação</h2>
                    <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                  </div>
                  <form onSubmit={handleRegisterMovement} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Obra</label>
                        <select className="w-full border p-2 rounded" value={newMovement.artifactId} onChange={e => setNewMovement({...newMovement, artifactId: e.target.value})}>
                          <option value="">Selecione...</option>
                          {artifacts.map(a => <option key={a.id} value={a.id}>{a.regNumber} - {a.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Movimento</label>
                        <select className="w-full border p-2 rounded" value={newMovement.type} onChange={e => setNewMovement({...newMovement, type: e.target.value})}>
                          <option>Trânsito Interno</option>
                          <option>Empréstimo (Saída)</option>
                          <option>Empréstimo (Entrada)</option>
                          <option>Saída para Restauro</option>
                          <option>Retorno de Restauro</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Data</label><input type="date" className="w-full border p-2 rounded" value={newMovement.date} onChange={e => setNewMovement({...newMovement, date: e.target.value})}/></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Origem (Atual)</label><input disabled className="w-full border p-2 rounded bg-slate-100" value={newMovement.artifactId ? artifacts.find(a=>a.id==newMovement.artifactId)?.location : ''} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Destino</label><input className="w-full border p-2 rounded" placeholder="Ex: Reserva B, MASP..." value={newMovement.to} onChange={e => setNewMovement({...newMovement, to: e.target.value})}/></div>
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Responsável</label><input className="w-full border p-2 rounded" value={newMovement.responsible} onChange={e => setNewMovement({...newMovement, responsible: e.target.value})}/></div>
                    <div className="flex justify-end gap-2 pt-4">
                      <button type="button" onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                      <button type="submit" className="px-6 py-2 bg-yellow-600 text-white rounded font-bold hover:bg-yellow-700">Confirmar Movimentação</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><History size={18}/> Histórico Recente</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs"><tr><th className="p-3">Data</th><th className="p-3">Obra</th><th className="p-3">Tipo</th><th className="p-3">Destino</th><th className="p-3">Responsável</th></tr></thead>
                    <tbody>
                      {artifacts.flatMap(a => a.movements.map(m => ({...m, artwork: a.title}))).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((m, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">{m.date}</td>
                          <td className="p-3 font-bold text-slate-700">{m.artwork}</td>
                          <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{m.type}</span></td>
                          <td className="p-3">{m.to}</td>
                          <td className="p-3 text-slate-500">{m.responsible}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CONSERVAÇÃO - Funcional */}
          {activeTab === 'conservation' && (
            <div className="space-y-6">
              {/* Cards de Status */}
              <div className="grid grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                   <h3 className="text-xs font-bold text-slate-400 uppercase">Urgentes</h3>
                   <p className="text-3xl font-bold text-red-600 mt-2">{artifacts.filter(a => a.conservationQueue === 'Urgente').length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
                   <h3 className="text-xs font-bold text-slate-400 uppercase">Em Tratamento</h3>
                   <p className="text-3xl font-bold text-amber-600 mt-2">{artifacts.filter(a => a.conservationQueue === 'Em Tratamento').length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                   <h3 className="text-xs font-bold text-slate-400 uppercase">Higienização</h3>
                   <p className="text-3xl font-bold text-blue-600 mt-2">{artifacts.filter(a => a.conservationQueue === 'Higienização').length}</p>
                 </div>
              </div>

              {/* Área de Triagem */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex gap-2 items-center"><ClipboardList className="text-red-500"/> Triagem & Encaminhamento</h3>
                    <p className="text-sm text-slate-500 mt-1">Selecione as obras para encaminhar às filas de trabalho.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => moveToConservationQueue('Urgente')} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">Encaminhar Urgente</button>
                    <button onClick={() => moveToConservationQueue('Em Tratamento')} className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200">Iniciar Tratamento</button>
                    <button onClick={() => moveToConservationQueue('Higienização')} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">Enviar Higienização</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                      <tr>
                        <th className="p-3 w-10"><input type="checkbox" onChange={(e) => {
                          if (e.target.checked) setSelectedForConservation(artifacts.map(a => a.id));
                          else setSelectedForConservation([]);
                        }}/></th>
                        <th className="p-3">Obra</th>
                        <th className="p-3">Condição Atual</th>
                        <th className="p-3">Fila Atual</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {artifacts.map(a => (
                        <tr key={a.id} className={`hover:bg-slate-50 ${selectedForConservation.includes(a.id) ? 'bg-blue-50' : ''}`}>
                          <td className="p-3"><input type="checkbox" checked={selectedForConservation.includes(a.id)} onChange={() => toggleConservationSelection(a.id)}/></td>
                          <td className="p-3 font-medium text-slate-700">{a.title} <span className="text-xs text-slate-400 block">{a.regNumber}</span></td>
                          <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${a.condition === 'Bom' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{a.condition}</span></td>
                          <td className="p-3">
                            {a.conservationQueue ? (
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                a.conservationQueue === 'Urgente' ? 'bg-red-100 text-red-800 border-red-200' :
                                a.conservationQueue === 'Em Tratamento' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                {a.conservationQueue}
                              </span>
                            ) : <span className="text-slate-400 text-xs italic">Sem fila</span>}
                          </td>
                          <td className="p-3 text-right">
                            {a.conservationQueue && (
                              <button onClick={() => {
                                const updated = artifacts.map(art => art.id === a.id ? {...art, conservationQueue: null} : art);
                                setArtifacts(updated);
                                addLog("CONSERVACAO", `Removeu ${a.title} da fila`);
                              }} className="text-slate-400 hover:text-red-500 text-xs underline">Remover da Fila</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AUDITORIA */}
          {activeTab === 'audit' && (
            <div id="audit-report" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><History size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800">Logs de Auditoria</h2>
                </div>
                <button onClick={handlePrintCard} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Printer size={16} /> Exportar PDF
                </button>
              </div>
              
              <div className="hidden print:block p-8 border-b">
                 <h1 className="text-2xl font-bold text-slate-900">Relatório de Auditoria - NUGEP</h1>
                 <p className="text-sm text-slate-500">Gerado em: {new Date().toLocaleString()}</p>
                 <p className="text-sm text-slate-500">Solicitado por: {currentUser.name}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                    <tr><th className="px-6 py-4">Data/Hora</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4">Ação</th><th className="px-6 py-4">Detalhes</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {systemLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 text-sm">
                        <td className="px-6 py-3 font-mono text-slate-500">{log.timestamp.toLocaleString()}</td>
                        <td className="px-6 py-3 font-medium text-slate-700">{log.user}</td>
                        <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action === 'LOGIN' ? 'bg-green-100 text-green-700' : log.action === 'REMOCAO' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{log.action}</span></td>
                        <td className="px-6 py-3 text-slate-600">{log.details}</td>
                      </tr>
                    ))}
                    {systemLogs.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATALOGAÇÃO */}
          {activeTab === 'add' && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Cadastrar Nova Ficha</h2>
              <form onSubmit={handleAddArtifact} className="space-y-8">
                
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Identificação & Procedência</h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nº Registro</label>
                      <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={newArtifact.regNumber} onChange={(e) => setNewArtifact({...newArtifact, regNumber: e.target.value})} />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                      <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={newArtifact.title} onChange={(e) => setNewArtifact({...newArtifact, title: e.target.value})} />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Artista / Autor</label>
                      <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={newArtifact.artist} onChange={(e) => setNewArtifact({...newArtifact, artist: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Histórico de Procedência</label>
                    <textarea rows="2" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Ex: Doado pela família em 1990..." value={newArtifact.provenance} onChange={(e) => setNewArtifact({...newArtifact, provenance: e.target.value})} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Detalhes Técnicos & Vínculos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ano</label>
                      <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={newArtifact.year} onChange={(e) => setNewArtifact({...newArtifact, year: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none" value={newArtifact.type} onChange={(e) => setNewArtifact({...newArtifact, type: e.target.value})}>
                        <option>Pintura</option><option>Escultura</option><option>Fotografia</option><option>Artefato Histórico</option><option>Documento</option>
                      </select>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Localização</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none" value={newArtifact.location} onChange={(e) => setNewArtifact({...newArtifact, location: e.target.value})}>
                        <option>Galeria Principal</option><option>Reserva Técnica A</option><option>Reserva Técnica B</option><option>Arquivo Fotográfico</option><option>Laboratório de Restauro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Estado Conservação</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none" value={newArtifact.condition} onChange={(e) => setNewArtifact({...newArtifact, condition: e.target.value})}>
                        <option>Bom</option><option>Regular</option><option>Ruim</option><option>Péssimo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-4">
                     <div className="flex-1">
                        <label className="block text-sm font-bold text-orange-900 mb-2 flex items-center gap-2"><LinkIcon size={16}/> Vincular a outra Ficha</label>
                        <select className="w-full px-4 py-2 border border-orange-200 rounded-lg bg-white outline-none text-sm" value={newArtifact.relatedTo} onChange={(e) => setNewArtifact({...newArtifact, relatedTo: e.target.value})}>
                          <option value="">-- Sem vínculo --</option>
                          {artifacts.map(a => <option key={a.id} value={a.id}>#{a.regNumber} - {a.title} ({a.type})</option>)}
                        </select>
                     </div>
                     <div className="flex-1">
                        <label className="block text-sm font-bold text-orange-900 mb-2 flex items-center gap-2"><Copyright size={16}/> Direitos Autorais</label>
                        <input type="text" className="w-full px-4 py-2 border border-orange-200 rounded-lg bg-white outline-none text-sm" placeholder="Ex: Domínio Público, Artista, Família..." value={newArtifact.copyright} onChange={(e) => setNewArtifact({...newArtifact, copyright: e.target.value})} />
                     </div>
                  </div>
                </div>

                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Mídia Digital & Acessibilidade</h3>
                   <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Upload de Imagem</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-lg hover:bg-white hover:border-orange-400 transition-all p-4 text-center cursor-pointer group bg-slate-50">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center text-slate-500 group-hover:text-orange-600">
                              <Camera size={24} className="mb-2" />
                              <span className="text-sm font-medium">Carregar Arquivo</span>
                            </div>
                        </div>
                        {newArtifact.image && <div className="mt-2 h-20 w-20 rounded border bg-white overflow-hidden shadow-sm"><img src={newArtifact.image} className="w-full h-full object-cover"/></div>}
                      </div>
                      <div className="flex-1">
                         <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Eye size={16}/> Audiodescrição (Acessibilidade)</label>
                         <textarea rows="4" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm resize-none outline-none" placeholder="Descrição visual detalhada para leitores de tela..." value={newArtifact.audioDesc} onChange={(e) => setNewArtifact({...newArtifact, audioDesc: e.target.value})} />
                      </div>
                   </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Documentação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">Descrição</label>
                            <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc || !newArtifact.title} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg flex gap-1 items-center hover:bg-orange-100 transition-colors">{isGeneratingDesc ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Gerar IA</button>
                          </div>
                          <textarea rows="4" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm resize-none outline-none" value={newArtifact.description} onChange={(e) => setNewArtifact({...newArtifact, description: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Observações Técnicas</label>
                          <textarea rows="4" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm resize-none outline-none" value={newArtifact.observations} onChange={(e) => setNewArtifact({...newArtifact, observations: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Settings size={14}/> Campos Personalizados</label>
                  <div className="flex gap-2 mb-3">
                    <input placeholder="Rótulo (ex: Material)" className="flex-1 border border-slate-200 p-2 rounded text-sm outline-none focus:border-orange-500" value={tempCustomField.label} onChange={e=>setTempCustomField({...tempCustomField, label: e.target.value})} />
                    <input placeholder="Valor (ex: Óleo sobre tela)" className="flex-1 border border-slate-200 p-2 rounded text-sm outline-none focus:border-orange-500" value={tempCustomField.value} onChange={e=>setTempCustomField({...tempCustomField, value: e.target.value})} />
                    <button type="button" onClick={addCustomField} className="bg-orange-600 text-white p-2 rounded hover:bg-orange-700 transition-colors"><Plus size={18}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newArtifact.customFields.map((field, idx) => (
                      <div key={idx} className="bg-white border px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow-sm">
                        <span className="font-bold text-slate-600">{field.label}:</span> {field.value}
                        <button type="button" onClick={() => removeCustomField(idx)} className="text-red-400 hover:text-red-600"><X size={12}/></button>
                      </div>
                    ))}
                    {newArtifact.customFields.length === 0 && <span className="text-xs text-slate-400 italic">Nenhum campo extra.</span>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveTab('collection')} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-orange-600 rounded-lg text-white hover:bg-orange-700 font-medium shadow-lg shadow-orange-600/20">Salvar Ficha</button>
                </div>
              </form>
            </div>
          )}

          {/* ANÁLISE IA */}
          {activeTab === 'analysis' && (
             <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 relative z-10"><Sparkles className="text-indigo-200"/> Análise Qualitativa</h2>
                <form onSubmit={handleRunAnalysis} className="flex gap-2 relative z-10">
                  <input value={analysisInput} onChange={(e)=>setAnalysisInput(e.target.value)} placeholder="Ex: Analise a conservação das esculturas..." className="flex-1 px-4 py-3 rounded-lg text-slate-900 outline-none shadow-lg" />
                  <button disabled={isAnalyzing} className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-colors">{isAnalyzing ? <Loader2 className="animate-spin"/> : 'Analisar'}</button>
                </form>
              </div>
              {analysisResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Resultado da Análise</h3>
                  <div className="prose prose-sm text-slate-600 mb-8 leading-relaxed whitespace-pre-line">{analysisResult.text}</div>
                  {analysisResult.chartData && analysisResult.chartData.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">{analysisResult.chartTitle || "Visualização de Dados"}</h4>
                      <div className="space-y-3">
                        {analysisResult.chartData.map((d, i)=>(
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-32 text-xs font-medium text-slate-600 truncate">{d.label}</span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${d.color || 'bg-indigo-600'}`} style={{width: `${d.value*10}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Detalhes Avançado (Tabs) */}
        {selectedArtifact && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print" onClick={()=>setSelectedArtifact(null)}>
            <div id="printable-area" className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e=>e.stopPropagation()}>
              
              {/* Header do Modal */}
              <div className="bg-slate-50 border-b p-6 flex justify-between items-start">
                <div className="catalog-header">
                  <div className="flex gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{selectedArtifact.type}</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{selectedArtifact.regNumber}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 leading-tight">{selectedArtifact.title}</h2>
                  <p className="text-lg text-slate-500 font-serif italic mt-1">{selectedArtifact.artist}, {selectedArtifact.year}</p>
                </div>
                <div className="flex gap-2 no-print">
                  <button onClick={() => alert("Gerando QR Code para: " + selectedArtifact.regNumber)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600" title="Gerar QR Code"><QrCode size={20}/></button>
                  <button onClick={handlePrintCard} className="p-2 hover:bg-slate-200 rounded-full text-slate-600" title="Imprimir Ficha"><Printer size={20}/></button>
                  <button onClick={() => setSelectedArtifact(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600"><X size={20}/></button>
                </div>
              </div>

              {/* Corpo com Tabs */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-48 bg-slate-50 border-r p-2 space-y-1 no-print">
                  {['geral', 'multimidia', 'conservacao', 'historico'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${detailTab === tab ? 'bg-white shadow-sm text-green-700 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      {tab === 'geral' ? 'Ficha Técnica' : tab === 'multimidia' ? 'Multimídia' : tab === 'conservacao' ? 'Conservação' : 'Histórico & Mov.'}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 catalog-card">
                  {detailTab === 'geral' && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="border p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase font-bold">Localização Atual</p><p className="font-bold text-slate-800">{selectedArtifact.location}</p></div>
                          <div className="border p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase font-bold">Status</p><p className="font-bold text-slate-800">{selectedArtifact.status}</p></div>
                          <div className="border p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase font-bold">Direitos Autorais</p><p className="font-bold text-slate-800">{selectedArtifact.copyright || "Não informado"}</p></div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Descrição Museológica</h4>
                          {selectedArtifact.description}
                        </div>
                      </div>
                      
                      {selectedArtifact.relatedTo && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center justify-between cursor-pointer" onClick={() => setSelectedArtifact(artifacts.find(a => a.id == selectedArtifact.relatedTo))}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded text-orange-600"><LinkIcon size={16}/></div>
                            <div><p className="text-[10px] font-bold text-orange-400 uppercase">Vinculado à Obra</p><p className="text-sm font-bold text-orange-900">{artifacts.find(a => a.id == selectedArtifact.relatedTo)?.title}</p></div>
                          </div>
                          <ExternalLink size={14} className="text-orange-400"/>
                        </div>
                      )}

                      {selectedArtifact.customFields && selectedArtifact.customFields.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Dados Específicos</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedArtifact.customFields.map((f,i) => (
                              <span key={i} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700"><b>{f.label}:</b> {f.value}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'multimidia' && (
                    <div className="animate-in fade-in">
                      <div className="bg-slate-100 rounded-xl p-8 flex items-center justify-center border border-slate-200 mb-4">
                        {selectedArtifact.image ? <img src={selectedArtifact.image} alt={selectedArtifact.title} className="max-h-[400px] object-contain shadow-lg" /> : <div className="text-slate-400 flex flex-col items-center"><ImageIcon size={48}/><span className="mt-2 text-sm">Sem imagem digitalizada</span></div>}
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Eye size={12}/> Audiodescrição</h4>
                        <p className="text-sm text-slate-600 italic">{selectedArtifact.audioDesc || "Não cadastrada."}</p>
                      </div>
                    </div>
                  )}

                  {detailTab === 'conservacao' && (
                    <div className="animate-in fade-in space-y-6">
                      <div className="flex gap-4">
                        <div className={`flex-1 p-4 rounded-xl border ${selectedArtifact.condition === 'Bom' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                          <p className="text-xs uppercase font-bold opacity-70">Estado Geral</p>
                          <p className="text-xl font-bold">{selectedArtifact.condition}</p>
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs uppercase font-bold text-slate-400">Observações Técnicas</p>
                          <p className="text-sm text-slate-700 mt-1">{selectedArtifact.observations || "Sem observações."}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Stethoscope size={16}/> Histórico de Intervenções</h4>
                        <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                          <thead className="bg-slate-50"><tr><th className="p-3">Data</th><th className="p-3">Tipo</th><th className="p-3">Responsável</th></tr></thead>
                          <tbody>
                            {selectedArtifact.interventions && selectedArtifact.interventions.length > 0 ? selectedArtifact.interventions.map((int, i) => (
                              <tr key={i} className="border-t"><td className="p-3 font-mono text-xs">{int.date}</td><td className="p-3">{int.type}</td><td className="p-3">{int.responsible}</td></tr>
                            )) : <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Nenhuma intervenção registrada.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {detailTab === 'historico' && (
                    <div className="animate-in fade-in space-y-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Procedência / Histórico</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedArtifact.provenance || "Histórico de procedência não documentado."}</p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Truck size={16}/> Movimentações</h4>
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                          {selectedArtifact.movements && selectedArtifact.movements.map((mov, i) => (
                            <div key={i} className="relative pl-6">
                              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></div>
                              <p className="text-xs font-mono text-slate-400 mb-1">{mov.date}</p>
                              <p className="text-sm font-bold text-slate-700">{mov.type}</p>
                              <p className="text-xs text-slate-500">De: {mov.from} → Para: {mov.to}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Resp: {mov.responsible}</p>
                            </div>
                          ))}
                          {(!selectedArtifact.movements || selectedArtifact.movements.length === 0) && <p className="pl-6 text-sm text-slate-400 italic">Sem movimentações.</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer do Modal */}
              <div className="bg-slate-50 border-t p-4 flex justify-end no-print">
                 <button onClick={() => handleDelete(selectedArtifact.id, selectedArtifact.title)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"><Trash2 size={16}/> Arquivar Ficha</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
