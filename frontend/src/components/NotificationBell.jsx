import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Bell, Check, X, BellDot, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const token = useSelector((state) => state.auth.accessToken);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialisation et Socket
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/v1/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      } catch (err) {
        console.error('Erreur chargement notifications', err);
      }
    };

    fetchNotifications();

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('new_notification', (notif) => {
      // Ajouter à la liste
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Afficher le Toast (Popup en bas à droite)
      const toastId = Date.now();
      setToasts(prev => [...prev, { ...notif, id: toastId }]);
      
      // Auto-fermer le toast après 5 secondes
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, 5000);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.put(`/api/v1/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/v1/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-slate-300"
        >
          {unreadCount > 0 ? (
            <>
              <BellDot className="w-5 h-5 text-primary-400 animate-pulse" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-[10px] font-bold flex items-center justify-center rounded-full text-white border border-dark-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 max-h-[400px] bg-dark-800/90 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl overflow-hidden flex flex-col z-50"
            >
              <div className="p-4 border-b border-glass-border flex items-center justify-between bg-dark-900/50">
                <h3 className="font-semibold text-slate-100">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                    <Check className="w-3 h-3" /> Tout marquer lu
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    Aucune notification pour le moment.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-lg flex gap-3 cursor-pointer transition-colors ${
                        notif.isRead ? 'hover:bg-white/5 opacity-70' : 'bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20'
                      }`}
                    >
                      <div className="text-xl shrink-0 pt-1">{notif.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm ${notif.isRead ? 'font-medium text-slate-300' : 'font-bold text-slate-100'}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <button 
                              onClick={(e) => markAsRead(notif._id, e)}
                              className="text-slate-500 hover:text-primary-400 shrink-0"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.body}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toasts de Notification en direct (Bas Droite) */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto w-80 bg-dark-800/90 backdrop-blur-xl border border-glass-border shadow-2xl rounded-xl p-4 flex gap-3 items-start relative group cursor-pointer"
              onClick={() => {
                if(toast.actionUrl) navigate(toast.actionUrl);
                setToasts(prev => prev.filter(t => t.id !== toast.id));
              }}
            >
              <div className="text-2xl">{toast.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-100 text-sm">{toast.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{toast.body}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setToasts(prev => prev.filter(t => t.id !== toast.id)); }}
                className="absolute top-2 right-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
