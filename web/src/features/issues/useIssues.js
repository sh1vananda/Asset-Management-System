import { useEffect } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";

export const useIssues = () => {
  const { issues, setIssues } = useApp();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      // const res = await api.get("/issues");
      // setIssues(res.data);

      // 🔥 MOCK
      setIssues([
        {
          id: 1,
          assetId: 1,
          reportedBy: 1,
          title: "Screen flickering",
          description: "Laptop issue",
          status: "Open",
          priority: "Medium",
          reportedDate: "2024-01-15",
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const reportIssue = async (data) => {
    try {
      // await api.post("/issues", data);

      setIssues((prev) => [...prev, { ...data, id: Date.now() }]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateIssueStatus = async (id, status) => {
    try {
      // await api.put(`/issues/${id}`, { status });

      setIssues((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status } : i
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return { issues, reportIssue, updateIssueStatus };
};