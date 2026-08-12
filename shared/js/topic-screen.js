// Chem Games — the shared topic screen. One template for every topic in the
// universe (see documentation/TOPIC_UNIVERSE_PLAN.md): a strip of sub-topic tabs,
// each tab an explanation card with its games at the bottom. Data in, screen out —
// fix it here and all 18 topics follow.
//
// topic = {
//   tabs: [
//     { id, label, card: "<h2>…</h2><p>…</p>", games: [{ label, href }] },   // built
//     { id, label, soon: "one-line tease of what's coming" },                 // stub
//   ],
//   comingNote: "optional line under the card",
// }
// Tabs are hash-linkable: opening page#boyle lands on that tab.

export function renderTopicScreen(mount, topic) {
  let active = Math.max(0, topic.tabs.findIndex((t) => "#" + t.id === location.hash));

  function tabStrip() {
    return `<div class="level-tabs" role="tablist">${topic.tabs.map((t, i) =>
      `<button class="level-tab${i === active ? " is-active" : ""}${t.soon ? " is-soon" : ""}" data-tab="${i}" type="button" role="tab" aria-selected="${i === active}">${t.label}${t.soon ? " ·" : ""}</button>`
    ).join("")}</div>`;
  }

  function card(t) {
    if (t.soon) return `
      <div class="concept concept-soon">
        <h2>${t.label}</h2>
        <p>${t.soon}</p>
        <p class="coming-note">This lab is on the bench — it joins the strip when it's ready.</p>
      </div>`;
    return `
      <div class="concept">
        ${t.card}
        ${t.games?.length ? `<div class="controls">${t.games.map((g) =>
          `<a class="action primary" href="${g.href}">${g.label}</a>`).join("")}</div>` : ""}
      </div>`;
  }

  function render() {
    const t = topic.tabs[active];
    mount.innerHTML = `${tabStrip()}${card(t)}${topic.comingNote ? `<p class="coming-note">${topic.comingNote}</p>` : ""}`;
    mount.querySelectorAll(".level-tab").forEach((b) =>
      b.addEventListener("click", () => {
        active = Number(b.dataset.tab);
        history.replaceState(null, "", "#" + topic.tabs[active].id);
        render();
      }));
  }

  render();
}
