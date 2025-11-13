const chat = async (prompt: string) => {
  const res = await window.puter.ai.chat(prompt);
  return JSON.parse(JSON.stringify(res?.message.content));
};

export default chat;
