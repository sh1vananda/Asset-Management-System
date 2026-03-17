import { useState, useEffect } from "react";
import api from "../../core/api";

export const useAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // const res = await api.get("/assignments");
      // setAssignments(res.data);

      // ✅ MOCK
      setAssignments([
        {
          id: 1,
          assetId: 1,
          userId: 1,
          assignedDate: "2024-01-01",
          returnDate: null,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignAsset = async (data) => {
    try {
      // await api.post("/assignments", data);

      setAssignments(prev => [...prev, { ...data, id: Date.now() }]);
    } catch (err) {
      console.error(err);
    }
  };

  const returnAsset = async (id) => {
    try {
      // await api.put(`/assignments/${id}/return`);

      setAssignments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, returnDate: new Date().toISOString() } : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return { assignments, assignAsset, returnAsset, loading };
};