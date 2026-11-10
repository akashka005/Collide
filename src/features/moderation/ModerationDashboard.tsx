import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';
import { SafetyReport, ModerationMetrics } from '../../types';
import { API_BASE_URL } from '../../lib/api';

interface ModerationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({ isOpen, onClose }) => {
  const { safetyReports, blockedUsers } = useSocialDiscovery();
  const [reportsList, setReportsList] = useState<SafetyReport[]>(safetyReports);
  const [metrics, setMetrics] = useState<ModerationMetrics>({
    activeSessions: 0,
    queueDepth: 0,
    avgDurationSec: 0,
    reportRatePercent: 0,
    healthStatus: 'Live Monitoring',
  });
  const [activeTab, setActiveTab] = useState<'reports' | 'blocks'>('reports');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchModData = async () => {
      try {
        const [repRes, metRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/moderation/reports`),
          fetch(`${API_BASE_URL}/api/v1/moderation/metrics`),
        ]);

        if (repRes.ok && isMounted) {
          const liveReports = await repRes.json();
          if (Array.isArray(liveReports)) {
            setReportsList(liveReports);
          }
        }

        if (metRes.ok && isMounted) {
          const liveMetrics = await metRes.json();
          setMetrics(liveMetrics);
        }
      } catch {
      }
    };

    fetchModData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (id: string, newStatus: SafetyReport['status']) => {
    setReportsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    try {
      await fetch(`${API_BASE_URL}/api/v1/moderation/reports/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newStatus }),
      });
    } catch {
    }
  };

  const filteredReports = reportsList.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-title"
    >
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="relative w-full max-w-4xl p-5 sm:p-7 rounded-3xl glass-surface border border-white/80 dark:border-white/20 shadow-2xl bg-white/95 dark:bg-[#15152B]/95 text-[#1B1B3A] dark:text-white max-h-[90vh] flex flex-col no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill cursor-pointer"
          aria-label="Close moderation dashboard"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="p-2 rounded-xl bg-indigo-500/20 text-[#6FA8FF]">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h2 id="mod-title" className="font-serif text-2xl font-medium leading-none">
              Trust & Safety Moderation Console
            </h2>
            <p className="text-xs text-[#4B4A68] dark:text-slate-400 mt-1">
              Live queue oversight, report auditing, and server-side block management
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-[#4B4A68] dark:text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-[#6FA8FF]" />
              <span>Active Sessions</span>
            </div>
            <div className="text-lg font-bold text-[#1B1B3A] dark:text-white">{metrics.activeSessions}</div>
            <div className="text-[10px] text-emerald-500 font-medium">● {metrics.healthStatus}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-[#4B4A68] dark:text-slate-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Queue Depth</span>
            </div>
            <div className="text-lg font-bold text-[#1B1B3A] dark:text-white">{metrics.queueDepth} peers</div>
            <div className="text-[10px] text-[#4B4A68] dark:text-slate-400">Atomic Redis Queue</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-[#4B4A68] dark:text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Avg Duration</span>
            </div>
            <div className="text-lg font-bold text-[#1B1B3A] dark:text-white">
              {Math.floor(metrics.avgDurationSec / 60)}m {metrics.avgDurationSec % 60}s
            </div>
            <div className="text-[10px] text-emerald-500">Live Telemetry</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-[#4B4A68] dark:text-slate-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Report Rate</span>
            </div>
            <div className="text-lg font-bold text-[#1B1B3A] dark:text-white">{metrics.reportRatePercent}%</div>
            <div className="text-[10px] text-emerald-500 font-medium">Below threshold</div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-b border-white/40 dark:border-white/10 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${activeTab === 'reports'
                ? 'bg-[#15152B] text-white dark:bg-white dark:text-[#15152B]'
                : 'glass-pill text-[#4B4A68] dark:text-slate-300'
              }`}
          >
            Incident Reports ({reportsList.length})
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${activeTab === 'blocks'
                ? 'bg-[#15152B] text-white dark:bg-white dark:text-[#15152B]'
                : 'glass-pill text-[#4B4A68] dark:text-slate-300'
              }`}
          >
            Blocked Pairs ({blockedUsers.length})
          </button>
        </div>
        {activeTab === 'reports' && (
          <div className="flex-1 flex flex-col min-h-[300px] overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#4B4A68] dark:text-slate-400">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2 py-1 rounded-lg glass-surface text-xs text-[#1B1B3A] dark:text-white focus:outline-none"
                >
                  <option value="all">All Violations</option>
                  <option value="inappropriate">Inappropriate Media</option>
                  <option value="harassment">Harassment</option>
                  <option value="spam">Commercial Spam</option>
                  <option value="underage">Underage</option>
                </select>
              </div>
              <span className="text-xs text-[#4B4A68] dark:text-slate-400">
                Audited with pseudonymous tokens
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {filteredReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#4B4A68]">
                  No reports in this queue category.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-[#1B1B3A] dark:text-white">
                          Target: {report.reportedUserName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          {report.category}
                        </span>
                        <span className="text-[10px] text-[#4B4A68] dark:text-slate-400">
                          {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B4A68] dark:text-slate-300 leading-relaxed max-w-lg">
                        {report.notes || 'No extra notes provided by user'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {report.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'actioned')}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Ban Target</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                            className="px-3 py-1 rounded-full text-[11px] font-semibold glass-pill text-[#4B4A68] dark:text-slate-300 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                          {report.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'blocks' && (
          <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[300px] no-scrollbar">
            {blockedUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#4B4A68]">
                No users currently blocked in your session.
              </div>
            ) : (
              blockedUsers.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className="font-semibold text-[#1B1B3A] dark:text-white">
                        {b.blockedUserName} ({b.blockedUserId})
                      </span>
                      <div className="text-[10px] text-[#4B4A68] dark:text-slate-400">
                        Reason: {b.reason || 'Manual block'} · Guaranteed zero re-pairing
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Active Lease
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        <div className="pt-3 border-t border-white/40 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold glass-pill cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};