// "Ask about me" assistant. The resume and system prompt live server-side in the
// Lambda behind API Gateway; this file only handles the UI.
// All model output is HTML-escaped before a small Markdown subset is applied.
(() => {
  "use strict";

  const API_URL = "https://i0w2kksfb0.execute-api.us-east-1.amazonaws.com/chat";
  const MAX_TURNS = 6; // conversation turns sent back for context

  const fab = document.getElementById("chat-fab");
  const panel = document.getElementById("chat");
  const body = document.getElementById("chat-body");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const send = form.querySelector(".chat__send");
  const chips = document.getElementById("chat-chips");
  const history = [];
  let busy = false;

  function openChat() {
    panel.hidden = false;
    fab.hidden = true;
    fab.setAttribute("aria-expanded", "true");
    input.focus();
  }
  function closeChat() {
    panel.hidden = true;
    fab.hidden = false;
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }
  window.openChat = openChat;

  fab.addEventListener("click", openChat);
  document.getElementById("chat-close").addEventListener("click", closeChat);
  document.querySelectorAll("[data-open-chat]").forEach(b => b.addEventListener("click", openChat));
  panel.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); closeChat(); } });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Escape first, then allow **bold**, *italic*, `code`, [text](https://…), bare URLs, emails and "- " lists.
  function renderMarkdown(text) {
    const inline = s => escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
      .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+)/g, '$1<a href="mailto:$2">$2</a>');

    const out = [];
    let list = null;
    for (const raw of text.split(/\n/)) {
      const line = raw.trim();
      const item = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
      if (item) {
        if (!list) { list = []; }
        list.push("<li>" + inline(item[1]) + "</li>");
        continue;
      }
      if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
      if (line) out.push("<p>" + inline(line.replace(/^#+\s*/, "")) + "</p>");
    }
    if (list) out.push("<ul>" + list.join("") + "</ul>");
    return out.join("");
  }

  function addMessage(kind, content, { html = false } = {}) {
    const div = document.createElement("div");
    div.className = "msg msg--" + kind;
    if (html) div.innerHTML = content;
    else div.textContent = content;
    body.append(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  async function ask(question) {
    if (busy) return;
    busy = true;
    send.disabled = true;
    chips?.remove();

    addMessage("user", question);
    history.push({ role: "user", content: question });

    const typing = addMessage("bot", "<i></i><i></i><i></i>", { html: true });
    typing.classList.add("msg--typing");
    typing.setAttribute("aria-label", "Assistant is typing");

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-MAX_TURNS * 2) }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const reply = (data && typeof data.reply === "string" && data.reply.trim()) || "Sorry, I couldn't get a response.";
      typing.remove();
      addMessage("bot", renderMarkdown(reply), { html: true });
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      typing.remove();
      history.pop(); // drop the unanswered question so the next request stays well-formed
      addMessage("error", "I couldn't reach the assistant just now. You can email vemulasaiharsha@gmail.com directly.");
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    ask(q);
  });
  chips?.querySelectorAll("button").forEach(b => b.addEventListener("click", () => ask(b.textContent)));
})();
