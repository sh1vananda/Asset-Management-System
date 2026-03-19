export function extractApiErrorMessage(error, fallback = "Something went wrong") {
  const payload = error?.response?.data;

  const direct = payload?.error ?? payload?.message ?? payload?.details;

  if (typeof direct === "string" && direct.trim()) {
    return direct;
  }

  if (direct && typeof direct === "object") {
    const nested = direct.message ?? direct.error ?? direct.details ?? direct.code;
    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }

    try {
      return JSON.stringify(direct);
    } catch {
      return fallback;
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
