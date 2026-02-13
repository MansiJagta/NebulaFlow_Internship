import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Shield, Users, Send } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

const existingMembers: Member[] = [
  { id: '1', name: 'Alice Chen', email: 'alice@nebula.dev', role: 'Developer', status: 'active' },
  { id: '2', name: 'Bob Kumar', email: 'bob@nebula.dev', role: 'Developer', status: 'active' },
  { id: '3', name: 'Carol Davis', email: 'carol@nebula.dev', role: 'Designer', status: 'active' },
  { id: '4', name: 'Dave Wilson', email: 'dave@nebula.dev', role: 'DevOps', status: 'active' },
  { id: '5', name: 'Eve Martinez', email: 'eve@nebula.dev', role: 'Designer', status: 'pending' },
];

const PMAddMembers = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold nebula-gradient-text">Team Members</h1>
        <p className="text-muted-foreground text-sm">Manage your team</p>
      </motion.div>

      {/* Invite */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Invite Member
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="bg-muted/30 border border-border/30 rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option>Developer</option>
            <option>Designer</option>
            <option>DevOps</option>
            <option>QA</option>
          </select>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-lg nebula-gradient-bg text-primary-foreground text-sm font-medium flex items-center gap-2">
            <Send className="w-4 h-4" /> Invite
          </motion.button>
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="nebula-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left p-4 text-muted-foreground font-medium">Member</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Role</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {existingMembers.map((m, i) => (
              <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full nebula-gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{m.role}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {m.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default PMAddMembers;
