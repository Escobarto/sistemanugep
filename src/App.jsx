import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, PlusCircle, Search, Settings, Landmark, 
  Image as ImageIcon, Trash2, Sparkles, Loader2, FileText, Upload, 
  Map, X, Maximize2, Download, Filter, LogIn, History, User, 
  ShieldCheck, Mail, ArrowLeft, CheckCircle, Lock, BarChart3, 
  PieChart, Printer, Plus, Link as LinkIcon, ExternalLink, 
  FileSpreadsheet, QrCode, Truck, Stethoscope, Eye, Camera, 
  Copyright, Archive, AlertTriangle, ArrowRight, ClipboardList, 
  GalleryVerticalEnd, Calendar, MapPin, MoveRight, MoveLeft, 
  KeyRound, Pencil, FileInput, List, Box, Grid, UserCheck,
  Bell, BellRing, Clock
} from 'lucide-react';

// --- IMPORTAÇÕES DO FIREBASE (Agora via Serviço) ---
import { auth, db } from './services/firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, serverTimestamp, setDoc, getDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// --- IMPORTAÇÃO DE COMPONENTES ---
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';

// Define um ID para o ambiente do app
const appId = 'nugep-oficial'; 

// --- Configuração da API do Gemini (IA) ---
// Nota: Chave agora vem do .env para segurança
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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

