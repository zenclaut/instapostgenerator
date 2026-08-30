import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  FolderOpen, 
  Clock, 
  Download, 
  Upload,
  Layers,
  Smartphone,
  Square
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/postDatabase';

import type { ProjectData } from '../../types/postTypes';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: ProjectData) => void;
  currentProjectId: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  currentProjectId
}) => {
  const projects = useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), []);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredProjects = projects?.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu gönderi projesini geçmişten silmek istediğinize emin misiniz?')) {
      await db.projects.delete(id);
    }
  };

  const handleExportBackup = async () => {
    const all = await db.projects.toArray();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(all, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `bgy_posts_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          await db.projects.bulkPut(parsed);
          alert('Yedek başarıyla içeri aktarıldı!');
        }
      } catch (err) {
        alert('Geçersiz yedek dosyası!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Geçmiş Gönderiler</h2>
              <p className="text-[11px] text-slate-400">Tarayıcıda kayıtlı tüm projeleriniz</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Arama & İşlem Çubuğu */}
        <div className="p-4 border-b border-slate-800 space-y-2.5 bg-slate-900/40">
          <input
            type="text"
            placeholder="Projelerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-slate-200 placeholder:text-slate-500"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{filteredProjects?.length || 0} Proje Kayıtlı</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1 hover:text-slate-200 text-slate-400"
                title="Tüm veritabanını JSON olarak yedekle"
              >
                <Download className="w-3 h-3" />
                <span>Yedekle</span>
              </button>
              <label className="flex items-center gap-1 hover:text-slate-200 text-slate-400 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>İçe Aktar</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Proje Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProjects && filteredProjects.length > 0 ? (
            filteredProjects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              const dateStr = new Date(p.updatedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onLoadProject(p);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-red-950/40 to-slate-900 border-red-500 shadow-md shadow-red-950/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 transition-colors line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{dateStr}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="p-1 hover:bg-red-950/60 rounded text-slate-500 hover:text-red-400 transition-colors"
                        title="Projeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rozetler ve Sayfa Sayısı */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3 text-red-400" />
                        {p.slides.length} Sayfa
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                        {p.aspectRatio === '4:5' ? (
                          <>
                            <Smartphone className="w-3 h-3 text-blue-400" />
                            4:5 Dikey
                          </>
                        ) : (
                          <>
                            <Square className="w-3 h-3 text-emerald-400" />
                            1:1 Kare
                          </>
                        )}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="text-red-400 font-semibold">Aktif Proje</span>
                    ) : (
                      <span className="text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5">
                        <FolderOpen className="w-3 h-3" />
                        Aç
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs">Henüz kayıtlı geçmiş gönderi bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
