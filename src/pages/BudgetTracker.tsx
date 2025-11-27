import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, CheckCircle, AlertCircle, Download, RefreshCw } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

interface BudgetData {
  totalBudget: number;
  categories: Category[];
}

// Storage manager using localStorage
const StorageManager = {
  STORAGE_KEY: 'wedding-budget-data',
  
  save(data: BudgetData): { success: boolean; method: string } {
    try {
      console.log('💾 Saving to localStorage:', data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Saved successfully');
      return { success: true, method: 'localStorage' };
    } catch (error) {
      console.error('❌ Save error:', error);
      return { success: false, method: 'none' };
    }
  },
  
  load(): BudgetData {
    try {
      console.log('📂 Loading from localStorage...');
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const data = JSON.parse(stored) as BudgetData;
        console.log('✅ Loaded from localStorage:', data);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Load failed:', error);
    }
    
    // Return default data
    console.log('📦 Loading default data');
    return {
      totalBudget: 60000,
      categories: [
        { id: 1, name: 'Venue', budget: 15000, spent: 12000, color: '#3b82f6' },
        { id: 2, name: 'Catering', budget: 20000, spent: 18500, color: '#10b981' },
        { id: 3, name: 'Photography', budget: 5000, spent: 5000, color: '#8b5cf6' },
        { id: 4, name: 'Flowers', budget: 3000, spent: 2800, color: '#ec4899' },
        { id: 5, name: 'Music', budget: 4000, spent: 3500, color: '#f59e0b' },
        { id: 6, name: 'Attire', budget: 8000, spent: 4000, color: '#ef4444' },
        { id: 7, name: 'Invitations', budget: 2000, spent: 1500, color: '#06b6d4' },
        { id: 8, name: 'Decorations', budget: 3000, spent: 0, color: '#84cc16' }
      ]
    };
  },
  
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Storage cleared');
  }
};

