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

// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE (SEU PROJETO) ---
const firebaseConfig = {
  apiKey: "AIzaSyBcJGFgJqhMUSbBjOAJcUXXT2Cptl8sFDo",
  authDomain: "nugepsistema.firebaseapp.com",
  projectId: "nugepsistema",
  storageBucket: "nugepsistema.firebasestorage.app",
  messagingSenderId: "324001063842",
  appId: "1:324001063842:web:1fb9c00ed1b7dcedff08fb",
  measurementId: "G-J3SHPEQ9S1"
};

// Inicializa o Firebase com suas credenciais
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Define um ID para o ambiente do app (usado para organizar as pastas no banco)
const appId = 'nugep-oficial'; 

// --- Configuração da API do Gemini (IA) ---
// CORREÇÃO: Tenta ler do .env (Vercel) ou usa string vazia.
// Você deve configurar 'VITE_GEMINI_API_KEY' nas variáveis de ambiente do Vercel.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- CÓDIGO MESTRE DA INSTITUIÇÃO ---
const INSTITUTION_ACCESS_CODE = "NUGEP2025"; 

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
  // AJUSTE: O formData agora foca em 'email' para o login
  const [formData, setFormData] = useState({ 
    username: '', password: '', email: '', regName: '', regPassword: '', accessCode: '' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  // --- LÓGICA DE LOGIN REAL AJUSTADA ---
  const handleLogin = async (e) => { 
    e.preventDefault();
    setIsLoading(true); 
    
    try {
      // 1. Tenta login REAL no Firebase com Email e Senha
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Se deu certo, chama o onLogin do App
      const role = formData.email.includes('admin') ? 'Administrador' : 'Usuário'; 
      
      onLogin({ 
        name: user.email, 
        role: role, 
        uid: user.uid,
        loginTime: new Date() 
      });

    } catch (error) {
      console.error("Erro de Auth:", error);
      setError('Email ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validações Básicas
    if (!formData.regName || !formData.email || !formData.regPassword || !formData.accessCode) { 
      setError('Todos os campos são obrigatórios.'); 
      return; 
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    // Validação do Código da Instituição (Segurança extra)
    if (formData.accessCode !== INSTITUTION_ACCESS_CODE) {
        setError('Código de Acesso Institucional incorreto. Solicite à chefia.');
        return;
    }

    setIsLoading(true);

    try {
      // --- CRIAÇÃO REAL NO FIREBASE ---
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.regPassword);
      const user = userCredential.user;

      // Opcional: Aqui você poderia salvar o nome (regName) no perfil do usuário ou no banco de dados
      
      // Loga o usuário automaticamente no App após criar
      onLogin({ 
          name: formData.regName, // Usamos o nome digitado para exibição imediata
          role: 'Usuário', 
          uid: user.uid,
          loginTime: new Date(), 
          email: user.email 
      });
      
      alert(`Conta criada com sucesso! Bem-vindo(a), ${formData.regName}!`);

    } catch (error) {
      console.error("Erro ao registrar:", error);
      if (error.code === 'auth/email-already-in-use') {
          setError('Este e-mail já está cadastrado.');
      } else if (error.code === 'auth/weak-password') {
          setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
          setError('Erro ao criar conta: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
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
                {/* AJUSTE: Input de Email configurado corretamente */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="email" 
                    type="email" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" 
                    placeholder="Email de Acesso (ex: admin@nugep.com)" 
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="password" 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" 
                    placeholder="Senha" 
                    value={formData.password} 
                    onChange={handleChange} 
                  />
                </div>
                
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button type="submit" className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-wide"><LogIn size={18} /> Acessar Sistema</button>
              </form>
              <div className="text-center pt-4 border-t border-slate-100">
                <button onClick={() => { setAuthMode('register'); setError(''); }} className="text-green-600 font-semibold hover:underline text-sm">Novo Cadastro (Equipe)</button>
              </div>
            </div>
          )}
          
          {authMode === 'register' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
               <button onClick={() => { setAuthMode('login'); setError(''); }} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 uppercase tracking-wide"><ArrowLeft size={14} /> Voltar</button>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <p className="text-xs text-blue-800 flex items-center gap-2"><KeyRound size={14}/> Para criar uma conta, solicite o <b>Código de Acesso</b> à administração do NUGEP.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="regName" type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-600" placeholder="Nome Completo" value={formData.regName} onChange={handleChange} /></div>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="email" type="email" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-600" placeholder="Email Institucional" value={formData.email} onChange={handleChange} /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="regPassword" type="password" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-600" placeholder="Criar Senha" value={formData.regPassword} onChange={handleChange} /></div>
                
                <div className="relative pt-2">
                  <KeyRound className="absolute left-3 top-[60%] -translate-y-1/2 text-orange-500" size={18} />
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Chave de Segurança</label>
                  <input name="accessCode" type="text" className="w-full pl-10 pr-4 py-2 border-2 border-orange-100 rounded-lg outline-none text-sm focus:border-orange-500 text-orange-700 font-bold tracking-wider" placeholder="CÓDIGO DA INSTITUIÇÃO" value={formData.accessCode} onChange={handleChange} />
                </div>

                {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors text-sm uppercase mt-2 shadow-lg shadow-green-600/20">{isLoading ? <Loader2 className="animate-spin" /> : 'Validar e Cadastrar'}</button>
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
  const [firebaseUser, setFirebaseUser] = useState(null); // Auth do Firebase
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '', artist: '', status: '' });
  
  // Estados de Dados (Vindo do Firebase)
  const [systemLogs, setSystemLogs] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [locations, setLocations] = useState([]); // NOVO ESTADO PARA LOCAIS/SETORES

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [detailTab, setDetailTab] = useState('geral');
  const fileInputRef = useRef(null); 

  // Estados de Edição de Ficha
  const [isEditing, setIsEditing] = useState(false);

  // Estados Movimentação
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({ artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', date: new Date().toISOString().slice(0,10) });

  // Estados Conservação
  const [selectedForConservation, setSelectedForConservation] = useState([]);

  // Estados Exposições
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [newExhibition, setNewExhibition] = useState({ name: '', startDate: '', endDate: '', location: '', curator: '' });
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);
  const [editingExhibitionId, setEditingExhibitionId] = useState(null); // Estado para ID da exposição sendo editada

  // Estados para Gestão de Locais (NOVO)
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('Reserva Técnica');
  const [newLocationResponsible, setNewLocationResponsible] = useState(''); // NOVO: Responsável
  const [editingLocationId, setEditingLocationId] = useState(null); // NOVO: ID do local sendo editado

  // Estados IA
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [tempCustomField, setTempCustomField] = useState({ label: '', value: '' });

  const [newArtifact, setNewArtifact] = useState({ 
    regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '',
    image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '', exhibitionHistory: []
  });

  // --- FIREBASE: Inicialização e Listeners ---
  
  // 1. Monitoramento de Autenticação (CORRIGIDO)
  useEffect(() => {
    // Apenas escuta se houve login ou logout (não tenta logar forçado)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    
    // Limpa o listener ao desmontar
    return () => unsubscribe();
  }, []); // <--- Verifique se esta linha está exatamente assim

  // 2. Escutar Coleções do Firestore (Só roda após auth)
  useEffect(() => {
    if (!firebaseUser) return;

    // Listener de Artefatos
    const unsubArtifacts = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'),
      (snapshot) => {
        const loadedArtifacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArtifacts(loadedArtifacts);
      },
      (error) => {
        console.error("Erro ao carregar acervo:", error);
      }
    );

    // Listener de Locais/Setores (NOVO)
    const unsubLocations = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'locations'),
        (snapshot) => {
            const loadedLocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Ordena alfabeticamente
            loadedLocations.sort((a,b) => a.name.localeCompare(b.name));
            setLocations(loadedLocations);
        },
        (error) => console.error("Erro ao carregar locais:", error)
    );

    // Listener de Exposições
    const unsubExhibitions = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'exhibitions'),
      (snapshot) => {
        const loadedExhibitions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExhibitions(loadedExhibitions);
      },
      (error) => console.error("Erro ao carregar exposições:", error)
    );

    // Listener de Logs
    const unsubLogs = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'system_logs'),
      (snapshot) => {
        const loadedLogs = snapshot.docs.map(doc => {
            const data = doc.data();
            const dateObj = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            return { id: doc.id, ...data, timestamp: dateObj };
        });
        loadedLogs.sort((a, b) => b.timestamp - a.timestamp);
        setSystemLogs(loadedLogs);
      },
      (error) => console.error("Erro ao carregar logs:", error)
    );

    return () => {
      unsubArtifacts();
      unsubExhibitions();
      unsubLogs();
      unsubLocations();
    };
  }, [firebaseUser]);


  // --- Funções Auxiliares Modificadas para Firebase ---
  
  const addLog = async (action, details) => { 
    if (!firebaseUser) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'system_logs'), {
            timestamp: serverTimestamp(),
            user: currentUser ? currentUser.name : 'Sistema', 
            role: currentUser ? currentUser.role : 'System', 
            action, 
            details 
        });
    } catch (e) { console.error("Erro ao salvar log", e); }
  };

  const handleUserLogin = (user) => { 
    setCurrentUser(user); 
  };
  useEffect(() => {
      if (currentUser) addLog("LOGIN", "Usuário acessou o sistema");
  }, [currentUser]);
  
  // --- MODIFICADO: FUNÇÃO CALLGEMINI MAIS ROBUSTA ---
  const callGemini = async (prompt, jsonMode = false) => {
    // 1. Verifica se a chave existe antes de tentar
    if (!apiKey) {
      alert("ERRO DE CONFIGURAÇÃO: Chave da API Gemini não encontrada.\n\nSe você está no Vercel, adicione a variável de ambiente 'VITE_GEMINI_API_KEY'.");
      return null;
    }

    try {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
      };

      const response = await fetch(GEMINI_API_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });

      // 2. Verifica se a resposta HTTP foi OK (200-299)
      if (!response.ok) {
         const errorData = await response.json();
         // Tenta pegar mensagem de erro detalhada do Google ou usa status padrão
         const errorMessage = errorData.error?.message || `Erro HTTP ${response.status}`;
         throw new Error(errorMessage);
      }

      const data = await response.json(); 
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("A API não retornou nenhum candidato de texto.");
      }
    } catch (error) { 
      // 3. Exibe erro visual para o usuário
      console.error("Erro API Gemini:", error); 
      alert(`Falha na Análise IA: ${error.message}`);
      return null; 
    }
  };

  const exportToCSV = () => {
    addLog("EXPORT", "Exportou planilha completa do acervo");
    const headers = ["ID", "Nº Registro", "Título", "Artista", "Ano", "Tipo", "Status", "Localização", "Exposições (Histórico)"];
    const csvContent = [headers.join(","), ...artifacts.map(a => [
      a.id, 
      `"${a.regNumber}"`, 
      `"${a.title}"`, 
      `"${a.artist}"`, 
      a.year, 
      a.type, 
      a.status, 
      `"${a.location}"`, 
      `"${a.exhibitionHistory ? a.exhibitionHistory.map(ex => ex.name).join('; ') : ''}"`
    ].join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })); link.download = `nugep_acervo_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const dataLines = lines.slice(1).filter(line => line.trim() !== '');
      
      let count = 0;
      for (const line of dataLines) {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
        const newArt = {
          regNumber: cols[0] || `IMP-${Date.now()}-${count}`,
          title: cols[1] || 'Sem Título',
          artist: cols[2] || 'Desconhecido',
          year: cols[3] || 'S/D',
          type: cols[4] || 'Outros',
          status: cols[5] || 'Armazenado',
          location: cols[6] || 'Reserva Técnica',
          condition: cols[7] || 'Bom',
          description: cols[8] || '',
          exhibition: '',
          exhibitionHistory: [],
          conservationQueue: null,
          image: '',
          observations: 'Importado via CSV',
          createdBy: currentUser.name,
          createdAt: new Date().toISOString(),
          customFields: [],
          movements: [{ date: new Date().toISOString().slice(0,10), type: "Importação em Massa", from: "Externo", to: cols[6] || 'Reserva Técnica', responsible: currentUser.name }],
          interventions: []
        };
        
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), newArt);
        count++;
      }

      addLog("IMPORT", `Importou ${count} fichas via CSV`);
      alert(`Sucesso! ${count} novas obras foram adicionadas ao acervo.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // --- LÓGICA DE EXPOSIÇÕES (ATUALIZADA PARA EDIÇÃO) ---
  const calculateArtifactStatus = (artifact) => {
    const today = new Date().toISOString().slice(0,10);
    const activeExhibitions = artifact.exhibitionHistory ? artifact.exhibitionHistory.filter(ex => ex.endDate >= today) : [];

    if (activeExhibitions.length > 0) {
      const currentEx = activeExhibitions[activeExhibitions.length - 1];
      return {
        status: 'Exposto',
        location: currentEx.location,
        exhibition: currentEx.name
      };
    } else {
      return {
        status: 'Armazenado',
        location: 'Reserva Técnica A',
        exhibition: ''
      };
    }
  };

  // Agora função unificada para Salvar (Criar ou Editar)
  const handleSaveExhibition = async (e) => {
    e.preventDefault();
    try {
        if (editingExhibitionId) {
            // Lógica de Edição
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exhibitions', editingExhibitionId), newExhibition);
            addLog("EXPOSICAO", `Editou exposição: ${newExhibition.name}`);
        } else {
            // Lógica de Criação
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exhibitions'), newExhibition);
            addLog("EXPOSICAO", `Criou exposição: ${newExhibition.name}`);
        }
        setIsExhibitionModalOpen(false);
        setNewExhibition({ name: '', startDate: '', endDate: '', location: '', curator: '' });
        setEditingExhibitionId(null);
    } catch (err) {
        alert("Erro ao salvar exposição.");
    }
  };

  const handleEditExhibition = (ex) => {
      setNewExhibition({
          name: ex.name,
          startDate: ex.startDate,
          endDate: ex.endDate,
          location: ex.location,
          curator: ex.curator
      });
      setEditingExhibitionId(ex.id);
      setIsExhibitionModalOpen(true);
  }

  const handleDeleteExhibition = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`ATENÇÃO: Deseja excluir a exposição "${name}"?\n\nO registro será removido do histórico de todas as obras.`)) {
      
      const artifactsToUpdate = artifacts.filter(art => art.exhibitionHistory?.some(h => h.name === name));
      
      for (const art of artifactsToUpdate) {
          const newHistory = art.exhibitionHistory.filter(h => h.name !== name);
          const tempArt = { ...art, exhibitionHistory: newHistory };
          const statusUpdate = calculateArtifactStatus(tempArt);
          
          let newMovements = art.movements;
          if (statusUpdate.status === 'Armazenado' && art.status === 'Exposto') {
              newMovements = [{ 
                  date: new Date().toISOString().slice(0,10), 
                  type: "Retorno de Exposição (Excluída)", 
                  from: name, 
                  to: statusUpdate.location, 
                  responsible: currentUser.name 
              }, ...(art.movements || [])];
          }

          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), {
              exhibitionHistory: newHistory,
              movements: newMovements,
              ...statusUpdate
          });
      }

      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exhibitions', id));
      addLog("EXPOSICAO", `Excluiu a exposição: ${name}`);
    }
  };

  const addArtifactToExhibition = async (artifactId, exhibition) => {
      const art = artifacts.find(a => a.id === artifactId);
      if (!art) return;

      const alreadyIn = art.exhibitionHistory?.some(h => h.name === exhibition.name);
      if (alreadyIn) return alert("Esta obra já está registrada nesta exposição.");

      const newHistory = [...(art.exhibitionHistory || []), {
        id: exhibition.id,
        name: exhibition.name,
        startDate: exhibition.startDate,
        endDate: exhibition.endDate,
        location: exhibition.location
      }];

      const tempArt = { ...art, exhibitionHistory: newHistory };
      const statusUpdate = calculateArtifactStatus(tempArt);

      let newMovements = art.movements || [];
      if (statusUpdate.status === 'Exposto' && art.status !== 'Exposto') {
            newMovements = [{ date: new Date().toISOString().slice(0,10), type: "Montagem Exposição", from: art.location, to: exhibition.location, responsible: currentUser.name }, ...newMovements];
            alert(`Obra adicionada à exposição!\nStatus: Exposto\nLocal: ${exhibition.location}`);
      } else if (statusUpdate.status === 'Exposto' && art.status === 'Exposto') {
            if (art.location !== exhibition.location) {
              newMovements = [{ date: new Date().toISOString().slice(0,10), type: "Trânsito Entre Exposições", from: art.location, to: exhibition.location, responsible: currentUser.name }, ...newMovements];
            }
            alert("Obra adicionada ao histórico da exposição.\n(Mantém status Exposto)");
      } else {
            alert(`Obra registrada no histórico da exposição antiga "${exhibition.name}".\nStatus permanece: ${art.status} (Pois a exposição já terminou).`);
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), {
          exhibitionHistory: newHistory,
          movements: newMovements,
          ...statusUpdate
      });
      addLog("EXPOSICAO", `Adicionou obra ${art.regNumber} ao histórico da exposição ${exhibition.name}`);
  };

  const removeArtifactFromExhibition = async (artifactId, exhibitionName) => {
    const art = artifacts.find(a => a.id === artifactId);
    if (!art) return;

    const targetExName = exhibitionName || art.exhibition;
    const newHistory = art.exhibitionHistory ? art.exhibitionHistory.filter(h => h.name !== targetExName) : [];
    
    const tempArt = { ...art, exhibitionHistory: newHistory };
    const statusUpdate = calculateArtifactStatus(tempArt);

    let newMovements = art.movements || [];
    if (art.status === 'Exposto' && statusUpdate.status === 'Armazenado') {
        newMovements = [{ date: new Date().toISOString().slice(0,10), type: "Desmontagem Exposição", from: art.location, to: statusUpdate.location, responsible: currentUser.name }, ...newMovements];
    }

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), {
        exhibitionHistory: newHistory,
        movements: newMovements,
        ...statusUpdate
    });
    addLog("EXPOSICAO", `Removeu obra ${art.regNumber} da exposição ${exhibitionName || 'Atual'}`);
  };

  // --- LÓGICA DE MOVIMENTAÇÃO ---
  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    if (!newMovement.artifactId) return alert("Selecione uma obra.");
    
    const art = artifacts.find(a => a.id === newMovement.artifactId);
    if (!art) return;

    let newLocation = art.location;
    let newStatus = art.status;
    const dest = newMovement.to;

    switch (newMovement.type) {
        case 'Trânsito Interno':
        if (dest) newLocation = dest;
        break;
        case 'Empréstimo (Saída)':
        case 'Saída': 
        newLocation = 'Externo'; 
        newStatus = 'Empréstimo'; 
        break;
        case 'Empréstimo (Entrada)':
        case 'Entrada': 
        if (dest) newLocation = dest;
        newStatus = 'Armazenado'; 
        break;
        case 'Saída para Restauro':
        newLocation = 'Laboratório de Restauro'; 
        newStatus = 'Em Restauração';
        if (dest) newLocation = dest; 
        break;
        case 'Retorno de Restauro':
        if (dest) newLocation = dest;
        newStatus = 'Armazenado'; 
        break;
        default:
        if (dest) newLocation = dest;
        break;
    }

    const movementRecord = { ...newMovement, to: newLocation };
    const updatedMovements = [movementRecord, ...(art.movements || [])];

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', art.id), {
        location: newLocation,
        status: newStatus,
        movements: updatedMovements
    });

    addLog("MOVIMENTACAO", `${newMovement.type} da obra ID ${art.regNumber}`);
    setIsMovementModalOpen(false);
    setNewMovement({ artifactId: '', type: 'Trânsito Interno', from: '', to: '', responsible: '', date: new Date().toISOString().slice(0,10) });
    alert("Movimentação registrada com sucesso.");
  };

  // --- LÓGICA DE GESTÃO DE ESPAÇOS (ATUALIZADA PARA EDIÇÃO E RESPONSÁVEL) ---
  const handleSaveLocation = async (e) => {
      e.preventDefault();
      if (!newLocationName.trim()) return;
      
      try {
          if (editingLocationId) {
             // Lógica de Edição
             await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', editingLocationId), {
                name: newLocationName,
                type: newLocationType,
                responsible: newLocationResponsible, // Atualiza Responsável
                updatedAt: serverTimestamp()
             });
             addLog("ADMIN", `Editou setor: ${newLocationName}`);
          } else {
             // Lógica de Criação
             const exists = locations.some(l => l.name.toLowerCase() === newLocationName.toLowerCase());
             if (exists) return alert("Já existe um setor com este nome.");

             await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), {
                name: newLocationName,
                type: newLocationType,
                responsible: newLocationResponsible, // Salva Responsável
                createdAt: serverTimestamp()
             });
             addLog("ADMIN", `Criou novo setor: ${newLocationName}`);
          }
          // Limpa formulário
          setNewLocationName('');
          setNewLocationType('Reserva Técnica');
          setNewLocationResponsible('');
          setEditingLocationId(null);
      } catch (err) {
          console.error(err);
          alert("Erro ao salvar setor.");
      }
  };

  const handleEditLocation = (loc) => {
      setNewLocationName(loc.name);
      setNewLocationType(loc.type);
      setNewLocationResponsible(loc.responsible || '');
      setEditingLocationId(loc.id);
  }

  const handleCancelEditLocation = () => {
      setNewLocationName('');
      setNewLocationType('Reserva Técnica');
      setNewLocationResponsible('');
      setEditingLocationId(null);
  }

  const handleDeleteLocation = async (id, name) => {
      if (window.confirm(`Deseja excluir o setor "${name}"? \n\nAtenção: Obras que estiverem neste local manterão o nome do local no registro, mas ele não aparecerá mais como opção de destino.`)) {
          try {
              await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', id));
              addLog("ADMIN", `Excluiu setor: ${name}`);
          } catch(err) {
              console.error(err);
          }
      }
  }

  // --- LÓGICA DE CONSERVAÇÃO ---
  const toggleConservationSelection = (id) => {
    if (selectedForConservation.includes(id)) setSelectedForConservation(selectedForConservation.filter(itemId => itemId !== id));
    else setSelectedForConservation([...selectedForConservation, id]);
  };

  const moveToConservationQueue = async (queueName) => {
    if (selectedForConservation.length === 0) return alert("Selecione pelo menos uma obra.");
    
    for (const id of selectedForConservation) {
        const art = artifacts.find(a => a.id === id);
        if (art) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id), {
                conservationQueue: queueName,
                status: queueName === 'Em Tratamento' ? 'Em Restauração' : art.status
            });
        }
    }
    
    addLog("CONSERVACAO", `Moveu ${selectedForConservation.length} obras para ${queueName}`);
    setSelectedForConservation([]);
    alert(`Obras encaminhadas para: ${queueName}`);
  };

  const removeFromConservationQueue = async (id) => {
      const art = artifacts.find(a => a.id === id);
      if (art) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id), {
              conservationQueue: null
          });
          addLog("CONSERVACAO", `Removeu ${art.regNumber} da fila`);
      }
  };

  // --- Demais Funções ---
  const handlePrintCard = () => { addLog("EXPORT_FICHA", `Imprimiu ficha: ${selectedArtifact.regNumber}`); window.print(); };
  
  const handleRunAnalysis = async (e) => {
    e.preventDefault(); 
    if (!analysisInput.trim()) return; 
    setIsAnalyzing(true);
    
    const context = JSON.stringify(artifacts.map(a => ({ title: a.title, year: a.year, type: a.type, status: a.status, condition: a.condition })));
    
    const prompt = `
      Atue como um assistente de gestão museológica profissional.
      Adote um tom positivo, paciente, compreensivo e formal. Use linguagem clara e direta.
      
      OBJETIVO: Analisar os dados do acervo e responder à pergunta do usuário com foco em dados quantitativos e análises qualitativas sobre:
      - Quantidade total e por categorias.
      - Estado de conservação (BOM, REGULAR, RUIM, etc.).
      - Movimentações recentes e padrões de fluxo.
      - Status de empréstimos (Entradas/Saídas).

      DADOS DO ACERVO: ${context}
      PERGUNTA DO USUÁRIO: "${analysisInput}"
      
      IMPORTANTE:
      - Seja direto ao ponto.
      - Evite jargões excessivamente complexos, assumindo um entendimento básico mas profissional.
      - Se a pergunta fugir do contexto de museologia/dados, redirecione educadamente.
      
      Responda EXCLUSIVAMENTE em formato JSON seguindo este schema:
      {
        "text": "Sua resposta completa aqui (texto corrido em PT-BR, formal e calmo).",
        "chartTitle": "Título para gráfico (ex: Distribuição por Estado)",
        "chartData": [
          {"label": "Categoria", "value": 10, "color": "bg-blue-500"}
        ]
      }
    `;

    try { 
      let resultText = await callGemini(prompt, true); 
      if (resultText) {
          setAnalysisResult(JSON.parse(resultText)); 
      }
    } catch (err) { 
      console.error(err);
      // O alert já é disparado no callGemini se for erro de API, aqui pegamos erros de JSON parse
      if (!err.message.includes('API')) alert("Erro ao processar a resposta da IA.");
    } 
    setIsAnalyzing(false);
  };
  
  const addCustomField = () => { if (tempCustomField.label && tempCustomField.value) { setNewArtifact(prev => ({ ...prev, customFields: [...prev.customFields, tempCustomField] })); setTempCustomField({ label: '', value: '' }); } };
  const removeCustomField = (idx) => setNewArtifact(prev => ({ ...prev, customFields: prev.customFields.filter((_, i) => i !== idx) }));
  
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewArtifact(prev => ({ ...prev, image: reader.result })); reader.readAsDataURL(file); } };
  
  const handleEditArtifact = (artifact) => {
    setNewArtifact(artifact); 
    setIsEditing(true); 
    setActiveTab('add'); 
    setSelectedArtifact(null); 
  };

  const handleSaveArtifact = async (e) => { 
    e.preventDefault(); 
    try {
        if (isEditing) {
            const artRef = doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', newArtifact.id);
            await updateDoc(artRef, newArtifact);
            addLog("EDICAO", `Editou ficha: ${newArtifact.title}`);
            alert("Ficha atualizada com sucesso!");
        } else {
            const artifact = { 
                ...newArtifact, 
                createdBy: currentUser.name, 
                createdAt: new Date().toISOString(), 
                movements: [{ date: new Date().toISOString().slice(0,10), type: "Entrada Inicial", from: "Externo", to: newArtifact.location, responsible: currentUser.name }], 
                interventions: [] 
            }; 
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'collection_items'), artifact);
            addLog("CADASTRO", `Nova ficha: ${artifact.title}`);
            alert("Ficha catalogada com sucesso!"); 
        }
        setNewArtifact({ regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '', image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '', exhibitionHistory: [] }); 
        setIsEditing(false);
        setActiveTab('collection'); 
    } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro ao salvar dados.");
    }
  };
  
  const handleCancelEdit = () => {
    setNewArtifact({ regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '', image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '', exhibitionHistory: [] });
    setIsEditing(false);
    setActiveTab('collection');
  };

  const handleDelete = async (id, title) => { 
      if (currentUser.role !== 'Administrador') { 
          return alert("Acesso Negado: Apenas Administradores podem excluir fichas.\n\nDica: Seu usuário deve conter 'admin' no nome para ter essa permissão."); 
      } 
      if (window.confirm(`Tem certeza que deseja arquivar permanentemente a obra "${title}"?`)) { 
          try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'collection_items', id));
            setSelectedArtifact(null); 
            addLog("REMOCAO", `Arquivou: ${title}`); 
          } catch (e) {
            console.error(e);
            alert("Erro ao excluir. Verifique sua conexão.");
          }
      } 
  };
  
  const handleGenerateDescription = async () => { if (!newArtifact.title) return alert("Preencha o título."); setIsGeneratingDesc(true); const desc = await callGemini(`Descrição técnica (PT-BR) para: "${newArtifact.title}" de "${newArtifact.artist}".`); if (desc) setNewArtifact(prev => ({ ...prev, description: desc })); setIsGeneratingDesc(false); };
  
  // Combina locais dinâmicos com locais já existentes nas obras (para não quebrar legado)
  const availableLocations = locations.map(l => l.name);
  const legacyLocations = [...new Set(artifacts.map(a => a.location))];
  const allFilterLocations = [...new Set([...availableLocations, ...legacyLocations])].sort();

  const uniqueTypes = [...new Set(artifacts.map(a => a.type))];

  const filteredArtifacts = artifacts.filter(art => {
    const matchesSearch = art.title?.toLowerCase().includes(searchTerm.toLowerCase()) || art.regNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filters.location ? art.location === filters.location : true;
    const matchesType = filters.type ? art.type === filters.type : true;
    return matchesSearch && matchesLocation && matchesType;
  });
  
  // Contagem dinâmica por localização (Inventário)
  const locationCounts = {};
  locations.forEach(loc => { locationCounts[loc.name] = 0; });
  artifacts.forEach(a => { 
      locationCounts[a.location] = (locationCounts[a.location] || 0) + 1; 
  });

  if (!currentUser) return (<><style>{printStyles}</style><LoginScreen onLogin={handleUserLogin} /></>);
  if (!firebaseUser) return (<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/><span className="ml-2 text-slate-600">Conectando ao Banco de Dados...</span></div>);

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
          {/* NOVA ABA DE ESPAÇOS */}
          <button onClick={() => setActiveTab('spaces')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'spaces' ? 'bg-purple-700 text-white shadow-md' : 'hover:bg-purple-900/50 hover:text-white'}`}>
            <Box size={18} className={activeTab === 'spaces' ? "text-white" : "text-purple-400"}/> <span className="text-sm font-medium">Espaços & Inventário</span>
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
          <button onClick={() => { setActiveTab('add'); setIsEditing(false); setNewArtifact({ regNumber: '', title: '', artist: '', year: '', type: 'Pintura', status: 'Armazenado', condition: 'Bom', location: 'Reserva Técnica A', exhibition: '', image: '', description: '', observations: '', customFields: [], relatedTo: '', provenance: '', copyright: '', audioDesc: '' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'add' ? 'bg-orange-600 text-white shadow-md' : 'hover:bg-orange-900/50 hover:text-white'}`}>
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
          
          {/* DASHBOARD - AGORA DINÂMICO */}
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
                <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide"><Map size={18} className="text-blue-600"/> Mapa de Distribuição do Acervo (Por Setor)</h3>
                
                {/* GRID DINÂMICO BASEADO EM LOCAIS CADASTRADOS */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {locations.length === 0 && (
                       <div className="col-span-4 p-8 bg-slate-50 rounded border border-dashed text-center text-slate-400">
                           Nenhum setor cadastrado. Vá em "Espaços & Inventário" para criar setores.
                           <br/><small>As obras em locais antigos continuam listadas no filtro.</small>
                       </div>
                   )}
                   {locations.map(loc => {
                       // Define cores baseadas no tipo de local
                       let borderColor = 'border-slate-200';
                       let bgColor = 'bg-slate-50';
                       let iconColor = 'text-slate-400';
                       
                       if (loc.type === 'Exposição') { borderColor = 'border-blue-200'; bgColor = 'bg-blue-50'; iconColor='text-blue-500'; }
                       else if (loc.type === 'Reserva Técnica') { borderColor = 'border-green-200'; bgColor = 'bg-green-50'; iconColor='text-green-500'; }
                       else if (loc.type === 'Laboratório') { borderColor = 'border-red-200'; bgColor = 'bg-red-50'; iconColor='text-red-500'; }
                       else if (loc.type === 'Setor Sonoro' || loc.name.toLowerCase().includes('sonoro')) { borderColor = 'border-purple-200'; bgColor = 'bg-purple-50'; iconColor='text-purple-500'; }

                       return (
                        <div key={loc.id} className={`${bgColor} border-2 ${borderColor} border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative group hover:bg-white transition-colors`}>
                            <span className={`absolute top-2 left-3 text-[10px] font-bold ${iconColor} uppercase`}>{loc.name}</span>
                            <span className={`text-2xl font-bold ${iconColor.replace('400', '700').replace('500', '700')} mt-4`}>
                                {locationCounts[loc.name] || 0}
                            </span>
                            <span className="text-[10px] text-slate-400">obras</span>
                            {/* Mostra responsável se houver */}
                            {loc.responsible && <span className="absolute bottom-2 right-3 text-[9px] text-slate-400 flex items-center gap-1"><UserCheck size={8}/> {loc.responsible}</span>}
                        </div>
                       );
                   })}
                   
                   {/* Card fixo para itens Externos/Outros */}
                   <div className="bg-yellow-50 border-2 border-yellow-100 border-dashed rounded-xl p-4 flex items-center justify-center flex-col relative">
                        <span className="absolute top-2 left-3 text-[10px] font-bold text-yellow-600 uppercase">Externo / Empréstimo</span>
                        <span className="text-2xl font-bold text-yellow-700 mt-4">{artifacts.filter(a => a.location === 'Externo' || a.status === 'Empréstimo').length}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* NOVA ABA: GESTÃO DE ESPAÇOS E INVENTÁRIO */}
          {activeTab === 'spaces' && (
              <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl flex items-start justify-between shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Box size={24}/></div>
                      <div>
                        <h2 className="text-lg font-bold text-purple-900">Gestão de Espaços & Setores</h2>
                        <p className="text-sm text-purple-700 mb-2">Crie e edite setores e reservas para organizar seu inventário.</p>
                      </div>
                    </div>
                  </div>

                  {/* Formulário de Criação / Edição */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 text-sm uppercase">{editingLocationId ? 'Editar Espaço' : 'Criar Novo Espaço'}</h3>
                        {editingLocationId && (
                           <button onClick={handleCancelEditLocation} className="text-xs text-red-500 hover:underline">Cancelar Edição</button>
                        )}
                      </div>
                      <form onSubmit={handleSaveLocation} className="flex gap-4 items-end flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Setor / Espaço</label>
                              <input required value={newLocationName} onChange={e=>setNewLocationName(e.target.value)} placeholder="Ex: Setor Sonoro, Reserva C..." className="w-full border p-2 rounded-lg text-sm" />
                          </div>
                          <div className="w-48">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Espaço</label>
                              <select value={newLocationType} onChange={e=>setNewLocationType(e.target.value)} className="w-full border p-2 rounded-lg text-sm bg-white">
                                  <option>Reserva Técnica</option>
                                  <option>Exposição</option>
                                  <option>Laboratório</option>
                                  <option>Setor Administrativo</option>
                                  <option>Setor Sonoro</option>
                                  <option>Setor Iconográfico</option>
                                  <option>Outros</option>
                              </select>
                          </div>
                          {/* CAMPO NOVO: RESPONSÁVEL */}
                          <div className="flex-1 min-w-[200px]">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Responsável pelo Setor</label>
                              <input value={newLocationResponsible} onChange={e=>setNewLocationResponsible(e.target.value)} placeholder="Ex: João da Silva" className="w-full border p-2 rounded-lg text-sm" />
                          </div>
                          
                          <button type="submit" className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 text-white ${editingLocationId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                              {editingLocationId ? <Pencil size={16}/> : <Plus size={16}/>} 
                              {editingLocationId ? 'Atualizar' : 'Criar'}
                          </button>
                      </form>
                  </div>

                  {/* Lista de Espaços e Contagem (Inventário) */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                          <h3 className="font-bold text-slate-700 flex items-center gap-2"><List size={16}/> Inventário por Setor</h3>
                          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{locations.length} setores cadastrados</span>
                      </div>
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                              <tr>
                                  <th className="p-4">Nome do Espaço</th>
                                  <th className="p-4">Tipo</th>
                                  <th className="p-4">Responsável</th>
                                  <th className="p-4">Inventário</th>
                                  <th className="p-4 text-right">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {locations.map(loc => (
                                  <tr key={loc.id} className="hover:bg-purple-50 transition-colors">
                                      <td className="p-4 font-bold text-slate-700">{loc.name}</td>
                                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">{loc.type}</span></td>
                                      <td className="p-4 text-slate-600">{loc.responsible || '-'}</td>
                                      <td className="p-4">
                                          <div className="flex items-center gap-2">
                                              <span className="font-bold text-lg text-purple-700">{locationCounts[loc.name] || 0}</span>
                                              <span className="text-xs text-slate-400">itens</span>
                                          </div>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditLocation(loc)} className="text-blue-500 hover:bg-blue-50 p-2 rounded" title="Editar Setor"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteLocation(loc.id, loc.name)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded" title="Excluir Setor"><Trash2 size={16}/></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {locations.length === 0 && (
                                  <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">Nenhum setor criado. Use o formulário acima.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
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
                {/* FILTRO DINÂMICO DE LOCALIZAÇÃO */}
                <select className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-600" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
                  <option value="">Todas Localizações</option>
                  {allFilterLocations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-600" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                  <option value="">Todos Tipos</option>
                  {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-2 justify-end col-span-2 md:col-span-1 md:col-start-6">
                  <button onClick={() => {setFilters({location:'', type:'', artist:'', status:''}); setSearchTerm('')}} className="text-slate-400 hover:text-red-500 p-2 rounded-full transition-colors" title="Limpar Filtros"><X size={16}/></button>
                  <button onClick={exportToCSV} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors border border-green-200" title="Exportar CSV"><FileSpreadsheet size={18} /></button>
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCSVImport} />
                  <button onClick={() => fileInputRef.current.click()} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-blue-200" title="Importar CSV"><FileInput size={18} /></button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr><th className="px-6 py-4">Obra</th><th className="px-6 py-4">Localização & Tipo</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredArtifacts.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-400">Nenhuma obra cadastrada ou encontrada.</td></tr>}
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
                            <div className="flex justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleEditArtifact(art); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Editar Ficha"><Pencil size={18}/></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(art.id, art.title); }} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Excluir Ficha"><Trash2 size={18}/></button>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedArtifact(art); setDetailTab('geral'); }} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"><Maximize2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EXPOSIÇÕES */}
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
                    <button onClick={() => {setIsExhibitionModalOpen(true); setEditingExhibitionId(null); setNewExhibition({ name: '', startDate: '', endDate: '', location: '', curator: '' });}} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2">
                      <Plus size={18}/> Criar Nova Exposição
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exhibitions.map(ex => (
                      <div key={ex.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedExhibition(ex)}>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2 py-1 rounded uppercase text-[10px] font-bold ${ex.endDate >= new Date().toISOString().slice(0,10) ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                            {ex.endDate >= new Date().toISOString().slice(0,10) ? 'Ativa/Futura' : 'Encerrada'}
                          </span>
                          <div className="flex gap-2">
                             {/* BOTÃO EDITAR EXPOSIÇÃO */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditExhibition(ex); }} 
                              className="text-slate-300 hover:text-blue-500 transition-colors" 
                              title="Editar Exposição"
                            >
                              <Pencil size={18}/>
                            </button>
                            <button 
                              onClick={(e) => handleDeleteExhibition(e, ex.id, ex.name)} 
                              className="text-slate-300 hover:text-red-500 transition-colors" 
                              title="Excluir Exposição"
                            >
                              <Trash2 size={18}/>
                            </button>
                            <GalleryVerticalEnd size={20} className="text-slate-400 group-hover:text-blue-600"/>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{ex.name}</h3>
                        <div className="space-y-2 text-sm text-slate-500 mb-4">
                          <p className="flex items-center gap-2"><Calendar size={14}/> {ex.startDate} - {ex.endDate}</p>
                          <p className="flex items-center gap-2"><MapPin size={14}/> {ex.location}</p>
                          <p className="flex items-center gap-2"><User size={14}/> Curadoria: {ex.curator}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600">{artifacts.filter(a => a.exhibitionHistory?.some(h => h.name === ex.name)).length} Obras Vinculadas</span>
                          <span className="text-xs text-blue-600 font-bold group-hover:underline">Gerenciar Obras →</span>
                        </div>
                      </div>
                    ))}
                    {exhibitions.length === 0 && <p className="col-span-3 text-center text-slate-400 p-10">Nenhuma exposição criada.</p>}
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
                        <h3 className="font-bold text-blue-900 flex items-center gap-2"><GalleryVerticalEnd size={18}/> Obras Vinculadas</h3>
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{artifacts.filter(a => a.exhibitionHistory?.some(h => h.name === selectedExhibition.name)).length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
                        {artifacts.filter(a => a.exhibitionHistory?.some(h => h.name === selectedExhibition.name)).map(art => (
                          <div key={art.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                {art.image ? <img src={art.image} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-slate-400 m-auto mt-2"/>}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{art.title}</p>
                                <p className="text-xs text-slate-500">{art.regNumber} • {art.status}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeArtifactFromExhibition(art.id, selectedExhibition.name)}
                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                              title="Remover desta exposição"
                            >
                              <MoveRight size={16}/>
                            </button>
                          </div>
                        ))}
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
                        {/* Filtra obras que NÃO estão nesta exposição específica */}
                        {artifacts.filter(a => !a.exhibitionHistory?.some(h => h.name === selectedExhibition.name) && a.location !== 'Externo').map(art => (
                          <div key={art.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center group opacity-80 hover:opacity-100">
                            <button 
                              onClick={() => addArtifactToExhibition(art.id, selectedExhibition)}
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

              {/* Modal de Criação / Edição de Exposição */}
              {isExhibitionModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">{editingExhibitionId ? 'Editar Exposição' : 'Nova Exposição'}</h2>
                    <form onSubmit={handleSaveExhibition} className="space-y-4">
                      <div><label className="text-sm font-bold text-slate-600">Nome da Exposição</label><input required className="w-full border p-2 rounded" value={newExhibition.name} onChange={e=>setNewExhibition({...newExhibition, name: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-bold text-slate-600">Data Início</label><input type="date" required className="w-full border p-2 rounded" value={newExhibition.startDate} onChange={e=>setNewExhibition({...newExhibition, startDate: e.target.value})} /></div>
                        <div><label className="text-sm font-bold text-slate-600">Data Fim</label><input type="date" required className="w-full border p-2 rounded" value={newExhibition.endDate} onChange={e=>setNewExhibition({...newExhibition, endDate: e.target.value})} /></div>
                      </div>
                      <div><label className="text-sm font-bold text-slate-600">Local</label><input required className="w-full border p-2 rounded" placeholder="Ex: Galeria Principal" value={newExhibition.location} onChange={e=>setNewExhibition({...newExhibition, location: e.target.value})} /></div>
                      <div><label className="text-sm font-bold text-slate-600">Curador Responsável</label><input required className="w-full border p-2 rounded" value={newExhibition.curator} onChange={e=>setNewExhibition({...newExhibition, curator: e.target.value})} /></div>
                      <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={()=>{setIsExhibitionModalOpen(false); setEditingExhibitionId(null);}} className="px-4 py-2 border rounded hover:bg-slate-50">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">{editingExhibitionId ? 'Salvar Alterações' : 'Criar Exposição'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Destino</label>
                          {/* SELEÇÃO DINÂMICA DE DESTINO */}
                          <input list="locations-list" className="w-full border p-2 rounded" placeholder="Selecione ou digite..." value={newMovement.to} onChange={e => setNewMovement({...newMovement, to: e.target.value})}/>
                          <datalist id="locations-list">
                              {locations.map(l => <option key={l.id} value={l.name}/>)}
                          </datalist>
                      </div>
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
                      {artifacts.flatMap(a => (a.movements || []).map(m => ({...m, artwork: a.title}))).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((m, i) => (
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
                              <button onClick={() => removeFromConservationQueue(a.id)} className="text-slate-400 hover:text-red-500 text-xs underline">Remover da Fila</button>
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

          {/* CATALOGAÇÃO / EDIÇÃO */}
          {activeTab === 'add' && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isEditing ? `Editando Ficha: ${newArtifact.title}` : 'Cadastrar Nova Ficha'}</h2>
                {isEditing && (
                  <button onClick={handleCancelEdit} className="text-sm text-red-600 hover:underline">Cancelar Edição</button>
                )}
              </div>

              <form onSubmit={handleSaveArtifact} className="space-y-8">
                
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
                      {/* SELECT DINÂMICO PARA CATALOGAÇÃO */}
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none" value={newArtifact.location} onChange={(e) => setNewArtifact({...newArtifact, location: e.target.value})}>
                        {/* Lista os locais cadastrados */}
                        {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                        
                        {/* Fallback se a lista estiver vazia ou para a primeira vez */}
                        {locations.length === 0 && (
                            <>
                            <option>Reserva Técnica A</option>
                            <option>Reserva Técnica B</option>
                            <option>Galeria Principal</option>
                            </>
                        )}
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
                  <button type="button" onClick={handleCancelEdit} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-orange-600 rounded-lg text-white hover:bg-orange-700 font-medium shadow-lg shadow-orange-600/20">{isEditing ? 'Salvar Alterações' : 'Cadastrar Ficha'}</button>
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
                   {/* Botão de Edição no Modal */}
                  <button onClick={() => handleEditArtifact(selectedArtifact)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700" title="Editar Ficha"><Pencil size={20}/></button>
                  <button onClick={() => alert("Gerando QR Code para: " + selectedArtifact.regNumber)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600" title="Gerar QR Code"><QrCode size={20}/></button>
                  <button onClick={handlePrintCard} className="p-2 hover:bg-slate-200 rounded-full text-slate-600" title="Imprimir Ficha"><Printer size={20}/></button>
                  <button onClick={() => setSelectedArtifact(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600"><X size={20}/></button>
                </div>
              </div>

              {/* Corpo com Tabs */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-48 bg-slate-50 border-r p-2 space-y-1 no-print">
                  {['geral', 'exposicoes', 'multimidia', 'conservacao', 'historico'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${detailTab === tab ? 'bg-white shadow-sm text-green-700 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      {tab === 'geral' ? 'Ficha Técnica' : tab === 'exposicoes' ? 'Exposições' : tab === 'multimidia' ? 'Multimídia' : tab === 'conservacao' ? 'Conservação' : 'Histórico & Mov.'}
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

                  {detailTab === 'exposicoes' && (
                    <div className="animate-in fade-in space-y-6">
                       <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><GalleryVerticalEnd size={16}/> Histórico de Exposições</h4>
                       
                       <div className="space-y-4">
                          {selectedArtifact.exhibitionHistory && selectedArtifact.exhibitionHistory.length > 0 ? (
                            selectedArtifact.exhibitionHistory.sort((a,b) => new Date(b.startDate) - new Date(a.startDate)).map((ex, i) => {
                              const isActive = ex.endDate >= new Date().toISOString().slice(0,10);
                              return (
                                <div key={i} className={`p-4 rounded-lg border ${isActive ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                   <div className="flex justify-between items-start mb-2">
                                     <h5 className="font-bold text-slate-800">{ex.name}</h5>
                                     {isActive && <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Ativa</span>}
                                   </div>
                                   <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                      <p><span className="font-bold text-slate-500 text-xs uppercase block">Período</span> {ex.startDate} a {ex.endDate}</p>
                                      <p><span className="font-bold text-slate-500 text-xs uppercase block">Local</span> {ex.location}</p>
                                   </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-slate-400 text-sm italic">Nenhum registro de exposição.</p>
                          )}
                       </div>
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
