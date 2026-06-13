import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Sparkles, Calendar, Mail, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export function ATSBoard() {
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const token = useSelector(state => state.auth.accessToken);

  useEffect(() => {
    fetchBoard();
  }, [token]);

  const fetchBoard = async () => {
    try {
      const res = await axios.get('/api/v1/applications/company/board', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoardData(res.data.data);
    } catch (err) {
      console.error('Erreur chargement board', err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = boardData[source.droppableId];
    const destCol = boardData[destination.droppableId];

    const sourceItems = Array.from(sourceCol.items);
    const destItems = Array.from(destCol.items);

    const [movedItem] = sourceItems.splice(source.index, 1);
    
    // Update local state immediately for fast UI
    movedItem.status = destination.droppableId;
    
    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, movedItem);
      setBoardData({
        ...boardData,
        [source.droppableId]: { ...sourceCol, items: sourceItems }
      });
    } else {
      destItems.splice(destination.index, 0, movedItem);
      setBoardData({
        ...boardData,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });
    }

    // Call API to update backend
    try {
      await axios.put(`/api/v1/applications/${draggableId}/status`, 
        { status: destination.droppableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Erreur mise à jour statut', err);
      fetchBoard(); // Rollback if error
    }
  };

  if (loading || !boardData) {
    return <div className="p-8 text-slate-400">Chargement de votre ATS...</div>;
  }

  // Define column render order to match ATS flow
  const columnOrder = ['pending', 'viewed', 'shortlisted', 'interview', 'hired'];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Candidatures (Kanban ATS)</h2>
        <p className="text-slate-400 mt-2">Glissez-déposez les candidats pour avancer dans le processus de recrutement.</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6 px-1 min-w-max">
            {columnOrder.map((colId) => {
              const column = boardData[colId];
              if (!column) return null;

              return (
                <div key={colId} className="flex flex-col w-80 max-h-full">
                  <div className="bg-dark-800/80 backdrop-blur-md rounded-t-xl p-3 border-t border-l border-r border-glass-border flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-slate-200 capitalize">{column.title}</h3>
                    <span className="bg-dark-900 text-slate-400 text-xs px-2 py-1 rounded-full font-bold border border-glass-border">
                      {column.items.length}
                    </span>
                  </div>

                  <Droppable droppableId={colId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto custom-scrollbar p-3 rounded-b-xl border border-glass-border transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary-500/5 border-primary-500/30' : 'bg-dark-900/50'
                        }`}
                      >
                        {column.items.map((item, index) => (
                          <Draggable key={item._id} draggableId={item._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 bg-dark-800 rounded-xl p-4 border border-glass-border shadow-lg transition-transform ${
                                  snapshot.isDragging ? 'rotate-2 scale-105 border-primary-500/50 shadow-primary-500/20' : 'hover:border-slate-600'
                                }`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30 text-xs uppercase">
                                      {item.candidateId?.firstName?.[0] || 'C'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-100">{item.candidateId?.firstName} {item.candidateId?.lastName}</p>
                                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.jobId?.title || 'Offre supprimée'}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {item.matchScore !== null && (
                                  <div className="flex items-center gap-1.5 mb-3 bg-emerald-500/10 border border-emerald-500/20 w-fit px-2 py-1 rounded-md">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-400">Match IA : {item.matchScore}%</span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-glass-border">
                                  <span className="text-[10px] text-slate-500">
                                    Il y a {item.daysAgo} jour(s)
                                  </span>
                                  <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-white transition-colors" title="Voir CV">
                                      <FileText className="w-4 h-4" />
                                    </button>
                                    <button className="text-slate-400 hover:text-white transition-colors" title="Envoyer Message">
                                      <Mail className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
