import { useState } from 'react';
import { motion } from 'framer-motion';
import { jiraTickets, statusColumns, statusLabels, priorityColors, typeIcons } from '@/data/jiraMockData';
import { List, LayoutGrid, Calendar, GanttChart } from 'lucide-react';

type ViewMode = 'board' | 'list';

const JiraPage = () => {
  const [view, setView] = useState<ViewMode>('board');
  const [tickets, setTickets] = useState(jiraTickets);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold nebula-gradient-text">Jira Board</h1>
          <p className="text-muted-foreground text-sm">Manage your sprint tasks</p>
        </motion.div>
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
          {[
            { id: 'board' as const, icon: LayoutGrid, label: 'Board' },
            { id: 'list' as const, icon: List, label: 'List' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === v.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <v.icon className="w-3.5 h-3.5" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((status, colIdx) => {
            const colTickets = tickets.filter(t => t.status === status);
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.1 }}
                className="nebula-card p-3 min-h-[300px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-foreground">{statusLabels[status]}</h3>
                  <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">{colTickets.length}</span>
                </div>
                <div className="space-y-2">
                  {colTickets.map((ticket, i) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: colIdx * 0.1 + i * 0.05 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 15px hsl(257 100% 68% / 0.2)' }}
                      className="p-3 bg-muted/20 rounded-lg border border-border/20 cursor-pointer transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{typeIcons[ticket.type]}</span>
                        <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2 leading-snug">{ticket.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{ticket.assignee}</span>
                        <span className="text-xs text-primary font-mono">{ticket.points}pts</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nebula-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">ID</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Title</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Priority</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Assignee</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                >
                  <td className="p-3 font-mono text-primary text-xs">{ticket.id}</td>
                  <td className="p-3 text-foreground">{ticket.title}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{statusLabels[ticket.status]}</span>
                  </td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span></td>
                  <td className="p-3 text-muted-foreground">{ticket.assignee}</td>
                  <td className="p-3 text-primary font-mono">{ticket.points}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default JiraPage;
