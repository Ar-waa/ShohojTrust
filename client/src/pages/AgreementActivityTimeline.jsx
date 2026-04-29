import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AgreementActivityTimeline.css";
import { Bell, Check, Clock3, FileText, Send } from "lucide-react";
import API from "../api";

const AgreementActivityTimeline = () => {
  const { agreementId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [agreementMeta, setAgreementMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMarking, setIsMarking] = useState(false);

  const { userEmail, userRole } = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return {
      userEmail: user?.email || "",
      userRole: user?.role || ""
    };
  }, []);

  const getEventIcon = (icon) => {
    if (icon === "send") return <Send size={18} />;
    if (icon === "check") return <Check size={18} />;
    if (icon === "clock") return <Clock3 size={18} />;
    if (icon === "alert") return <Bell size={18} />;
    return <FileText size={18} />;
  };

  const loadTimeline = useCallback(async ({ showLoading = true } = {}) => {
    if (!agreementId) {
      setLoading(false);
      setTimeline([]);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");

      const { data } = await API.get(`/agreements/${agreementId}/events`, {
        params: userEmail ? { userEmail } : {},
      });

      setAgreementMeta({
        agreementId: data.agreementId,
        title: data.title,
        clientEmail: data.clientEmail,
        providerEmail: data.providerEmail,
        status: data.status,
      });

      setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
    } catch (error) {
      const message =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";
      setError(message);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  }, [agreementId, userEmail]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleMarkDone = async () => {
    if (!window.confirm("Are you sure you want to mark this agreement as done?")) return;
    
    setIsMarking(true);
    try {
      await API.put(`/agreements/${agreementId}/complete`);
      await loadTimeline({ showLoading: false });
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "Failed to mark as done";
      alert(message);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Topbar />

        <div className="content">
          <div className="atl-page">
            <div className="timeline-page-title">User Agreement Activity Timeline</div>

            <div className="timeline-card">
              <div className="timeline-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2>Agreement Activity Timeline</h2>
                  <p className="agreement-id">
                    Agreement ID: {agreementMeta?.agreementId || agreementId || "N/A"}
                  </p>
                </div>
                {agreementMeta && agreementMeta.status === "accepted" && userRole === "provider" && (
                  <button 
                    className="aa-btn aa-btn-accept" 
                    onClick={handleMarkDone}
                    disabled={isMarking}
                    style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {isMarking ? "Processing..." : "Mark as Done"}
                  </button>
                )}
              </div>
              <hr className="timeline-divider" />

              {!agreementId ? (
                <div className="timeline-empty">Open this page by clicking an agreement from Active Agreements.</div>
              ) : loading ? (
                <div className="timeline-empty">Loading timeline...</div>
              ) : error ? (
                <div className="timeline-empty timeline-error">{error}</div>
              ) : timeline.length === 0 ? (
                <div className="timeline-empty">No timeline events found for this agreement.</div>
              ) : (
                <div className="timeline-list">
                  {timeline.map((event, index) => (
                    <div className="timeline-item" key={event.key || index}>
                      <div className="icon-col">
                        <div className={`timeline-icon ${event.iconColor || "blue"}`}>
                          {getEventIcon(event.icon)}
                        </div>
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-content-top">
                          <span className="event-title">{event.title}</span>
                          {event.badge ? (
                            <span className={`timeline-badge ${event.badgeType || "paid"}`}>
                              {event.badge}
                            </span>
                          ) : null}
                        </div>
                        <p className="event-desc">{event.description}</p>
                        <p className="event-time">{new Date(event.time).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementActivityTimeline;
