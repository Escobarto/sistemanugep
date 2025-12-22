import React, { useState } from 'react';
import { Landmark, Mail, Lock, LogIn, ArrowLeft, KeyRound, User, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase'; // Importa a auth configurada

const INSTITUTION_ACCESS_CODE = "NUGEP2025"; 

const LoginScreen = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); 
  const [formData, setFormData] = useState({ 
    username: '', password: '', email: '', regName: '', regPassword: '', accessCode: '' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleLogin = async (e) => { 
    e.preventDefault();
    setIsLoading(true); 
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      const adminEmails = ['guilhermemescobar@gmail.com', 'admin@nugep.com', 'diretoria@museu.com'];
      const isAdmin = formData.email.includes('admin') || adminEmails.includes(formData.email);
      const role = isAdmin ? 'Administrador' : 'Usuário'; 
      
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
    if (!formData.regName || !formData.email || !formData.regPassword || !formData.accessCode) { 
      setError('Todos os campos são obrigatórios.'); return; 
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setError('Por favor, insira um e-mail válido.'); return; }

    if (formData.accessCode !== INSTITUTION_ACCESS_CODE) {
        setError('Código de Acesso Institucional incorreto. Solicite à chefia.'); return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.regPassword);
      const user = userCredential.user;

      onLogin({ 
          name: formData.regName, 
          role: 'Usuário', 
          uid: user.uid,
          loginTime: new Date(), 
          email: user.email 
      });
      alert(`Conta criada com sucesso! Bem-vindo(a), ${formData.regName}!`);
    } catch (error) {
      console.error("Erro ao registrar:", error);
      if (error.code === 'auth/email-already-in-use') setError('Este e-mail já está cadastrado.');
      else if (error.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
      else setError('Erro ao criar conta: ' + error.message);
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
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="email" type="email" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="Email de Acesso" value={formData.email} onChange={handleChange} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="password" type="password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="Senha" value={formData.password} onChange={handleChange} />
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
                <p className="text-xs text-blue-800 flex items-center gap-2"><KeyRound size={14}/> Para criar uma conta, solicite o <b>Código de Acesso</b> à administração.</p>
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

export default LoginScreen;
