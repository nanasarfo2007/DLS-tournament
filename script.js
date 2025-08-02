// initial teams
const initial = {
  A: ["NBA...Baddest", "Juicewrld", "Nana Sarfo", "Evans"],
  B: ["WAGASTY", "TKB Malone😎", "🥶GodFather_swg😠", "ISODAYS"]
};

// stats storage
const groups = {};

function makeEmptyTeam(name) {
  return {
    name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
  };
}

function ensureGroup(g) {
  if (!groups[g]) {
    groups[g] = {};
    initial[g].forEach(t => {
      groups[g][t] = makeEmptyTeam(t);
    });
  }
  return groups[g];
}

function recordMatch(groupName, team1, team2, s1, s2) {
  const grp = ensureGroup(groupName);
  if (!grp[team1]) grp[team1] = makeEmptyTeam(team1);
  if (!grp[team2]) grp[team2] = makeEmptyTeam(team2);
  const t1 = grp[team1];
  const t2 = grp[team2];

  t1.played += 1;
  t2.played += 1;
  t1.gf += s1; t1.ga += s2;
  t2.gf += s2; t2.ga += s1;

  if (s1 > s2) {
    t1.wins += 1;
    t2.losses += 1;
  } else if (s1 < s2) {
    t2.wins += 1;
    t1.losses += 1;
  } else {
    t1.draws += 1;
    t2.draws += 1;
  }
}

function computePoints(t) {
  return t.wins * 3 + t.draws;
}

function goalDiff(t) {
  return t.gf - t.ga;
}

function sortStandings(grp) {
  return Object.values(grp).sort((a, b) => {
    if (computePoints(a) !== computePoints(b)) return computePoints(b) - computePoints(a);
    if (goalDiff(a) !== goalDiff(b)) return goalDiff(b) - goalDiff(a);
    if (a.gf !== b.gf) return b.gf - a.gf;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}

function renderTable(groupName, containerId) {
  const grp = ensureGroup(groupName);
  const sorted = sortStandings(grp);
  let html = `<table>
    <thead>
      <tr>
        <th class="pos">Pos</th>
        <th class="team">Team</th>
        <th>P</th><th>W</th><th>D</th><th>L</th>
        <th>GF</th><th>GA</th><th>GD</th><th class="points">PTS</th>
      </tr>
    </thead>
    <tbody>`;
  sorted.forEach((t, i) => {
    const pts = computePoints(t);
    const gd = goalDiff(t);
    html += `<tr>
      <td class="pos">${i+1}</td>
      <td class="team">${t.name}</td>
      <td>${t.played}</td>
      <td>${t.wins}</td>
      <td>${t.draws}</td>
      <td>${t.losses}</td>
      <td>${t.gf}</td>
      <td>${t.ga}</td>
      <td>${gd >= 0 ? '+'+gd : gd}</td>
      <td class="points">${pts}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById(containerId).innerHTML = html;
}

function populateSelectors() {
  const groupSel = document.getElementById("groupSelect");
  const team1 = document.getElementById("team1");
  const team2 = document.getElementById("team2");

  function refreshTeams() {
    const g = groupSel.value;
    team1.innerHTML = "";
    team2.innerHTML = "";
    ensureGroup(g);
    Object.keys(groups[g]).forEach(t => {
      const o1 = document.createElement("option");
      o1.value = t;
      o1.textContent = t;
      team1.appendChild(o1);
      const o2 = o1.cloneNode(true);
      team2.appendChild(o2);
    });
  }

  groupSel.addEventListener("change", refreshTeams);
  refreshTeams();
}

document.getElementById("addResultBtn").addEventListener("click", e => {
  e.preventDefault();
  const group = document.getElementById("groupSelect").value;
  const team1 = document.getElementById("team1").value;
  const team2 = document.getElementById("team2").value;
  const score1 = parseInt(document.getElementById("score1").value, 10);
  const score2 = parseInt(document.getElementById("score2").value, 10);
  if (team1 === team2) {
    alert("Select two different teams.");
    return;
  }
  recordMatch(group, team1, team2, score1, score2);
  renderTable("A", "tableA");
  renderTable("B", "tableB");
  document.getElementById("score1").value = 0;
  document.getElementById("score2").value = 0;
});

document.getElementById("resetBtn").addEventListener("click", e => {
  e.preventDefault();
  Object.keys(groups).forEach(g => delete groups[g]);
  ensureGroup("A");
  ensureGroup("B");
  renderTable("A", "tableA");
  renderTable("B", "tableB");
});

// initial render
ensureGroup("A");
ensureGroup("B");
populateSelectors();
renderTable("A", "tableA");
renderTable("B", "tableB");