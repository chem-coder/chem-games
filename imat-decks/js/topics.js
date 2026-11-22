// IMAT Decks — topic checklist page. Each topic is a heading with a checkbox, each
// subtopic a line with a checkbox, and every line has three dots (red, yellow, green)
// for how comfortable the student feels. Marks are saved in this browser.

import { TOPICS } from "../data/topics.js";
import {
  LEVELS, loadState, saveState, subKey, setDone, toggleLevel,
  doneCount, topicStatus, setTopicDone, totals,
} from "./checklist.js";

const root = document.getElementById("checklist");
const state = loadState();

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function dots(key, what) {
  const buttons = LEVELS.map(({ level, name }) =>
    `<button class="dot dot-${level}" type="button" data-key="${key}" data-level="${level}"
       aria-pressed="false" aria-label="${name}" title="${name}"></button>`
  ).join("");
  return `<div class="dots" role="group" aria-label="How comfortable you feel with ${esc(what)}">${buttons}</div>`;
}

function topicBlock(topic) {
  const subs = topic.subs.map((sub) => {
    const key = subKey(topic, sub);
    const detail = sub.detail ? ` <span class="sub-detail">(${sub.detail})</span>` : "";
    return `<li class="row sub-row">
        <label class="tick"><input type="checkbox" data-sub="${key}"><span class="sub-label">${esc(sub.label)}${detail}</span></label>
        ${dots(key, sub.label)}
      </li>`;
  }).join("");

  return `<section class="topic" data-topic="${topic.id}">
      <div class="row topic-row">
        <h2 class="topic-name"><label class="tick"><input type="checkbox" data-topic-box="${topic.id}"><span>${esc(topic.name)}</span></label></h2>
        <span class="topic-count" data-count="${topic.id}"></span>
        ${dots(topic.id, topic.name)}
      </div>
      <ul class="subs">${subs}</ul>
    </section>`;
}

// Bring every checkbox, dot and count in line with the saved marks.
function sync() {
  for (const topic of TOPICS) {
    const box = root.querySelector(`[data-topic-box="${topic.id}"]`);
    const status = topicStatus(state, topic);
    box.checked = status === "all";
    box.indeterminate = status === "some";
    root.querySelector(`[data-count="${topic.id}"]`).textContent =
      `${doneCount(state, topic)} of ${topic.subs.length}`;
  }
  root.querySelectorAll("[data-sub]").forEach((box) => {
    box.checked = Boolean(state.done[box.dataset.sub]);
  });
  root.querySelectorAll(".dot").forEach((dot) => {
    dot.setAttribute("aria-pressed", String(state.level[dot.dataset.key] === Number(dot.dataset.level)));
  });
  const { done, total } = totals(state, TOPICS);
  document.getElementById("summary").textContent = `${done} of ${total} subtopics covered`;
}

root.innerHTML = TOPICS.map(topicBlock).join("");

root.addEventListener("change", (e) => {
  const box = e.target;
  if (box.dataset.sub) setDone(state, box.dataset.sub, box.checked);
  else if (box.dataset.topicBox) setTopicDone(state, TOPICS.find((t) => t.id === box.dataset.topicBox), box.checked);
  else return;
  saveState(state);
  sync();
});

root.addEventListener("click", (e) => {
  const dot = e.target.closest(".dot");
  if (!dot) return;
  toggleLevel(state, dot.dataset.key, Number(dot.dataset.level));
  saveState(state);
  sync();
});

sync();
