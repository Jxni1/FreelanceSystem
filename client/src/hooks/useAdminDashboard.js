import { useState, useEffect, useMemo } from 'react';

export function useAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Thirrja e backend-it tënd .NET përmes HTTPS te porta e saktë 7244
    fetch('https://localhost:7244/api/dashboard')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  return useMemo(() => {
    // Nëse të dhënat ende po ngarkohen ose API dështon përkohësisht, kthejmë strukturen bosh që të mos bëjë crash dizajni
    if (loading || !data) {
      return {
        isLoading: loading,
        flaggedCount: 0,
        stats: {
          grossVolume: { value: "$0", delta: "0%", deltaDir: "up" },
          activeUsers: { value: "0", delta: "0%", deltaDir: "up" },
          openDisputes: { value: "0", delta: "0%", deltaDir: "down" },
          jobsPosted: { value: "0", delta: "0%", deltaDir: "up" }
        },
        moderation: [],
        health: [{ label: 'Report/Dispute Rate', value: '0%', percent: 0, tone: 'emerald' }],
        escalated: { count: 0, text: "No pending automated flags require attention." },
      };
    }

    // Mapimi i të dhënave dinamike direkt te fushat që përdor dizajni yt ekzistues
    return {
      isLoading: false,
      flaggedCount: data.moderationQueue ? data.moderationQueue.length : 0,
      stats: {
        grossVolume: { 
          value: `$${(data.kpiCards?.grossMarketplaceVolume ?? 0).toLocaleString()}`, 
          delta: "12%", 
          deltaDir: "up" 
        },
        activeUsers: { 
          value: (data.kpiCards?.activeUsersCount ?? 0).toLocaleString(), 
          delta: "8%", 
          deltaDir: "up" 
        },
        openDisputes: { 
          value: (data.kpiCards?.openDisputesCount ?? 0).toLocaleString(), 
          delta: "2%", 
          deltaDir: "down" 
        },
        jobsPosted: { 
          value: (data.kpiCards?.jobsPostedCount ?? 0).toLocaleString(), 
          delta: "5%", 
          deltaDir: "up" 
        },
      },
      moderation: (data.moderationQueue ?? []).map(row => ({
        id: row.id,
        type: row.type === "Report" ? "Dispute" : row.type, // Konvertim i thjeshtë që të kapë saktë ngjyrat (TYPE_TONE) e dizajnit tënd
        item: row.item,
        subject: row.subject,
        reason: row.reason === "Integrity Check" ? "Integrity" : row.reason // Përputhje me REASON_TONE e dizajnit tënd
      })),
      health: [
        { 
          label: 'Report/Dispute Rate', 
          value: `${data.marketplaceHealth?.disputeRate ?? 0}%`, 
          percent: data.marketplaceHealth?.disputeRate ?? 0, 
          tone: (data.marketplaceHealth?.disputeRate ?? 0) > 15 ? 'rose' : 'emerald' 
        }
      ],
      escalated: {
        count: data.kpiCards?.openDisputesCount ?? 0,
        text: `There are currently ${data.kpiCards?.openDisputesCount ?? 0} unresolved flags submitted by users that need safety triage.`
      },
    };
  }, [data, loading]);
}

export default useAdminDashboard;