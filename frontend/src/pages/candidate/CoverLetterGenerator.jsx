import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, FileText, Send, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function CoverLetterGenerator() {
  const [cvs, setCvs] = useState([]);
  const [selectedCv, setSelectedCv] = useState('');
  const [jobContext, setJobContext] = useState('');
  const [tone, setTone] = useState('Professionnel');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [letter, setLetter] = useState(null); // The generated letter object
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const token = useSelector((state) => state.auth.accessToken);

  // Load candidate's CVs on mount
  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const res = await axios.get('/api/v1/cv/my-cvs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCvs(res.data.data.cvs);
        if (res.data.data.cvs.length > 0) {
          // Select primary CV or the first one
          const primary = res.data.data.cvs.find(c => c.isPrimary);
          setSelectedCv(primary ? primary._id : res.data.data.cvs[0]._id);
        }
      } catch (err) {
        console.error('Erreur chargement CVs', err);
      }
    };
    if (token) fetchCVs();
  }, [token]);

  const handleGenerate = async () => {
    if (!selectedCv) return setError('Veuillez uploader et sélectionner un CV d\'abord.');
    if (!jobContext.trim()) return setError('Veuillez fournir le contexte de l\'offre.');

    setIsGenerating(true);
    setError('');
    setLetter(null);

    try {
      const response = await axios.post('/api/v1/cover-letters/generate', {
        cvId: selectedCv,
        jobContext,
        tone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLetter(response.data.data.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la génération de la lettre.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!letter || !letter._id) return;
    
    setIsExporting(true);
    try {
      const response = await axios.post(`/api/v1/cover-letters/${letter._id}/export-pdf`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pdfUrl = response.data.data.pdfUrl;
      // Open Cloudinary PDF in new tab
      window.open(pdfUrl, '_blank');
    } catch (err) {
      setError('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    if (!letter) return;
    navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary-400" />
          Générateur IA
        </h2>
        <p className="text-slate-400 mt-2">Générez une lettre de motivation sur-mesure basée sur votre CV et l'offre d'emploi.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">CV Source</label>
                <select 
                  className="glass-input"
                  value={selectedCv}
                  onChange={(e) => setSelectedCv(e.target.value)}
                >
                  {cvs.length === 0 && <option value="">Aucun CV disponible</option>}
                  {cvs.map(cv => (
                    <option key={cv._id} value={cv._id}>
                      {cv.fileName} {cv.isPrimary ? '(Principal)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">URL de l'offre ou description</label>
                <textarea 
                  className="glass-input min-h-[120px] resize-none"
                  placeholder="Collez l'URL de l'offre ou la description du poste ici..."
                  value={jobContext}
                  onChange={(e) => setJobContext(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ton de la lettre</label>
                <select 
                  className="glass-input"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Professionnel">Formel et Professionnel</option>
                  <option value="Moderne">Dynamique et Moderne</option>
                  <option value="Créatif">Créatif / Storytelling</option>
                </select>
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={handleGenerate}
                disabled={isGenerating || cvs.length === 0}
                isLoading={isGenerating}
              >
                {!isGenerating && <Sparkles className="w-4 h-4 mr-2" />}
                Générer ma lettre
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="glass-panel h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Résultat</CardTitle>
              {letter && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" onClick={handleExportPDF} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Génération...' : 'PDF'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px] relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-primary-400">
                  <Sparkles className="w-8 h-8 animate-pulse mb-4" />
                  <p className="animate-pulse">Analyse du CV et de l'offre en cours...</p>
                </div>
              ) : letter ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-dark-800/30 border border-glass-border rounded-xl p-6 h-full whitespace-pre-wrap text-slate-300 leading-relaxed font-serif overflow-y-auto max-h-[600px]"
                >
                  {letter.content}
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
                  <FileText className="w-12 h-12 mb-4 opacity-50" />
                  <p>Votre lettre de motivation apparaîtra ici.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
