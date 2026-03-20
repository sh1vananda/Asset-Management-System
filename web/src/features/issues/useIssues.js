import { useCallback, useEffect, useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { STORAGE_KEYS } from "../../core/constants";
import { extractApiErrorMessage } from "../../core/errors";

const VALID_STATUSES = new Set(["open", "in_progress", "resolved", "closed"]);
const ISSUE_TIMELINE_STORAGE_KEY = `${STORAGE_KEYS.USER}_issue_timeline`;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeIssueStatus = (status) => {
  const normalized = (status || "open").toString().trim().toLowerCase().replace(/\s+/g, "_");
  return VALID_STATUSES.has(normalized) ? normalized : "open";
};

const toIsoString = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const diffDays = (startValue, endValue) => {
  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return null;
  }

  return Math.max(0, Math.ceil((end - start) / DAY_IN_MS));
};

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

const getIssueTimeline = () => {
  try {
    return JSON.parse(localStorage.getItem(ISSUE_TIMELINE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const setIssueTimeline = (timeline) => {
  localStorage.setItem(ISSUE_TIMELINE_STORAGE_KEY, JSON.stringify(timeline));
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

      const previousTimeline = getIssueTimeline();
      const nextTimeline = { ...previousTimeline };
      let timelineChanged = false;

      const enrichedRows = rows
        .filter((row) => !hiddenIssueIds.has(Number(row.id)))
        .map((row) => {
          const issueId = Number(row.id);
          const status = normalizeIssueStatus(row.status);
          const existingTimeline = previousTimeline[issueId] || {};

          const backendCreatedAt = toIsoString(row.created_at || row.createdAt);
          const backendClosedAt = toIsoString(
            row.closed_at || row.closedAt || row.resolved_at || row.resolvedAt || row.updated_at || row.updatedAt
          );

          const createdAt = backendCreatedAt || toIsoString(existingTimeline.created_at) || new Date().toISOString();
          const shouldBeClosed = status === "closed" || status === "resolved";
          const closedAt = shouldBeClosed
            ? backendClosedAt || toIsoString(existingTimeline.closed_at) || new Date().toISOString()
            : null;

          const timelineEntry = {
            created_at: createdAt,
            closed_at: closedAt,
          };

          if (
            existingTimeline.created_at !== timelineEntry.created_at ||
            existingTimeline.closed_at !== timelineEntry.closed_at
          ) {
            nextTimeline[issueId] = timelineEntry;
            timelineChanged = true;
          }

          const turnaroundDays = diffDays(createdAt, closedAt || new Date().toISOString());
          const resolutionDays = closedAt ? diffDays(createdAt, closedAt) : null;

          return {
            ...row,
            status,
            created_at: createdAt,
            closed_at: closedAt,
            turnaround_days: turnaroundDays,
            resolution_days: resolutionDays,
            title: issueMeta[row.id]?.title || `Issue #${row.id}`,
          };
        });

      if (timelineChanged) {
        setIssueTimeline(nextTimeline);
      }

      setIssues(enrichedRows);
    } catch (err) {
      console.error("ISSUES ERROR:", err.response?.data);
      setIssues([]);
      setError(extractApiErrorMessage(err, "Failed to load issues"));
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

        const timeline = getIssueTimeline();
        timeline[Number(issueId)] = {
          ...(timeline[Number(issueId)] || {}),
          created_at: new Date().toISOString(),
          closed_at: null,
        };
        setIssueTimeline(timeline);
      }

      await fetchIssues();
      return { success: true };
    } catch (err) {
      console.error("REPORT ISSUE ERROR:", err.response?.data);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to report issue"),
      };
    }
  };

  const updateIssueStatus = async (id, status) => {
    const numericId = Number(id);
    const nextStatus = normalizeIssueStatus(status);
    let previousStatus = null;

    setIssues((prev) =>
      prev.map((issue) => {
        if (Number(issue.id) !== numericId) return issue;
        previousStatus = normalizeIssueStatus(issue.status);
        return { ...issue, status: nextStatus };
      })
    );

    try {
      await api.patch(`/issues/${id}/status`, { status: nextStatus });

      const timeline = getIssueTimeline();
      const existingEntry = timeline[numericId] || {};
      timeline[numericId] = {
        created_at: toIsoString(existingEntry.created_at) || new Date().toISOString(),
        closed_at:
          nextStatus === "closed" || nextStatus === "resolved" ? new Date().toISOString() : null,
      };
      setIssueTimeline(timeline);

      await fetchIssues();
      return { success: true };
    } catch (err) {
      if (previousStatus) {
        setIssues((prev) =>
          prev.map((issue) =>
            Number(issue.id) === numericId ? { ...issue, status: previousStatus } : issue
          )
        );
      }

      console.error("UPDATE ISSUE ERROR:", err.response?.data);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to update issue"),
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