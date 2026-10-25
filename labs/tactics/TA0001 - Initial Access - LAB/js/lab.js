"use strict";
/* Lab engine: three questions, a score, and a report to the parent frame.
   Contract: posts LAB_READY on load and LAB_SCORE on check; the site reads both. */
(function () {
  var root = document.getElementById("lab");
  if (!root) { return; }
  var LAB = JSON.parse(document.getElementById("lab-data").textContent || "{}");
  var answers = {};

  function post(type, detail) {
    try { parent.postMessage({ type: type, labId: LAB.id, topicId: LAB.topicId, detail: detail }, "*"); }
    catch (e) { /* no parent, still usable */ }
  }

  function render() {
    var html = "";
    LAB.questions.forEach(function (q, i) {
      html += '<div class="card" data-q="' + i + '"><p><strong>' + (i + 1) + ". " + q.prompt + "</strong></p>";
      if (q.code) { html += "<pre><code>" + q.code.replace(/[<>&]/g, function (c) { return ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]; }) + "</code></pre>"; }
      q.options.forEach(function (o, j) {
        html += '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '"><span>' + o + "</span></label>";
      });
      html += "</div>";
    });
    root.querySelector("#questions").innerHTML = html;
    root.querySelectorAll(".opt input").forEach(function (input) {
      input.addEventListener("change", function () {
        var card = input.closest(".card");
        card.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("sel"); });
        input.closest(".opt").classList.add("sel");
        answers[card.getAttribute("data-q")] = Number(input.value);
      });
    });
  }

  function check() {
    var right = 0;
    LAB.questions.forEach(function (q, i) {
      if (answers[i] === q.answer) { right++; }
    });
    var percent = Math.round((right / LAB.questions.length) * 100);
    var box = root.querySelector("#verdict");
    box.className = "verdict show " + (percent >= 70 ? "good" : "bad");
    box.innerHTML = "<strong>" + right + " of " + LAB.questions.length + " correct (" + percent + "%).</strong> " +
      LAB.questions.map(function (q, i) {
        return "<br>" + (i + 1) + ": " + (answers[i] === q.answer ? "&#10003;" : "&#10007;") + " " + q.explain;
      }).join("");
    post("LAB_SCORE", { percent: percent, passed: percent >= 70, correct: right, total: LAB.questions.length });
    box.scrollIntoView({ block: "nearest" });
  }

  render();
  root.querySelector("#check").addEventListener("click", check);
  post("LAB_READY", {});
})();
