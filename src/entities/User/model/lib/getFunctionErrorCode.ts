// Код ошибки Edge Function из тела ответа ({ error: 'CODE' }); если тела нет — исходное сообщение.
export const getFunctionErrorCode = async (error: Error): Promise<string> => {
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (body?.error) return body.error;
    } catch {
      // Тело не JSON — оставляем исходное сообщение.
    }
  }
  return error.message;
};
