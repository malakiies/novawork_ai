import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, X, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CVManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cvs, setCvs] = useState([]); // List of uploaded CVs

  // Redux token
  const token = useSelector((state) => state.auth.accessToken);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    setError('');
    setSuccess('');
    
    if (!selectedFile) return false;
    
    // Check type (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      setError('Seul le format PDF est autorisé.');
      return false;
    }
    
    // Check size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError('La taille du fichier ne doit pas dépasser 5 Mo.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setFilePreview(URL.createObjectURL(droppedFile));
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setError('');
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('cv', file); // Field name must match multer .single('cv')

    try {
      const response = await axios.post('/api/v1/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setSuccess('CV uploadé et analysé avec succès !');
      
      // Simulate adding to list (in a real app, fetch /api/v1/cv/my-cvs)
      setCvs(prev => [response.data.data, ...prev]);
      
      setTimeout(() => {
        handleClearFile();
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Gestion des CVs</h2>
        <p className="text-slate-400 mt-2">Uploadez votre CV au format PDF pour l'analyse IA. (Max 5MB)</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>{success}</p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Box */}
        <Card className="glass-panel h-full flex flex-col">
          <CardHeader>
            <CardTitle>Nouveau CV</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[300px] ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-glass-border hover:border-slate-500 hover:bg-white/5'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-primary-400' : 'text-slate-400'}`} />
                  <h3 className="text-lg font-medium text-slate-200 mb-1">
                    Glissez & Déposez votre fichier
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Uniquement au format PDF. Maximum 5 Mo.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('cv-upload').click()}
                  >
                    Parcourir les fichiers
                  </Button>
                  <input 
                    id="cv-upload" 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf" 
                    onChange={handleFileSelect}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="file-ready"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-800/50 border border-glass-border rounded-2xl p-6 relative"
                >
                  <button 
                    onClick={handleClearFile} 
                    disabled={isUploading}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col items-center text-center mt-4">
                    <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-4 text-primary-400 shadow-lg shadow-primary-500/10">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-200 truncate w-full max-w-[250px] mb-1">
                      {file.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      {(file.size / 1024 / 1024).toFixed(2)} Mo
                    </p>

                    {isUploading ? (
                      <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{uploadProgress < 100 ? 'Upload en cours...' : 'Analyse IA...'}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            className="bg-primary-500 h-2 rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleUpload}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Envoyer et Analyser
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </CardContent>
        </Card>

        {/* PDF Preview Box */}
        <Card className="glass-panel h-[500px] flex flex-col overflow-hidden p-0 border-primary-500/20">
          <CardHeader className="bg-dark-800/80 border-b border-glass-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-primary-400" />
              Aperçu du PDF
            </CardTitle>
          </CardHeader>
          <div className="flex-1 bg-dark-900 relative">
            {filePreview ? (
              <iframe 
                src={`${filePreview}#view=FitH`} 
                title="PDF Preview"
                className="w-full h-full border-none"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <FileSearch className="w-12 h-12 mb-4 opacity-50" />
                <p>Sélectionnez un PDF pour voir l'aperçu</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* List of uploaded CVs */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Mes CVs Sauvegardés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cvs.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Aucun CV uploadé pour le moment.</p>
          ) : (
            cvs.map((cv, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-primary-500/30 bg-primary-500/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-dark-900/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">CV Analysé</p>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Traitement terminé
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.open(cv.cvUrl, '_blank')}>
                  Voir sur Cloudinary
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
