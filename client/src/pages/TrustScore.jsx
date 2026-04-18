import React, { useEffect, useState } from "react";

const TrustScore = () => {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:5000/api/trust", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load trust score");
        }

        const data = await res.json();

        setScore(data?.trustScore || 0);

      } catch (err) {
        setError(err.message);
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  return (
    <div className="content">

      <h2>Trust Score</h2>

      {loading ? (
        <div className="card">
          <p>Loading trust score...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ color: "red" }}>
          <p>{error}</p>
        </div>
      ) : (
        <div className="card">
          <h1>{score} / 100</h1>
          <p>Your reliability score based on behavior, agreements, and actions</p>
        </div>
      )}

    </div>
  );
};

export default TrustScore;