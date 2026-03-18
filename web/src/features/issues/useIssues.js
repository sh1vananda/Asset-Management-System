import { useEffect } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";

export const useIssues = () => {
  const { issues, setIssues, user } = useApp();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues");

      setIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("ISSUES ERROR:", err.response?.data);
      setIssues([]);
    }
  };

  const reportIssue = async (assetId, description) => {
    try {
      const payload = {
        asset_id: Number(assetId),
        description,
        reported_by: user?.id,
      };

      await api.post("/issues", payload);
      fetchIssues();
    } catch (err) {
      console.error("REPORT ISSUE ERROR:", err.response?.data);
    }
  };

  const updateIssueStatus = async (id, status) => {
    try {
      await api.patch(`/issues/${id}/status`, { status });
      fetchIssues();
    } catch (err) {
      console.error("UPDATE ISSUE ERROR:", err.response?.data);
    }
  };

  return { issues, reportIssue, updateIssueStatus };
};