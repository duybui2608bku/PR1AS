import React, { useState, useEffect, useMemo } from 'react';
import { PinLogin } from './components/PinLogin';
import { AccountModal } from './components/AccountModal';
import { QuickViewModal } from './components/QuickViewModal';
import { Account, Category, ExportData, Theme } from './types';
import { dbService } from './services/db.ts';
import { encryptData, decryptData } from './services/cryptoService';
import { REQUIRED_PIN } from './constants';
import { 
  Search, Plus, Moon, Sun, LogOut, Folder, 
  Copy, ExternalLink, Settings, Download, Upload, Trash2,
  Menu, ChevronLeft, Eye
} from './components/Icons';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  
  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Initialization
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const refreshData = async () => {
    try {
      const accs = await dbService.getAccounts();
      const cats = await dbService.getCategories();
      
      // Seed default category if none
      if (cats.length === 0) {
        const defaultCats = [
            { id: '1', name: 'Social' },
            { id: '2', name: 'Work' },
            { id: '3', name: 'Banking' },
            { id: 'uncategorized', name: 'Uncategorized' }
        ];
        for(const c of defaultCats) await dbService.saveCategory(c);
        setCategories(defaultCats);
      } else {
        setCategories(cats);
      }
      setAccounts(accs);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  // Actions
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccounts([]);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSaveAccount = async (account: Account) => {
    await dbService.saveAccount(account);
    await refreshData();
  };

  const handleDeleteAccount = async (id: string) => {
    await dbService.deleteAccount(id);
    await refreshData();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const newCat = { id: crypto.randomUUID(), name: newCategoryName };
    await dbService.saveCategory(newCat);
    setCategories(prev => [...prev, newCat]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (id: string) => {
      if (id === 'uncategorized') {
          alert("Cannot delete default category");
          return;
      }
      // Move accounts to uncategorized
      const affectedAccounts = accounts.filter(a => a.categoryId === id);
      for(const acc of affectedAccounts) {
          await dbService.saveAccount({ ...acc, categoryId: 'uncategorized' });
      }
      await dbService.deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory('all');
      await refreshData();
  };

  // Import / Export
  const handleExport = async () => {
    try {
        // Decrypt everything for export
        const decryptedAccounts = await Promise.all(accounts.map(async (acc) => ({
            ...acc,
            password: await decryptData(acc.password, REQUIRED_PIN),
            notes: acc.notes ? await decryptData(acc.notes, REQUIRED_PIN) : undefined
        })));

        const data: ExportData = {
            version: 1,
            exportedAt: Date.now(),
            categories,
            accounts: decryptedAccounts
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securevault_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch(e) {
        alert("Export failed: " + e);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if(!confirm("Importing will replace existing data with the same IDs. Continue?")) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
        try {
            const json = JSON.parse(ev.target?.result as string) as ExportData;
            if (!json.accounts || !json.categories) throw new Error("Invalid format");

            // Re-encrypt
            for (const cat of json.categories) {
                await dbService.saveCategory(cat);
            }

            for (const acc of json.accounts) {
                const encryptedPass = await encryptData(acc.password, REQUIRED_PIN);
                const encryptedNotes = acc.notes ? await encryptData(acc.notes, REQUIRED_PIN) : undefined;
                
                await dbService.saveAccount({
                    ...acc,
                    password: encryptedPass,
                    notes: encryptedNotes
                });
            }
            await refreshData();
            alert("Import successful");
        } catch (e) {
            alert("Import failed. Ensure file is valid JSON from this app.");
        }
    };
    reader.readAsText(file);
  };

  // Filter Logic
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesCategory = selectedCategory === 'all' || acc.categoryId === selectedCategory;
      const matchesSearch = acc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            acc.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [accounts, selectedCategory, searchQuery]);

  if (!isAuthenticated) {
    return <PinLogin onSuccess={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              SV
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-white">SecureVault</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500">
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="px-4 mb-4">
            <button 
                onClick={() => { setEditingAccount(null); setIsModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-medium"
            >
                <Plus size={18} />
                <span>New Account</span>
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <button
            onClick={() => { setSelectedCategory('all'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Folder size={18} />
            <span className="flex-1 text-left font-medium">All Items</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{accounts.length}</span>
          </button>
          
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</div>
          {categories.map(cat => (
            <div key={cat.id} className="group flex items-center justify-between">
                <button
                onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }}
                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                >
                <div className={`w-2 h-2 rounded-full ${selectedCategory === cat.id ? 'bg-current' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <span className="text-left truncate font-medium">{cat.name}</span>
                </button>
                {cat.id !== 'uncategorized' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
          ))}
          
          <div className="mt-2 flex gap-2 px-2">
            <input 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category"
                className="flex-1 text-sm px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button onClick={handleAddCategory} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors">
                <Plus size={16} />
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut size={20} />
          </button>
        </div>
        
        {/* Settings Popover */}
        {showSettings && (
            <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 space-y-1 animate-in slide-in-from-bottom-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Backup</div>
                <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Download size={16} /> Export JSON
                </button>
                <label className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                    <Upload size={16} /> Import JSON
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
            </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-gray-50 dark:bg-gray-900">
        <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 md:px-8 gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
            {filteredAccounts.length} Items
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {filteredAccounts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-4">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Folder size={48} className="opacity-40" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No accounts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        {searchQuery ? `No results matching "${searchQuery}"` : "Get started by creating your first secure account."}
                    </p>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-blue-600 dark:text-blue-400 font-medium mt-4 hover:underline">
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredAccounts.map(acc => (
                        <div 
                            key={acc.id}
                            onClick={() => setViewingAccount(acc)}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-400 shadow-inner">
                                    {acc.image ? (
                                        <img src={acc.image} alt={acc.title} className="w-full h-full object-cover" />
                                    ) : (
                                        acc.title.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate leading-tight mb-1">{acc.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">{acc.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-medium truncate max-w-[50%]">
                                    {categories.find(c => c.id === acc.categoryId)?.name || 'Uncategorized'}
                                </span>
                                
                                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={() => {
                                            setViewingAccount(acc);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Quick View"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {acc.url && (
                                        <a 
                                            href={acc.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Open Website"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* Modals */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAccount(null); }}
        account={editingAccount}
        categories={categories}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
      />

      <QuickViewModal
        isOpen={!!viewingAccount}
        account={viewingAccount}
        onClose={() => setViewingAccount(null)}
        onEdit={(acc) => {
            setViewingAccount(null);
            setEditingAccount(acc);
            setIsModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;