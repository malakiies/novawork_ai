import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Send, Sparkles, User, Bot, MessageSquarePlus, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CareerChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isAiTyping]);

  // Initialiser Socket.io et charger les conversations
  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get('/api/v1/chat', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data.data.conversations);
        if (res.data.data.conversations.length > 0) {
          loadConversation(res.data.data.conversations[0]._id);
        }
      } catch (err) {
        console.error('Erreur chargement convs', err);
      }
    };

    fetchConversations();

    // Connexion Socket
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('chat_chunk', ({ conversationId, chunk }) => {
      if (conversationId !== activeConvId) return; // Ignorer si pas la bonne tab
      setIsAiTyping(true);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        
        // Si le dernier message est déjà celui de l'IA (en construction), on ajoute le chunk
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg._isStreaming) {
          lastMsg.content += chunk;
        } else {
          // Sinon, on crée un nouveau bloc IA
          newMsgs.push({ role: 'assistant', content: chunk, _isStreaming: true });
        }
        return newMsgs;
      });
    });

    socketRef.current.on('chat_complete', () => {
      setIsAiTyping(false);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg._isStreaming) delete lastMsg._isStreaming;
        return newMsgs;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, activeConvId]);

  const loadConversation = async (id) => {
    setActiveConvId(id);
    setIsAiTyping(false);
    try {
      const res = await axios.get(`/api/v1/chat/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await axios.post('/api/v1/chat', { title: 'Nouvelle discussion' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newConv = res.data.data.conversation;
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv._id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;

    const msgContent = inputMessage.trim();
    setInputMessage('');

    // Affichage immédiat localement
    setMessages(prev => [...prev, { role: 'user', content: msgContent }]);
    setIsAiTyping(true);

    // Envoi au backend via Socket
    socketRef.current.emit('send_chat_message', {
      conversationId: activeConvId,
      content: msgContent
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      
      {/* Sidebar - Historique */}
      <div className="w-80 flex flex-col gap-4">
        <Button onClick={createNewConversation} className="w-full">
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Nouveau Chat
        </Button>
        <Card className="glass-panel flex-1 overflow-y-auto">
          <CardContent className="p-4 space-y-2">
            {conversations.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">Aucune conversation.</div>
            )}
            {conversations.map(conv => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeConvId === conv._id 
                    ? 'bg-primary-500/20 border border-primary-500/30' 
                    : 'hover:bg-dark-800/50 border border-transparent'
                }`}
              >
                <div className="font-medium text-slate-200 truncate">{conv.title}</div>
                <div className="text-xs text-slate-500 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <Card className="glass-panel flex-1 flex flex-col p-0 overflow-hidden border border-primary-500/20">
        {/* Header */}
        <div className="p-4 border-b border-glass-border flex items-center gap-3 bg-dark-900/50">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Coach Carrière Nova
            </h3>
            <p className="text-xs text-slate-400">IA en ligne - Conseils CV & Entretiens</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <Bot className="w-16 h-16 mb-4" />
              <p>Bonjour {user?.firstName} ! Je suis votre coach carrière.</p>
              <p>Posez-moi vos questions sur votre CV, un entretien ou votre carrière.</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  msg.role === 'user' ? 'bg-primary-600' : 'bg-dark-800 border border-primary-500/50'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-6 h-6 text-primary-400" />}
                </div>
                <div className={`p-4 rounded-2xl whitespace-pre-wrap font-sans leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary-600/20 border border-primary-500/30 text-slate-100' 
                    : 'bg-dark-800/50 border border-glass-border text-slate-300'
                }`}>
                  {msg.content}
                  {msg._isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary-400 animate-pulse"></span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAiTyping && (!messages.length || messages[messages.length-1].role !== 'assistant' || !messages[messages.length-1]._isStreaming) && (
             <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex gap-4 max-w-[80%]"
           >
             <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-dark-800 border border-primary-500/50 shadow-lg">
               <Bot className="w-6 h-6 text-primary-400" />
             </div>
             <div className="p-4 rounded-2xl bg-dark-800/50 border border-glass-border text-slate-300 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"></span>
               <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
             </div>
           </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-glass-border bg-dark-900/50">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Demandez un conseil à votre Coach IA..."
              className="w-full bg-dark-800/50 border border-glass-border rounded-xl pl-4 pr-16 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-500 text-slate-100 shadow-inner"
              disabled={!activeConvId}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 h-10 w-10 rounded-lg"
              disabled={!inputMessage.trim() || isAiTyping || !activeConvId}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