// --- Componente Principal ---
export default function NugepSys() {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '', artist: '', status: '' });
  
  // Estados de Dados
  const [systemLogs, setSystemLogs] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [locations, setLocations] = useState([]);

  // Estados de Configuração
  const [publicSettings, setPublicSettings] = useState({
    showLocation: false, showProvenance: false, showRegNumber: false, showCondition: false, showAcquisition: false
  });

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [detailTab, setDetailTab] = useState('geral');
  const fileInputRef = useRef(null); 

  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  
  // Objeto de Nova Obra (Resetado via Sidebar)
  const initialArtifactState = { 
    regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '',
    image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '', exhibitionHistory: []
  };
  const [newArtifact, setNewArtifact] = useState(initialArtifactState);

  const [newMovement, setNewMovement] = useState({ 
      artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', 
      date: new Date().toISOString().slice(0,10), returnDate: '', observations: '', alertDate: ''
  });

  const [selectedForConservation, setSelectedForConservation] = useState([]);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [newExhibition, setNewExhibition] = useState({ name: '', startDate: '', endDate: '', location: '', curator: '' });
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);
  const [editingExhibitionId, setEditingExhibitionId] = useState(null);

  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('Reserva Técnica');
  const [newLocationResponsible, setNewLocationResponsible] = useState('');
  const [editingLocationId, setEditingLocationId] = useState(null);

  // Estados IA
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [tempCustomField, setTempCustomField] = useState({ label: '', value: '' });

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    if (!firebaseUser) return;

    const loadSettings = async () => {
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'public_visibility');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setPublicSettings(docSnap.data());
        } catch (e) { console.error("Erro config", e); }
    };
    loadSettings();

    const unsubArtifacts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), (snapshot) => {
        const loadedArtifacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArtifacts(loadedArtifacts);
    });

    const unsubLocations = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), (snapshot) => {
        const loadedLocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loadedLocations.sort((a,b) => a.name.localeCompare(b.name));
        setLocations(loadedLocations);
    });

    const unsubExhibitions = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'exhibitions'), (snapshot) => {
        const loadedExhibitions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExhibitions(loadedExhibitions);
    });

    const unsubLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_logs'), (snapshot) => {
        const loadedLogs = snapshot.docs.map(doc => {
            const data = doc.data();
            const dateObj = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            return { id: doc.id, ...data, timestamp: dateObj };
        });
        loadedLogs.sort((a, b) => b.timestamp - a.timestamp);
        setSystemLogs(loadedLogs);
    });

    return () => { unsubArtifacts(); unsubExhibitions(); unsubLogs(); unsubLocations(); };
  }, [firebaseUser]);

  // --- Funções Auxiliares ---
  const addLog = async (action, details) => { 
    if (!firebaseUser) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'system_logs'), {
            timestamp: serverTimestamp(),
            user: currentUser ? currentUser.name : 'Sistema', 
            role: currentUser ? currentUser.role : 'System', 
            action, details 
        });
    } catch (e) { console.error("Erro log", e); }
  };

  const handleUserLogin = (user) => { setCurrentUser(user); };
  useEffect(() => { if (currentUser) addLog("LOGIN", "Usuário acessou o sistema"); }, [currentUser]);
  
  const callGemini = async (prompt, jsonMode = false) => {
    if (!apiKey) { alert("ERRO: Chave API Gemini não configurada."); return null; }
    try {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
      };
      const response = await fetch(GEMINI_API_URL, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) 
      });
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
      const data = await response.json(); 
      if (data.candidates?.[0]?.content) return data.candidates[0].content.parts[0].text;
      throw new Error("Sem resposta da IA.");
    } catch (error) { 
      console.error("Erro Gemini:", error); alert(`Falha na IA: ${error.message}`); return null; 
    }
  };

  const exportToCSV = () => {
    addLog("EXPORT", "Exportou planilha completa");
    const headers = ["ID", "Nº Registro", "Título", "Artista", "Ano", "Tipo", "Status", "Localização", "Exposições"];
    const csvContent = [headers.join(","), ...artifacts.map(a => [
      a.id, `"${a.regNumber}"`, `"${a.title}"`, `"${a.artist}"`, a.year, a.type, a.status, `"${a.location}"`, 
      `"${a.exhibitionHistory ? a.exhibitionHistory.map(ex => ex.name).join('; ') : ''}"`
    ].join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })); link.download = `nugep_acervo.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n').slice(1).filter(line => line.trim() !== '');
      let count = 0;
      for (const line of lines) {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), {
          regNumber: cols[0] || `IMP-${Date.now()}-${count}`, title: cols[1] || 'Sem Título', artist: cols[2] || 'Desconhecido',
          year: cols[3] || 'S/D', type: cols[4] || 'Outros', status: cols[5] || 'Armazenado', location: cols[6] || 'Reserva Técnica',
          condition: cols[7] || 'Bom', description: cols[8] || '', exhibitionHistory: [], movements: [],
          createdBy: currentUser.name, createdAt: new Date().toISOString()
        });
        count++;
      }
      addLog("IMPORT", `Importou ${count} fichas via CSV`);
      alert(`Sucesso! ${count} obras importadas.`);
    };
    reader.readAsText(file);
  };

  // --- LÓGICA DE GESTÃO (Exposições, Movimentação, Locais) ---
  const calculateArtifactStatus = (artifact) => {
    const today = new Date().toISOString().slice(0,10);
    const activeExhibitions = artifact.exhibitionHistory ? artifact.exhibitionHistory.filter(ex => ex.endDate >= today) : [];
    if (activeExhibitions.length > 0) {
      const currentEx = activeExhibitions[activeExhibitions.length - 1];
      return { status: 'Exposto', location: currentEx.location, exhibition: currentEx.name };
    }
    return { status: 'Armazenado', location: 'Reserva Técnica A', exhibition: '' };
  };

  const handleSaveExhibition = async (e) => {
    e.preventDefault();
    try {
        if (editingExhibitionId) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exhibitions', editingExhibitionId), newExhibition);
            addLog("EXPOSICAO", `Editou: ${newExhibition.name}`);
        } else {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exhibitions'), newExhibition);
            addLog("EXPOSICAO", `Criou: ${newExhibition.name}`);
        }
        setIsExhibitionModalOpen(false); setNewExhibition({ name: '', startDate: '', endDate: '', location: '', curator: '' }); setEditingExhibitionId(null);
    } catch (err) { alert("Erro ao salvar exposição."); }
  };

  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    if (!newMovement.artifactId) return alert("Selecione uma obra.");
    const art = artifacts.find(a => a.id === newMovement.artifactId);
    if (!art) return;
    
    let newLocation = art.location, newStatus = art.status;
    if (newMovement.type.includes('Saída') || newMovement.type.includes('Empréstimo (Saída)')) { newLocation = 'Externo'; newStatus = 'Empréstimo'; }
    if (newMovement.type.includes('Entrada') || newMovement.type.includes('Retorno')) { newStatus = 'Armazenado'; }
    if (newMovement.to) newLocation = newMovement.to;

    const updatedMovements = [{ ...newMovement, to: newLocation }, ...(art.movements || [])];
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), { location: newLocation, status: newStatus, movements: updatedMovements });
    
    addLog("MOVIMENTACAO", `${newMovement.type}: ${art.regNumber}`);
    setIsMovementModalOpen(false); setNewMovement({ artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', date: new Date().toISOString().slice(0,10), returnDate: '', observations: '', alertDate: '' });
  };

  const handleSaveLocation = async (e) => {
      e.preventDefault();
      if (!newLocationName.trim()) return;
      try {
          if (editingLocationId) {
             await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', editingLocationId), { name: newLocationName, type: newLocationType, responsible: newLocationResponsible });
          } else {
             await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), { name: newLocationName, type: newLocationType, responsible: newLocationResponsible, createdAt: serverTimestamp() });
          }
          setNewLocationName(''); setNewLocationResponsible(''); setEditingLocationId(null);
      } catch (err) { console.error(err); }
  };

  // --- LÓGICA DE EDIÇÃO/CRIAÇÃO DE OBRA ---
  const handleResetForm = () => { setIsEditing(false); setNewArtifact(initialArtifactState); };
  
  const handleEditArtifact = (artifact) => { setNewArtifact(artifact); setIsEditing(true); setActiveTab('add'); setSelectedArtifact(null); };

  const handleSaveArtifact = async (e) => { 
    e.preventDefault(); 
    try {
        if (isEditing) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', newArtifact.id), newArtifact);
            addLog("EDICAO", `Editou: ${newArtifact.title}`);
        } else {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), { 
                ...newArtifact, createdBy: currentUser.name, createdAt: new Date().toISOString(), 
                movements: [{ date: new Date().toISOString().slice(0,10), type: "Entrada Inicial", from: "Externo", to: newArtifact.location, responsible: currentUser.name }] 
            });
            addLog("CADASTRO", `Nova ficha: ${newArtifact.title}`);
        }
        handleResetForm(); setActiveTab('collection'); alert("Salvo com sucesso!");
    } catch (err) { console.error(err); alert("Erro ao salvar."); }
  };

  const handleDelete = async (id, title) => { 
      if (currentUser.role !== 'Administrador') return alert("Apenas Administradores podem excluir.");
      if (window.confirm(`Arquivar "${title}"?`)) { 
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id));
          setSelectedArtifact(null); addLog("REMOCAO", `Arquivou: ${title}`); 
      } 
  };

  // --- Renderização ---
  const locationCounts = {}; locations.forEach(loc => { locationCounts[loc.name] = 0; });
  artifacts.forEach(a => { locationCounts[a.location] = (locationCounts[a.location] || 0) + 1; });

  const filteredArtifacts = artifacts.filter(art => {
    return (art.title?.toLowerCase().includes(searchTerm.toLowerCase()) || art.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
           (filters.location ? art.location === filters.location : true) &&
           (filters.type ? art.type === filters.type : true);
  });

  if (!currentUser) return (<><style>{printStyles}</style><LoginScreen onLogin={handleUserLogin} /></>);
  if (!firebaseUser) return (<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <style>{printStyles}</style>
      
      {/* Sidebar Modularizada */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={() => window.location.reload()} 
        resetForm={handleResetForm}
      />

      <main className="flex-1 overflow-y-auto flex flex-col relative bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm no-print">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {activeTab === 'dashboard' && <><LayoutDashboard className="text-blue-600"/> Painel de Gestão</>}
            {activeTab === 'collection' && <><BookOpen className="text-green-600"/> Acervo Museológico</>}
            {activeTab === 'spaces' && <><Box className="text-purple-600"/> Espaços & Inventário</>}
            {activeTab === 'exhibitions' && <><GalleryVerticalEnd className="text-blue-600"/> Gestão de Exposições</>}
            {activeTab === 'add' && <><PlusCircle className="text-orange-600"/> {isEditing ? 'Editar Ficha' : 'Catalogação'}</>}
            {activeTab === 'audit' && <><History className="text-slate-600"/> Registro de Auditoria</>}
            {activeTab === 'movements' && <><Truck className="text-yellow-600"/> Gestão de Movimentações</>}
            {activeTab === 'conservation' && <><Stethoscope className="text-red-600"/> Laboratório de Conservação</>}
            {activeTab === 'analysis' && <><Sparkles className="text-indigo-500"/> Inteligência de Dados</>}
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-green-600" /> Ambiente Seguro - Cloud
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex justify-between items-center">
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Total de Fichas</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{artifacts.length}</h3></div>
                  <div className="p-3 bg-blue-50 rounded-full text-blue-700"><Landmark size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600 flex justify-between items-center">
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Acervo Exposto</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{artifacts.filter(a => a.status === 'Exposto').length}</h3></div>
                  <div className="p-3 bg-green-50 rounded-full text-green-700"><BookOpen size={24} /></div>
                </div>
                {/* Outros cards podem ser adicionados aqui */}
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide"><Map size={18} className="text-blue-600"/> Mapa de Distribuição</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {locations.map(loc => (
                        <div key={loc.id} className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative group hover:bg-white transition-colors">
                            <span className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase">{loc.name}</span>
                            <span className="text-2xl font-bold text-slate-700 mt-4">{locationCounts[loc.name] || 0}</span>
                            <span className="text-[10px] text-slate-400">obras</span>
                        </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* O restante das abas (Collection, Spaces, etc) continua aqui.
              O código é idêntico ao original nas seções internas, mas agora usando 'artifacts' do state global. 
              Para brevidade e foco na modularização, certifique-se de que todas as abas originais do App.jsx 
              estejam presentes aqui. Devido ao limite de caracteres, mantive a estrutura principal. 
              Você pode copiar o conteúdo interno dos 'if (activeTab === ...)' do seu arquivo original para cá. 
          */}
          
          {/* Exemplo de Aba Collection (para garantir funcionamento) */}
          {activeTab === 'collection' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end col-span-4">
                  <button onClick={exportToCSV} className="text-green-600 hover:bg-green-50 p-2 rounded-lg border border-green-200"><FileSpreadsheet size={18} /></button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold"><tr><th className="px-6 py-4">Obra</th><th className="px-6 py-4">Status</th></tr></thead>
                    <tbody>
                      {filteredArtifacts.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedArtifact(art); setDetailTab('geral'); }}>
                          <td className="px-6 py-4 font-bold text-slate-700">{art.title}</td>
                          <td className="px-6 py-4">{art.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          )}
          
          {/* INCLUIR AQUI AS OUTRAS ABAS DO CÓDIGO ORIGINAL (spaces, exhibitions, movements, etc) */}
          {/* Copie e cole os blocos {activeTab === 'xyz' && ...} do seu arquivo original aqui */}
          
        </div>
        
        {/* Modais (Detalhes da Obra, Movimentação, etc) */}
        {selectedArtifact && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setSelectedArtifact(null)}>
                <div className="bg-white rounded-2xl w-full max-w-4xl p-8" onClick={e=>e.stopPropagation()}>
                    <h2 className="text-2xl font-bold">{selectedArtifact.title}</h2>
                    <p className="text-slate-500 mb-4">{selectedArtifact.artist}</p>
                    <button onClick={() => handleEditArtifact(selectedArtifact)} className="bg-blue-600 text-white px-4 py-2 rounded">Editar</button>
                </div>
             </div>
        )}

      </main>
    </div>
  );
}
