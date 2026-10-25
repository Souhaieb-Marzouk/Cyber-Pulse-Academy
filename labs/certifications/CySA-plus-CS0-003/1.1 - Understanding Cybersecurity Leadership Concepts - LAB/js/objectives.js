/**
 * CyberLab — "The Leadership Ledger" — OBJECTIVE VALIDATION ENGINE
 *
 * Ported 1:1 (machine-transpiled, not hand-copied) from the original TypeScript lab.
 * Pure functions over the content in data.js: touched-gating, per-part teaching
 * results, correctness, mode lookup, scoring config. No DOM access here.
 */
function isPartTouched(spec, ans) {
    if (!ans)
        return false;
    switch (spec.kind) {
        case 'classify':
        case 'match':
        case 'decision': {
            const rec = ans;
            const keys = spec.kind === 'classify' ? spec.items.map((i) => i.id) : spec.rows.map((r) => r.id);
            return keys.every((k) => rec[k] != null && rec[k] !== '');
        }
        case 'choice': {
            const rec = ans;
            if (!rec['main'])
                return false;
            if (spec.second && !rec['second'])
                return false;
            return true;
        }
        case 'multiselect': {
            const arr = ans;
            return Array.isArray(arr) && arr.length > 0;
        }
        case 'sequence': {
            const arr = ans;
            return Array.isArray(arr) && arr.length > 0;
        }
    }
}
function isObjectiveTouched(obj, answers) {
    return obj.parts.every((p, i) => isPartTouched(p, answers[i]));
}
/** Per-entry teaching results for a part. */
function partResults(spec, ans) {
    if (!ans)
        return [{ label: 'No answer provided', ok: false, explain: 'Interact with the widget above, then check again.' }];
    switch (spec.kind) {
        case 'classify': {
            const rec = ans;
            return spec.items.map((it) => ({
                label: it.text,
                ok: rec[it.id] === it.correct,
                explain: it.explain,
            }));
        }
        case 'match':
        case 'decision': {
            const rec = ans;
            return spec.rows.map((r) => ({ label: r.text, ok: rec[r.id] === r.correct, explain: r.explain }));
        }
        case 'choice': {
            const rec = ans;
            const out = spec.options
                .filter((o) => o.id === spec.correct || o.id === rec['main'])
                .map((o) => ({
                label: `${o.id === spec.correct ? 'Correct choice' : 'Your choice'}: ${o.label}`,
                ok: o.id === spec.correct,
                explain: o.id === spec.correct
                    ? (spec.explains?.[o.id] ?? 'This is the response that matches the lesson\u2019s leadership standard.')
                    : (spec.explains?.[o.id] ?? 'This choice misses the leadership standard — compare it with the correct one.'),
            }));
            if (spec.second) {
                const okSecond = rec['second'] === spec.second.correct;
                out.push({
                    label: `Follow-up: ${spec.second.prompt}`,
                    ok: okSecond,
                    explain: okSecond
                        ? 'Correct — the criterion named is the one that option violates outright.'
                        : 'Re-test the options against each SMART criterion: only one criterion fails outright for that option.',
                });
            }
            return out;
        }
        case 'multiselect': {
            const arr = new Set(ans);
            return spec.items
                .filter((it) => arr.has(it.id) || it.correct)
                .map((it) => ({
                label: `${arr.has(it.id) ? 'You selected' : 'Should be selected'}: ${it.text}`,
                ok: arr.has(it.id) === it.correct,
                explain: it.explain,
            }));
        }
        case 'sequence': {
            const arr = ans ?? [];
            const byId = new Map(spec.items.map((i) => [i.id, i]));
            const expected = spec.correctOrder.map((id) => byId.get(id)?.text ?? id);
            const given = arr.map((id) => byId.get(id)?.text ?? id);
            if (arr.length !== spec.correctOrder.length || arr.some((id, i) => id !== spec.correctOrder[i])) {
                return [
                    {
                        label: 'Sequence',
                        ok: false,
                        explain: `Your sequence: ${given.length ? given.join(' → ') : '(empty)'}. Expected: ${expected.join(' → ')}.`,
                    },
                ];
            }
            return spec.correctOrder.map((id, i) => ({
                label: `Step ${i + 1}: ${byId.get(id)?.text ?? id}`,
                ok: true,
                explain: byId.get(id)?.explain ?? '',
            }));
        }
    }
}
function isPartCorrect(spec, ans) {
    return partResults(spec, ans).every((r) => r.ok);
}
function isObjectiveCorrect(obj, answers) {
    return obj.parts.every((p, i) => isPartCorrect(p, answers[i]));
}
/* ------------------------------------------------------------------ */
/* Lookup helpers                                                      */
/* ------------------------------------------------------------------ */
function objectivesForMode(mode) {
    return mode === 'medium' ? OBJECTIVES : HARD_OBJECTIVES;
}
function findObjective(id) {
    return [...OBJECTIVES, ...HARD_OBJECTIVES].find((o) => o.id === id);
}
const MAX_SCORE = { medium: 190, hard: 160 };
function starsFor(percent) {
    if (percent >= 90)
        return 5;
    if (percent >= 75)
        return 4;
    if (percent >= 60)
        return 3;
    if (percent >= 40)
        return 2;
    return 1;
}
/* Red-herring decoy memo shown in Hard mode agenda */
