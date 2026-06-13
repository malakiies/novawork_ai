import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, Send, Bot, User, MessageSquarePlus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AICoach() {
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
      const res = await axios.post('/api/v1/chat', { title: 'Nouveau conseil' }, {
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
      <Card className="glass-panel flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-glass-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Coach Carrière Nova</h3>
            <p className="text-xs text-slate-400">IA en ligne - Toujours à votre écoute</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <Bot className="w-16 h-16 mb-4" />
              <p>Bonjour ! Je suis votre coach carrière.</p>
              <p>Posez-moi vos questions sur votre CV, un entretien ou votre carrière.</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl p-4 whitespace-pre-wrap font-sans ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-50' 
                    : 'bg-dark-800/50 border border-glass-border text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAiTyping && (!messages.length || messages[messages.length-1].role !== 'assistant' || !messages[messages.length-1]._isStreaming) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="bg-dark-800/50 border border-glass-border text-slate-400 rounded-2xl p-4 flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-glass-border">
          <form onSubmit={sendMessage} className="relative">
            <textarea
              className="glass-input w-full pr-14 py-3 min-h-[60px] max-h-[150px] resize-y rounded-xl"
              placeholder="Posez votre question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={!activeConvId}
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-2 bottom-3 w-10 h-10 p-0 rounded-lg"
              disabled={!inputMessage.trim() || !activeConvId}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
