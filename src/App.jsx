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
  KeyRound, Pencil, FileInput, List, Box, Grid, UserCheck
} from 'lucide-react';

// --- IMPORTAÇÕES MODULARIZADAS ---
import { auth, db } from './services/firebase';
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';

import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, serverTimestamp, setDoc, getDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const appId = 'nugep-oficial'; 
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

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

  // Configurações Públicas
  const [publicSettings, setPublicSettings] = useState({
    showLocation: false, showProvenance: false, showRegNumber: false, showCondition: false, showAcquisition: false
  });

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [detailTab, setDetailTab] = useState('geral');
  const fileInputRef = useRef(null); 

  const [isEditing, setIsEditing] = useState(false);
  
  // Movimentação
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({ 
      artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', 
      date: new Date().toISOString().slice(0,10)
  });

  // Conservação e Exposições
  const [selectedForConservation, setSelectedForConservation] = useState([]);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [newExhibition, setNewExhibition] = useState({ name: '', startDate: '', endDate: '', location: '', curator: '' });
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);
  const [editingExhibitionId, setEditingExhibitionId] = useState(null);

  // Espaços
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('Reserva Técnica');
  const [newLocationResponsible, setNewLocationResponsible] = useState('');
  const [editingLocationId, setEditingLocationId] = useState(null);

  // IA
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [tempCustomField, setTempCustomField] = useState({ label: '', value: '' });

  const initialArtifactState = { 
    regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '',
    image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '', exhibitionHistory: []
  };
  const [newArtifact, setNewArtifact] = useState(initialArtifactState);

  // --- Listeners do Firebase ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { setFirebaseUser(user); });
    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    if (!firebaseUser) return;

    const loadSettings = async () => {
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings_visibility');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setPublicSettings(docSnap.data());
        } catch (e) { console.error("Erro config", e); }
    };
    loadSettings();

    const unsubArtifacts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), (snapshot) => {
        setArtifacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLocations = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), (snapshot) => {
        const locs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        locs.sort((a,b) => a.name.localeCompare(b.name));
        setLocations(locs);
    });

    const unsubExhibitions = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'exhibitions'), (snapshot) => {
        setExhibitions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
            timestamp: serverTimestamp(), user: currentUser ? currentUser.name : 'Sistema', 
            role: currentUser ? currentUser.role : 'System', action, details 
        });
    } catch (e) { console.error("Erro log", e); }
  };

  const handleSaveSettings = async () => {
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings_visibility'), publicSettings);
        addLog("CONFIG", "Atualizou privacidade da Galeria Pública");
        alert("Configurações atualizadas!");
    } catch (e) { alert("Erro ao salvar."); }
  };

  const handleUserLogin = (user) => { setCurrentUser(user); };
  useEffect(() => { if (currentUser) addLog("LOGIN", "Usuário acessou o sistema"); }, [currentUser]);
  
  const callGemini = async (prompt, jsonMode = false) => {
    if (!apiKey) { alert("ERRO: Chave API Gemini ausente."); return null; }
    try {
      const response = await fetch(GEMINI_API_URL, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined }) 
      });
      if (!response.ok) throw new Error("Erro HTTP");
      const data = await response.json(); 
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) { console.error(error); alert("Erro IA: " + error.message); return null; }
  };

  const exportToCSV = () => {
    addLog("EXPORT", "Exportou planilha completa");
    const headers = ["ID", "Nº Registro", "Título", "Artista", "Ano", "Tipo", "Status", "Localização", "Exposições (Histórico)"];
    const csvContent = [headers.join(","), ...artifacts.map(a => [
      a.id, `"${a.regNumber}"`, `"${a.title}"`, `"${a.artist}"`, a.year, a.type, a.status, `"${a.location}"`, 
      `"${a.exhibitionHistory ? a.exhibitionHistory.map(ex => ex.name).join('; ') : ''}"`
    ].join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })); link.download = `nugep_acervo.csv`; link.click();
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const lines = e.target.result.split('\n').slice(1).filter(l => l.trim());
      let count = 0;
      for (const line of lines) {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), {
          regNumber: cols[0] || `IMP-${Date.now()}-${count}`, title: cols[1] || 'Sem Título', artist: cols[2] || 'Desconhecido',
          year: cols[3] || 'S/D', type: cols[4] || 'Outros', status: cols[5] || 'Armazenado', location: cols[6] || 'Reserva Técnica',
          createdBy: currentUser.name, createdAt: new Date().toISOString(), movements: []
        });
        count++;
      }
      alert(`Importação concluída: ${count} itens.`);
    };
    reader.readAsText(file);
  };

  const calculateArtifactStatus = (artifact) => {
    const today = new Date().toISOString().slice(0,10);
    const activeEx = artifact.exhibitionHistory?.filter(ex => ex.endDate >= today).pop();
    return activeEx ? { status: 'Exposto', location: activeEx.location, exhibition: activeEx.name } : { status: 'Armazenado', location: 'Reserva Técnica A', exhibition: '' };
  };

  const handleSaveExhibition = async (e) => {
    e.preventDefault();
    try {
        if (editingExhibitionId) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exhibitions', editingExhibitionId), newExhibition);
        else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exhibitions'), newExhibition);
        setIsExhibitionModalOpen(false); setNewExhibition({ name: '', startDate: '', endDate: '', location: '', curator: '' }); setEditingExhibitionId(null);
    } catch (err) { alert("Erro ao salvar."); }
  };

  const handleEditExhibition = (ex) => {
      setNewExhibition({ name: ex.name, startDate: ex.startDate, endDate: ex.endDate, location: ex.location, curator: ex.curator });
      setEditingExhibitionId(ex.id); setIsExhibitionModalOpen(true);
  };

  const handleDeleteExhibition = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Excluir exposição "${name}"?`)) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exhibitions', id));
      addLog("EXPOSICAO", `Excluiu exposição: ${name}`);
    }
  };

  const addArtifactToExhibition = async (artifactId, exhibition) => {
      const art = artifacts.find(a => a.id === artifactId);
      if (!art) return;
      const newHistory = [...(art.exhibitionHistory || []), { id: exhibition.id, name: exhibition.name, startDate: exhibition.startDate, endDate: exhibition.endDate, location: exhibition.location }];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), { exhibitionHistory: newHistory, ...calculateArtifactStatus({...art, exhibitionHistory: newHistory}) });
  };

  const removeArtifactFromExhibition = async (artifactId, exhibitionName) => {
    const art = artifacts.find(a => a.id === artifactId);
    if (!art) return;
    const newHistory = art.exhibitionHistory.filter(h => h.name !== exhibitionName);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), { exhibitionHistory: newHistory, ...calculateArtifactStatus({...art, exhibitionHistory: newHistory}) });
  };

  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    const art = artifacts.find(a => a.id === newMovement.artifactId);
    if (!art) return;
    
    let newLocation = newMovement.to || art.location;
    let newStatus = art.status;
    if (newMovement.type.includes('Saída')) { newLocation = 'Externo'; newStatus = 'Empréstimo'; }
    if (newMovement.type.includes('Entrada')) newStatus = 'Armazenado';

    const updatedMovements = [{ ...newMovement, to: newLocation }, ...(art.movements || [])];
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), { location: newLocation, status: newStatus, movements: updatedMovements });
    
    addLog("MOVIMENTACAO", `${newMovement.type}: ${art.regNumber}`);
    setIsMovementModalOpen(false); setNewMovement({ artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', date: new Date().toISOString().slice(0,10) });
  };

  const handleSaveLocation = async (e) => {
      e.preventDefault();
      if (!newLocationName.trim()) return;
      try {
          if (editingLocationId) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', editingLocationId), { name: newLocationName, type: newLocationType, responsible: newLocationResponsible });
          else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), { name: newLocationName, type: newLocationType, responsible: newLocationResponsible, createdAt: serverTimestamp() });
          setNewLocationName(''); setNewLocationResponsible(''); setEditingLocationId(null);
      } catch (err) { console.error(err); }
  };

  const handleEditLocation = (loc) => { setNewLocationName(loc.name); setNewLocationType(loc.type); setNewLocationResponsible(loc.responsible); setEditingLocationId(loc.id); };
  const handleDeleteLocation = async (id) => { if(window.confirm("Excluir local?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', id)); };
  const handleCancelEditLocation = () => { setNewLocationName(''); setNewLocationResponsible(''); setEditingLocationId(null); };

  const moveToConservationQueue = async (queue) => {
    for (const id of selectedForConservation) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id), { conservationQueue: queue });
    setSelectedForConservation([]);
  };
  const removeFromConservationQueue = async (id) => await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id), { conservationQueue: null });
  const toggleConservationSelection = (id) => setSelectedForConservation(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleResetForm = () => { setIsEditing(false); setNewArtifact(initialArtifactState); };
  const handleEditArtifact = (art) => { setNewArtifact(art); setIsEditing(true); setActiveTab('add'); setSelectedArtifact(null); };
  const handleCancelEdit = () => { handleResetForm(); setActiveTab('collection'); };

  const handleSaveArtifact = async (e) => { 
    e.preventDefault(); 
    try {
        if (isEditing) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', newArtifact.id), newArtifact);
        else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), { ...newArtifact, createdBy: currentUser.name, createdAt: new Date().toISOString(), movements: [] });
        handleResetForm(); setActiveTab('collection');
    } catch (err) { alert("Erro ao salvar."); }
  };

  const handleDelete = async (id, title) => { 
      if (currentUser.role !== 'Administrador') return alert("Permissão negada.");
      if (window.confirm(`Excluir "${title}"?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id));
      setSelectedArtifact(null);
  };
  
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewArtifact(prev => ({ ...prev, image: reader.result })); reader.readAsDataURL(file); } };
  const handleGenerateDescription = async () => { setIsGeneratingDesc(true); const desc = await callGemini(`Descrição técnica: "${newArtifact.title}"`); if (desc) setNewArtifact(prev => ({ ...prev, description: desc })); setIsGeneratingDesc(false); };
  const handleRunAnalysis = async (e) => { e.preventDefault(); setIsAnalyzing(true); const res = await callGemini(analysisInput, true); if(res) setAnalysisResult(JSON.parse(res)); setIsAnalyzing(false); };
  const addCustomField = () => { if(tempCustomField.label){ setNewArtifact(p=>({...p, customFields:[...p.customFields, tempCustomField]})); setTempCustomField({label:'',value:''}); }};
  const removeCustomField = (i) => setNewArtifact(p=>({...p, customFields: p.customFields.filter((_,idx)=>idx!==i)}));
  const handlePrintCard = () => window.print();

  const locationCounts = {}; locations.forEach(loc => locationCounts[loc.name] = 0);
  artifacts.forEach(a => locationCounts[a.location] = (locationCounts[a.location] || 0) + 1);
  const availableLocations = locations.map(l => l.name);
  const allFilterLocations = [...new Set([...availableLocations, ...artifacts.map(a => a.location)])].sort();
  const uniqueTypes = [...new Set(artifacts.map(a => a.type))];

  const filteredArtifacts = artifacts.filter(art => (art.title?.toLowerCase().includes(searchTerm.toLowerCase()) || art.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())) && (filters.location ? art.location === filters.location : true) && (filters.type ? art.type === filters.type : true));

  if (!currentUser) return (<><style>{printStyles}</style><LoginScreen onLogin={handleUserLogin} /></>);
  if (!firebaseUser) return (<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/> Carregando...</div>);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <style>{printStyles}</style>
      
      {/* Sidebar agora recebe 'navigateToAdd' para preservar a lógica do botão 'Cadastrar'.
      */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={() => window.location.reload()} 
        navigateToAdd={() => { setActiveTab('add'); setIsEditing(false); setNewArtifact(initialArtifactState); }} 
      />

      <main className="flex-1 overflow-y-auto flex flex-col relative bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm no-print">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {activeTab === 'dashboard' ? <><LayoutDashboard className="text-blue-600"/> Painel de Gestão</> : 
             activeTab === 'collection' ? <><BookOpen className="text-green-600"/> Acervo</> :
             activeTab === 'spaces' ? <><Box className="text-purple-600"/> Espaços & Inventário</> :
             activeTab === 'exhibitions' ? <><GalleryVerticalEnd className="text-blue-600"/> Exposições</> :
             activeTab === 'add' ? <><PlusCircle className="text-orange-600"/> {isEditing ? 'Editar' : 'Cadastro'}</> :
             activeTab === 'audit' ? <><History className="text-slate-600"/> Auditoria</> :
             activeTab === 'movements' ? <><Truck className="text-yellow-600"/> Movimentação</> :
             activeTab === 'conservation' ? <><Stethoscope className="text-red-600"/> Conservação</> :
             activeTab === 'settings' ? <><ShieldCheck className="text-gray-600"/> Configurações</> :
             <><Sparkles className="text-indigo-500"/> Inteligência de Dados</>}
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-green-600" /> Ambiente Seguro - Cloud
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600"><h3>{artifacts.length}</h3><p>Fichas</p></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600"><h3>{artifacts.filter(a => a.status === 'Exposto').length}</h3><p>Expostos</p></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500"><h3>{artifacts.filter(a => a.location === 'Externo').length}</h3><p>Empréstimos</p></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600"><h3>{artifacts.filter(a => a.conservationQueue).length}</h3><p>Conservação</p></div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                 {locations.map(loc => (
                    <div key={loc.id} className="bg-slate-50 border-2 border-dashed rounded-xl p-4 text-center">
                        <span className="block font-bold text-slate-700">{loc.name}</span>
                        <span className="text-2xl font-bold">{locationCounts[loc.name] || 0}</span>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'spaces' && (
              <div className="space-y-6">
                  <form onSubmit={handleSaveLocation} className="bg-white p-6 rounded-xl border flex gap-4 items-end">
                      <div className="flex-1"><label>Nome</label><input value={newLocationName} onChange={e=>setNewLocationName(e.target.value)} className="w-full border p-2 rounded"/></div>
                      <div className="w-48"><label>Tipo</label><select value={newLocationType} onChange={e=>setNewLocationType(e.target.value)} className="w-full border p-2 rounded"><option>Reserva Técnica</option><option>Exposição</option><option>Outros</option></select></div>
                      <div className="flex-1"><label>Responsável</label><input value={newLocationResponsible} onChange={e=>setNewLocationResponsible(e.target.value)} className="w-full border p-2 rounded"/></div>
                      <button type="submit" className="bg-purple-600 text-white p-2 rounded px-4">{editingLocationId ? 'Atualizar' : 'Criar'}</button>
                      {editingLocationId && <button onClick={handleCancelEditLocation} className="text-red-500 text-sm">Cancelar</button>}
                  </form>
                  <table className="w-full bg-white rounded-xl border">
                      <thead><tr><th className="p-4 text-left">Nome</th><th className="p-4 text-left">Tipo</th><th className="p-4 text-left">Responsável</th><th className="p-4 text-center">Ações</th></tr></thead>
                      <tbody>
                          {locations.map(loc => (
                              <tr key={loc.id} className="border-t">
                                  <td className="p-4 font-bold">{loc.name}</td><td className="p-4">{loc.type}</td><td className="p-4">{loc.responsible}</td>
                                  <td className="p-4 text-center">
                                      <button onClick={()=> handleEditLocation(loc)} className="text-blue-500 mr-2"><Pencil size={16}/></button>
                                      <button onClick={()=> handleDeleteLocation(loc.id)} className="text-red-500"><Trash2 size={16}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

          {activeTab === 'collection' && (
            <div className="space-y-4">
              <div className="bg-white p-4 border rounded-xl flex gap-4 items-center">
                <Search className="text-slate-400" size={16}/>
                <input placeholder="Buscar..." className="flex-1 outline-none text-sm" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                <select className="border p-2 rounded text-sm" value={filters.location} onChange={e=>setFilters({...filters, location: e.target.value})}>
                    <option value="">Locais</option>{allFilterLocations.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={exportToCSV} className="text-green-600 border p-2 rounded hover:bg-green-50"><FileSpreadsheet size={18}/></button>
                <button onClick={()=>fileInputRef.current.click()} className="text-blue-600 border p-2 rounded hover:bg-blue-50"><FileInput size={18}/></button>
                <input type="file" hidden ref={fileInputRef} onChange={handleCSVImport} />
              </div>
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Obra</th><th className="p-4">Local</th><th className="p-4">Status</th><th className="p-4 text-right">Ações</th></tr></thead>
                  <tbody>
                    {filteredArtifacts.map(art => (
                      <tr key={art.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={()=>{setSelectedArtifact(art); setDetailTab('geral');}}>
                        <td className="p-4 font-bold">{art.title}</td><td className="p-4">{art.location}</td><td className="p-4">{art.status}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                            <button onClick={(e)=>{e.stopPropagation(); handleEditArtifact(art);}} className="text-blue-500"><Pencil size={16}/></button>
                            <button onClick={(e)=>{e.stopPropagation(); handleDelete(art.id, art.title);}} className="text-red-500"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'exhibitions' && (
              <div className="space-y-6">
                  {!selectedExhibition ? (
                      <>
                        <div className="bg-blue-50 p-6 rounded-xl flex justify-between items-center border border-blue-200">
                            <div><h2 className="text-lg font-bold text-blue-900">Exposições</h2><p className="text-sm text-blue-700">Gerencie suas mostras.</p></div>
                            <button onClick={()=>{setIsExhibitionModalOpen(true); setEditingExhibitionId(null); setNewExhibition({name:'',startDate:'',endDate:'',location:'',curator:''});}} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm flex gap-2"><Plus size={16}/> Nova Exposição</button>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {exhibitions.map(ex => (
                                <div key={ex.id} className="bg-white p-6 rounded-xl border hover:shadow-lg cursor-pointer" onClick={()=>setSelectedExhibition(ex)}>
                                    <div className="flex justify-between mb-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase">Exposição</span>
                                        <div className="flex gap-2">
                                            <button onClick={(e)=>{e.stopPropagation(); handleEditExhibition(ex);}} className="text-slate-400 hover:text-blue-500"><Pencil size={16}/></button>
                                            <button onClick={(e)=>handleDeleteExhibition(e, ex.id, ex.name)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{ex.name}</h3>
                                    <p className="text-sm text-slate-500">{ex.location} • {ex.startDate}</p>
                                </div>
                            ))}
                        </div>
                      </>
                  ) : (
                      <div className="space-y-6">
                          <button onClick={()=>setSelectedExhibition(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800"><ArrowLeft size={16}/> Voltar</button>
                          <h2 className="text-2xl font-bold">{selectedExhibition.name}</h2>
                          <div className="grid grid-cols-2 gap-6 h-[500px]">
                              <div className="bg-white border rounded-xl flex flex-col">
                                  <div className="p-4 bg-slate-50 border-b font-bold">Obras na Exposição</div>
                                  <div className="p-2 overflow-y-auto flex-1 space-y-2">
                                      {artifacts.filter(a => a.exhibitionHistory?.some(h => h.name === selectedExhibition.name)).map(art => (
                                          <div key={art.id} className="flex justify-between items-center p-2 border rounded">
                                              <span>{art.title}</span>
                                              <button onClick={()=>removeArtifactFromExhibition(art.id, selectedExhibition.name)} className="text-red-500"><MoveRight size={16}/></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              <div className="bg-white border rounded-xl flex flex-col">
                                  <div className="p-4 bg-slate-50 border-b font-bold">Acervo Disponível</div>
                                  <div className="p-2 overflow-y-auto flex-1 space-y-2">
                                      {artifacts.filter(a => !a.exhibitionHistory?.some(h => h.name === selectedExhibition.name) && a.location !== 'Externo').map(art => (
                                          <div key={art.id} className="flex justify-between items-center p-2 border rounded">
                                              <button onClick={()=>addArtifactToExhibition(art.id, selectedExhibition)} className="text-green-500"><MoveLeft size={16}/></button>
                                              <span>{art.title}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
                  {isExhibitionModalOpen && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                          <form onSubmit={handleSaveExhibition} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
                              <h3 className="font-bold text-lg">Exposição</h3>
                              <input placeholder="Nome" className="w-full border p-2 rounded" value={newExhibition.name} onChange={e=>setNewExhibition({...newExhibition, name:e.target.value})} required/>
                              <div className="grid grid-cols-2 gap-2">
                                  <input type="date" className="w-full border p-2 rounded" value={newExhibition.startDate} onChange={e=>setNewExhibition({...newExhibition, startDate:e.target.value})} required/>
                                  <input type="date" className="w-full border p-2 rounded" value={newExhibition.endDate} onChange={e=>setNewExhibition({...newExhibition, endDate:e.target.value})} required/>
                              </div>
                              <input placeholder="Local" className="w-full border p-2 rounded" value={newExhibition.location} onChange={e=>setNewExhibition({...newExhibition, location:e.target.value})} required/>
                              <input placeholder="Curador" className="w-full border p-2 rounded" value={newExhibition.curator} onChange={e=>setNewExhibition({...newExhibition, curator:e.target.value})} required/>
                              <div className="flex justify-end gap-2">
                                  <button type="button" onClick={()=>setIsExhibitionModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
                              </div>
                          </form>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'movements' && (
              <div className="space-y-6">
                  {!isMovementModalOpen ? (
                      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 flex justify-between items-center">
                          <div><h2 className="text-lg font-bold text-yellow-900">Movimentações</h2><p className="text-sm text-yellow-700">Trânsito, Empréstimos e Restauro.</p></div>
                          <button onClick={()=>setIsMovementModalOpen(true)} className="bg-yellow-600 text-white px-4 py-2 rounded font-bold text-sm flex gap-2"><Plus size={16}/> Nova Movimentação</button>
                      </div>
                  ) : (
                      <form onSubmit={handleRegisterMovement} className="bg-white p-6 rounded-xl border space-y-4">
                          <h3 className="font-bold text-lg">Registrar Movimento</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <select className="border p-2 rounded" value={newMovement.artifactId} onChange={e=>setNewMovement({...newMovement, artifactId:e.target.value})}>
                                  <option value="">Selecione a Obra...</option>
                                  {artifacts.map(a=><option key={a.id} value={a.id}>{a.regNumber} - {a.title}</option>)}
                              </select>
                              <select className="border p-2 rounded" value={newMovement.type} onChange={e=>setNewMovement({...newMovement, type:e.target.value})}>
                                  <option>Trânsito Interno</option><option>Empréstimo (Saída)</option><option>Entrada</option>
                              </select>
                          </div>
                          <input list="locs" className="w-full border p-2 rounded" placeholder="Destino..." value={newMovement.to} onChange={e=>setNewMovement({...newMovement, to:e.target.value})}/>
                          <datalist id="locs">{locations.map(l=><option key={l.id} value={l.name}/>)}</datalist>
                          <div className="flex justify-end gap-2">
                              <button type="button" onClick={()=>setIsMovementModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                              <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded">Confirmar</button>
                          </div>
                      </form>
                  )}
                  <div className="bg-white p-6 rounded-xl border">
                      <h3 className="font-bold mb-4">Histórico Recente</h3>
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50"><tr><th className="p-2">Data</th><th className="p-2">Obra</th><th className="p-2">Tipo</th><th className="p-2">Destino</th></tr></thead>
                          <tbody>
                              {artifacts.flatMap(a=>(a.movements||[]).map(m=>({...m, title:a.title}))).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10).map((m,i)=>(
                                  <tr key={i} className="border-t"><td className="p-2">{m.date}</td><td className="p-2 font-bold">{m.title}</td><td className="p-2">{m.type}</td><td className="p-2">{m.to}</td></tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'conservation' && (
              <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                      {['Urgente', 'Em Tratamento', 'Higienização'].map(q => (
                          <div key={q} className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                              <h3 className="text-xs font-bold text-slate-400 uppercase">{q}</h3>
                              <p className="text-3xl font-bold mt-2">{artifacts.filter(a => a.conservationQueue === q).length}</p>
                          </div>
                      ))}
                  </div>
                  <div className="bg-white p-6 rounded-xl border">
                      <div className="flex justify-between mb-4">
                          <h3 className="font-bold">Fila de Trabalho</h3>
                          <div className="flex gap-2">
                              <button onClick={()=>moveToConservationQueue('Urgente')} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold">Urgente</button>
                              <button onClick={()=>moveToConservationQueue('Em Tratamento')} className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-xs font-bold">Tratar</button>
                          </div>
                      </div>
                      <table className="w-full text-left text-sm">
                          <thead><tr><th className="p-2 w-10">Check</th><th className="p-2">Obra</th><th className="p-2">Condição</th><th className="p-2">Fila</th><th className="p-2">Ação</th></tr></thead>
                          <tbody>
                              {artifacts.map(a=>(
                                  <tr key={a.id} className="border-t hover:bg-slate-50">
                                      <td className="p-2"><input type="checkbox" checked={selectedForConservation.includes(a.id)} onChange={()=>toggleConservationSelection(a.id)}/></td>
                                      <td className="p-2">{a.title}</td>
                                      <td className="p-2">{a.condition}</td>
                                      <td className="p-2">{a.conservationQueue || '-'}</td>
                                      <td className="p-2"><button onClick={()=>removeFromConservationQueue(a.id)} className="text-xs text-red-500 underline">Remover</button></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleSaveArtifact} className="bg-white p-8 rounded-xl border space-y-6">
                <h2 className="text-xl font-bold">{isEditing ? 'Editar' : 'Novo Cadastro'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Nº Registro" value={newArtifact.regNumber} onChange={e=>setNewArtifact({...newArtifact, regNumber: e.target.value})} className="border p-2 rounded"/>
                    <input placeholder="Título" value={newArtifact.title} onChange={e=>setNewArtifact({...newArtifact, title: e.target.value})} className="border p-2 rounded"/>
                    <input placeholder="Artista" value={newArtifact.artist} onChange={e=>setNewArtifact({...newArtifact, artist: e.target.value})} className="border p-2 rounded"/>
                    <select value={newArtifact.location} onChange={e=>setNewArtifact({...newArtifact, location: e.target.value})} className="border p-2 rounded">
                        {locations.length ? locations.map(l=><option key={l.id}>{l.name}</option>) : <option>Reserva Técnica A</option>}
                    </select>
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded font-bold">Salvar</button>
                    {isEditing && <button onClick={handleResetForm} className="text-red-500">Cancelar</button>}
                </div>
            </form>
          )}

          {activeTab === 'audit' && (
              <div className="bg-white rounded-xl border overflow-hidden">
                  <div className="p-6 border-b flex justify-between">
                      <h2 className="font-bold text-lg">Logs de Auditoria</h2>
                      <button onClick={handlePrintCard} className="text-sm bg-slate-100 px-3 py-1 rounded">Imprimir</button>
                  </div>
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50"><tr><th className="p-3">Data</th><th className="p-3">Usuário</th><th className="p-3">Ação</th><th className="p-3">Detalhes</th></tr></thead>
                      <tbody>
                          {systemLogs.map(log=>(
                              <tr key={log.id} className="border-t">
                                  <td className="p-3">{log.timestamp.toLocaleString()}</td>
                                  <td className="p-3 font-bold">{log.user}</td>
                                  <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{log.action}</span></td>
                                  <td className="p-3 text-slate-500">{log.details}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

          {activeTab === 'settings' && (
             <div className="bg-white p-6 rounded-xl border max-w-lg mx-auto">
                 <h2 className="text-xl font-bold mb-4">Privacidade Pública</h2>
                 <div className="space-y-4">
                     <label className="flex items-center gap-3"><input type="checkbox" checked={publicSettings.showLocation} onChange={e=>setPublicSettings({...publicSettings, showLocation: e.target.checked})}/> Mostrar Localização</label>
                     <label className="flex items-center gap-3"><input type="checkbox" checked={publicSettings.showRegNumber} onChange={e=>setPublicSettings({...publicSettings, showRegNumber: e.target.checked})}/> Mostrar Nº Registro</label>
                     <button onClick={handleSaveSettings} className="bg-indigo-600 text-white w-full py-2 rounded">Salvar Configurações</button>
                 </div>
             </div>
          )}

          {activeTab === 'analysis' && (
             <div className="max-w-3xl mx-auto space-y-6">
                 <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl text-white">
                     <h2 className="text-2xl font-bold mb-4">Análise IA</h2>
                     <div className="flex gap-2">
                         <input value={analysisInput} onChange={e=>setAnalysisInput(e.target.value)} className="flex-1 rounded p-2 text-black" placeholder="Ex: Analise o estado de conservação..."/>
                         <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="bg-white text-indigo-600 px-4 py-2 rounded font-bold">{isAnalyzing ? '...' : 'Analisar'}</button>
                     </div>
                 </div>
                 {analysisResult && (
                     <div className="bg-white p-6 rounded-xl border">
                         <p className="whitespace-pre-wrap text-slate-700">{analysisResult.text}</p>
                     </div>
                 )}
             </div>
          )}
        </div>
        
        {/* MODAL GERAL DE DETALHES */}
        {selectedArtifact && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={()=>setSelectedArtifact(null)}>
                <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-start bg-slate-50">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{selectedArtifact.regNumber}</span>
                            <h2 className="text-3xl font-bold text-slate-800">{selectedArtifact.title}</h2>
                            <p className="text-slate-500">{selectedArtifact.artist}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={()=>handleEditArtifact(selectedArtifact)} className="p-2 bg-blue-100 text-blue-600 rounded-full"><Pencil size={20}/></button>
                            <button onClick={()=>handleDelete(selectedArtifact.id, selectedArtifact.title)} className="p-2 bg-red-100 text-red-600 rounded-full"><Trash2 size={20}/></button>
                            <button onClick={()=>setSelectedArtifact(null)} className="p-2 bg-slate-200 text-slate-600 rounded-full"><X size={20}/></button>
                        </div>
                    </div>
                    
                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-48 bg-slate-50 border-r p-2 space-y-1">
                            {['geral','exposicoes','conservacao','historico'].map(t => (
                                <button key={t} onClick={()=>setDetailTab(t)} className={`w-full text-left px-4 py-2 rounded text-xs font-bold uppercase ${detailTab===t ? 'bg-white shadow' : 'text-slate-500'}`}>{t}</button>
                            ))}
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto">
                            {detailTab === 'geral' && (
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-slate-400 uppercase block">Localização</span>
                                            <span className="text-lg font-bold text-slate-800">{selectedArtifact.location}</span>
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-slate-400 uppercase block">Descrição</span>
                                            <p className="text-slate-600">{selectedArtifact.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {selectedArtifact.image && <img src={selectedArtifact.image} className="rounded shadow-lg max-h-64 object-contain bg-slate-100"/>}
                                    </div>
                                </div>
                            )}
                            {detailTab === 'exposicoes' && (
                                <div className="space-y-4">
                                    {selectedArtifact.exhibitionHistory?.map((ex,i)=>(
                                        <div key={i} className="border p-4 rounded bg-slate-50">
                                            <h4 className="font-bold">{ex.name}</h4>
                                            <p className="text-sm">{ex.startDate} - {ex.endDate}</p>
                                        </div>
                                    ))}
                                    {!selectedArtifact.exhibitionHistory?.length && <p>Sem histórico.</p>}
                                </div>
                            )}
                            {detailTab === 'historico' && (
                                <div className="space-y-4">
                                    {selectedArtifact.movements?.map((m,i)=>(
                                        <div key={i} className="flex gap-4 text-sm border-b pb-2">
                                            <span className="font-mono text-slate-400">{m.date}</span>
                                            <span className="font-bold">{m.type}</span>
                                            <span className="text-slate-600">{m.to}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
