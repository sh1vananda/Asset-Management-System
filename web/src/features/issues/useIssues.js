import { useCallback, useEffect, useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { STORAGE_KEYS } from "../../core/constants";

const getIssueMetaKey = (userId) => `${STORAGE_KEYS.USER}_issue_meta_${userId || "anon"}`;

const getIssueMeta = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getIssueMetaKey(userId)) || "{}");
  } catch {
    return {};
  }
};

const setIssueMeta = (userId, meta) => {
  localStorage.setItem(getIssueMetaKey(userId), JSON.stringify(meta));
};

export const useIssues = () => {
  const { issues, setIssues, user } = useApp();
  const [error, setError] = useState("");

  const fetchIssues = useCallback(async () => {
    setError("");

    try {
      const res = await api.get("/issues");
      const rows = Array.isArray(res.data) ? res.data : [];
      const issueMeta = getIssueMeta(user?.id);
      const hiddenIssueIds = new Set(
        Object.entries(issueMeta)
          .filter(([, meta]) => Boolean(meta?.hidden))
          .map(([id]) => Number(id))
      );

      setIssues(
        rows
          .filter((row) => !hiddenIssueIds.has(Number(row.id)))
          .map((row) => ({
            ...row,
            title: issueMeta[row.id]?.title || `Issue #${row.id}`,
          }))
      );
    } catch (err) {
      console.error("ISSUES ERROR:", err.response?.data);
      setIssues([]);
      setError(err.response?.data?.error || "Failed to load issues");
    }
  }, [setIssues, user]);

  useEffect(() => {
    Promise.resolve().then(() => fetchIssues());
  }, [fetchIssues]);

  const reportIssue = async ({ assetId, title, description }) => {
    try {
      const payload = {
        asset_id: Number(assetId),
        description,
        reported_by: user?.id,
      };

      const res = await api.post("/issues", payload);
      const issueId = res.data?.issue_id;

      if (issueId) {
        const currentMeta = getIssueMeta(user?.id);
        currentMeta[issueId] = {
          title: title || `Issue #${issueId}`,
          description,
          hidden: false,
        };
        setIssueMeta(user?.id, currentMeta);
      }

      await fetchIssues();
      return { success: true };
    } catch (err) {
      console.error("REPORT ISSUE ERROR:", err.response?.data);
      return {
        success: false,
        message: err.response?.data?.error || "Failed to report issue",
      };
    }
  };

  const updateIssueStatus = async (id, status) => {
    try {
      await api.patch(`/issues/${id}/status`, { status });
      await fetchIssues();
      return { success: true };
    } catch (err) {
      console.error("UPDATE ISSUE ERROR:", err.response?.data);
      return {
        success: false,
        message: err.response?.data?.error || "Failed to update issue",
      };
    }
  };

  const editIssueLocal = (id, { title, description }) => {
    try {
      const numericId = Number(id);
      const currentMeta = getIssueMeta(user?.id);
      currentMeta[numericId] = {
        ...(currentMeta[numericId] || {}),
        title: (title || "").trim() || `Issue #${numericId}`,
        description: (description || "").trim(),
        hidden: false,
      };
      setIssueMeta(user?.id, currentMeta);

      setIssues((prev) =>
        prev.map((issue) =>
          Number(issue.id) === numericId
            ? {
                ...issue,
                title: currentMeta[numericId].title,
                description: currentMeta[numericId].description || issue.description,
              }
            : issue
        )
      );

      return { success: true };
    } catch {
      return { success: false, message: "Failed to edit issue" };
    }
  };

  const deleteIssueLocal = (id) => {
    try {
      const numericId = Number(id);
      const currentMeta = getIssueMeta(user?.id);
      currentMeta[numericId] = {
        ...(currentMeta[numericId] || {}),
        hidden: true,
      };
      setIssueMeta(user?.id, currentMeta);
      setIssues((prev) => prev.filter((issue) => Number(issue.id) !== numericId));
      return { success: true };
    } catch {
      return { success: false, message: "Failed to delete issue" };
    }
  };

  return { issues, reportIssue, updateIssueStatus, editIssueLocal, deleteIssueLocal, error };
};