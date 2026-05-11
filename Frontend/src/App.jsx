import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import { useReactToPrint } from 'react-to-print';
import { 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  LayoutDashboard,
  Home,
  UserPlus,
  ShieldCheck,
  Briefcase,
  Power,
  PowerOff,
  CheckCircle2,
  XCircle,
  FileText,
  FolderTree,
  FolderRoot,
  History,
  ChevronDown,
  ArrowRightLeft,
  BookOpen,
  Menu,
  X,
  Edit2,
  Trash2,
  PieChart,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  FileCheck,
  Check,
  CheckSquare,
  Printer,
  Receipt,
  Banknote,
  Scale,
  Handshake,
  HandCoins,
  User,
  ListOrdered,
  List,
  Filter,
  Share2,
  Smartphone,
  Bluetooth
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- API Service ---
const API_URL = import.meta.env.VITE_API_URL || 'https://fin-react-bk.onrender.com/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are at root, force reload to reset React state.
      // If we are elsewhere, redirect to root which will reload.
      if (window.location.pathname === '/') {
        window.location.reload();
      } else {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// --- Components ---

const Modal = ({ isOpen, onClose, title, children, noPadding = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {!noPadding && title && (
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-slate-800 uppercase tracking-tight">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className={cn("overflow-y-auto max-h-[90vh]", !noPadding && "p-6")}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const ReceiptModal = ({ isOpen, onClose, tx, acc, companyProfile, user }) => {
  const receiptRef = useRef(null);

  if (!isOpen || !tx) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
       toast.error('Print window blocked! Please allow popups for this site.', { duration: 512 });
       return;
    }

    const tailwindCdn = '<script src="https://cdn.tailwindcss.com"></script>';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          ${tailwindCdn}
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body class="bg-white p-4">
          <div class="max-w-[380px] mx-auto border-2 border-dashed border-slate-300 p-6">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleWhatsApp = () => {
    const text = `*${companyProfile?.name?.toUpperCase() || 'RECEIPT'}*\n` +
                 `Transaction Receipt\n` +
                 `------------------\n` +
                 `Date: ${new Date(tx.date).toLocaleDateString()}\n` +
                 `Voucher: ${tx.voucherNo || 'N/A'}\n` +
                 `Customer: ${acc?.name || 'N/A'}\n` +
                 `Account: ${acc?.accNo || 'N/A'}\n` +
                 `Type: ${tx.type?.toUpperCase() || 'N/A'}\n` +
                 `Amount: Rs.${tx.amt?.toLocaleString()}\n` +
                 `Available Bal: Rs.${acc?.balance?.toLocaleString()}\n` +
                 `------------------\n` +
                 `Issued by: ${user?.name || user?.username || ''}\n` +
                 `Mob: ${user?.mobile || ''}\n` +
                 `Thank you!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveImage = () => {
    if (receiptRef.current) {
      htmlToImage.toPng(receiptRef.current, { backgroundColor: '#fff' })
        .then((dataUrl) => {
          download(dataUrl, `receipt-${tx.voucherNo || 'tx'}.png`);
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
          toast.error("Failed to save image");
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        {/* Modal Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-black text-slate-800 uppercase tracking-tight text-lg">Receipt Preview</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Receipt View */}
          <div className="bg-white p-2 rounded-2xl shadow-xl ring-1 ring-slate-200">
            <div 
              ref={receiptRef}
              className="bg-white border-2 border-dashed border-slate-300 p-8 flex flex-col items-center text-slate-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <h1 className="text-2xl font-black text-center uppercase leading-tight mb-1">
                {companyProfile?.name || 'MY SOUHARD SAHAKARI N., SINDGI'}
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Transaction Receipt</p>
              
              <div className="w-full border-t border-slate-900 my-4 opacity-20"></div>
              
              <div className="w-full space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Date:</span>
                  <span className="font-black">{new Date(tx.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Voucher No:</span>
                  <span className="font-bold">{tx.voucherNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Customer:</span>
                  <span className="font-bold truncate max-w-[200px]">{acc?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span className="font-bold text-slate-500 font-sans">Account:</span>
                  <span className="font-black text-slate-700">{acc?.accNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">Type:</span>
                  <span className="font-black uppercase text-xs bg-slate-100 px-2 py-0.5 rounded">{tx.type}</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-bold text-slate-500">Opening Bal:</span>
                   <span className="font-bold text-slate-700 italic">₹{(
                     ['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'receipt', 'agent_handover'].includes(tx.type)
                       ? (acc?.balance || 0) - (tx.amt || 0)
                       : (acc?.balance || 0) + (tx.amt || 0)
                   ).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                   <span className="font-black text-slate-900">Amount:</span>
                   <span className="text-3xl font-black text-slate-900 tabular-nums">₹{tx.amt?.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-y border-slate-100 border-dotted">
                   <span className="font-bold text-slate-900 text-sm">Available Bal:</span>
                   <span className="font-black text-slate-900 text-sm italic">₹{acc?.balance?.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-bold text-slate-500">Details:</span>
                   <span className="font-medium text-slate-600 text-xs truncate max-w-[150px]">{tx.desc || 'N/A'}</span>
                 </div>
              </div>

              <div className="w-full border-t border-slate-900 my-6 opacity-20"></div>
              
              <div className="text-center space-y-1">
                <p className="font-bold text-slate-900 tracking-wider">Thank you</p>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Issued by: <span className="text-slate-900">{user?.name || user?.username || 'N/A'}</span></p>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Mob: <span className="text-slate-900 font-mono italic">{user?.mobile || 'N/A'}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={handleSaveImage}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                <ImageIcon size={18} /> Save Image
             </button>
             <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                <Smartphone size={18} /> WhatsApp
             </button>
          </div>
          <button 
             onClick={handlePrint}
             className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest"
          >
            <Printer size={20} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

const Button = ({ children, className, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100',
    secondary: 'bg-white text-slate-600 border-2 border-slate-100 hover:bg-slate-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-600'
  };
  return (
    <button className={cn('px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50', variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
    <input 
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      {...props}
    />
  </div>
);

const Card = ({ title, children, className }) => (
  <div className={cn('bg-white p-6 rounded-xl shadow-sm border border-gray-100', className)}>
    {title && <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
);

const PermissionDenied = () => (
  <div className="flex flex-col items-center justify-center p-20 text-center">
    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-50">
       <X size={40}/>
    </div>
    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Access Denied</h2>
    <p className="text-slate-500 font-bold max-w-md">You do not have administrative privileges to access this page. Please contact your company administrator.</p>
    <Button onClick={() => window.location.href = '/dashboard'} className="mt-8 bg-slate-900">Back to Dashboard</Button>
  </div>
);

// --- Pages ---

const LoginPage = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const toastId = toast.loading('Authenticating...');
    try {
      const { data } = await api.post('/auth/login', { 
        username: username.trim().toLowerCase(), 
        password 
      });
      toast.success('Successfully logged in!', { id: toastId });
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('user');
      }
      setUser(data.user || null);
      navigate(data.user.role === 'superadmin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Login error details:', err.response || err);
      const msg = err.response?.data?.message || 'Login failed. Please check your connection.';
      toast.error(msg, { id: toastId, duration: 6000 });
      setError(msg);
    }
  };

  const isExpiryError = error && error.toLowerCase().includes('expired');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className={cn(isExpiryError && "border-red-200 bg-red-50/50 shadow-2xl shadow-red-100")}>
        <div className="text-center mb-8">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors",
            isExpiryError ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
          )}>
            {isExpiryError ? <XCircle size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900">FinSphere Multi-Tenant</h1>
          {isExpiryError ? (
            <div className="mt-4 py-2 px-4 bg-red-600 text-white font-black text-sm uppercase rounded-lg shadow-lg animate-bounce">
              SERVICE EXPIRED
            </div>
          ) : (
            <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input label="Username" placeholder="e.g. admin" value={username} onChange={e => setUsername(e.target.value)} required />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && !isExpiryError && <p className="text-red-500 text-sm font-medium">{error}</p>}
          {isExpiryError && (
            <div className="p-4 bg-white border-2 border-red-200 rounded-xl text-center">
              <p className="text-red-600 font-bold text-sm leading-tight">{error}</p>
              <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Please contact vendor for renewal</p>
            </div>
          )}
          <Button type="submit" className={cn("w-full py-3 mt-6", isExpiryError ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "")}>
            {isExpiryError ? "RETRY LOGIN" : "Login"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Default Admin Access</p>
          <div className="mt-2 text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">
            admin / admin123
          </div>
        </div>
      </Card>
      </motion.div>
    </div>
  );
};

const Sidebar = ({ role, user, isOpen, onClose, setUser, companyProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const menuClick = (path) => {
    navigate(path || '/');
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[998] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-[999] w-64 bg-slate-800 text-slate-300 flex flex-col p-0 shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen print:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col items-center justify-center px-6 py-10 transition-all">
          {companyProfile?.logo ? (
            <div className="w-20 h-20 mb-4">
              <img src={companyProfile.logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="p-3 bg-slate-700/50 rounded-2xl mb-4">
               <LayoutDashboard className="text-white" size={32} />
            </div>
          )}
          <span className="font-black text-2xl tracking-tighter text-white">FinSphere</span>
        </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {role === 'superadmin' ? (
            <>
              <NavItem icon={<Building2 size={20}/>} label="Companies" onClick={() => menuClick('/admin')} active={location.pathname === '/admin'} />
              <NavItem icon={<Briefcase size={20}/>} label="All Agents" onClick={() => menuClick('/admin/agents')} active={location.pathname === '/admin/agents'} />
            </>
          ) : (
            <>
              <NavItem icon={<Home size={20}/>} label="Dashboard" onClick={() => menuClick('/dashboard')} active={location.pathname === '/dashboard'} />
              <NavItem icon={<Users size={20}/>} label="Customers" onClick={() => menuClick('/customers')} active={location.pathname === '/customers'} />
              <NavItem icon={<ArrowRightLeft size={20}/>} label="Transactions" onClick={() => menuClick('/transactions')} active={location.pathname === '/transactions'} />
              <NavItem icon={<Edit2 size={20}/>} label="Adjustment Entry" onClick={() => menuClick('/adjustments')} active={location.pathname === '/adjustments'} />
              <NavItem icon={<FileText size={20}/>} label="Reports" onClick={() => menuClick('/reports')} active={location.pathname === '/reports'} />
              
              {role === 'company_owner' && (
                <CollapsibleItem 
                  icon={<Briefcase size={20}/>} 
                  label="Performance" 
                  isOpen={openSubmenu === 'agents'} 
                  onClick={() => toggleSubmenu('agents')}
                >
                  <SubNavItem label="Manage Agents" onClick={() => menuClick('/agents')} />
                </CollapsibleItem>
              )}

              <CollapsibleItem 
                icon={<FolderTree size={20}/>} 
                label="Master" 
                isOpen={openSubmenu === 'master'} 
                onClick={() => toggleSubmenu('master')}
              >
                <SubNavItem label="Accounts" onClick={() => menuClick('/master/accounts')} />
                <SubNavItem label="Groups" onClick={() => menuClick('/master/groups')} />
                <SubNavItem label="Types" onClick={() => menuClick('/master/types')} />
              </CollapsibleItem>

              <NavItem icon={<Settings size={20}/>} label="Settings" onClick={() => menuClick('/settings')} active={location.pathname === '/settings'} />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-700/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all font-bold text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

const CollapsibleItem = ({ icon, label, isOpen, onClick, children }) => (
  <div className="space-y-1">
    <button 
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold hover:bg-slate-800 hover:text-white'
      )}
    >
      <div className="flex items-center gap-3">
        {icon} <span>{label}</span>
      </div>
      <ChevronDown size={16} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
    </button>
    {isOpen && <div className="space-y-1 pl-10 pr-2 pb-2">{children}</div>}
  </div>
);

const SubNavItem = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
  >
    {label}
  </button>
);

const NavItem = ({ icon, label, onClick, active }) => (
  <button 
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold',
      active ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
    )}
  >
    {icon} {label}
  </button>
);

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [amcAmount, setAmcAmount] = useState('');
  const [amcStatus, setAmcStatus] = useState('Pending');

  const [dbStatus, setDbStatus] = useState('checking...');
  const [dbInfo, setDbInfo] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/companies');
      setCompanies(data);
      const health = await api.get('/health');
      setDbStatus(health.data.database);
      setDbInfo(health.data.env);
    } catch (err) {
      if (err.response?.status === 401) return;
      console.error('Fetch error:', err);
      setDbStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) {
        date.setFullYear(date.getFullYear() + 1);
        date.setDate(date.getDate() - 1);
        setExpiryDate(date.toISOString().split('T')[0]);
      }
    }
  }, [startDate]);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isDuplicate = companies.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== editId);
    if (isDuplicate) {
      toast.error('Company name already exists!');
      setLoading(false);
      return;
    }

    const payload = { 
      name: newName, 
      username: newUsername, 
      password: newPassword,
      startDate,
      expiryDate,
      amcAmount,
      amcStatus
    };
    try {
      if (editId) {
        await api.put(`/admin/companies/${editId}`, payload);
        toast.success('Company updated');
      } else {
        await api.post('/admin/companies', payload);
        toast.success('Company created');
      }
      resetForm();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving company');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewName(''); setNewUsername(''); setNewPassword('');
    setStartDate(''); setExpiryDate(''); setAmcAmount('');
    setAmcStatus('Pending'); setEditId(null); setShowAdd(false);
  };

  const handleEdit = (company) => {
    setEditId(company.id);
    setNewName(company.name);
    setNewUsername(company.username || '');
    setNewPassword(company.password || '');
    setStartDate(company.startDate || '');
    setExpiryDate(company.expiryDate || '');
    setAmcAmount(company.amcAmount || '');
    setAmcStatus(company.amcStatus || 'Pending');
    setShowAdd(true);
  };

  const toggleCompanyStatus = async (id) => {
    try {
      await api.patch(`/admin/companies/${id}/status`);
      toast.success('Status updated');
      fetchCompanies();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm("CRITICAL: This will permanently delete this company and ALL its data (users, customers, transactions). This action cannot be undone. Proceed?")) {
      try {
        await api.delete(`/admin/companies/${id}`);
        toast.success('Company permanently deleted');
        fetchCompanies();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting company');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Companies</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500">Manage tenant organizations</p>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1",
              dbStatus === 'connected' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600 text-xs py-1"
            )} title={dbInfo?.hasUri ? "URI present" : "Missing MONGODB_URI"}>
              <div className={cn("w-1.5 h-1.5 rounded-full", dbStatus === 'connected' ? "bg-emerald-400" : "bg-red-400")}></div>
              DB: {dbStatus} {!dbInfo?.hasUri && "(URI Missing)"}
            </span>
          </div>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowAdd(true); }} 
          className="flex items-center gap-2 px-6 w-full sm:w-auto justify-center"
        >
          <UserPlus size={20} /> Add Company
        </Button>
      </div>

      {showAdd && (
        <Card title={editId ? "Update Company Details" : "Register New Company"} className="mb-8 border-2 border-indigo-100">
          <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Company Name" placeholder="e.g. Acme Corp" value={newName} onChange={e => setNewName(e.target.value)} required />
            <Input label="Owner Username" placeholder="admin_acme" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
            <Input label="Owner Password" type={editId ? "text" : "password"} placeholder={editId ? "Password" : "••••••••"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required={!editId} />
            
            <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <Input label="Expiry Date (Auto)" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">AMC Status</label>
              <select 
                value={amcStatus} 
                onChange={e => setAmcStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Renewal">Renewal</option>
                <option value="Grace Period">Grace Period</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <Input label="AMC Amount" type="number" placeholder="₹" value={amcAmount} onChange={e => setAmcAmount(e.target.value)} />

            <div className="md:col-span-3 flex gap-3 justify-end mt-2">
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  editId ? 'Update Entity' : 'Create Entity'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <Card 
            key={company.id} 
            className={cn(
              "hover:shadow-md transition-all border-t-4",
              company.active ? "border-t-emerald-500" : "border-t-red-500 bg-slate-50"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  company.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className={cn("font-bold transition-colors", company.active ? "text-slate-900" : "text-slate-400 line-through")}>
                    {company.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{company.id}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-wider",
                  company.active ? "text-emerald-500" : "text-red-500"
                )}>
                  {company.active ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                  {company.active ? 'Active' : 'Inactive'}
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                  company.amcStatus === 'Paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  AMC: {company.amcStatus || 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl">
               <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Validity</span>
                  <span className="text-slate-900 font-black tracking-tighter">
                    {company.startDate ? new Date(company.startDate).toLocaleDateString() : '-'} to {company.expiryDate ? new Date(company.expiryDate).toLocaleDateString() : '-'}
                  </span>
               </div>
               <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">AMC Amount</span>
                  <span className="text-slate-900 font-black tracking-tighter">₹{company.amcAmount || '0'}</span>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Management</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const shareText = `Access Link: ${window.location.origin}`;
                    navigator.clipboard.writeText(shareText);
                    toast.success("Application link copied!");
                  }}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  title="Share Credentials"
                >
                  <Share2 size={16}/>
                </button>
                <button 
                  onClick={() => handleEdit(company)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit Company"
                >
                  <Edit2 size={16}/>
                </button>
              <button 
                 onClick={() => toggleCompanyStatus(company.id || company._id)}
                 title={company.active ? "Deactivate" : "Activate"}
                 className={cn(
                   "p-2 rounded-lg transition-all",
                   company.active ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"
                 )}
               >
                 {company.active ? <PowerOff size={16}/> : <Power size={16}/>}
               </button>
               <button 
                 onClick={() => handleDeleteCompany(company.id || company._id)}
                 title="Delete Company"
                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
               >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          </Card>
        ))
      }
      </div>
    </div>
  );
};

const CompanyDashboard = ({ user }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/tenant/summary').then(res => setSummary(res.data));
  }, []);

  const [showExpiryAlert, setShowExpiryAlert] = useState(false);

  useEffect(() => {
    if (summary?.expiryDate) {
      const expiry = new Date(summary.expiryDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 5) {
        setShowExpiryAlert(true);
      }
    }
  }, [summary]);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="p-3 sm:p-5 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        {showExpiryAlert && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex justify-between items-center rounded-r-xl shadow-sm">
             <div className="flex items-center gap-3">
                <Info size={20}/>
                <p className="text-xs font-bold uppercase">Account expires in {Math.ceil((new Date(summary.expiryDate) - new Date()) / (1000*60*60*24))} days. Contact Admin.</p>
             </div>
             <button onClick={() => setShowExpiryAlert(false)} className="text-red-900 font-black">✕</button>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            label="CASH IN HAND" 
            value={`₹${summary?.cashInHand?.toLocaleString() || '0.00'}`} 
            border="border-sky-500" 
          />
          <StatsCard 
            label="TODAY RECEIPT" 
            value={`₹${summary?.todayReceipt?.toLocaleString() || '0.00'}`} 
            border="border-emerald-500" 
          />
          <StatsCard 
            label="TOTAL INCOME" 
            value={`₹${summary?.totalIncome?.toLocaleString() || '0.00'}`} 
            border="border-emerald-500"
            valueColor="text-emerald-500"
          />
          <StatsCard 
            label="TOTAL EXPENSE" 
            value={`₹${summary?.totalExpense?.toLocaleString() || '0.00'}`} 
            border="border-rose-500"
            valueColor="text-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            label="TODAY COUNT" 
            value={summary?.todayCount || '0'} 
            border="border-amber-500" 
          />
          <StatsCard 
            label="SUMMARY" 
            value={summary?.profit?.toLocaleString() || '0.00'} 
            border="border-purple-500" 
          />
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
           <div className="p-4 bg-white border-b border-slate-50 flex items-center gap-3">
             <Activity size={18} className="text-slate-400" />
             <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Recent Activity</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-[#f8fafc] text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                 <tr>
                   <th className="px-5 py-3">Date</th>
                   <th className="px-5 py-3">Type</th>
                   <th className="px-5 py-3">Details</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {summary?.recentTransactions?.slice(0, 5).map((tx, idx) => (
                   <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-5 py-4 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                       {new Date(tx.date).toLocaleDateString('en-GB')}
                     </td>
                     <td className="px-5 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[9px] font-black uppercase tracking-tight",
                          tx.type === 'income' || tx.type === 'receipt' || tx.type === 'deposit' || tx.type === 'collection' ? "bg-emerald-100 text-emerald-700" :
                          tx.type === 'expense' || tx.type === 'withdraw' ? "bg-rose-100 text-rose-700" :
                          tx.type === 'adjustment' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {tx.type || 'Transaction'}
                        </span>
                     </td>
                     <td className="px-5 py-4 text-[11px] text-slate-800 font-bold tracking-tight">
                       {tx.desc || `TX#${(tx.id || '').substring(0,8).toUpperCase()} - ₹${parseFloat(tx.amt || 0).toLocaleString()}`}
                     </td>
                   </tr>
                 ))}
                 {(!summary?.recentTransactions || summary.recentTransactions.length === 0) && (
                   <tr>
                     <td colSpan="3" className="px-5 py-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No recent activity recorded</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
        <div className="mt-8 flex justify-center pb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User: {user.username} ({user.role})</p>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, border, valueColor }) => (
  <div className={cn("bg-white p-4 sm:p-5 rounded-xl shadow-sm border-l-[6px] flex flex-col justify-center min-h-[90px] transition-all hover:shadow-md", border)}>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-2 leading-none">{label}</p>
    <div className={cn(
      "text-xl sm:text-2xl font-bold tracking-tight leading-none truncate",
      valueColor || "text-slate-900"
    )}>
      {label === "SUMMARY" ? (
        <span className="text-emerald-500 text-[13px] font-bold block mt-1">
           Profit: ₹{value}
        </span>
      ) : value}
    </div>
  </div>
);

const QuickButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold group text-white">
    <div className="flex items-center gap-3">
      {icon} <span>{label}</span>
    </div>
    <ArrowRightLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

const MasterAccountsPage = ({ user }) => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', group: '', type: 'general', category: 'ledger' });

  const isAgent = user?.role === 'agent';

  const fetchData = async () => {
    const [aRes, gRes] = await Promise.all([api.get('/accounts'), api.get('/groups')]);
    let filteredAccs = aRes.data.filter(a => a.category === 'ledger');
    
    setAccounts(filteredAccs);
    setGroups(gRes.data);
    if (gRes.data.length > 0 && !formData.group) setFormData(prev => ({ ...prev, group: gRes.data[0].name }));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isDuplicate = accounts.some(a => a.name.toLowerCase() === formData.name.toLowerCase() && a.id !== editId);
    if (isDuplicate) {
      toast.error('Ledger name already exists!');
      return;
    }

    try {
      if (editId) {
        await api.put(`/accounts/${editId}`, formData);
        toast.success('Ledger updated');
      } else {
        await api.post('/accounts', formData);
        toast.success('Ledger created');
      }
      setFormData({ name: '', group: groups[0]?.name || '', type: 'general', category: 'ledger' });
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error saving ledger');
    }
  };

  const handleEdit = (acc) => {
    setEditId(acc.id);
    setFormData({ name: acc.name, group: acc.group, type: acc.type, category: acc.category });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid unique identifier for ledger");
      return;
    }
    if (window.confirm('Are you sure you want to delete this ledger?')) {
      try {
        await api.delete(`/accounts/${id}`);
        toast.success('Account successfully removed');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Deletion failed. Ensure account has no transactions.');
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await api.patch(`/accounts/${id}/status`);
      toast.success(res.data.message || 'Status updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const filteredAccounts = accounts.filter(acc => 
    (acc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (acc.accNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Master</h1>
          <p className="text-slate-500 font-medium">Configure corporate ledgers</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search ledgers..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6">
            <Plus size={20} /> Add Ledger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map(acc => (
          <Card key={acc.id} className={cn("relative group overflow-hidden transition-all", acc.status === 'inactive' && "opacity-60 grayscale-[0.3]")}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen size={20}/>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded ring-1 ring-slate-100 italic">{acc.group}</span>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => navigate('/transactions', { state: { accNo: acc.accNo } })}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100 hover:border-emerald-200 shadow-sm"
                        title="Open Direct Transaction form"
                      >
                        <ArrowRightLeft size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(acc)} 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100 hover:border-indigo-200 shadow-sm" 
                        title="Edit"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={() => {
                          const balance = parseFloat(acc.balance || 0);
                          if (acc.status === 'active' && balance !== 0) {
                            toast.error(`Account balance must be 0 to deactivate. Current: ₹${balance}`);
                          } else {
                            toggleStatus(acc.id || acc._id);
                          }
                        }} 
                        className={cn(
                          "p-2 rounded-lg transition-all border shadow-sm",
                          acc.status === 'active' ? "text-amber-600 hover:bg-amber-50 border-amber-100 hover:border-amber-200" : "text-emerald-600 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-200",
                          (acc.status === 'active' && parseFloat(acc.balance || 0) !== 0) && "opacity-50 cursor-not-allowed"
                        )}
                        title={acc.status === 'active' ? (parseFloat(acc.balance || 0) === 0 ? "Deactivate" : "Cannot Deactivate (Balance > 0)") : "Activate"}
                      >
                        {acc.status === 'active' ? <Power size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button 
                        onClick={() => {
                          const balance = parseFloat(acc.balance || 0);
                          if (balance !== 0) {
                            toast.error(`Cannot delete account with non-zero balance: ₹${balance}`);
                            return;
                          }
                          if (window.confirm(`Delete ${acc.name}?`)) handleDelete(acc.id || acc._id);
                        }} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 hover:border-red-200 shadow-sm" 
                        title="Delete"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
              </div>
            </div>
            <h4 className="font-black text-slate-800 mb-1">{acc.name}</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black tracking-widest">{acc.accNo || 'LEDGER'}</span>
              {acc.status === 'inactive' && (
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
                  <PowerOff size={8} /> Inactive
                </span>
              )}
            </div>
            <p className={cn("text-2xl font-black", acc.balance >= 0 ? "text-emerald-600" : "text-red-600")}>
              ₹{Math.abs(acc.balance).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? "Edit Ledger" : "Create New Ledger"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Ledger Name" placeholder="e.g. Office Rent" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Account Group</label>
            <select className="w-full p-2 border rounded-lg" value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })} required>
              {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
             <label className="text-sm font-semibold text-gray-700">System Type</label>
             <select className="w-full p-2 border rounded-lg" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
               <option value="general">General Ledger</option>
               <option value="bank">Bank / Cash Account</option>
               <option value="income">Income Stream</option>
               <option value="expense">Operating Expense</option>
             </select>
          </div>
          <Button type="submit" className="w-full">{editId ? 'Update Ledger' : 'Register Ledger'}</Button>
        </form>
      </Modal>
    </div>
  );
};

const AdjustmentEntryForm = ({ onSuccess, onClose, accounts, initialData }) => {
  const [formData, setFormData] = useState(initialData || { 
    accId: '', 
    secAccId: '', 
    type: 'adjustment', 
    amt: '', 
    desc: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [debitSearch, setDebitSearch] = useState('');
  const [creditSearch, setCreditSearch] = useState('');
  const [selectedDebit, setSelectedDebit] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedDebit(accounts.find(a => a.id === initialData.accId) || null);
      setSelectedCredit(accounts.find(a => a.id === initialData.secAccId) || null);
    } else {
      setFormData({ 
        accId: '', 
        secAccId: '', 
        type: 'adjustment', 
        amt: '', 
        desc: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedDebit(null);
      setSelectedCredit(null);
    }
  }, [initialData, accounts]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!selectedDebit || !selectedCredit) {
      toast.error('Please select both Debit and Credit accounts');
      return;
    }

    let detectedType = 'adjustment';
    const crGroup = (selectedCredit.group || '').toUpperCase();
    const crType = (selectedCredit.type || '').toUpperCase();
    const drGroup = (selectedDebit.group || '').toUpperCase();
    const drType = (selectedDebit.type || '').toUpperCase();

    if (crGroup.includes('INCOME') || crType === 'INCOME' || crGroup.includes('INTEREST') || crGroup.includes('RENT')) {
      detectedType = 'income';
    } else if (drGroup.includes('EXPENSE') || drType === 'EXPENSE' || drGroup.includes('RENT')) {
      detectedType = 'expense';
    } else if ((drGroup.includes('CASH') || drGroup.includes('BANK')) && 
             (crGroup.includes('LIABILITY') || crGroup.includes('SB') || crGroup.includes('RD') || crGroup.includes('DEPOSIT'))) {
      detectedType = 'receipt';
    }

    try {
      if (initialData?.id) {
        await api.put(`/transactions/${initialData.id}`, {
          ...formData,
          type: detectedType,
          accId: selectedDebit.id,
          secAccId: selectedCredit.id
        });
        toast.success(`Journal Entry Updated`);
      } else {
        await api.post('/transactions', {
          ...formData,
          type: detectedType,
          accId: selectedDebit.id,
          secAccId: selectedCredit.id
        });
        toast.success(`Journal Entry Posted as ${detectedType.toUpperCase()}`);
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error posting adjustment');
    }
  };

  return (
    <Card className="border-none shadow-md bg-white p-6 rounded-xl border-t-4 border-t-amber-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Journal Adjustment Entry</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handlePost} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Voucher Description</label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-400 italic">
                Type detected automatically based on accounts
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Voucher Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date"
                className="w-full pl-10 p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full pl-8 p-2.5 bg-white border border-slate-200 rounded-lg text-lg font-black focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                value={formData.amt}
                onChange={e => setFormData({ ...formData, amt: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
               <ArrowRightLeft size={18} />
             </div>
           </div>

          {/* DEBIT SIDE */}
          <div className="border-2 border-[#2ecc71]/20 rounded-2xl p-5 bg-white shadow-sm ring-1 ring-[#2ecc71]/5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2ecc71]/10 pb-2">
              <p className="text-[11px] font-black uppercase text-[#27ae60] tracking-[0.2em] flex items-center gap-2">
                <ArrowUpRight size={14} /> DEBIT (DR+)
              </p>
              <span className="text-[9px] font-bold text-slate-400 uppercase italic">Increase / Inflow</span>
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    placeholder="Search Debit Account..."
                    className="w-full pl-9 p-3 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#2ecc71] outline-none"
                    value={selectedDebit ? selectedDebit.name : debitSearch}
                    readOnly={!!selectedDebit}
                    onChange={e => setDebitSearch(e.target.value)}
                  />
                </div>
              </div>
              {debitSearch && !selectedDebit && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-100 shadow-2xl max-h-40 overflow-y-auto rounded-b-xl mt-1">
                  {accounts
                    .filter(a => a.name.toLowerCase().includes(debitSearch.toLowerCase()) || (a.accNo || '').toLowerCase().includes(debitSearch.toLowerCase()))
                    .map(a => (
                      <div key={a.id} onClick={() => { setSelectedDebit(a); setDebitSearch(''); }} className="p-3 hover:bg-emerald-50 cursor-pointer text-sm font-bold border-b border-slate-50 flex justify-between">
                        <span>{a.name}</span>
                        <span className="text-[10px] text-slate-400">{a.accNo}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-lg">
              <p className="text-[10px] text-emerald-700 font-bold">Current Bal: ₹{selectedDebit?.balance?.toLocaleString() || '0.00'}</p>
              {selectedDebit && <button type="button" onClick={() => setSelectedDebit(null)} className="text-[9px] text-red-500 font-black hover:bg-red-50 px-2 py-1 rounded">CANCEL</button>}
            </div>
          </div>

          {/* CREDIT SIDE */}
          <div className="border-2 border-[#e74c3c]/20 rounded-2xl p-5 bg-white shadow-sm ring-1 ring-[#e74c3c]/5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#e74c3c]/10 pb-2">
              <p className="text-[11px] font-black uppercase text-[#c0392b] tracking-[0.2em] flex items-center gap-2">
                <ArrowDownRight size={14} /> CREDIT (CR-)
              </p>
              <span className="text-[9px] font-bold text-slate-400 uppercase italic">Decrease / Outflow</span>
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    placeholder="Search Credit Account..."
                    className="w-full pl-9 p-3 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#e74c3c] outline-none"
                    value={selectedCredit ? selectedCredit.name : creditSearch}
                    readOnly={!!selectedCredit}
                    onChange={e => setCreditSearch(e.target.value)}
                  />
                </div>
              </div>
              {creditSearch && !selectedCredit && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-100 shadow-2xl max-h-40 overflow-y-auto rounded-b-xl mt-1">
                  {accounts
                    .filter(a => a.name.toLowerCase().includes(creditSearch.toLowerCase()) || (a.accNo || '').toLowerCase().includes(creditSearch.toLowerCase()))
                    .map(a => (
                      <div key={a.id} onClick={() => { setSelectedCredit(a); setCreditSearch(''); }} className="p-3 hover:bg-red-50 cursor-pointer text-sm font-bold border-b border-slate-50 flex justify-between">
                        <span>{a.name}</span>
                        <span className="text-[10px] text-slate-400">{a.accNo}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center bg-red-50/50 p-2 rounded-lg">
              <p className="text-[10px] text-red-700 font-bold">Current Bal: ₹{selectedCredit?.balance?.toLocaleString() || '0.00'}</p>
              {selectedCredit && <button type="button" onClick={() => setSelectedCredit(null)} className="text-[9px] text-red-500 font-black hover:bg-red-50 px-2 py-1 rounded">CANCEL</button>}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Narration (Journal Remarks)</label>
          <textarea 
            rows="2"
            placeholder="Explain the purpose of this adjustment (e.g., Transfer from Cash to Bank)"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.desc}
            onChange={e => setFormData({ ...formData, desc: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
           <button type="submit" className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-black px-10 py-3.5 rounded-xl shadow-xl transition-all flex items-center gap-2 text-sm uppercase">
             <FileCheck size={18} /> {initialData?.id ? 'Update' : 'Post'} Journal Entry
           </button>
           <button type="button" onClick={onClose} className="bg-white border-2 border-slate-200 text-slate-600 font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-sm uppercase">
             <X size={18} /> Cancel
           </button>
        </div>
      </form>
    </Card>
  );
};

const TransactionsPage = ({ user, companyProfile }) => {
  const location = useLocation();
  const [txs, setTxs] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFrom, setHistoryFrom] = useState('');
  const [historyTo, setHistoryTo] = useState('');
  
  const [previewTx, setPreviewTx] = useState(null);
  const [previewAcc, setPreviewAcc] = useState(null);

  const [formData, setFormData] = useState({ 
    accId: '', 
    secAccId: '', 
    type: 'deposit', 
    amt: '', 
    desc: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    const [tRes, aRes] = await Promise.all([api.get('/transactions'), api.get('/accounts')]);
    setTxs(tRes.data);
    setAccounts(aRes.data);
    
    if (location.state?.accNo) {
      const targetAcc = aRes.data.find(a => a.accNo === location.state.accNo);
      if (targetAcc) {
        setSelectedAcc(targetAcc);
        setFormData(prev => ({ ...prev, accId: targetAcc.id }));
        setShowAdd(true);
      }
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!id) {
       toast.error("Unable to identify transaction for deletion");
       return;
    }
    if (window.confirm("Permanently delete this transaction? This will update account balances.")) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success("Transaction deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting transaction');
      }
    }
  };

  useEffect(() => { fetchData(); }, [location.state]);

  const resetForm = () => {
    setFormData({ 
      accId: '', 
      secAccId: '', 
      type: 'deposit', 
      amt: '', 
      desc: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedAcc(null);
    setEditId(null);
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    if (!formData.accId) {
      toast.error("Please select an account first");
      return;
    }
    if (!formData.secAccId) {
      toast.error("Please select a payment mode / secondary account");
      return;
    }
    if (!formData.amt || parseFloat(formData.amt) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, formData);
        toast.success("Transaction updated");
      } else {
        await api.post('/transactions', formData);
        toast.success("Transaction recorded");
      }
      resetForm();
      setShowAdd(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing transaction');
    }
  };

  const isLoanAcc = selectedAcc && (
    (selectedAcc.group || '').toUpperCase().includes('LOAN') || 
    (selectedAcc.type || '').toUpperCase().includes('LOAN')
  );

  const handleAccountSelect = (acc) => {
    setSelectedAcc(acc);
    const isLoan = (acc.group || '').toUpperCase().includes('LOAN') || (acc.type || '').toUpperCase().includes('LOAN');
    setFormData(prev => ({ 
      ...prev, 
      accId: acc.id,
      type: prev.type === 'adjustment' ? 'adjustment' : (isLoan ? 'loan_disbursement' : 'deposit')
    }));
    setSearchTerm('');
  };

  const filteredTxs = txs.filter(tx => {
    const acc = accounts.find(a => a.id === tx.accId);
    const date = tx.date.split('T')[0];
    const matchesSearch = 
      (acc?.name || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (tx.desc || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (tx.voucherNo || '').toLowerCase().includes(historySearch.toLowerCase());
    
    const matchesDate = (!historyFrom || date >= historyFrom) && (!historyTo || date <= historyTo);
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-[#f0f2f5] min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">Transactions</h1>
        {!showAdd && (
          <Button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-[#2c3e50] hover:bg-[#34495e] text-white">
            <Plus size={18} className="mr-2" /> CREATE VOUCHER
          </Button>
        )}
      </div>

      {/* History Filters */}
      <Card className="mb-4 p-4 border-none shadow-sm bg-white rounded-md flex flex-col md:flex-row gap-4 items-center">
         <input 
           placeholder="Search History..." 
           className="flex-1 w-full p-2 border border-slate-200 rounded text-sm italic focus:outline-none focus:border-indigo-400"
           value={historySearch}
           onChange={e => setHistorySearch(e.target.value)}
         />
         <div className="flex items-center gap-2 w-full md:w-auto">
           <input 
             type="date" 
             className="p-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-400" 
             value={historyFrom}
             onChange={e => setHistoryFrom(e.target.value)}
           />
           <input 
             type="date" 
             className="p-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-400" 
             value={historyTo}
             onChange={e => setHistoryTo(e.target.value)}
           />
           {(historyFrom || historyTo || historySearch) && (
              <button 
                onClick={() => { setHistorySearch(''); setHistoryFrom(''); setHistoryTo(''); }}
                className="text-[10px] font-black text-red-500 hover:underline uppercase"
              >
                Clear
              </button>
           )}
         </div>
      </Card>

      {showAdd && (
        formData.type === 'adjustment' ? (
          <AdjustmentEntryForm 
            accounts={accounts}
            onClose={() => { setShowAdd(false); setEditId(null); setSelectedAcc(null); }}
            onSuccess={() => { setShowAdd(false); setEditId(null); setSelectedAcc(null); fetchData(); }}
            initialData={editId ? { ...formData, id: editId } : null}
          />
        ) : (
        <Card className="mb-8 border-none shadow-sm bg-white p-6 rounded-md border-t-4 border-t-indigo-500">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editId ? 'Edit Voucher' : 'New Voucher'}</h2>
             <button onClick={() => { setShowAdd(false); setEditId(null); setSelectedAcc(null); }} className="text-slate-400 hover:text-slate-600">
               <X size={20} />
             </button>
           </div>
           <div className="mb-6 relative">
             <input 
               placeholder="Search Account Name or Number..."
               className="w-full p-2.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
             {searchTerm && (
               <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 shadow-xl max-h-60 overflow-y-auto rounded-b-md">
                 {accounts
                   .filter(a => (
                        (user?.role === 'agent') 
                        ? (user?.assignedAccounts || []).includes(a.id) 
                        : true
                      ) && (
                     a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     (a.accNo || '').toLowerCase().includes(searchTerm.toLowerCase())
                   ))
                   .map(acc => (
                     <div 
                       key={acc.id} 
                       onClick={() => handleAccountSelect(acc)}
                       className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center"
                     >
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="font-bold text-slate-800 text-sm">{acc.name}</p>
                             {acc.status === 'inactive' && (
                               <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase">Inactive</span>
                             )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{acc.type}</p>
                        </div>
                        <p className="text-xs font-black text-blue-600">{acc.accNo}</p>
                     </div>
                   ))}
               </div>
             )}
           </div>

           {selectedAcc && (
             <div className="bg-[#e0f2f1] p-4 rounded mb-6 border border-[#b2dfdb] relative group">
                <span className="absolute top-2 right-2 bg-[#2ecc71] text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest">{selectedAcc.accNo}</span>
                <p className="font-black text-[#16a085] text-lg uppercase tracking-tight">{selectedAcc.name} - {selectedAcc.type}</p>
                <div className="flex gap-6 mt-1">
                   <p className="text-xs text-slate-600">Op Date: <span className="font-black tabular-nums">{selectedAcc.openingDate ? new Date(selectedAcc.openingDate).toLocaleDateString('en-GB') : (selectedAcc.createdAt ? new Date(selectedAcc.createdAt).toLocaleDateString('en-GB') : 'N/A')}</span></p>
                   <p className="text-xs text-slate-600">Cur Bal: <span className={cn("font-black tabular-nums", selectedAcc.balance < 0 ? "text-red-500" : "text-[#16a085]")}>₹{selectedAcc.balance?.toLocaleString() || '0.00'}</span></p>
                </div>
                <button 
                  onClick={() => { setSelectedAcc(null); setFormData(prev => ({ ...prev, accId: '' })); }}
                  className="absolute bottom-2 right-2 text-[10px] font-black text-[#16a085] hover:underline"
                >
                   CHANGE ACCOUNT
                </button>
             </div>
           )}

           <form onSubmit={handleEntry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Transaction Type</label>
                   <select 
                     className="w-full p-2.5 bg-white border border-slate-200 rounded text-sm font-bold focus:outline-none focus:border-blue-400"
                     value={formData.type}
                     onChange={e => setFormData({ ...formData, type: e.target.value })}
                   >
                     {isLoanAcc ? (
                        <>
                          <option value="loan_disbursement">Payment / Disbursement</option>
                          <option value="repay_princ">Repayment</option>
                        </>
                      ) : (
                        <>
                          <option value="deposit">Deposit/Receipt</option>
                          <option value="withdraw">Withdrawal/Payment</option>
                        </>
                      )}
                     <option value="collection">Agent Collection</option>
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Date</label>
                   <input 
                     type="date"
                     className="w-full p-2.5 bg-white border border-slate-200 rounded text-sm font-bold focus:outline-none focus:border-blue-400"
                     value={formData.date}
                     onChange={e => setFormData({ ...formData, date: e.target.value })}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Payment Mode (Secondary Account)</label>
                   <select 
                     className="w-full p-2.5 bg-white border border-slate-200 rounded text-sm font-bold focus:outline-none focus:border-blue-400"
                     value={formData.secAccId}
                     onChange={e => setFormData({ ...formData, secAccId: e.target.value })}
                     required
                   >
                     <option value="">Select Account</option>
                     {accounts.filter(a => a.category === 'ledger' || a.type?.toLowerCase().includes('cash') || a.type?.toLowerCase().includes('bank')).map(a => (
                       <option key={a.id} value={a.id}>
                         {a.name} (Bal: ₹{a.balance?.toLocaleString() || '0.00'})
                       </option>
                     ))}
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Amount</label>
                   <input 
                     type="number"
                     placeholder="0.00"
                     className="w-full p-2.5 bg-white border border-slate-200 rounded text-sm font-bold focus:outline-none focus:border-blue-400 placeholder:font-normal"
                     value={formData.amt}
                     onChange={e => setFormData({ ...formData, amt: e.target.value })}
                     required
                   />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Narration/Details</label>
                 <textarea 
                   rows="1"
                   placeholder="Optional notes about this transaction"
                   className="w-full p-2.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                   value={formData.desc}
                   onChange={e => setFormData({ ...formData, desc: e.target.value })}
                 />
              </div>
              <div className="flex items-center gap-3">
                 <button 
                   type="submit" 
                   className="bg-[#2980b9] hover:bg-[#3498db] text-white font-black px-8 py-2.5 rounded shadow-md transition-colors flex items-center gap-2"
                 >
                   <Check size={18} /> SAVE
                 </button>
                 <button 
                   type="button"
                   onClick={() => { setShowAdd(false); setEditId(null); setSelectedAcc(null); }}
                   className="bg-[#e67e22] hover:bg-[#f39c12] text-white font-black px-8 py-2.5 rounded shadow-md transition-colors flex items-center gap-2"
                 >
                   <X size={18} /> CANCEL
                 </button>
              </div>
           </form>
        </Card>
        )
      )}



      {/* Table Section */}
      <Card className="p-0 overflow-hidden border-none shadow-sm bg-white rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fa] border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">VOU</th>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">Date</th>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">Account</th>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">Type</th>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">Amount</th>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">Desc</th>
                <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500 tracking-tight">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400 italic">No transactions found for the selected filters.</td>
                </tr>
              ) : (
                filteredTxs.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accId);
                  return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-[10px] font-black text-slate-400">{tx.voucherNo || '-'}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-600">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-slate-800">{acc?.name || 'Unknown'}</p>
                      <p className="text-[9px] text-slate-400 font-bold">({acc?.accNo || 'N/A'})</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                        tx.type === 'income' ? "bg-emerald-100 text-emerald-700" :
                        tx.type === 'expense' ? "bg-rose-100 text-rose-700" :
                        tx.type === 'adjustment' ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-500"
                      )}>{tx.type}</span>
                    </td>
                    <td className="px-4 py-4 font-black text-slate-800 text-sm">
                      ₹{tx.amt?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400 italic max-w-[200px] truncate">
                      {tx.desc}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setPreviewTx(tx);
                            setPreviewAcc(acc);
                          }}
                          title="View & Print Receipt"
                          className="bg-slate-800 text-white p-2 rounded-lg shadow-sm hover:bg-black transition-all"
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditId(tx.id);
                            setFormData({
                              accId: tx.accId,
                              secAccId: tx.secAccId,
                              type: tx.type,
                              amt: tx.amt,
                              desc: tx.desc || '',
                              date: new Date(tx.date).toISOString().split('T')[0]
                            });
                            setSelectedAcc(acc);
                            setSearchTerm('');
                            setShowAdd(true);
                          }}
                          className="bg-amber-500 text-white p-2 rounded-lg shadow-sm hover:bg-amber-600 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id || tx._id)}
                          className="bg-rose-500 text-white p-2 rounded-lg shadow-sm hover:bg-rose-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </Card>

      <ReceiptModal 
        isOpen={!!previewTx} 
        onClose={() => setPreviewTx(null)} 
        tx={previewTx} 
        acc={previewAcc} 
        companyProfile={companyProfile}
        user={user}
      />
    </div>
  );
};




const Adjustments = () => {
  const [txs, setTxs] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ accId: '', secAccId: '', type: 'adjustment', amt: '', desc: '', date: new Date().toISOString().split('T')[0] });
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    const [tRes, aRes] = await Promise.all([api.get('/transactions'), api.get('/accounts')]);
    setTxs(tRes.data.filter(t => t.secAccId && ['adjustment', 'income', 'expense', 'receipt', 'transfer'].includes(t.type)));
    setAccounts(aRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="bg-[#f0f2f5] min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Professional Adjustment</h1>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">Double Entry System (Dr. / Cr.)</p>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-100">
            <Plus size={18} className="mr-2" /> CREATE ENTRY
          </Button>
        )}
      </div>

      {showAdd && (
        <AdjustmentEntryForm 
          accounts={accounts}
          onSuccess={() => { fetchData(); setEditId(null); setFormData({ accId: '', secAccId: '', type: 'adjustment', amt: '', desc: '', date: new Date().toISOString().split('T')[0] }); setShowAdd(false); }}
          onClose={() => { setEditId(null); setFormData({ accId: '', secAccId: '', type: 'adjustment', amt: '', desc: '', date: new Date().toISOString().split('T')[0] }); setShowAdd(false); }}
          initialData={editId ? { ...formData, id: editId } : null}
        />
      )}

      <div className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Adjustment History</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search Narrative / Account..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg">
              <Calendar size={14} className="ml-2 text-slate-400" />
              <input 
                type="date"
                className="bg-transparent border-none text-[10px] font-black uppercase focus:ring-0 outline-none"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <span className="text-slate-300">|</span>
              <input 
                type="date"
                className="bg-transparent border-none text-[10px] font-black uppercase focus:ring-0 outline-none"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            {(searchTerm || startDate || endDate) && (
              <button 
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="text-xs font-black text-rose-500 uppercase hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <Card className="p-0 border-none shadow-md bg-white overflow-hidden rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Debit (Dr) / To</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Credit (Cr) / From</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {txs
                .filter(tx => {
                  const s = searchTerm.toLowerCase();
                  const drAcc = accounts.find(a => a.id === tx.accId)?.name?.toLowerCase() || '';
                  const crAcc = accounts.find(a => a.id === tx.secAccId)?.name?.toLowerCase() || '';
                  const desc = (tx.desc || '').toLowerCase();
                  const matchesSearch = !searchTerm || drAcc.includes(s) || crAcc.includes(s) || desc.includes(s);
                  
                  const txDate = new Date(tx.date).toISOString().split('T')[0];
                  const matchesStart = !startDate || txDate >= startDate;
                  const matchesEnd = !endDate || txDate <= endDate;
                  
                  return matchesSearch && matchesStart && matchesEnd;
                })
                .map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-600">{new Date(tx.date).toLocaleDateString('en-GB')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">VOU#{tx.voucherNo || '00'}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                        tx.type === 'income' ? "bg-emerald-100 text-emerald-700" :
                        tx.type === 'expense' ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                      )}>{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 focus-within:ring-0">
                    <div className="flex items-center gap-2">
                       <ArrowUpRight size={14} className="text-[#27ae60]" />
                       <div>
                         <p className="text-sm font-black text-slate-800">{accounts.find(a => a.id === tx.accId)?.name}</p>
                         <p className="text-[10px] text-emerald-500 font-black tracking-widest">DEBIT (DR)</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <ArrowDownRight size={14} className="text-[#c0392b]" />
                       <div>
                         <p className="text-sm font-black text-slate-800">{accounts.find(a => a.id === tx.secAccId)?.name}</p>
                         <p className="text-[10px] text-red-500 font-black tracking-widest">CREDIT (CR)</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-end">
                      <p className="font-black text-slate-900 text-base">₹{tx.amt?.toLocaleString()}</p>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditId(tx.id);
                            setFormData({
                              accId: tx.accId,
                              secAccId: tx.secAccId,
                              type: tx.type,
                              amt: tx.amt,
                              desc: tx.desc || '',
                              date: new Date(tx.date).toISOString().split('T')[0]
                            });
                            setShowAdd(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[10px] text-indigo-600 font-black uppercase hover:underline mt-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to REVERSE this adjustment? This will undo the balance changes.")) {
                              try {
                                const targetId = tx.id || tx._id;
                                if (!targetId) throw new Error("No primary key found for transaction");
                                await api.delete(`/transactions/${targetId}`);
                                toast.success("Adjustment Reversed Successfully");
                                fetchData();
                              } catch (err) {
                                toast.error(err.response?.data?.message || "Error reversing adjustment");
                              }
                            }
                          }}
                          className="text-[10px] text-red-500 font-black uppercase hover:underline mt-1"
                        >
                          Reverse
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No adjustments recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

const MasterGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'Asset' });

  const fetchData = () => api.get('/groups').then(res => setGroups(res.data));
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDuplicate = groups.some(g => g.name.toLowerCase() === formData.name.toLowerCase() && g.id !== editId);
    if (isDuplicate) {
      toast.error('Group name already exists!');
      return;
    }

    try {
      if (editId) {
        await api.put(`/groups/${editId}`, formData);
        toast.success('Group updated');
      } else {
        await api.post('/groups', formData);
        toast.success('Group created');
      }
      setFormData({ name: '', type: 'Asset' });
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error saving group');
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Permanently remove this classification group?")) {
      try {
        await api.delete(`/groups/${id}`);
        toast.success('Group deleted');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting group');
      }
    }
  };

  const handleEdit = (g) => {
    setEditId(g.id);
    setFormData({ name: g.name, type: g.type });
    setShowModal(true);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Groups</h1>
          <p className="text-slate-500 font-medium">Categorization for balance sheet</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6">
          <Plus size={20} /> Add Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map(g => (
          <Card key={g.id} className="border-l-4 border-slate-900 group">
             <div className="flex justify-between items-start">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{g.type}</p>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEdit(g)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                 <button onClick={() => {
                   if (window.confirm(`Permanently delete group: ${g.name}?`)) handleDelete(g.id || g._id);
                 }} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
               </div>
             </div>
             <h4 className="text-xl font-black text-slate-800">{g.name}</h4>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); setFormData({ name: '', type: 'Asset' }); }} title={editId ? "Edit Group" : "Create New Group"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Group Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Group Type</label>
            <select className="w-full p-2 border rounded-lg" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
              {['Asset', 'Liability', 'Income', 'Expense', 'Equity'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full">{editId ? 'Update Group' : 'Create Group'}</Button>
        </form>
      </Modal>
    </div>
  );
};

const MasterTypesPage = () => {
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', prefix: '', group: '' });
  const [groups, setGroups] = useState([]);

  const fetchData = async () => {
    const [tRes, gRes] = await Promise.all([api.get('/account-types'), api.get('/groups')]);
    setTypes(tRes.data);
    setGroups(gRes.data);
    if (gRes.data.length > 0 && !formData.group) setFormData(prev => ({ ...prev, group: gRes.data[0].name }));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameDuplicate = types.some(t => t.name.toLowerCase() === formData.name.toLowerCase() && t.id !== editId);
    const isPrefixDuplicate = types.some(t => t.prefix.toLowerCase() === formData.prefix.toLowerCase() && t.id !== editId);
    
    if (isNameDuplicate) {
      toast.error('Type name already exists!');
      return;
    }
    if (formData.prefix && isPrefixDuplicate) {
      toast.error('Prefix already exists!');
      return;
    }

    try {
      if (editId) {
        await api.put(`/account-types/${editId}`, formData);
        toast.success('Voucher type updated');
      } else {
        await api.post('/account-types', formData);
        toast.success('Voucher type created');
      }
      setFormData({ name: '', prefix: '', group: groups[0]?.name || '' });
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error saving voucher type');
    }
  };

  const handleEdit = (t) => {
    setEditId(t.id);
    setFormData({ name: t.name, prefix: t.prefix, group: t.group });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher type?')) {
      try {
        await api.delete(`/account-types/${id}`);
        toast.success('Voucher type deleted');
        fetchData();
      } catch (err) {
        toast.error('Error deleting voucher type');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Voucher Types</h1>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6">
          <Plus size={20} /> Add Type
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {types.map(t => (
          <Card key={t.id} className="border-t-4 border-indigo-600 relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleEdit(t)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
               <button onClick={() => {
                 if (window.confirm(`Permanently delete account type: ${t.name}?`)) handleDelete(t.id || t._id);
               }} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
            </div>
            <h4 className="font-bold text-lg">{t.name}</h4>
            <p className="text-xs font-black text-indigo-400 uppercase">{t.prefix} SERIES</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">Mapped to: {t.group}</p>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? "Edit Voucher Type" : "Create New Voucher Type"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Type Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Fixed Deposit" required />
          <Input label="Prefix (Series)" value={formData.prefix} onChange={e => setFormData({ ...formData, prefix: e.target.value })} placeholder="e.g. FD" required />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Link to Account Group</label>
            <select className="w-full p-2 border rounded-lg" value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })} required>
              {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full">{editId ? 'Update Type' : 'Create Type'}</Button>
        </form>
      </Modal>
    </div>
  );
};

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobile: '', username: '', password: '', assignedAccounts: [] });
  const [editId, setEditId] = useState(null);

  // Assignment states
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedAccsForAssign, setSelectedAccsForAssign] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentRes, accRes] = await Promise.all([
        api.get('/agents'),
        api.get('/accounts')
      ]);
      setAgents(agentRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        username: formData.username.trim().toLowerCase()
      };

      const isNameDuplicate = (Array.isArray(agents) ? agents : []).some(a => (a.name || '').toLowerCase() === payload.name.toLowerCase() && a.id !== editId);
      const isUsernameDuplicate = (Array.isArray(agents) ? agents : []).some(a => (a.username || '').toLowerCase() === payload.username.toLowerCase() && a.id !== editId);

      if (isNameDuplicate) {
        toast.error('Agent name already exists!');
        setLoading(false);
        return;
      }
      if (isUsernameDuplicate) {
        toast.error('Username already taken!');
        setLoading(false);
        return;
      }

      if (editId) {
        await api.put(`/agents/${editId}`, payload); 
        toast.success('Agent updated successfully');
      } else {
        await api.post('/agents', payload);
        toast.success('Agent onboarded successfully');
      }
      setShowAdd(false);
      setEditId(null);
      setFormData({ name: '', mobile: '', username: '', password: '', assignedAccounts: [] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing agent');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await api.delete(`/agents/${id}`);
        toast.success('Agent deleted');
        fetchData();
      } catch (err) {
        toast.error('Error deleting agent');
      }
    }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setFormData({
      name: a.name,
      mobile: a.mobile,
      username: a.username,
      password: '',
      assignedAccounts: a.assignedAccounts || []
    });
    setShowAdd(true);
  };

  const handleBulkAssign = async () => {
    if (!selectedAgentForAssign) {
      toast.error("Please select an agent first");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/agents/${selectedAgentForAssign}`, { assignedAccounts: selectedAccsForAssign });
      toast.success('Assignments updated successfully');
      setShowAssign(false);
      setSelectedAgentForAssign('');
      setSelectedAccsForAssign([]);
      fetchData();
    } catch (err) {
      toast.error('Failed to update assignments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccs = (Array.isArray(accounts) ? accounts : []).filter(acc => {
    if (acc.status !== 'active') return false;
    const name = (acc.name || '').toLowerCase();
    const accNo = (acc.accNo || '').toLowerCase();
    const type = (acc.type || '').toLowerCase();
    const group = (acc.group || '').toLowerCase();

    // 1. STRICT EXCLUSION: Internal ledgers, banks, expenses
    const excludeKeywords = [
      'interest', 'rent', 'salary', 'commission', 'postage', 'electricity', 
      'office', 'drawing', 'staff', 'owner', 'expense', 'income', 
      'bank', 'tax', 'gst', 'tds', 'cash', 'suspense', 'charges', 'profit', 'loss',
      'audit', 'fee', 'maintenance', 'bad debt', 'depreciation', 'capital'
    ];
    
    if (excludeKeywords.some(k => 
      name.includes(k) || type.includes(k) || group.includes(k)
    )) return false;

    // 2. STRICT INCLUSION: Looks like a customer account
    const customerPrefixes = /^(pa|pg|sb|rd|fd|pl|gl|dl|cl|od|pg)/i;
    const isCustomerType = ['pigmy', 'savings', 'rd', 'loan', 'recurring', 'fixed', 'fd', 'personal', 'gold', 'daily'].some(p => 
      type.includes(p) || group.includes(p)
    );
    const hasCustomerNo = customerPrefixes.test(accNo);

    // If it matches customer patterns and isn't a bank/internal, include it
    if (hasCustomerNo || isCustomerType) return true;

    // Default: Exclude if it doesn't clearly look like a customer account
    return false;
  }).filter(acc => 
    acc.name.toLowerCase().includes(assignSearch.toLowerCase()) || 
    (acc.accNo || '').toLowerCase().includes(assignSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance</h1>
          <p className="text-slate-500 font-medium">Manage your field agents and assignments</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowAssign(true)} variant="secondary" className="flex items-center gap-2 flex-1 sm:flex-none">
            <CheckSquare size={18}/> Assign Accounts
          </Button>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2 flex-1 sm:flex-none justify-center shadow-lg shadow-indigo-100">
            <Plus size={20}/> Onboard Agent
          </Button>
        </div>
      </div>

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Assign Accounts to Agent">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500">1. Select Agent</label>
               <select 
                  className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:border-orange-500"
                  value={selectedAgentForAssign}
                  onChange={e => {
                     const agentId = e.target.value;
                     setSelectedAgentForAssign(agentId);
                     const agent = agents.find(a => a.id === agentId);
                     setSelectedAccsForAssign(agent?.assignedAccounts || []);
                  }}
               >
                  <option value="">-- Select Agent --</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500">2. Select Accounts (Hold Ctrl/Cmd to select multiple)</label>
               <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <input 
                     placeholder="Search Account Name or No..." 
                     className="w-full p-3 border-b border-slate-100 text-sm focus:outline-none focus:border-orange-400"
                     value={assignSearch}
                     onChange={e => setAssignSearch(e.target.value)}
                  />
                  <select 
                     multiple 
                     className="w-full h-48 p-2 font-bold text-slate-700 text-xs focus:outline-none"
                     value={selectedAccsForAssign}
                     onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedAccsForAssign(values);
                     }}
                  >
                     {filteredAccs.map(acc => (
                        <option key={acc.id} value={acc.id} className="p-2 cursor-pointer hover:bg-orange-50 checked:bg-orange-100 checked:text-orange-700">
                           {acc.accNo} - {acc.name} - {acc.group || acc.type || 'PIGMY'}
                        </option>
                     ))}
                  </select>
               </div>
            </div>

            <button 
               onClick={handleBulkAssign}
               disabled={loading}
               className="w-full py-4 bg-[#ef8a26] hover:bg-[#d67b21] text-white font-black rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
               {loading ? 'Saving...' : 'Save Assignments'}
            </button>
         </div>
      </Modal>
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Onboard New Field Agent">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Mobile Number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
          <Input label="Login Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
          <Input label="Login Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editId} />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Assigned Accounts to Agent for collection</label>
            <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg p-2 grid grid-cols-1 gap-1">
               {(Array.isArray(accounts) ? accounts : []).filter(acc => {
                  if (acc.status !== 'active') return false;
                  const name = (acc.name || '').toLowerCase();
                  const accNo = (acc.accNo || '').toLowerCase();
                  const type = (acc.type || '').toLowerCase();
                  const group = (acc.group || '').toLowerCase();

                  // STRICT EXCLUSION: Internal ledgers, banks, expenses
                  const excludeKeywords = [
                    'interest', 'rent', 'salary', 'commission', 'postage', 'electricity', 
                    'office', 'drawing', 'staff', 'owner', 'expense', 'income', 
                    'bank', 'tax', 'gst', 'tds', 'cash', 'suspense', 'charges', 'profit', 'loss',
                    'audit', 'fee', 'maintenance', 'bad debt', 'depreciation', 'capital'
                  ];
                  
                  if (excludeKeywords.some(k => 
                    name.includes(k) || type.includes(k) || group.includes(k)
                  )) return false;

                  // STRICT INCLUSION: Looks like a customer account
                  const customerPrefixes = /^(pa|pg|sb|rd|fd|pl|gl|dl|cl|od|pg)/i;
                  const isCustomerType = ['pigmy', 'savings', 'rd', 'loan', 'recurring', 'fixed', 'fd', 'personal', 'gold', 'daily'].some(p => 
                    type.includes(p) || group.includes(p)
                  );
                  const hasCustomerNo = customerPrefixes.test(accNo);

                  return hasCustomerNo || isCustomerType;
               }).map(acc => (
                  <label key={acc.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                     <input 
                        type="checkbox" 
                        checked={formData.assignedAccounts.includes(acc.id)}
                        onChange={e => {
                           const newAssigned = e.target.checked 
                              ? [...formData.assignedAccounts, acc.id]
                              : formData.assignedAccounts.filter(id => id !== acc.id);
                           setFormData({ ...formData, assignedAccounts: newAssigned });
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                     />
                     <span className="text-[11px] font-bold text-slate-600">{acc.name} <span className="text-slate-400 font-medium tracking-tighter">({acc.accNo})</span> <span className="text-[9px] uppercase text-indigo-400 italic">[{acc.group || acc.type}]</span></span>
                  </label>
               ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 mt-4" disabled={loading}>
            {loading ? 'Processing...' : (editId ? 'Update Agent' : 'Confirm Onboarding')}
          </Button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(agents) ? agents : []).map(a => (
          <Card key={a.id} className="flex items-center gap-4 hover:shadow-lg transition-shadow border-l-4 border-indigo-600">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-slate-200">
              {(a.name || a.username)[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-black text-slate-900">{a.name || a.username}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{a.username}</p>
              <p className="text-[10px] text-indigo-600 font-black mt-1 bg-indigo-50 px-2 py-0.5 rounded inline-block">Active Field Agent</p>
            </div>
            <div className="ml-auto flex gap-2">
               <button 
                onClick={() => {
                  const shareText = `App Link: ${window.location.origin}`;
                  navigator.clipboard.writeText(shareText);
                  toast.success("Application link copied!");
                }}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Share Credentials"
              >
                <Share2 size={18}/>
              </button>
              <button 
                onClick={() => handleEdit(a)}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                title="Edit Agent"
              >
                <Edit2 size={18}/>
              </button>
              <button 
                onClick={() => handleDelete(a.id || a._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Agent"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          </Card>
        ))}
        {agents.length === 0 && !loading && (
          <div className="lg:col-span-3 py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
               <Users size={32} />
             </div>
             <p className="text-slate-400 italic font-medium">No field agents registered for this tenant</p>
             <Button variant="secondary" onClick={() => setShowAdd(true)}>Register Your First Agent</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsPage = ({ user, companyProfile }) => {
  const [activeReport, setActiveReport] = useState(null);
  const [data, setData] = useState({ transactions: [], accounts: [], customers: [], groups: [], agents: [] });
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: activeReport ? `${activeReport.toUpperCase()} Report` : 'Report',
    onAfterPrint: () => console.log('Print success'),
    onPrintError: (error) => console.error('Print failed', error),
  });

  const handlePrintReceipt = (tx) => {
    setSelectedTxForReceipt(tx);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer record from this view?")) {
      setData(prev => ({
        ...prev,
        customers: prev.customers.filter(c => c.id !== customerId)
      }));
      toast.success("Customer removed from view (not deleted from database)");
    }
  };
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [typeSearch, setTypeSearch] = useState('');

  const [selectedLedger, setSelectedLedger] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, accRes, custRes, groupRes, agentRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/accounts'),
          api.get('/customers'),
          api.get('/groups'),
          api.get('/agents')
        ]);

        let filteredAccs = accRes.data;
        let filteredTxs = txRes.data;

        setData({ 
          transactions: filteredTxs, 
          accounts: filteredAccs, 
          customers: custRes.data,
          groups: groupRes.data,
          agents: agentRes.data
        });
      } catch (err) {
        if (err.response?.status === 401) return;
        console.error("Error fetching report data", err);
      }
    };
    fetchData();
  }, [user]);

  const setPredefinedRange = (type) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (type) {
      case 'today':
        from = new Date();
        to = new Date();
        break;
      case 'week':
        const day = today.getDay();
        from.setDate(today.getDate() - day);
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case '3months':
        from.setMonth(today.getMonth() - 2);
        from.setDate(1);
        break;
      case '6months':
        from.setMonth(today.getMonth() - 5);
        from.setDate(1);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31);
        break;
      case 'fiscal':
        const year = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
        from = new Date(year, 3, 1);
        to = new Date(year + 1, 2, 31);
        break;
    }
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };

  const reportModules = [
    { id: 'customers', label: 'Cust List', icon: <Users size={28} />, color: 'text-sky-500' },
    { id: 'daybook', label: 'Day Book', icon: <Calendar size={28} />, color: 'text-sky-500' },
    { id: 'balbook', label: 'Bal Book', icon: <BookOpen size={28} />, color: 'text-sky-500' },
    { id: 'accbal', label: 'Schedule', icon: <ListOrdered size={28} />, color: 'text-sky-500' },
    { id: 'ledger', label: 'Ledger', icon: <List size={28} />, color: 'text-sky-500' },
    { id: 'loans', label: 'Loans', icon: <Banknote size={28} />, color: 'text-sky-500' },
    { id: 'recpay', label: 'Rec/Pay', icon: <ArrowRightLeft size={28} />, color: 'text-sky-500' },
    { id: 'pnl', label: 'P & L', icon: <TrendingUp size={28} />, color: 'text-sky-500' },
    { id: 'balancesheet', label: 'Bal Sheet', icon: <Scale size={28} />, color: 'text-sky-500' },
    { id: 'handover', label: 'Handover Rep', icon: <Handshake size={28} />, color: 'text-sky-500' },
    { id: 'agent', label: 'Assigned Accounts', icon: <User size={28} />, color: 'text-sky-500' },
  ];

  const Header = ({ title }) => (
    <div className="text-center py-4 border-b border-slate-100 bg-white print:border-none flex flex-col items-center justify-center">
      {companyProfile?.logo && (
        <img src={companyProfile.logo} alt="Logo" className="w-16 h-16 object-contain mb-2 print:block" referrerPolicy="no-referrer" />
      )}
      <h1 className="text-lg sm:text-2xl font-black text-[#1e293b] uppercase tracking-tighter">
        {companyProfile?.name || 'Srushti Finance'}
      </h1>
      <h2 className="mt-1 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h2>
      <p className="text-[9px] text-slate-400 font-bold">
        {fromDate === toDate 
          ? `As on: ${new Date(fromDate).toLocaleDateString('en-GB')}` 
          : `Period: ${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}`}
      </p>
    </div>
  );

  const Toolbar = ({ onBack, title, onPrint }) => {
    return (
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-2 py-3 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => {
                if (onBack) onBack();
                else setActiveReport(null);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[linear-gradient(to_right,#FF007F,#FF69B4)] text-white font-black text-[10px] uppercase rounded-lg shadow-md hover:opacity-90 transition-opacity shrink-0"
            >
              <ArrowLeft size={14} /> BACK
            </button>
            
            <div className="flex flex-col min-w-0 pr-2 border-r border-slate-100 hidden sm:flex">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Report</span>
              <h3 className="text-xs font-black text-slate-900 truncate tracking-tight uppercase leading-none">{title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={onPrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[linear-gradient(to_right,#007BFF,#00D2FF)] text-white font-black text-[10px] uppercase rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              <Printer size={14} /> PRINT REPORT
            </button>
            <button 
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[linear-gradient(to_right,#32CD32,#ADFF2F)] text-white font-black text-[10px] uppercase rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              <Filter size={14} /> FILTER
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (!data || !data.accounts) return (
      <div className="p-20 text-center">
        <RefreshCw className="mx-auto animate-spin text-slate-300 mb-4" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Synchronizing Data...</p>
      </div>
    );

    switch (activeReport) {
      case 'customers': {
        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar title="Customer List" onPrint={handlePrint} />
            <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden mb-10">
                <Header title="Customer List" />
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] min-w-[800px]">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-black uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left w-12">S.No</th>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Mobile</th>
                        <th className="px-4 py-3 text-left">Address</th>
                        <th className="px-4 py-3 text-center">Accounts</th>
                        <th className="px-4 py-3 text-right print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.customers || []).map((c, i) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-4 py-3 text-slate-400 font-bold">{i + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-600">{c.custNo}</td>
                          <td className="px-4 py-3 font-black text-slate-900">{c.name}</td>
                          <td className="px-4 py-3 font-bold text-slate-400">{c.phone || '-'}</td>
                          <td className="px-4 py-3 text-slate-400">{c.address || '-'}</td>
                          <td className="px-4 py-3 text-center font-black text-indigo-600">{(data.accounts || []).filter(a => a.customerId === c.id).length}</td>
                          <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                            <button 
                              onClick={() => handleDeleteCustomer(c.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Remove from list"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'daybook': {
        const cashBankAccIds = (data.accounts || [])
          .filter(a => ['CASH', 'BANK'].includes((a.group || a.type || '').toUpperCase()))
          .map(a => a.id);

        const filteredTxs = (data.transactions || []).filter(t => {
          const d = t.date.split('T')[0];
          const isCashFlow = cashBankAccIds.includes(t.accId) || cashBankAccIds.includes(t.secAccId);
          return isCashFlow && d >= fromDate && d <= toDate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let openingBal = (data.transactions || [])
          .filter(t => {
            const d = t.date.split('T')[0];
            const isCashFlow = cashBankAccIds.includes(t.accId) || cashBankAccIds.includes(t.secAccId);
            return isCashFlow && d < fromDate;
          })
          .reduce((sum, t) => {
            const amt = parseFloat(t.amt || 0);
            if (cashBankAccIds.includes(t.accId)) {
               if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover', 'adjustment', 'receipt'].includes(t.type)) sum += amt;
               if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type)) sum -= amt;
            }
            if (cashBankAccIds.includes(t.secAccId)) {
               if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover', 'transfer', 'receipt'].includes(t.type)) sum += amt;
               if (['withdraw', 'loan_disbursement', 'expense', 'adjustment'].includes(t.type)) sum -= amt;
            }
            return sum;
          }, 0);

        let currentRunning = openingBal;
        const totalIn = filteredTxs.reduce((sum, t) => {
          const amt = parseFloat(t.amt || 0);
          let txIn = 0;
          if (cashBankAccIds.includes(t.accId)) {
             if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover', 'adjustment', 'receipt'].includes(t.type)) txIn += amt;
          }
          if (cashBankAccIds.includes(t.secAccId)) {
             if (['withdraw', 'loan_disbursement', 'expense', 'transfer', 'deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover', 'receipt'].includes(t.type)) {
                // Determine if it's actually In for secondary side
                if (['withdraw', 'loan_disbursement', 'expense'].includes(t.type)) { /* Out */ }
                else txIn += amt;
             }
          }
          return sum + txIn;
        }, 0);

        const totalOut = filteredTxs.reduce((sum, t) => {
          const amt = parseFloat(t.amt || 0);
          let txOut = 0;
          if (cashBankAccIds.includes(t.accId)) {
             if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type)) txOut += amt;
          }
          if (cashBankAccIds.includes(t.secAccId)) {
             // For secondary account, these are the types that typically represent a decrease in balance (depending on accounting)
             // But in this specific app's server.js logic:
             if (['withdraw', 'loan_disbursement', 'expense', 'adjustment'].includes(t.type)) txOut += amt;
          }
          return sum + txOut;
        }, 0);

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar title="Daily Cash Book" onPrint={handlePrint} />
            <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden mb-10">
                <Header title="Daily Cash Book" />
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] min-w-[800px]">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3 text-left w-24">Date</th>
                        <th className="px-4 py-3 text-left">Particulars</th>
                        <th className="px-4 py-3 text-left w-24">Type</th>
                        <th className="px-4 py-3 text-right w-28">In (+)</th>
                        <th className="px-4 py-3 text-right w-28">Out (-)</th>
                        <th className="px-4 py-3 text-right w-32">Balance</th>
                        <th className="px-4 py-3 text-right print:hidden">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic">
                      <tr className="bg-amber-50/50 font-black italic">
                        <td className="px-4 py-3" colSpan="3">Opening Cash Balance</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right font-black">₹{openingBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                      {filteredTxs.map(tx => {
                        const amt = parseFloat(tx.amt || 0);
                        let isIn = false;
                        let isOut = false;

                        if (cashBankAccIds.includes(tx.accId)) {
                           if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover', 'adjustment', 'receipt'].includes(tx.type)) isIn = true;
                           if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(tx.type)) isOut = true;
                        }
                        if (cashBankAccIds.includes(tx.secAccId)) {
                           if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover', 'transfer', 'receipt'].includes(tx.type)) isIn = true;
                           if (['withdraw', 'loan_disbursement', 'expense', 'adjustment'].includes(tx.type)) isOut = true;
                        }

                        if (isIn) currentRunning += amt;
                        if (isOut) currentRunning -= amt;
                        
                        const acc = data.accounts.find(a => a.id === tx.accId);
                        const secAcc = data.accounts.find(a => a.id === tx.secAccId);
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-bold whitespace-nowrap">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3">
                              <span className="font-black text-slate-800">{acc?.name}</span>
                              {secAcc && <span className="text-slate-400 mx-1">/</span>}
                              {secAcc && <span className="text-slate-500 font-bold">{secAcc?.name}</span>}
                              <span className="text-[9px] uppercase font-bold text-slate-400 ml-1">
                                ({acc?.group || acc?.type})
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">{tx.type}</td>
                            <td className={`px-4 py-3 text-right font-black ${isIn ? 'text-emerald-600' : 'text-slate-200'}`}>
                              {isIn ? `₹${amt.toLocaleString()}` : '-'}
                            </td>
                            <td className={`px-4 py-3 text-right font-black ${isOut ? 'text-red-500' : 'text-slate-200'}`}>
                              {isOut ? `₹${amt.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-slate-900 bg-slate-50/30">₹{currentRunning.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                              <button 
                                onClick={() => handlePrintReceipt(tx)}
                                className="p-1 px-2 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100 transition-colors flex items-center gap-1 ml-auto"
                                title="Print Receipt"
                              >
                                <Receipt size={12} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Receipt</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 text-white font-black text-[11px]">
                        <td colSpan="3" className="px-4 py-4 uppercase tracking-widest text-slate-400">Day totals</td>
                        <td className="px-4 py-4 text-right text-emerald-400">₹{totalIn.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-red-400">₹{totalOut.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right">₹{currentRunning.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-4 print:hidden"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'agent': {
        const agents = data.agents;
        if (!selectedAgentId && agents.length > 0) {
          return (
            <div className="max-w-md mx-auto mt-10 px-2">
               <Card className="p-0 overflow-hidden">
                  <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <h2 className="font-black uppercase tracking-widest text-xs">Performance: Select Agent</h2>
                    <X className="cursor-pointer" onClick={() => setActiveReport(null)} />
                  </div>
                  <div className="p-4 space-y-2">
                    {agents.map(a => {
                      return (
                        <button key={a.id} onClick={() => setSelectedAgentId(a.id)} className="w-full p-4 hover:bg-slate-50 transition-all rounded-xl border border-slate-100 flex items-center justify-between group text-left">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-700 group-hover:text-indigo-600 transition-colors uppercase italic">{a.name}</span>
                            <span className="text-[9px] font-bold text-slate-400">Assigned: {(a.assignedAccounts || []).length} Accounts</span>
                          </div>
                          <ChevronRight size={18} className="text-slate-300" />
                        </button>
                      );
                    })}
                  </div>
               </Card>
            </div>
          );
        }

        const agent = data.agents.find(a => a.id === selectedAgentId);
        const agentTxs = data.transactions.filter(t => t.agentId === selectedAgentId && t.date.split('T')[0] >= fromDate && t.date.split('T')[0] <= toDate);
        const totalCollected = agentTxs.reduce((sum, t) => sum + parseFloat(t.amt || 0), 0);

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar onBack={() => setSelectedAgentId(null)} title={`Assigned Accounts: ${agent?.name}`} onPrint={handlePrint} />
            <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title={`Assigned Accounts Report: ${agent?.name}`} />
                <div className="bg-indigo-600 text-white p-8 text-center flex flex-col items-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-2">Total Collection Volume</p>
                   <h3 className="text-5xl font-black italic tracking-tighter">₹{totalCollected.toLocaleString()}</h3>
                </div>
                
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Ledgers for Collection</h4>
                   <div className="flex flex-wrap gap-2">
                      {(agent?.assignedAccounts || []).map(accId => {
                         const acc = data.accounts.find(a => a.id === accId);
                         return (
                            <span key={accId} className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 shadow-sm">
                               {acc?.name || 'Unknown Account'}
                            </span>
                         )
                      })}
                      {(agent?.assignedAccounts || []).length === 0 && <span className="text-[9px] text-slate-400 italic">No accounts explicitly assigned</span>}
                   </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[800px]">
                    <thead className="bg-slate-100 border-b border-slate-800 text-slate-800 font-black uppercase tracking-widest text-[9px]">
                      <tr>
                        <th className="px-4 py-3 text-left border-r border-slate-200">Date</th>
                        <th className="px-4 py-3 text-left border-r border-slate-200">Account</th>
                        <th className="px-4 py-3 text-left border-r border-slate-200">Cust ID</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic">
                      {agentTxs.map(t => {
                        const acc = data.accounts.find(a => a.id === t.accId);
                        const cust = data.customers.find(c => c.id === acc?.customerId);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-400">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3 border-r border-slate-100 font-black">{cust?.name || acc?.name}</td>
                            <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-500">{cust?.custNo}</td>
                            <td className="px-4 py-3 text-right font-black text-indigo-600">₹{parseFloat(t.amt).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                      {agentTxs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-20 text-center text-slate-300 font-black uppercase tracking-widest">No activity for this agent in period</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'ledger': {
        if (!selectedLedger) {
          return (
            <div className="max-w-md mx-auto mt-10 print:hidden px-2">
              <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900">
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Select Ledger</h2>
                  <button onClick={() => setActiveReport(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-700 transition-all">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      placeholder="Search Account Name or Number..."
                      className="w-full pl-12 p-4 border border-slate-100 rounded-xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-400 transition-all shadow-sm"
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden custom-scrollbar bg-slate-50/30">
                    {data.accounts
                      .filter(acc => 
                        acc.name.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                        (acc.accNo || '').toLowerCase().includes(ledgerSearch.toLowerCase())
                      )
                      .map(acc => (
                        <button 
                          key={acc.id} 
                          onClick={() => setSelectedLedger(acc)}
                          className="w-full p-5 hover:bg-white transition-all text-left group border-none outline-none"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-black text-[#1e293b] group-hover:text-[#0e7490] transition-colors">{acc.name}</p>
                              <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{acc.accNo || 'No ID'} • {acc.group || acc.type || 'General'}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-200 group-hover:text-[#0e7490] transition-all transform group-hover:translate-x-1" />
                          </div>
                        </button>
                      ))}
                    {data.accounts.filter(acc => acc.name.toLowerCase().includes(ledgerSearch.toLowerCase())).length === 0 && (
                      <div className="p-10 text-center text-slate-400 font-bold italic">No accounts found...</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        }

        const ac = selectedLedger;
        // Accounting logic:
        // Assets/Expenses: Dr increases (+), Cr decreases (-)
        // Liabilities/Equity/Income: Cr increases (+), Dr decreases (-)
        const isAssetOrExpense = ['ASSET', 'EXPENSE', 'CASH', 'BANK'].some(word => 
          (ac.group || '').toUpperCase().includes(word) || 
          (ac.type || '').toUpperCase().includes(word)
        );
        
        let ledgerRunningBal = 0;
        
        // Calculate Opening Balance
        const pastTxs = data.transactions.filter(t => 
          (t.accId === ac.id || t.secAccId === ac.id) && 
          t.date.split('T')[0] < fromDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));

        pastTxs.forEach(t => {
          const amt = parseFloat(t.amt || 0);
          let dr = 0;
          let cr = 0;

          if (t.type === 'adjustment') {
            if (t.accId === ac.id) dr = amt;
            else if (t.secAccId === ac.id) cr = amt;
          } else {
            if (t.accId === ac.id) {
              if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'receipt', 'agent_handover'].includes(t.type)) {
                cr = amt;
              } else if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type)) {
                dr = amt;
              }
            } else if (t.secAccId === ac.id) {
              if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'receipt', 'agent_handover'].includes(t.type)) {
                dr = amt;
              } else if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type)) {
                cr = amt;
              }
            }
          }

          if (isAssetOrExpense) {
            ledgerRunningBal += (dr - cr);
          } else {
            ledgerRunningBal += (cr - dr);
          }
        });

        const periodTxs = data.transactions
          .filter(t => (t.accId === ac.id || t.secAccId === ac.id) && t.date.split('T')[0] >= fromDate && t.date.split('T')[0] <= toDate)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar onBack={() => setSelectedLedger(null)} title={`Ledger: ${ac.name}`} onPrint={handlePrint} />
            <div className="max-w-[1100px] mx-auto w-full px-2 sm:px-4 py-6 overflow-x-auto" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title={`Ledger Report: ${ac.name} ${ac.accNo ? `(${ac.accNo})` : ''}`} />
               
               <table className="w-full text-[12px] border-collapse bg-white">
                 <thead className="bg-[#f8fafc] border-y border-slate-800 text-slate-800 font-bold uppercase tracking-tighter">
                   <tr>
                     <th className="px-5 py-4 border-r border-slate-200 text-left w-32">Date</th>
                     <th className="px-5 py-4 border-r border-slate-200 text-left">Description</th>
                     <th className="px-5 py-4 border-r border-slate-200 text-right w-32">Dr (Debit)</th>
                     <th className="px-5 py-4 border-r border-slate-200 text-right w-32">Cr (Credit)</th>
                     <th className="px-5 py-4 text-right w-40">Balance</th>
                     <th className="px-5 py-4 text-right print:hidden">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {fromDate && (
                     <tr className="bg-[#fff9db] font-black italic border-b border-slate-800">
                       <td className="px-5 py-4 border-r border-slate-200"></td>
                       <td className="px-5 py-4 border-r border-slate-200">Opening Balance as of {new Date(fromDate).toLocaleDateString('en-GB')}</td>
                       <td className="px-5 py-4 border-r border-slate-200"></td>
                       <td className="px-5 py-4 border-r border-slate-200"></td>
                       <td className="px-5 py-4 text-right text-slate-900 border-l border-slate-800 bg-[#fff9db]">
                         ₹{ledgerRunningBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </td>
                       <td className="px-5 py-4 print:hidden"></td>
                     </tr>
                   )}
                   {periodTxs.map(t => {
                     const amt = parseFloat(t.amt || 0);
                     let drValue = null;
                     let crValue = null;
                     let contraAccount = null;

                     if (t.type === 'adjustment') {
                       if (t.accId === ac.id) {
                         drValue = amt;
                         contraAccount = data.accounts.find(a => a.id === t.secAccId);
                       } else if (t.secAccId === ac.id) {
                         crValue = amt;
                         contraAccount = data.accounts.find(a => a.id === t.accId);
                       }
                     } else if (t.accId === ac.id) {
                       contraAccount = data.accounts.find(a => a.id === t.secAccId);
                       if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover'].includes(t.type)) {
                         crValue = amt;
                       } else if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type)) {
                         drValue = amt;
                       }
                     } else if (t.secAccId === ac.id) {
                       contraAccount = data.accounts.find(a => a.id === t.accId);
                       if (['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'agent_handover'].includes(t.type)) {
                         drValue = amt;
                       } else if (['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type)) {
                         crValue = amt;
                       }
                     }
                     
                     const description = t.desc || (contraAccount ? `${t.type.toUpperCase()}: ${contraAccount.name}` : t.type);

                     if (isAssetOrExpense) {
                       ledgerRunningBal += ((drValue || 0) - (crValue || 0));
                     } else {
                       ledgerRunningBal += ((crValue || 0) - (drValue || 0));
                     }
                     
                     // Colors as per user request:
                     // For cash/bank (Assets): Dr is Green(+) Cr is Red(-)
                     // For Liabilities: Cr is Green(+) Dr is Red(-)
                     let drColor = '';
                     let crColor = '';

                     if (isAssetOrExpense) {
                       drColor = 'text-emerald-600';
                       crColor = 'text-red-500';
                     } else {
                       drColor = 'text-red-500';
                       crColor = 'text-emerald-600';
                     }

                     return (
                       <tr key={t.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 group">
                         <td className="px-5 py-4 border-r border-slate-200 text-slate-500 font-bold text-[10px] sm:text-xs">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                         <td className="px-5 py-4 border-r border-slate-200 font-medium text-slate-700">{description}</td>
                         <td className={`px-5 py-4 border-r border-slate-200 text-right font-black ${drColor}`}>
                           {drValue !== null ? `₹${drValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                         </td>
                         <td className={`px-5 py-4 border-r border-slate-200 text-right font-black ${crColor}`}>
                           {crValue !== null ? `₹${crValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                         </td>
                         <td className="px-5 py-4 text-right font-black text-slate-900 border-l border-slate-800 bg-slate-50/30">
                           ₹{ledgerRunningBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </td>
                         <td className="px-5 py-4 text-right print:hidden">
                           <button 
                             onClick={() => handlePrintReceipt(t)}
                             className="p-1 px-2 text-indigo-600 hover:bg-slate-100 rounded border border-indigo-100 transition-colors flex items-center gap-1 ml-auto"
                             title="Print Receipt"
                           >
                             <Receipt size={12} />
                             <span className="text-[9px] font-black uppercase tracking-tighter">Receipt</span>
                           </button>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
                 <tfoot className="border-t-2 border-slate-800">
                   <tr className="bg-[#90cdf4] font-black text-slate-900">
                     <td colSpan="4" className="px-5 py-5 border-r border-slate-200 uppercase tracking-widest text-sm">Closing Balance</td>
                     <td className="px-5 py-5 text-right text-sm">
                       ₹{ledgerRunningBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </td>
                   </tr>
                 </tfoot>
               </table>
            </div>
          </div>
        </div>
      );
    }
    case 'accbal': {
        if (!selectedAccountType) {
          const uniqueTypes = ['ALL ACCOUNTS', ...new Set(data.accounts.map(acc => (acc.type || 'GENERAL').toUpperCase()))];
          return (
            <div className="max-w-md mx-auto mt-10 print:hidden px-2">
              <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900">
                  <h2 className="text-xl font-black text-white">Select Account Type</h2>
                  <button onClick={() => setActiveReport(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-700">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      placeholder="Search Type (e.g. Savings)..."
                      className="w-full pl-12 p-4 border border-slate-100 rounded-lg font-medium text-slate-600 outline-none focus:ring-2 focus:ring-slate-400 transition-all shadow-inner"
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {uniqueTypes
                      .filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()))
                      .map(type => (
                        <button 
                          key={type} 
                          onClick={() => setSelectedAccountType(type)}
                          className="w-full p-4 hover:bg-slate-50 transition-all text-left group flex items-center gap-3"
                        >
                          {type === 'ALL ACCOUNTS' && <ListOrdered size={16} className="text-slate-900" />}
                          <span className="font-black text-slate-800 group-hover:text-black uppercase tracking-tight">{type}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </Card>
            </div>
          );
        }

        const accountsByType = selectedAccountType === 'ALL ACCOUNTS'
          ? data.accounts.reduce((acc, curr) => {
              const type = (curr.type || 'GENERAL').toUpperCase();
              if (!acc[type]) acc[type] = [];
              acc[type].push(curr);
              return acc;
            }, {})
          : { [selectedAccountType]: data.accounts.filter(a => (a.type || '').toUpperCase() === selectedAccountType) };

        const accBalGrandTotal = data.accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
        const selectedTotal = Object.values(accountsByType).flat().reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

        let sNo = 1;

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar onBack={() => setSelectedAccountType(null)} title={`${selectedAccountType} Balances`} onPrint={handlePrint} />
            <div className="max-w-[1000px] mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden">
                <Header title={`${selectedAccountType} Balance Report`} />
               
               <table className="w-full text-[12px] border-collapse">
                 <thead className="bg-white border-b border-slate-800 text-slate-800 font-black">
                   <tr>
                     <th className="px-4 py-3 border-r border-slate-300 text-left w-16">S.No</th>
                     <th className="px-4 py-3 border-r border-slate-300 text-left w-32">Open Date</th>
                     <th className="px-4 py-3 border-r border-slate-300 text-left w-32">Account No</th>
                     <th className="px-4 py-3 border-r border-slate-300 text-left">Particulars</th>
                     <th className="px-4 py-3 text-right w-40">Balance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                   {Object.entries(accountsByType).map(([type, accounts]) => {
                     const subtotal = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
                     return (
                       <React.Fragment key={type}>
                         <tr className="bg-[#eef2f7] border-y border-slate-800">
                           <td colSpan="5" className="px-4 py-2 font-black text-slate-800 uppercase tracking-tight">
                             {type} ACCOUNTS
                           </td>
                         </tr>
                         {accounts.map((acc) => {
                           const customer = data.customers.find(c => c.id === acc.customerId);
                           return (
                             <tr key={acc.id} className="hover:bg-slate-50">
                               <td className="px-4 py-3 border-r border-slate-300">{sNo++}</td>
                               <td className="px-4 py-3 border-r border-slate-300 text-slate-600 italic">
                                 {acc.openingDate ? new Date(acc.openingDate).toLocaleDateString('en-GB') : '-'}
                               </td>
                               <td className="px-4 py-3 border-r border-slate-300 font-bold">{acc.accNo}</td>
                               <td className="px-4 py-3 border-r border-slate-300 font-medium">{customer?.name || acc.name}</td>
                               <td className="px-4 py-3 text-right font-black">
                                 ₹{parseFloat(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                               </td>
                             </tr>
                           );
                         })}
                         <tr className="bg-slate-50 font-black italic">
                           <td colSpan="4" className="px-4 py-3 border-r border-slate-300 text-slate-800">Subtotal {type}</td>
                           <td className="px-4 py-3 text-right text-slate-900 border-l border-white">
                             ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </td>
                         </tr>
                       </React.Fragment>
                     );
                   })}
                 </tbody>
                 <tfoot className="border-t-2 border-slate-800">
                   <tr className="bg-[#90cdf4] font-black text-slate-900 border-t border-slate-800">
                     <td colSpan="4" className="px-4 py-4 border-r border-slate-300 text-sm uppercase tracking-widest">Grand Total</td>
                     <td className="px-4 py-4 text-right text-sm">
                       ₹{selectedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </td>
                   </tr>
                 </tfoot>
               </table>
            </div>
          </div>
        </div>
      );
    }
    case 'balbook': {
        if (!selectedCustomer) {
          return (
            <div className="max-w-xl mx-auto mt-10 print:hidden px-2">
              <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-xl font-black text-slate-800">Select Customer</h2>
                  <button onClick={() => setActiveReport(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      placeholder="Search Name, No, or Place..."
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 rounded-lg text-indigo-700 mb-2">
                       <Users size={16} />
                       <span className="text-[11px] font-black uppercase tracking-wider">All Customers</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {(Array.isArray(data.customers) ? data.customers : [])
                        .filter(c => 
                          (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || 
                          (c.custNo || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.address || '').toLowerCase().includes(customerSearch.toLowerCase())
                        )
                        .map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => setSelectedCustomer(c)}
                            className="w-full p-4 hover:bg-slate-50 rounded-xl transition-all text-left border border-transparent hover:border-slate-100 group"
                          >
                            <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{c.custNo} | {c.address || '-'}</p>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        }

        const customerAccounts = data.accounts.filter(a => a.customerId === selectedCustomer.id);
        const grandTotal = customerAccounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar onBack={() => setSelectedCustomer(null)} title={`Bal Book: ${selectedCustomer.name}`} onPrint={handlePrint} />
            <div className="max-w-[1000px] mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title={`Balance Book: ${selectedCustomer.name}`} />
               
               <div className="bg-[#e9ecef]/50 border-y border-slate-200 p-3 px-6">
                 <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{selectedCustomer.name} ({selectedCustomer.custNo})</p>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-[11px] min-w-[800px]">
                   <thead className="bg-[#e9ecef] border-b border-slate-200 text-slate-600 font-bold">
                     <tr>
                       <th className="px-4 py-3 border-r border-slate-200 text-left">Op Date</th>
                       <th className="px-4 py-3 border-r border-slate-200 text-left">Acc No</th>
                       <th className="px-4 py-3 border-r border-slate-200 text-left">Customer Name</th>
                       <th className="px-3 py-3 border-r border-slate-200 text-left">Type</th>
                       <th className="px-4 py-3 text-left">Balance</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {customerAccounts.map(acc => (
                       <tr key={acc.id} className="hover:bg-slate-50">
                         <td className="px-4 py-3 border-r border-slate-200 font-bold text-slate-400">{acc.openingDate ? new Date(acc.openingDate).toLocaleDateString('en-GB') : (acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('en-GB') : '-')}</td>
                         <td className="px-4 py-3 border-r border-slate-200 font-bold">{acc.accNo}</td>
                         <td className="px-4 py-3 border-r border-slate-200">{selectedCustomer.name}</td>
                         <td className="px-3 py-3 border-r border-slate-200 uppercase font-black text-slate-500">{acc.type}</td>
                         <td className={`px-4 py-3 font-black ${acc.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                           ₹{Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </td>
                       </tr>
                     ))}
                     <tr className="bg-[#a5d8ff] font-black">
                       <td colSpan="4" className="px-4 py-3 border-r border-slate-300 text-[#0c4a6e] uppercase tracking-widest">Grand Total Balance</td>
                        <td className="px-4 py-3 text-slate-900 text-sm">₹{Math.abs(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'loans': {
        const loanAccounts = (data.accounts || []).filter(a => 
          (a.group || '').toUpperCase().includes('LOAN') || 
          (a.type || '').toUpperCase().includes('LOAN')
        );
        const totalGivenAll = loanAccounts.reduce((sum, acc) => {
          return sum + data.transactions
            .filter(t => (t.accId === acc.id || t.accId === acc._id) && t.type === 'loan_disbursement')
            .reduce((s, t) => s + (t.amt || 0), 0);
        }, 0);
        const totalRepayAll = loanAccounts.reduce((sum, acc) => {
          return sum + data.transactions
            .filter(t => (t.accId === acc.id || t.accId === acc._id) && ['repay_princ', 'repay_int', 'collection', 'deposit'].includes(t.type))
            .reduce((s, t) => s + (t.amt || 0), 0);
        }, 0);
        const grandTotalLoans = loanAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar title="Outstanding Loans" onPrint={handlePrint} />
            <div className="max-w-[1200px] mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title="Outstanding Loans Report" />
                <div className="overflow-x-auto">
                 <table className="w-full text-[12px] border-collapse bg-white min-w-[1000px]">
                   <thead className="bg-[#f8fafc] border-y border-slate-800 text-slate-800 font-bold uppercase tracking-tight">
                     <tr>
                       <th className="px-5 py-4 border-r border-slate-200 text-left w-16">S.No</th>
                       <th className="px-5 py-4 border-r border-slate-200 text-left">Customer / Account</th>
                       <th className="px-5 py-4 border-r border-slate-200 text-left">Loan ID</th>
                       <th className="px-5 py-4 border-r border-slate-200 text-right">Given Amt</th>
                       <th className="px-5 py-4 border-r border-slate-200 text-right">Repay Amt</th>
                       <th className="px-5 py-4 text-right">Outstanding Bal</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 italic">
                     {loanAccounts.map((acc, index) => {
                       const cust = data.customers.find(c => c.id === acc.customerId);
                       const accTxs = data.transactions.filter(t => t.accId === acc.id || t.accId === acc._id);
                       const givenAmt = accTxs
                         .filter(t => t.type === 'loan_disbursement')
                         .reduce((sum, t) => sum + (t.amt || 0), 0);
                       const repayAmt = accTxs
                         .filter(t => ['repay_princ', 'repay_int', 'collection', 'deposit'].includes(t.type))
                         .reduce((sum, t) => sum + (t.amt || 0), 0);
                       const outstanding = (acc.balance || 0);

                       return (
                         <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-5 py-4 border-r border-slate-200 text-center">{index + 1}</td>
                           <td className="px-5 py-4 border-r border-slate-200 font-black">{cust?.name || acc.name}</td>
                           <td className="px-5 py-4 border-r border-slate-200 font-bold">{acc.accNo}</td>
                           <td className="px-5 py-4 border-r border-slate-200 text-right font-black text-slate-600">
                             ₹{givenAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </td>
                           <td className="px-5 py-4 border-r border-slate-200 text-right font-black text-emerald-600">
                             ₹{repayAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </td>
                           <td className={`px-5 py-4 text-right font-black ${outstanding < 0 ? 'text-red-600 bg-red-50/20' : 'text-emerald-600 bg-emerald-50/20'}`}>
                             ₹{Math.abs(outstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </td>
                         </tr>
                       );
                     })}
                     {loanAccounts.length === 0 && (
                       <tr>
                         <td colSpan="6" className="px-5 py-20 text-center text-slate-400 font-bold">No active loans found.</td>
                       </tr>
                     )}
                   </tbody>
                   <tfoot className="border-t-2 border-slate-800">
                     <tr className="bg-[#0f172a] text-white font-black">
                       <td colSpan="3" className="px-5 py-6 uppercase tracking-widest text-xs text-right border-r border-slate-600">Grand Totals</td>
                       <td className="px-5 py-6 text-right text-lg text-white border-r border-slate-600">
                         ₹{totalGivenAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </td>
                       <td className="px-5 py-6 text-right text-lg text-emerald-400 border-r border-slate-600">
                         ₹{totalRepayAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </td>
                       <td className="px-5 py-6 text-right text-lg text-red-400">
                         ₹{Math.abs(grandTotalLoans).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </td>
                     </tr>
                   </tfoot>
                 </table>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'recpay': {
        const periodTxs = data.transactions.filter(t => {
          const d = t.date.split('T')[0];
          return d >= fromDate && d <= toDate;
        });

        const receipts = periodTxs.filter(t => ['deposit', 'collection', 'repay_princ', 'repay_int', 'income', 'receipt', 'agent_handover'].includes(t.type));
        const payments = periodTxs.filter(t => ['withdraw', 'loan_disbursement', 'expense', 'transfer'].includes(t.type));

        const totalReceipts = receipts.reduce((sum, t) => sum + parseFloat(t.amt || 0), 0);
        const totalPayments = payments.reduce((sum, t) => sum + parseFloat(t.amt || 0), 0);

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar title="Rec / Pay Account" onPrint={handlePrint} />
            <div className="max-w-[1100px] mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title="Receipts & Payments Account" />
               <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  {/* Receipts Side */}
                  <div className="flex flex-col">
                    <div className="bg-emerald-50 p-4 border-b border-slate-800 text-center italic font-black text-emerald-800 uppercase tracking-widest">
                      Receipts (In)
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-[12px] border-collapse min-w-[350px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr className="text-slate-500 font-black uppercase text-[10px]">
                            <th className="px-4 py-3 text-left border-r border-slate-200">Date</th>
                            <th className="px-4 py-3 text-left border-r border-slate-200">Particulars</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {receipts.map(t => (
                            <tr key={t.id} className="hover:bg-emerald-50/30">
                              <td className="px-4 py-3 border-r border-slate-200 font-bold whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                              <td className="px-4 py-3 border-r border-slate-200 font-medium truncate max-w-[150px]">{t.desc || t.type}</td>
                              <td className="px-4 py-3 text-right font-black text-emerald-600 italic">₹{parseFloat(t.amt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-emerald-100 p-4 border-t border-slate-800 mt-auto flex justify-between items-center font-black">
                       <span className="uppercase text-xs tracking-tighter">Total Receipts</span>
                       <span className="text-emerald-900 italic">₹{totalReceipts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Payments Side */}
                  <div className="flex flex-col">
                    <div className="bg-red-50 p-4 border-b border-slate-800 text-center italic font-black text-red-800 uppercase tracking-widest">
                      Payments (Out)
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-[12px] border-collapse min-w-[350px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr className="text-slate-500 font-black uppercase text-[10px]">
                            <th className="px-4 py-3 text-left border-r border-slate-200">Date</th>
                            <th className="px-4 py-3 text-left border-r border-slate-200">Particulars</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map(t => (
                            <tr key={t.id} className="hover:bg-red-50/30">
                              <td className="px-4 py-3 border-r border-slate-200 font-bold whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                              <td className="px-4 py-3 border-r border-slate-200 font-medium truncate max-w-[150px]">{t.desc || t.type}</td>
                              <td className="px-4 py-3 text-right font-black text-red-600 italic">₹{parseFloat(t.amt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-red-100 p-4 border-t border-slate-800 mt-auto flex justify-between items-center font-black">
                       <span className="uppercase text-xs tracking-tighter">Total Payments</span>
                       <span className="text-red-900 italic">₹{totalPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
               </div>
               <div className="bg-slate-900 text-white p-6 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                      <ArrowRightLeft size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Surplus / Deficit</p>
                      <h4 className={`text-2xl font-black italic ${(totalReceipts - totalPayments) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ₹{(totalReceipts - totalPayments).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                    <p className={`font-black italic uppercase ${(totalReceipts - totalPayments) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(totalReceipts - totalPayments) >= 0 ? 'Surplus' : 'Deficit'}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    }
    case 'pnl': {
        // INCOME accounts: INCOME group or INCOME type
        const incomeAccs = data.accounts.filter(a => (a.group || a.type || '').toUpperCase().includes('INCOME'));
        // EXPENSE accounts: EXPENSE group or EXPENSE type
        const expenseAccs = data.accounts.filter(a => (a.group || a.type || '').toUpperCase().includes('EXPENSE'));

        const totalIncome = incomeAccs.reduce((sum, a) => sum + Math.abs(a.balance || 0), 0);
        const totalExpenses = expenseAccs.reduce((sum, a) => sum + Math.abs(a.balance || 0), 0);
        const netProfit = totalIncome - totalExpenses;

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar title="Profit & Loss Statement" onPrint={handlePrint} />
            <div className="max-w-[1000px] mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title="Profit & Loss Statement" />
               <div className="flex flex-col">
                  {/* Income Section */}
                  <div className="bg-emerald-50/50 p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="text-emerald-600" size={24} />
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Revenue / Income</h3>
                    </div>
                    <div className="space-y-4">
                      {incomeAccs.map(acc => (
                        <div key={acc.id} className="flex justify-between border-b border-emerald-100 pb-2">
                           <span className="font-bold text-slate-600">{acc.name}</span>
                           <span className="font-black text-emerald-700 italic">₹{Math.abs(acc.balance).toLocaleString()}</span>
                        </div>
                      ))}
                      {incomeAccs.length === 0 && <p className="text-slate-400 italic">No income records found.</p>}
                      <div className="flex justify-between pt-4 font-black text-lg text-emerald-900">
                         <span className="uppercase">Total Gross Income</span>
                         <span className="border-b-4 border-emerald-900 pb-1">₹{totalIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expense Section */}
                  <div className="bg-red-50/50 p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingDown className="text-red-600" size={24} />
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Operating Expenses</h3>
                    </div>
                    <div className="space-y-4">
                      {expenseAccs.map(acc => (
                        <div key={acc.id} className="flex justify-between border-b border-red-100 pb-2">
                           <span className="font-bold text-slate-600">{acc.name}</span>
                           <span className="font-black text-red-700 italic">₹{Math.abs(acc.balance).toLocaleString()}</span>
                        </div>
                      ))}
                      {expenseAccs.length === 0 && <p className="text-slate-400 italic">No expense records found.</p>}
                      <div className="flex justify-between pt-4 font-black text-lg text-red-900">
                         <span className="uppercase">Total Operating Expenses</span>
                         <span className="border-b-4 border-red-900 pb-1">₹{totalExpenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Final Net Section */}
                  <div className="bg-slate-900 text-white p-8 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Final Result</p>
                      <h4 className="text-3xl font-black tracking-tighter italic">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</h4>
                    </div>
                    <div className="text-right">
                       <p className={`text-4xl font-black italic ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                         ₹{Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Transferred to Capital / Reserve</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    }
    case 'balancesheet': {
        const assetGroupsSet = ['CASH', 'BANK', 'LOAN', 'ASSET', 'LN', 'ADVANCE', 'GOLD', 'PERSONAL', 'PGL', 'PIGMY', 'PL', 'EQUIPMENT', 'FURNITURE', 'VEHICLE', 'PROPERTY', 'INTERNAL', 'CASH IN HAND'];
        const liabilityGroupsSet = ['DEPOSIT', 'LIABILITY', 'SAVING', 'RD', 'PIGMY', 'SB', 'PG', 'FD', 'FIXED', 'PAYABLE', 'DEBT'];
        const equityGroupsSet = ['CAPITAL', 'EQUITY', 'RESERVE', 'NET PROFIT'];
        const incomeGroupsSet = ['INCOME', 'REVENUE', 'INTEREST RECEIVED', 'COMMISSION'];
        const expenseGroupsSet = ['EXPENSE', 'SALARY', 'RENT', 'INTEREST PAID'];

        const getGroupType = (acc) => {
          const group = data.groups.find(g => g.name === acc.group);
          if (group && group.type) return group.type;
          const name = (acc.group || acc.name || '').toUpperCase();
          if (assetGroupsSet.some(kw => name.includes(kw))) return 'Asset';
          if (liabilityGroupsSet.some(kw => name.includes(kw))) return 'Liability';
          if (equityGroupsSet.some(kw => name.includes(kw))) return 'Equity';
          if (incomeGroupsSet.some(kw => name.includes(kw))) return 'Income';
          if (expenseGroupsSet.some(kw => name.includes(kw))) return 'Expense';
          return 'Asset';
        };

        const assets = data.accounts.filter(a => getGroupType(a) === 'Asset');
        const liabilities = data.accounts.filter(a => getGroupType(a) === 'Liability');
        const equity = data.accounts.filter(a => ['Equity', 'Capital'].includes(getGroupType(a)));
        const incomeAccs = data.accounts.filter(a => getGroupType(a) === 'Income');
        const expenseAccs = data.accounts.filter(a => getGroupType(a) === 'Expense');

        const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalEquity = equity.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalIncome = incomeAccs.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalExpense = expenseAccs.reduce((sum, a) => sum + (a.balance || 0), 0);
        const netProfit = totalIncome - totalExpense;

        const grandTotalLiabilitiesEquity = totalLiabilities + totalEquity + netProfit;

        const groupSummary = (accList, isAsset = false) => {
          const categories = { 'PRIMARY': { total: 0, groups: {} }, 'CASH_BANK': { total: 0, heads: {} }, 'OTHER': { total: 0, heads: {} } };
          const loanKeywords = ['LOAN', 'LN', 'ADVANCE', 'PGL', 'PL', 'PERSONAL'];
          const depositKeywords = ['DEPOSIT', 'SAVING', 'RD', 'PIGMY', 'SB', 'PG', 'FD', 'FIXED'];

          accList.forEach(acc => {
            const amt = Math.abs(acc.balance || 0);
            const head = acc.group || 'General';
            const groupUpperCase = head.toUpperCase();
            const combinedInfo = `${groupUpperCase} ${(acc.type || '').toUpperCase()}`;
            const isLoan = isAsset && loanKeywords.some(kw => combinedInfo.includes(kw));
            const isCashBank = isAsset && (groupUpperCase.includes('CASH') || groupUpperCase.includes('BANK'));
            const isDeposit = !isAsset && (depositKeywords.some(kw => combinedInfo.includes(kw)) || groupUpperCase === 'DEPOSITS');

            if (isLoan || isDeposit) {
              categories.PRIMARY.total += amt;
              let groupName = head;
              if (!isAsset) {
                if (groupUpperCase.includes('SAVING') || groupUpperCase.includes('SB')) groupName = 'SAVINGS';
                else if (groupUpperCase.includes('RD')) groupName = 'RD';
                else if (groupUpperCase.includes('PIGMY')) groupName = 'PIGMY';
                else if (groupUpperCase.includes('FD')) groupName = 'FIXED DEPOSITS';
              }
              if (!categories.PRIMARY.groups[groupName]) categories.PRIMARY.groups[groupName] = { total: 0 };
              categories.PRIMARY.groups[groupName].total += amt;
            } else if (isCashBank) {
              categories.CASH_BANK.total += amt;
              if (!categories.CASH_BANK.heads[head]) categories.CASH_BANK.heads[head] = 0;
              categories.CASH_BANK.heads[head] += amt;
            } else {
              categories.OTHER.total += amt;
              if (!categories.OTHER.heads[head]) categories.OTHER.heads[head] = 0;
              categories.OTHER.heads[head] += amt;
            }
          });
          return categories;
        };

        const assetSummary = groupSummary(assets, true);
        const liabilitySummary = groupSummary(liabilities, false);
        const equitySummary = groupSummary(equity, false);

        // Calculate displayed totals for the UI (using absolute values as is standard for BS visuals)
        const displayTotalAssets = assetSummary.CASH_BANK.total + assetSummary.PRIMARY.total + assetSummary.OTHER.total + (netProfit < 0 ? Math.abs(netProfit) : 0);
        const displayTotalLiabilities = liabilitySummary.PRIMARY.total + liabilitySummary.OTHER.total;
        const displayTotalEquity = equitySummary.OTHER.total;
        const displayNetProfit = Math.abs(netProfit);
        const displayGrandTotalL = displayTotalLiabilities + displayTotalEquity + (netProfit >= 0 ? displayNetProfit : 0);
        return (
          <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            <Toolbar title="Balance Sheet" onPrint={handlePrint} />
            
            <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 mb-20" ref={contentRef}>
              <Header title="Balance Sheet" />

              <div className="bg-white rounded-lg border-2 border-[#1e293b] overflow-hidden shadow-2xl font-sans mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 bg-[#1e293b] text-white py-4 font-black uppercase tracking-[0.2em] text-sm italic shadow-md">
                  <div className="text-center border-r-0 lg:border-r border-slate-600 mb-2 lg:mb-0">LIABILITIES</div>
                  <div className="text-center">ASSETS</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* LIABILITIES COLUMN */}
              <div className="border-r-0 lg:border-r-2 border-[#1e293b] flex flex-col bg-white">
                <div className="grid grid-cols-[1fr_120px_130px] bg-[#f59e0b] text-white font-black text-[11px] py-2 uppercase border-b-2 border-[#1e293b]">
                  <div className="px-4 border-r border-white/30">PARTICULARS</div>
                  <div className="px-4 text-right border-r border-white/30">AMOUNT</div>
                  <div className="px-4 text-right">TOTAL</div>
                </div>

                <div className="flex-1 divide-y divide-slate-200">
                  {/* Deposits */}
                  {liabilitySummary.PRIMARY.total !== 0 && (
                    <div className="flex flex-col">
                      <div className="grid grid-cols-[1fr_120px_130px] bg-slate-50 font-black text-[12px] border-b border-slate-200">
                        <div className="px-4 py-3 border-r border-slate-200 uppercase">DEPOSITS</div>
                        <div className="px-4 py-3 border-r border-slate-200"></div>
                        <div className="px-4 py-3 text-right text-[#ea580c] text-[13px]">₹{liabilitySummary.PRIMARY.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                      {Object.entries(liabilitySummary.PRIMARY.groups).map(([group, ldata]) => (
                        <div key={group} className="grid grid-cols-[1fr_120px_130px] text-[11px] border-b border-slate-100">
                          <div className="px-8 py-2 font-bold text-slate-600 border-r border-slate-200">{group}</div>
                          <div className="px-4 py-2 text-right font-black text-[#ea580c]">₹{ldata.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className="px-4 py-2"></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Other Liabilities */}
                  {[...Object.entries(liabilitySummary.OTHER.heads), ...Object.entries(equitySummary.OTHER.heads)].map(([head, bal]) => (
                    <div key={head} className="grid grid-cols-[1fr_120px_130px] font-black text-[12px] bg-white">
                      <div className="px-4 py-3 border-r border-slate-200 uppercase">{head}</div>
                      <div className="px-4 py-3 border-r border-slate-200 text-right text-[#ea580c]">₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div className="px-4 py-3 text-right"></div>
                    </div>
                  ))}
                  {/* Net Profit (if positive) */}
                  {netProfit >= 0 && (
                    <div className="grid grid-cols-[1fr_120px_130px] bg-[#fff7ed] font-black text-[12px]">
                      <div className="px-4 py-4 border-r border-slate-200 italic font-black uppercase text-slate-900">NET PROFIT</div>
                      <div className="px-4 py-4 border-r border-slate-200"></div>
                      <div className="px-4 py-4 text-right text-[#ea580c] text-[14px]">₹{displayNetProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_150px] bg-[#3b82f6] text-white font-black text-[14px] py-4 border-t-2 border-[#1e293b] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                  <div className="px-4 uppercase tracking-widest font-black italic">TOTAL LIABILITIES</div>
                  <div className="px-4 text-right text-[17px] drop-shadow-sm">₹{displayGrandTotalL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* ASSETS COLUMN */}
              <div className="flex flex-col bg-white">
                <div className="grid grid-cols-[1fr_120px_130px] bg-[#10b981] text-white font-black text-[11px] py-2 uppercase border-b-2 border-[#1e293b]">
                  <div className="px-4 border-r border-white/30">PARTICULARS</div>
                  <div className="px-4 text-right border-r border-white/30">AMOUNT</div>
                  <div className="px-4 text-right">TOTAL</div>
                </div>

                <div className="flex-1 divide-y divide-slate-200">
                  {/* Cash & Bank */}
                  {assetSummary.CASH_BANK.total !== 0 && (
                    <div className="flex flex-col">
                      <div className="grid grid-cols-[1fr_120px_130px] bg-slate-50 font-black text-[12px] border-b border-slate-200">
                        <div className="px-4 py-3 border-r border-slate-200 uppercase">CASH & BANK</div>
                        <div className="px-4 py-3 border-r border-slate-200"></div>
                        <div className="px-4 py-3 text-right text-[#059669] text-[13px]">₹{assetSummary.CASH_BANK.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                      {Object.entries(assetSummary.CASH_BANK.heads).map(([head, bal]) => (
                        <div key={head} className="grid grid-cols-[1fr_120px_130px] text-[11px] border-b border-slate-100">
                          <div className="px-8 py-2 font-bold text-slate-600 border-r border-slate-200 uppercase">{head}</div>
                          <div className="px-4 py-2 text-right font-black text-[#059669]">₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className="px-4 py-2"></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Loans */}
                  {assetSummary.PRIMARY.total !== 0 && (
                    <div className="flex flex-col">
                      <div className="grid grid-cols-[1fr_120px_130px] bg-slate-50 font-black text-[12px] border-b border-slate-200">
                        <div className="px-4 py-3 border-r border-slate-200 uppercase">LOANS & ADVANCES</div>
                        <div className="px-4 py-3 border-r border-slate-200"></div>
                        <div className="px-4 py-3 text-right text-[#059669] text-[13px]">₹{assetSummary.PRIMARY.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                      {Object.entries(assetSummary.PRIMARY.groups).map(([group, adata]) => (
                        <div key={group} className="grid grid-cols-[1fr_120px_130px] text-[11px] border-b border-slate-100">
                          <div className="px-8 py-2 font-bold text-slate-600 border-r border-slate-200 uppercase">{group}</div>
                          <div className="px-4 py-2 text-right font-black text-[#059669]">₹{adata.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className="px-4 py-2"></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Others */}
                  {Object.entries(assetSummary.OTHER.heads).map(([head, bal]) => (
                    <div key={head} className="grid grid-cols-[1fr_120px_130px] font-black text-[12px] bg-white border-t border-slate-100">
                      <div className="px-4 py-3 border-r border-slate-200 uppercase">{head}</div>
                      <div className="px-4 py-3 border-r border-slate-200 text-right text-[#059669]">₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div className="px-4 py-3 text-right"></div>
                    </div>
                  ))}
                  {/* Net Loss (if negative profit) */}
                  {netProfit < 0 && (
                    <div className="grid grid-cols-[1fr_120px_130px] bg-[#fef2f2] font-black text-[12px]">
                      <div className="px-4 py-4 border-r border-slate-200 italic font-black uppercase text-rose-900">NET LOSS</div>
                      <div className="px-4 py-4 border-r border-slate-200"></div>
                      <div className="px-4 py-4 text-right text-rose-600 text-[14px]">₹{displayNetProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_150px] bg-[#3b82f6] text-white font-black text-[14px] py-4 border-t-2 border-[#1e293b] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                  <div className="px-4 uppercase tracking-widest font-black italic">TOTAL ASSETS</div>
                  <div className="px-4 text-right text-[17px] drop-shadow-sm">₹{displayTotalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1e293b] text-white p-4 flex flex-wrap justify-between items-center text-xs font-black uppercase tracking-widest border-t-2 border-[#1e293b] gap-4">
              <div className="flex items-center gap-3">
                <Scale className="text-blue-400" size={18} />
                <span>Balance Status: </span>
                <span className={Math.abs(displayTotalAssets - displayGrandTotalL) < 0.1 ? "text-emerald-400" : "text-rose-400"}>
                  {Math.abs(displayTotalAssets - displayGrandTotalL) < 0.1 ? "BALANCED" : "MISMATCHED"}
                </span>
              </div>
              <div>Difference: ₹{Math.abs(displayTotalAssets - displayGrandTotalL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
    case 'handover': {
        const collections = data.transactions.filter(t => 
          ['collection', 'repay_princ', 'repay_int', 'agent_handover', 'deposit', 'receipt'].includes(t.type) &&
          t.date.split('T')[0] >= fromDate && t.date.split('T')[0] <= toDate
        );
        const totalAmount = collections.reduce((sum, t) => sum + parseFloat(t.amt || 0), 0);

        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Toolbar title="Handover Report" onPrint={handlePrint} />
            <div className="max-w-[900px] mx-auto w-full px-2 sm:px-4 py-6" ref={contentRef}>
              <div className="bg-white shadow-2xl rounded-sm border border-slate-800 overflow-hidden mb-20">
                <Header title="Daily Handover / Collection Report" />
               <div className="p-10 text-center border-b border-slate-800 bg-[#f8fafc]/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Net Cash for Handover</p>
                  <h4 className="text-6xl font-black italic text-slate-900 tracking-tighter">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-xs min-w-[800px]">
                   <thead className="bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
                     <tr>
                       <th className="px-6 py-4 text-left border-r border-slate-800">Date</th>
                       <th className="px-6 py-4 text-left border-r border-slate-800">Voucher No</th>
                       <th className="px-6 py-4 text-left border-r border-slate-800">Source Account / Customer</th>
                       <th className="px-6 py-4 text-left border-r border-slate-800">Method</th>
                       <th className="px-6 py-4 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {collections.map(t => {
                       const acc = data.accounts.find(a => a.id === t.accId);
                       const cust = data.customers.find(c => c.id === acc?.customerId);
                       return (
                         <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-400 border-r border-slate-100 italic">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                           <td className="px-6 py-4 font-black border-r border-slate-100">#{t.id.slice(-6).toUpperCase()}</td>
                           <td className="px-6 py-4 border-r border-slate-100">
                             <p className="font-black text-slate-800">{cust?.name || acc?.name || 'Walk-in'}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{acc?.accNo}</p>
                           </td>
                           <td className="px-6 py-4 border-r border-slate-100 italic font-black uppercase text-slate-500">{t.type}</td>
                           <td className="px-6 py-4 text-right font-black italic text-emerald-600">₹{parseFloat(t.amt).toLocaleString()}</td>
                         </tr>
                       );
                     })}
                     {collections.length === 0 && (
                       <tr>
                         <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold">No collections recorded for the current period.</td>
                       </tr>
                     )}
                   </tbody>
                   <tfoot className="bg-slate-50">
                      <tr className="font-black text-slate-900 border-t-2 border-slate-200">
                        <td colSpan="4" className="px-6 py-6 text-right uppercase tracking-[0.2em] text-xs">Verified Collection Total</td>
                        <td className="px-6 py-6 text-right text-xl italic underline decoration-4 decoration-emerald-200 underline-offset-8">₹{totalAmount.toLocaleString()}</td>
                      </tr>
                   </tfoot>
                 </table>
               </div>
            </div>
          </div>
        </div>
      );
    }
      default:
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 text-center">
              <h2 className="text-base font-black text-slate-800 uppercase tracking-widest">Reports</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
              {reportModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveReport(module.id)}
                  className="flex flex-col items-center justify-center p-3 sm:p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all group aspect-square space-y-2 sm:space-y-4"
                >
                  <div className={`${module.color} group-hover:scale-110 transition-transform scale-75 sm:scale-100`}>
                    {module.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 tracking-tight text-center uppercase">{module.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      {renderReportContent()}

      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm print:hidden"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden print:hidden"
            >
              <div className="bg-gradient-to-r from-[#ef4444] to-[#ef4444] p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3 text-white">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Filter size={18} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Date Filter</h3>
                </div>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                    { id: '3months', label: 'Last 3 Months' },
                    { id: '6months', label: 'Last 6 Months' },
                    { id: 'year', label: 'This Year' }
                  ].map(range => (
                    <button
                      key={range.id}
                      onClick={() => setPredefinedRange(range.id)}
                      className="p-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl text-[#0369a1] text-xs font-black uppercase tracking-wider hover:bg-[#e0f2fe] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {range.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setPredefinedRange('fiscal')}
                    className="col-span-2 p-3 bg-[#fff9db] border border-[#ffe066] rounded-xl text-[#854000] text-sm font-black uppercase tracking-widest hover:bg-[#fff3bf] transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 mb-4"
                  >
                    Fiscal Year
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1e293b] tracking-wider uppercase">From Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0e7490] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1e293b] tracking-wider uppercase">To Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0e7490] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 flex-wrap">
                  <button 
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setFromDate(today);
                      setToDate(today);
                    }}
                    className="w-full py-3 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs border border-slate-200 mb-2"
                  >
                    Reset to Today
                  </button>
                  <button 
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 py-4 border-2 border-red-100 text-red-600 font-black rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest text-sm shadow-sm active:scale-[0.98]"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      setShowFilterModal(false);
                    }}
                    className="flex-1 py-4 bg-[#dcfce7] border-2 border-[#bbf7d0] text-[#166534] font-black rounded-2xl hover:bg-[#bbf7d0] transition-all uppercase tracking-widest text-sm shadow-sm active:scale-[0.98]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReceiptModal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        tx={selectedTxForReceipt}
        acc={(data.accounts || []).find(a => a.id === selectedTxForReceipt?.accId)}
        companyProfile={companyProfile}
        user={user}
      />
    </div>
  );
};

const SettingsPage = ({ onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', logo: '' });
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [printerMode, setPrinterMode] = useState('rawbt');
  const [bluetoothPrinter, setBluetoothPrinter] = useState(null);
  const [scanning, setScanning] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/tenant/profile');
      const data = res.data || {};
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        logo: data.logo || ''
      });
    } catch (err) {
      if (err.response?.status === 401) return;
      console.error("Error fetching profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    const savedPrinter = localStorage.getItem('printer_config');
    if (savedPrinter && savedPrinter !== 'undefined' && savedPrinter !== 'null') {
      try {
        const config = JSON.parse(savedPrinter);
        setPrinterMode(config.mode || 'rawbt');
        setBluetoothPrinter(config.bluetoothName || null);
      } catch (e) {
        localStorage.removeItem('printer_config');
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.post('/tenant/profile', profile);
      toast.success("Organization profile updated successfully");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrinter = () => {
    localStorage.setItem('printer_config', JSON.stringify({ 
      mode: printerMode,
      bluetoothName: bluetoothPrinter
    }));
    toast.success("Printer configuration saved locally");
  };

  const handleBluetoothSearch = async () => {
    if (!navigator.bluetooth) {
      toast.error("Bluetooth is not supported in this browser or environment.");
      return;
    }

    setScanning(true);
    try {
      // Inclusive list of services for typical thermal printers
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Thermal Printer
          '00001101-0000-1000-8000-00805f9b34fb', // Serial Port
          '0000180a-0000-1000-8000-00805f9b34fb'  // Device Info
        ].concat(Array.from({length: 5}, (_, i) => `0000${(parseInt('18f0', 16) + i).toString(16)}-0000-1000-8000-00805f9b34fb`))
      });
      setBluetoothPrinter(device.name || "Unknown Printer");
      // Save immediately to local storage for persistence
      localStorage.setItem('printer_config', JSON.stringify({ 
        mode: 'bluetooth',
        bluetoothName: device.name || "Unknown Printer"
      }));
      toast.success(`Connected to ${device.name}`);
    } catch (err) {
      if (err.name === 'NotFoundError' || err.name === 'AbortError') {
        return;
      }
      console.error("Bluetooth connection error:", err);
      toast.error("Failed to connect to printer. Ensure Bluetooth is ON.");
    } finally {
      setScanning(false);
    }
  };

  const testPrint = () => {
    if (printerMode === 'rawbt') {
      window.location.href = "rawbt:test";
      toast("Opening RawBT App for test print...");
    } else if (printerMode === 'bluetooth' && bluetoothPrinter) {
      toast(`Direct Print to ${bluetoothPrinter} initiated (Simulated)`);
    } else if (printerMode === 'bluetooth') {
      toast.error("Please search and connect a Bluetooth printer first.");
    } else {
      toast("Please select a printer method first.");
    }
  };

  const handleResetTransactions = async () => {
    if (!window.confirm("CRITICAL WARNING: This will permanently delete ALL transaction history and reset ALL account balances to zero. This action CANNOT be undone. Are you absolutely sure?")) {
      return;
    }

    if (!window.confirm("LAST CHANCE: Confirming again. Purge all records?")) {
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.post('/tenant/reset/transactions');
      toast.success(res.data.message || "Transaction history cleared successfully");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear transactions");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      <div className="space-y-4">
        {/* Organization Profile Card */}
        <div 
          onClick={() => setActiveTab(activeTab === 'profile' ? null : 'profile')}
          className={cn(
            "p-6 rounded-2xl cursor-pointer transition-all border-2",
            activeTab === 'profile' ? "bg-white border-indigo-100 shadow-xl shadow-indigo-50/50" : "bg-white/50 border-transparent hover:border-slate-100"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg tracking-tight">Organization Profile</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Profile Name / Email / Phone</p>
              </div>
            </div>
            <ChevronRight className={cn("text-slate-300 transition-transform", activeTab === 'profile' && "rotate-90")} />
          </div>

          {activeTab === 'profile' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-8 pt-8 border-t border-slate-50 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <Input 
                label="Organization Display Name" 
                placeholder="Acme Finance Ltd." 
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Emergency Contact" 
                  placeholder="+91..." 
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                <Input 
                  label="Recovery Email" 
                  placeholder="admin@acme.com" 
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Brand Logo</label>
                <div 
                  onClick={() => document.getElementById('logo-upload').click()}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-200 transition-colors group cursor-pointer relative overflow-hidden"
                >
                   <input 
                    id="logo-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile({ ...profile, logo: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                   />
                   <div className="bg-white p-2 rounded-lg shadow-sm w-12 h-12 flex items-center justify-center overflow-hidden">
                      {profile.logo ? (
                        <img src={profile.logo} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon className="text-slate-400 group-hover:text-indigo-500" size={24} />
                      )}
                   </div>
                   <div>
                     <p className="text-xs font-black text-slate-700">Upload Image / Logo</p>
                     <p className="text-[10px] text-slate-400">PNG, JPG up to 2MB</p>
                   </div>
                   {profile.logo && (
                     <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfile({ ...profile, logo: '' });
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-50 text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <Trash2 size={16} />
                     </button>
                   )}
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl font-black text-sm uppercase tracking-widest"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Printer Configuration Card */}
        <div 
          onClick={() => setActiveTab(activeTab === 'printer' ? null : 'printer')}
          className={cn(
            "p-6 rounded-2xl cursor-pointer transition-all border-2",
            activeTab === 'printer' ? "bg-white border-amber-100 shadow-xl shadow-amber-50/50" : "bg-white/50 border-transparent hover:border-slate-100"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                <Printer size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg tracking-tight">Printer Configuration</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                  {printerMode === 'rawbt' ? 'RawBT / Android' : (bluetoothPrinter || 'Bluetooth / Thermal')}
                </p>
              </div>
            </div>
            <ChevronRight className={cn("text-slate-300 transition-transform", activeTab === 'printer' && "rotate-90")} />
          </div>

          {activeTab === 'printer' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-8 pt-8 border-t border-slate-50 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-500 block mb-2">Select Print Method:</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPrinterMode('rawbt')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-center cursor-pointer",
                      printerMode === 'rawbt' ? "bg-white border-amber-500 shadow-lg shadow-amber-100" : "bg-slate-50 border-transparent hover:border-slate-200"
                    )}
                  >
                    <Smartphone className={cn("mx-auto mb-3", printerMode === 'rawbt' ? "text-amber-500" : "text-slate-300")} size={32} />
                    <p className="font-black text-slate-800 text-sm">RawBT App</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Android Only</p>
                  </div>
                  <div 
                    onClick={() => setPrinterMode('bluetooth')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-center cursor-pointer",
                      printerMode === 'bluetooth' ? "bg-white border-indigo-500 shadow-lg shadow-indigo-100" : "bg-slate-50 border-transparent hover:border-slate-200"
                    )}
                  >
                    <Bluetooth className={cn("mx-auto mb-3", printerMode === 'bluetooth' ? "text-indigo-500" : "text-slate-300")} size={32} />
                    <p className="font-black text-slate-800 text-sm">Bluetooth</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Direct Pairing</p>
                  </div>
                </div>

                {printerMode === 'bluetooth' && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Device</p>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight">
                          {bluetoothPrinter || "No Printer Connected"}
                        </h4>
                      </div>
                      <Button 
                        onClick={handleBluetoothSearch}
                        disabled={scanning}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                      >
                        {scanning ? "Searching..." : "Search Printer"}
                      </Button>
                    </div>
                  </div>
                )}

                {printerMode === 'rawbt' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-amber-800">
                      <span className="font-black">Requirement:</span> Install "RawBT" app from Play Store.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={testPrint}
                    className="h-12 rounded-xl border-amber-200 text-amber-700 bg-amber-50/30 hover:bg-amber-50 flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    <span className="font-black text-sm uppercase tracking-widest">Test Print</span>
                  </Button>
                  <Button 
                    onClick={handleSavePrinter}
                    className="h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest"
                  >
                    Save Config
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Maintenance & Reset */}
        <div 
          onClick={() => setActiveTab(activeTab === 'maintenance' ? null : 'maintenance')}
          className={cn(
            "p-6 rounded-2xl cursor-pointer transition-all border-2",
            activeTab === 'maintenance' ? "bg-white border-red-100 shadow-xl shadow-red-50/50" : "bg-white/50 border-transparent hover:border-slate-100"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-xl text-red-600">
                <RefreshCw size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg tracking-tight">System Maintenance</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Reset Data / Clear Records</p>
              </div>
            </div>
            <ChevronRight className={cn("text-slate-300 transition-transform", activeTab === 'maintenance' && "rotate-90")} />
          </div>

          {activeTab === 'maintenance' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-8 pt-8 border-t border-slate-50 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg text-red-600 shadow-sm mt-1">
                    <Trash2 size={20} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-black text-red-900 text-base">Purge Transaction History</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      This will permanently delete every transaction record in the system. 
                      All account balances (Loans, Savings, Cash, Bank) will be reset to <span className="font-bold">Zero</span>.
                      Customers and Account structures will be preserved.
                    </p>
                    <div className="pt-4">
                      <Button 
                        onClick={handleResetTransactions}
                        disabled={resetLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100 flex items-center gap-2"
                      >
                        {resetLoading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {resetLoading ? "Clearing..." : "Confirm Purge All Transactions"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                   <span className="text-red-600 font-black">Pro Tip:</span> Use this feature only at the start of a new financial year or if you wish to wipe test data. Ensure you have downloaded all necessary reports before proceeding.
                 </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showView, setShowView] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [custAccounts, setCustAccounts] = useState([]);
  const [showOpenAccount, setShowOpenAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountTypes, setAccountTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNo, setVoucherNo] = useState('');

  const fetchCustomers = () => api.get('/customers').then(res => setCustomers(res.data));
  const fetchTypes = () => api.get('/account-types').then(res => {
    const types = Array.isArray(res.data) ? res.data : [];
    setAccountTypes(types);
    if(types.length > 0) setSelectedType(types[0].name);
  }).catch(err => {
    if (err.response?.status === 401) return;
    console.error('Fetch Types Error:', err);
    setAccountTypes([]);
  });

  useEffect(() => { 
    fetchCustomers();
    fetchTypes();
  }, []);

  const fetchCustAccounts = (custId) => {
    api.get(`/accounts?customerId=${custId}`).then(res => setCustAccounts(res.data));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: newName.trim(), mobile: newMobile, address: newAddress };
      
      // Duplicate check
      const isDuplicate = (Array.isArray(customers) ? customers : []).some(c => 
        c.name.toLowerCase() === payload.name.toLowerCase() && c.id !== editId
      );

      if (isDuplicate) {
        toast.error('Customer name already exists!');
        setLoading(false);
        return;
      }

      if (editId) {
        await api.put(`/customers/${editId}`, payload);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer created successfully');
      }
      setNewName(''); setNewMobile(''); setNewAddress(''); setEditId(null);
      setShowAdd(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setNewName(c.name || '');
    setNewMobile(c.mobile || '');
    setNewAddress(c.address || '');
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!id) {
       toast.error("Invalid customer reference");
       return;
    }
    if (window.confirm('Are you sure you want to delete this customer? This will fail if they have active accounts.')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success('Customer entry removed');
        fetchCustomers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting customer - check for active dependencies');
      }
    }
  };

  const handleView = (c) => {
    setSelectedCust(c);
    fetchCustAccounts(c.id);
    setShowView(true);
  };

  const handleCloseAccount = async (acc) => {
    const accId = acc.id || acc._id;
    const balance = parseFloat(acc.balance || 0);
    if (balance !== 0) {
      toast.error(`Account balance must be 0 to deactivate. Current: ₹${balance.toLocaleString()}`);
      return;
    }
    if (window.confirm('Are you sure you want to mark this account as inactive?')) {
      try {
        await api.put(`/accounts/${accId}`, { status: 'inactive' });
        toast.success('Account marked as inactive');
        fetchCustAccounts(selectedCust.id);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error updating status');
      }
    }
  };

  const handleEditAccount = (acc) => {
    setEditingAccount(acc);
    setSelectedType(acc.type || '');
    setOpeningDate(acc.openingDate ? new Date(acc.openingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setVoucherNo(acc.voucherNo || '');
    setShowEditAccount(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    const accId = editingAccount.id || editingAccount._id;
    try {
      await api.put(`/accounts/${accId}`, { 
        type: selectedType,
        openingDate,
        voucherNo
      });
      toast.success('Account updated');
      setShowEditAccount(false);
      fetchCustAccounts(selectedCust.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating account');
    }
  };

  const handleDeleteAccount = async (acc) => {
    const accId = acc.id || acc._id;
    if (!accId) {
      toast.error("Account ID missing");
      return;
    }
    const balance = parseFloat(acc.balance || 0);
    if (balance !== 0) {
      toast.error(`Cannot delete account with non-zero balance: ₹${balance.toLocaleString()}`);
      return;
    }
    if (window.confirm('Permanently delete this account? This cannot be undone.')) {
      try {
        await api.delete(`/accounts/${accId}`);
        toast.success('Account deleted successfully');
        fetchCustAccounts(selectedCust.id);
        fetchCustomers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting account - it might have transaction history');
      }
    }
  };
  
  const handleOpenAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', { 
        name: `${selectedCust.name} - ${selectedType}`,
        type: selectedType,
        customerId: selectedCust.id,
        category: 'customer',
        openingDate,
        voucherNo
      });
      toast.success('Account opened');
      setShowOpenAccount(false);
      setVoucherNo('');
      fetchCustAccounts(selectedCust.id);
      fetchCustomers();
    } catch (err) {
      toast.error('Error creating account');
    }
  };

  const filtered = (Array.isArray(customers) ? customers : []).filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.custNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mobile || '').includes(searchTerm)
  );

  return (
    <div className="bg-[#f0f2f5] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Customer Management</h1>
        {!showAdd && (
          <Button 
            onClick={() => setShowAdd(true)} 
            className="bg-[#2c3e50] hover:bg-[#34495e] text-white"
          >
            <Plus size={18} className="mr-2" /> NEW CUSTOMER
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input 
          placeholder="Search Customers..." 
          className="w-full p-3 bg-white border border-slate-200 rounded-md shadow-sm text-sm focus:outline-none font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Horizontal Add Form */}
      {showAdd && (
        <Card className="mb-6 p-6 shadow-sm border-none bg-white rounded-md border-t-4 border-t-indigo-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">{editId ? 'Edit Customer' : 'Add New Customer'}</h3>
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <input 
              placeholder="Full Name" 
              className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-500" 
              value={newName} onChange={e => setNewName(e.target.value)} required 
            />
          </div>
          <div className="flex-1 w-full">
            <input 
              placeholder="Mobile" 
              className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-500" 
              value={newMobile} onChange={e => setNewMobile(e.target.value)} 
            />
          </div>
          <div className="flex-1 w-full">
            <input 
              placeholder="Full Address" 
              className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-500" 
              value={newAddress} onChange={e => setNewAddress(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black px-8 py-2 rounded text-sm transition-colors shadow-md"
          >
            {editId ? 'UPDATE' : 'CREATE'}
          </button>
        </form>
      </Card>
    )}

      {/* Table Section */}
      <Card className="p-0 overflow-hidden border-none shadow-sm bg-white rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-slate-500/80 tracking-tight">ID</th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-slate-500/80 tracking-tight">Name</th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-slate-500/80 tracking-tight">Mobile</th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-slate-500/80 tracking-tight">Address</th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-slate-500/80 tracking-tight">Accs</th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-slate-500/80 tracking-tight">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-400 italic">No customers found</td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-xs font-bold text-slate-800">{c.custNo}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-700">{c.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{c.mobile || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{c.address || '-'}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-600">{c.accCount || 0}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => handleView(c)} className="bg-[#16a085] hover:bg-[#1abc9c] text-white font-black px-3 py-1.5 rounded text-[10px] uppercase shadow-sm">View</button>
                        <button onClick={() => handleEdit(c)} className="bg-[#f39c12] hover:bg-[#e67e22] text-white p-1.5 rounded shadow-sm"><Edit2 size={14}/></button>
                        <button onClick={() => handleDelete(c.id || c._id)} className="bg-[#c0392b] hover:bg-[#e74c3c] text-white p-1.5 rounded shadow-sm"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Detail View Modal */}
      <Modal isOpen={showView} onClose={() => setShowView(false)} title="" noPadding>
        {selectedCust && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-black text-slate-900">{selectedCust.name}</h2>
              <button onClick={() => setShowView(false)} className="border border-slate-200 p-2 rounded-lg hover:bg-slate-50"><X size={20}/></button>
            </div>
            
            <div className="bg-[#f0f9ff] p-4 rounded-md mb-6 flex items-center gap-2 border border-blue-100">
               <span className="text-blue-500 font-bold text-sm">ID: <span className="text-blue-700">{selectedCust.custNo}</span></span>
               <span className="text-slate-300">|</span>
               <span className="text-slate-500 font-bold text-sm">Mobile: {selectedCust.mobile || 'None'}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-black text-slate-800">Accounts</h3>
               <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                    <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="accent-slate-800" />
                    <span>Show Inactive</span>
                  </label>
                  <button 
                    onClick={() => setShowOpenAccount(true)}
                    className="bg-[#2c3e50] hover:bg-[#34495e] text-white px-4 py-2 rounded-md text-sm font-black flex items-center gap-2 shadow-md"
                  >
                    + Open Account
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-md">
               <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase">AccNo</th>
                      <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase">Type</th>
                      <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase">Bal</th>
                      <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {custAccounts.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-slate-400 text-sm">No accessible accounts found.</td>
                      </tr>
                    ) : (
                      custAccounts.filter(a => showInactive || a.status === 'active').map(a => (
                        <tr key={a.id} className={cn("hover:bg-slate-50 transition-colors", a.status === 'inactive' && "bg-slate-50 opacity-60")}>
                          <td className="px-4 py-3 text-sm font-bold text-slate-600">
                             {a.accNo}
                             {a.status === 'inactive' && <span className="ml-2 text-[8px] bg-slate-200 text-slate-500 px-1 rounded">INACTIVE</span>}
                          </td>
                          <td className="px-4 py-3">
                             <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{a.type}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{a.openingDate ? new Date(a.openingDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-black">
                            <span className={cn(a.balance < 0 ? "text-red-600" : "text-emerald-600")}>
                              ₹{a.balance?.toLocaleString() || '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-1.5">
                               <button 
                                 onClick={() => navigate('/transactions', { state: { accNo: a.accNo } })}
                                 className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100 hover:border-emerald-200"
                                 title="New Transaction"
                                >
                                 <ArrowRightLeft size={14} />
                               </button>
                               <button 
                          onClick={() => {
                          const balance = parseFloat(a.balance || 0);
                          if (a.status === 'active' && balance !== 0) {
                            toast.error(`Account balance must be 0 to deactivate. Current: ₹${balance}`);
                            return;
                          }
                          const newStatus = a.status === 'active' ? 'inactive' : 'active';
                          api.put(`/accounts/${a.id || a._id}`, { status: newStatus })
                             .then(() => {
                               toast.success(`Account marked as ${newStatus}`);
                               fetchCustAccounts(selectedCust.id || selectedCust._id);
                               fetchCustomers();
                             }).catch(err => toast.error('Status update failed'));
                        }}
                                 className={cn(
                                   "p-1.5 rounded-lg transition-colors border shadow-sm",
                                   a.status === 'active' ? "text-amber-600 hover:bg-amber-50 border-amber-100" : "text-emerald-600 hover:bg-emerald-50 border-emerald-100"
                                 )}
                                 title={a.status === 'active' ? "Inactivate" : "Activate"}
                               >
                                 <Power size={14} />
                               </button>
                               <button 
                                 onClick={() => handleEditAccount(a)}
                                 className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                                 title="Edit Account"
                               >
                                 <Edit2 size={14} />
                               </button>
                               <button 
                                 onClick={() => handleDeleteAccount(a)}
                                 className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                 title="Delete Account"
                               >
                                 <Trash2 size={14} />
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Open Account Prompt Modal */}
      <Modal isOpen={showOpenAccount} onClose={() => setShowOpenAccount(false)} title="Open New Account">
         <div className="flex justify-between items-start mb-6">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activating For</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{selectedCust?.name}</h3>
            </div>
            <button 
              onClick={() => setShowOpenAccount(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
         </div>
         <form onSubmit={handleOpenAccount} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase">Select Account Type</label>
              <select 
                id="openAccountTypeSelect"
                className="w-full p-2 border border-slate-200 rounded focus:border-slate-800 outline-none font-bold" 
                value={selectedType} 
                onChange={e => setSelectedType(e.target.value)}
              >
                {(Array.isArray(accountTypes) ? accountTypes : []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Opening Date</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-slate-200 rounded focus:border-slate-800 outline-none font-bold"
                  value={openingDate}
                  onChange={e => setOpeningDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Ref Account</label>
                <input 
                  type="text"
                  placeholder="Optional"
                  className="w-full p-2 border border-slate-200 rounded focus:border-slate-800 outline-none font-bold placeholder:font-normal"
                  value={voucherNo}
                  onChange={e => setVoucherNo(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">Confirm Activation</Button>
         </form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal isOpen={showEditAccount} onClose={() => setShowEditAccount(false)} title="Edit Account">
         <form onSubmit={handleUpdateAccount} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Details</p>
              <p className="font-black text-slate-800">{editingAccount?.name}</p>
              <p className="font-bold text-slate-500 text-xs">{editingAccount?.accNo}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase">Update Type</label>
              <select 
                id="editAccountTypeSelect"
                className="w-full p-2 border border-slate-200 rounded focus:border-slate-800 outline-none font-bold" 
                value={selectedType} 
                onChange={e => setSelectedType(e.target.value)}
              >
                {(Array.isArray(accountTypes) ? accountTypes : []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Opening Date</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-slate-200 rounded focus:border-slate-800 outline-none font-bold"
                  value={openingDate}
                  onChange={e => setOpeningDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Ref Account</label>
                <input 
                  type="text"
                  placeholder="Optional"
                  className="w-full p-2 border border-slate-200 rounded focus:border-slate-800 outline-none font-bold placeholder:font-normal"
                  value={voucherNo}
                  onChange={e => setVoucherNo(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 bg-[#f39c12] hover:bg-[#e67e22]">Save Changes</Button>
         </form>
      </Modal>
    </div>
  );
};

// --- App Root ---

const AdminAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    username: '',
    password: '',
    companyId: '',
    active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  const fetchData = async () => {
    try {
      const [agentsRes, companiesRes] = await Promise.all([
        api.get('/admin/agents'),
        api.get('/admin/companies')
      ]);
      setAgents(agentsRes.data);
      setCompanies(companiesRes.data);
    } catch (err) {
      if (err.response?.status === 401) return;
      console.error('Error fetching admin data', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCompanies = (Array.isArray(companies) ? companies : []).filter(c => 
    (c.name || '').toLowerCase().includes(companySearch.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      username: formData.username.trim().toLowerCase()
    };
    try {
      if (editId) {
        await api.put(`/admin/agents/${editId}`, payload);
      } else {
        await api.post('/admin/agents', payload);
      }
      setShowAdd(false);
      setEditId(null);
      setFormData({ name: '', mobile: '', username: '', password: '', companyId: '', active: true });
      fetchData();
      toast.success('Agent saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing agent');
    }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setFormData({
      name: a.name,
      mobile: a.mobile,
      username: a.username,
      password: a.password || '',
      companyId: a.companyId,
      active: a.active
    });
    setCompanySearch(''); // Clear search on edit
    setShowAdd(true);
  };

  const handleDeleteAgent = async (id) => {
    if (window.confirm("Permanently delete this agent account?")) {
      try {
        await api.delete(`/admin/agents/${id}`);
        toast.success('Agent deleted');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting agent');
      }
    }
  };

  const filteredAgents = (Array.isArray(agents) ? agents : []).filter(a => 
    (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agent Network</h1>
          <p className="text-slate-500 font-medium">Global administration of specialized agents</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 shadow-xl w-full sm:w-auto justify-center">
          <Briefcase size={20} /> Register New Agent
        </Button>
      </div>

      <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search agents by name, company or ID..." 
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold text-slate-600 shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
      </div>

      {showAdd && (
        <Card title={editId ? "Update Agent Credentials" : "Register New Agent"} className="mb-8 border-2 border-indigo-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Input label="Legal Name" placeholder="e.g. John Agent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             <Input label="Mobile Line" placeholder="10-digit mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
             <Input label="Login Username" placeholder="agent_001" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
             <Input label="Secure Password" type="text" placeholder={editId ? "Password" : "••••••••"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editId} />
             
             <div className="space-y-4 lg:col-span-1">
                <div className="space-y-1">
                  <label className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Search size={12}/> Search Company
                  </label>
                  <input 
                    type="text"
                    placeholder="Type to filter companies..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    value={companySearch}
                    onChange={e => setCompanySearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black uppercase text-slate-400 tracking-widest">Select Results</label>
                  <select 
                    className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 bg-white shadow-sm"
                    value={formData.companyId}
                    onChange={e => setFormData({...formData, companyId: e.target.value})}
                    required
                  >
                    <option value="">-- Choose Company --</option>
                    {filteredCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                    {filteredCompanies.length === 0 && <option disabled>No companies found</option>}
                  </select>
                </div>
             </div>

             <div className="space-y-1 flex items-center gap-4 h-full pt-6">
                <label className="text-sm font-black uppercase text-slate-400 tracking-widest">Agent Status</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="agent-active"
                    checked={formData.active} 
                    onChange={e => setFormData({...formData, active: e.target.checked})}
                    className="w-6 h-6 rounded-lg border-2 border-slate-100 checked:bg-indigo-600 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-600">{formData.active ? 'Active' : 'Suspended'}</span>
                </div>
             </div>

             <div className="lg:col-span-3 flex gap-3 justify-end pt-4 mt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => { setShowAdd(false); setEditId(null); setCompanySearch(''); }}>Dismiss</Button>
                <Button type="submit">{editId ? 'Apply Changes' : 'Confirm Registration'}</Button>
             </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <Card key={agent.id} className={cn("hover:shadow-lg transition-all border-l-4", agent.active ? "border-l-emerald-500" : "border-l-red-500 bg-slate-50")}>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl", agent.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">{agent.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">@{agent.username} • {agent.mobile}</p>
                  </div>
                </div>
             </div>
             
             <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Primary Organization</p>
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-400" />
                  <p className="font-black text-slate-800 tracking-tight">{agent.companyName}</p>
                </div>
             </div>

             <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest", agent.active ? "text-emerald-500" : "text-red-500")}>
                   <div className={cn("w-2 h-2 rounded-full", agent.active ? "bg-emerald-500 animate-pulse" : "bg-red-500")}/>
                   {agent.active ? 'System Active' : 'Suspended'}
                </div>
                 <div className="flex gap-1">
                   <button 
                    onClick={() => {
                      const shareText = `Login at: ${window.location.origin}`;
                      navigator.clipboard.writeText(shareText);
                      toast.success("Login link copied!");
                    }}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Share Credentials"
                  >
                    <Share2 size={18}/>
                  </button>
                  <button 
                    onClick={() => handleEdit(agent)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit2 size={18}/>
                  </button>
                  <button 
                    onClick={() => handleDeleteAgent(agent.id || agent._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions')
      .then(res => {
        setLogs(res.data.slice(-50).reverse());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Logs</h1>
        <p className="text-slate-500 font-medium">Historical transaction trail for current session</p>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-900">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(log.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-black uppercase",
                      ['deposit', 'repay_princ'].includes(log.type) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {log.type}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-black",
                    ['deposit', 'repay_princ'].includes(log.type) ? "text-emerald-600" : "text-red-600"
                  )}>
                    ₹{parseFloat(log.amt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 font-medium italic">{log.desc || 'Activity log entry'}</p>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">No activity logs found for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({ name: '', logo: '' });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  });

  const fetchGlobalData = () => {
    const token = localStorage.getItem('token');
    if (user && user.role !== 'superadmin' && token) {
      api.get('/tenant/summary')
        .then(res => {
          setSummary(res.data);
          if (res.data.expiryDate) {
            const expiry = new Date(res.data.expiryDate);
            if (expiry < new Date()) {
              setIsExpired(true);
            }
          }
        })
        .catch(err => {
          if (err.response?.status === 401) return;
          console.error('App Summary Fetch Error:', err);
          if (err.response?.status === 403 && err.response?.data?.message?.includes('expired')) {
            setIsExpired(true);
          }
        });
        
      api.get('/tenant/profile')
        .then(res => setCompanyProfile(res.data))
        .catch(err => {
          if (err.response?.status === 401) return;
          console.error('App Profile Fetch Error:', err);
        });
    } else {
      setSummary(null);
      setCompanyProfile({ name: '', logo: '' });
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [user]);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginPage setUser={setUser} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: '600',
              padding: '12px 16px',
              borderRadius: '8px',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '600',
              padding: '12px 16px',
              borderRadius: '8px',
            },
          },
        }}
      />
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar role={user.role} user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} setUser={setUser} companyProfile={companyProfile} />
        
        <Modal isOpen={isExpired} onClose={() => {}} title="Service Expired">
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-100">
              <XCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase">Service Expired</h2>
              <p className="text-slate-500 font-bold">Your service period has expired. Please contact your vendor to renew your subscription.</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase tracking-widest"
            >
              Logout
            </button>
          </div>
        </Modal>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Main Top Header Section (Sticky) */}
          <div className="sticky top-0 z-10 bg-white uppercase print:hidden">
            <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2 font-black text-indigo-600">
                <Building2 size={24} /> <span>FinSphere</span>
              </div>
              {/* Spacer for centering if needed, or just keep justify-between */}
              <div className="w-10 h-10 lg:hidden"></div> 
            </header>

            {/* Organization Header - Visible on ALL pages for Tenants */}
            {user.role !== 'superadmin' && (
              <div className="px-4 py-3 bg-[#f0f2f5] border-b border-slate-200">
                <div className="bg-[#4a89bc] text-white p-3 md:p-4 rounded-xl shadow-md text-center max-w-[1600px] mx-auto">
                   <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
                     {companyProfile.name || summary?.companyName || user.companyId || 'Enterprise Dashboard'}
                   </h2>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <Routes>
              {user.role === 'superadmin' ? (
                <>
                  <Route path="/admin" element={<SuperAdminDashboard />} />
                  <Route path="/admin/agents" element={<AdminAgentsPage />} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={<CompanyDashboard user={user} />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/transactions" element={<TransactionsPage user={user} companyProfile={companyProfile} />} />
                  <Route path="/adjustments" element={<Adjustments />} />

                  
                  <Route path="/master/accounts" element={<MasterAccountsPage user={user} />} />
                  <Route path="/master/groups" element={<MasterGroupsPage />} />
                  <Route path="/master/types" element={<MasterTypesPage />} />
                  <Route path="/agents" element={<AgentsPage user={user} />} />

                  <Route path="/reports" element={<ReportsPage user={user} companyProfile={companyProfile} />} />
                  <Route path="/logs" element={<LogsPage />} />
                  <Route path="/settings" element={<SettingsPage onUpdate={fetchGlobalData} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              )}
            </Routes>
            
            <p className="p-4 text-center text-[10px] text-slate-300 font-mono">
              {new Date().toISOString()} | NODE: {user?.role?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </Router>
  );
}