const BudgetTracker: React.FC = () => {
  const [totalBudget, setTotalBudget] = useState(60000);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingBudget, setEditingBudget] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', budget: '', spent: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [storageMethod, setStorageMethod] = useState('');
  const [tempEditValues, setTempEditValues] = useState({ budget: '', spent: '' });
  const [tempBudgetValue, setTempBudgetValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const data = StorageManager.load();
      setTotalBudget(data.totalBudget);
      setCategories(data.categories);
    } catch (error) {
      console.error('❌ Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = (budget: number, cats: Category[]) => {
    setSaveStatus('saving');
    try {
      const result = StorageManager.save({ totalBudget: budget, categories: cats });
      
      if (result.success) {
        setSaveStatus('success');
        setLastSaved(new Date());
        setStorageMethod(result.method);
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed = (totalSpent / totalBudget) * 100;

  const startEditBudget = () => {
    setTempBudgetValue(totalBudget.toString());
    setEditingBudget(true);
  };

  const saveTotalBudget = () => {
    const newBudget = parseFloat(tempBudgetValue) || 0;
    if (newBudget <= 0) {
      alert('Please enter a valid budget amount greater than 0');
      return;
    }
    setTotalBudget(newBudget);
    saveData(newBudget, categories);
    setEditingBudget(false);
    setTempBudgetValue('');
  };

  const cancelEditBudget = () => {
    setEditingBudget(false);
    setTempBudgetValue('');
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setTempEditValues({ budget: category.budget.toString(), spent: category.spent.toString() });
  };

  const saveEditCategory = (id: number) => {
    const updated = categories.map(cat => 
      cat.id === id ? { 
        ...cat, 
        budget: parseFloat(tempEditValues.budget) || 0,
        spent: parseFloat(tempEditValues.spent) || 0
      } : cat
    );
    setCategories(updated);
    saveData(totalBudget, updated);
    setEditingCategory(null);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setTempEditValues({ budget: '', spent: '' });
  };

  const deleteCategory = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter(cat => cat.id !== id);
      setCategories(updated);
      saveData(totalBudget, updated);
    }
  };

  const addCategory = () => {
    if (!newCategory.name || !newCategory.budget) {
      alert('Please enter a category name and budget');
      return;
    }
    
    const category: Category = {
      id: Date.now(),
      name: newCategory.name,
      budget: parseFloat(newCategory.budget) || 0,
      spent: parseFloat(newCategory.spent) || 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
    };
    
    const updated = [...categories, category];
    setCategories(updated);
    saveData(totalBudget, updated);
    setNewCategory({ name: '', budget: '', spent: '' });
    setShowAddForm(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ totalBudget, categories, exportedAt: new Date().toISOString() }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const testStorage = () => {
    console.log('🧪 Running storage test...');
    
    try {
      const testData = { test: 'value', timestamp: Date.now() };
      console.log('Testing save with:', testData);
      localStorage.setItem('test-key', JSON.stringify(testData));
      console.log('✅ Save successful');
      
      const retrieved = localStorage.getItem('test-key');
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        console.log('✅ Load successful:', parsed);
        localStorage.removeItem('test-key');
        alert('✅ Storage is working perfectly! Your budget changes are being saved.');
      } else {
        alert('⚠️ Storage test failed.');
      }
    } catch (error) {
      console.error('❌ Storage test failed:', error);
      alert(`❌ Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
      StorageManager.clear();
      loadData();
      alert('Data has been reset to defaults');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Budget Tracker</h1>
            <p className="text-gray-600">Monitor your wedding expenses and stay on track</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={testStorage}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Test Storage
            </button>

            <button
              onClick={resetData}
              className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Reset
            </button>

            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Saving...</span>
              </div>
            )}
            
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Saved!</span>
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Save failed</span>
              </div>
            )}
            
            {lastSaved && !saveStatus && (
              <div className="text-sm text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
                {storageMethod && <span className="ml-1">({storageMethod})</span>}
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Budget</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            {editingBudget ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-700">$</span>
                  <input
                    type="number"
                    className="text-3xl font-bold border-b-2 border-blue-500 outline-none w-full"
                    value={tempBudgetValue}
                    onChange={(e) => setTempBudgetValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTotalBudget();
                      if (e.key === 'Escape') cancelEditBudget();
                    }}
                    autoFocus
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={saveTotalBudget}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Budget
                  </button>
                  <button 
                    onClick={cancelEditBudget}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</h2>
                  <button 
                    onClick={startEditBudget}
                    className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit total budget"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Allocated across all categories</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Spent</span>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-orange-500">${totalSpent.toLocaleString()}</h2>
            <p className="text-sm text-gray-500 mt-1">{percentUsed.toFixed(1)}% of budget used</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Remaining</span>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-green-500">${remaining.toLocaleString()}</h2>
            <p className="text-sm text-gray-500 mt-1">{(100 - percentUsed).toFixed(1)}% available</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Overall Budget Progress</h3>
          <p className="text-sm text-gray-600 mb-4">Track your total spending against the allocated budget</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Category Breakdown</h3>
              <p className="text-sm text-gray-600">Detailed view of spending by category</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Category name"
                  className="px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Budget amount"
                  className="px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  value={newCategory.budget}
                  onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Amount spent"
                  className="px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  value={newCategory.spent}
                  onChange={(e) => setNewCategory({ ...newCategory, spent: e.target.value })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCategory}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {categories.map(category => {
              const catPercent = (category.spent / category.budget) * 100;
              const catRemaining = category.budget - category.spent;
              const isEditing = editingCategory === category.id;

              return (
                <div key={category.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Spent"
                            className="w-24 px-2 py-1 text-sm border rounded outline-none"
                            value={tempEditValues.spent}
                            onChange={(e) => setTempEditValues({ ...tempEditValues, spent: e.target.value })}
                          />
                          <span className="text-gray-400">/</span>
                          <input
                            type="number"
                            placeholder="Budget"
                            className="w-24 px-2 py-1 text-sm border rounded outline-none"
                            value={tempEditValues.budget}
                            onChange={(e) => setTempEditValues({ ...tempEditValues, budget: e.target.value })}
                          />
                          <button onClick={() => saveEditCategory(category.id)} className="text-green-600 hover:text-green-700">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEditCategory} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-gray-700">
                            ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                          </span>
                          <button onClick={() => startEditCategory(category)} className="text-blue-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCategory(category.id)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(catPercent, 100)}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{catPercent.toFixed(1)}% used</span>
                    <span className={`font-semibold ${catRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(catRemaining).toLocaleString()} {catRemaining >= 0 ? 'remaining' : 'over budget'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;