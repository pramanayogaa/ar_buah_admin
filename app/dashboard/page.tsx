'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Plus, Edit, Trash2, Save, LogOut } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import supabase from "../api/lib/db";

// Type Definitions
interface ModelData {
  id: number;
  name: string;
  description: string;
}

interface QuizData {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
}

type TableData = ModelData | QuizData;

interface FormDataType {
  name: string;
  description: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('model3d');
  const [models, setModels] = useState<ModelData[]>([]);
  const [quiz, setquiz] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<TableData | null>(null);
  
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    answer: ''
  });

  // Protected Route - Check Authentication
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      router.push('/');
    } else {
      const userData = JSON.parse(user);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
      setUserName(userData.name);
    }
  }, [router]);

  // Fetch Data ketika authentication berhasil
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeMenu === 'model3d') {
          const { data, error } = await supabase.from('infoar').select('*');
          if (error) {
            console.error('Error fetching models:', error);
          } else {
            setModels(data || []);
          }
        } else {
          const { data, error } = await supabase.from('quiz').select('*');
          if (error) {
            console.error('Error fetching quiz:', error);
          } else {
            setquiz(data || []);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, activeMenu]);

  const handleLogout = () => {
    if (confirm('Yakin ingin logout?')) {
      sessionStorage.removeItem('user');
      router.push('/');
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setCurrentItem(null);
    setFormData({ name: '', description: '', question: '', option_a: '', option_b: '', option_c: '', option_d: '', answer: '' });
    setModalOpen(true);
  };

  const handleEdit = (item: TableData) => {
    setEditMode(true);
    setCurrentItem(item);
    
    // Convert item ke FormDataType
    if ('name' in item) {
      // Model data
      setFormData({
        name: item.name,
        description: item.description,
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        answer: ''
      });
    } else {
      // Quiz data
      setFormData({
        name: '',
        description: '',
        question: item.question,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
        answer: item.answer
      });
    }
    
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    
    setLoading(true);
    try {
      const table = activeMenu === 'model3d' ? 'infoar' : 'quiz';
      const { error } = await supabase.from(table).delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting:', error);
        alert('Gagal menghapus data!');
      } else {
        // Update state setelah berhasil delete
        if (activeMenu === 'model3d') {
          setModels(models.filter(m => m.id !== id));
        } else {
          setquiz(quiz.filter(q => q.id !== id));
        }
        alert('Data berhasil dihapus!');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan!');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const table = activeMenu === 'model3d' ? 'infoar' : 'quiz';
      
      // Filter formData sesuai dengan menu aktif
      let dataToSubmit: Partial<ModelData> | Partial<QuizData> = {};
      if (activeMenu === 'model3d') {
        dataToSubmit = {
          name: formData.name,
          description: formData.description
        };
      } else {
        dataToSubmit = {
          question: formData.question,
          option_a: formData.option_a,
          option_b: formData.option_b,
          option_c: formData.option_c,
          option_d: formData.option_d,
          answer: formData.answer
        };
      }
      
      if (editMode && currentItem) {
        // Update data
        const { data, error } = await supabase
          .from(table)
          .update(dataToSubmit)
          .eq('id', currentItem.id)
          .select();
        
        if (error) {
          console.error('Error updating:', error);
          alert(`Gagal mengupdate data! Error: ${error.message}`);
        } else {
          // Update state setelah berhasil update
          if (activeMenu === 'model3d') {
            setModels(models.map(m => m.id === currentItem.id ? data[0] : m));
          } else {
            setquiz(quiz.map(q => q.id === currentItem.id ? data[0] : q));
          }
          alert('Data berhasil diupdate!');
          setModalOpen(false);
          setFormData({ name: '', description: '', question: '', option_a: '', option_b: '', option_c: '', option_d: '', answer: '' });
        }
      } else {
        // Insert data baru
        const { data, error } = await supabase
          .from(table)
          .insert([dataToSubmit])
          .select();
        
        if (error) {
          console.error('Error inserting:', error);
          alert(`Gagal menambah data! Error: ${error.message}\n\nKemungkinan penyebab:\n1. RLS Policy belum diaktifkan\n2. Field required tidak terisi\n3. Permission tidak cukup`);
        } else {
          // Update state setelah berhasil insert
          if (activeMenu === 'model3d') {
            setModels([...models, data[0]]);
          } else {
            setquiz([...quiz, data[0]]);
          }
          alert('Data berhasil ditambahkan!');
          setModalOpen(false);
          setFormData({ name: '', description: '', question: '', option_a: '', option_b: '', option_c: '', option_d: '', answer: '' });
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error:', error);
      alert(`Terjadi kesalahan! ${error.message}`);
    }
    setLoading(false);
  };

  const tableData = activeMenu === 'model3d' ? models : quiz;

  // Animasi loading ketika authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-lg transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b-2 border-black pb-4">Menu</h2>
          <nav className="space-y-2">
            <Button
              onClick={() => setActiveMenu('model3d')}
              variant={activeMenu === 'model3d' ? 'default' : 'ghost'}
              className="w-full justify-start hover:bg-blue-600 hover:text-white"
            >
              Model 3D
            </Button>
            <Button
              onClick={() => setActiveMenu('quiz')}
              variant={activeMenu === 'quiz' ? 'default' : 'ghost'}
              className="w-full justify-start hover:bg-blue-600 hover:text-white"
            >
              Quiz
            </Button>
          </nav>
          
          {/* Logout Button in Sidebar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">AR Buah Buahan</h1>
            </div>
            
            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-gray-800">{userName}</span>
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {activeMenu === 'model3d' ? 'Data Model 3D' : 'Data Quiz'}
              </h2>
              <Button onClick={handleCreate}
              className='bg-blue-600 text-white hover:bg-blue-800 hover:text-white'
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Data
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      {activeMenu === 'model3d' ? (
                        <>
                          <TableHead>Nama Buah</TableHead>
                          <TableHead>Deskripsi</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Pertanyaan</TableHead>
                          <TableHead>Opsi A</TableHead>
                          <TableHead>Opsi B</TableHead>
                          <TableHead>Opsi C</TableHead>
                          <TableHead>Opsi D</TableHead>
                          <TableHead>Jawaban</TableHead>
                        </>
                      )}
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeMenu === 'model3d' ? 4 : 8} className="text-center py-8 text-gray-500">
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      tableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          {activeMenu === 'model3d' ? (
                            <>
                              <TableCell>{'name' in item ? item.name : ''}</TableCell>
                              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                                {'description' in item && item.description && item.description.length > 50 
                                  ? `${item.description.substring(0, 50)}...` 
                                  : 'description' in item ? item.description : ''}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{'question' in item ? item.question : ''}</TableCell>
                              <TableCell>{'option_a' in item ? item.option_a : ''}</TableCell>
                              <TableCell>{'option_b' in item ? item.option_b : ''}</TableCell>
                              <TableCell>{'option_c' in item ? item.option_c : ''}</TableCell>
                              <TableCell>{'option_d' in item ? item.option_d : ''}</TableCell>
                              <TableCell className="font-semibold">{'answer' in item ? item.answer : ''}</TableCell>
                            </>
                          )}
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Edit Data' : 'Tambah Data'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {activeMenu === 'model3d' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Buah</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama buah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="question">Pertanyaan</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Masukkan pertanyaan"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="option_a">Opsi A</Label>
                    <Input
                      id="option_a"
                      value={formData.option_a}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                      placeholder="Opsi A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_b">Opsi B</Label>
                    <Input
                      id="option_b"
                      value={formData.option_b}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                      placeholder="Opsi B"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_c">Opsi C</Label>
                    <Input
                      id="option_c"
                      value={formData.option_c}
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                      placeholder="Opsi C"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_d">Opsi D</Label>
                    <Input
                      id="option_d"
                      value={formData.option_d}
                      onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                      placeholder="Opsi D"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Jawaban (A/B/C/D)</Label>
                  <Input
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value.toUpperCase() })}
                    placeholder="Masukkan jawaban (A, B, C, atau D)"
                    maxLength={1}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}
              className='hover:bg-red-500 hover:text-white'
              >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}
              className='hover:bg-blue-600 hover:text-white'
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}