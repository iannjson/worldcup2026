'use client';

import { useEffect, useMemo, useState } from 'react';
import AppHeader from './AppHeader';
import FilterPanel from './FilterPanel';
import ScenarioTable from './ScenarioTable';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const HOSTS = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];
const WIKI_URL =
  'https://en.wikipedia.org/w/api.php?action=parse&page=Template:2026_FIFA_World_Cup_third-place_table&prop=text&format=json&origin=*';

function generateFallbackData() {
  let counter = 1;
  const scenarios = [];

  const assignMatchups = (advancingGroups) => {
    let result = null;

    const backtrack = (index, currentAssignment, used) => {
      if (result) return;
      if (index === 8) {
        result = [...currentAssignment];
        return;
      }

      const available = advancingGroups.filter((g) => !used.has(g));
      for (const candidate of available) {
        if (candidate !== HOSTS[index]) {
          used.add(candidate);
          currentAssignment.push(candidate);
          backtrack(index + 1, currentAssignment, used);
          currentAssignment.pop();
          used.delete(candidate);
        }
      }
    };

    backtrack(0, [], new Set());
    return result;
  };

  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      for (let k = j + 1; k < 12; k++) {
        for (let l = k + 1; l < 12; l++) {
          const eliminated = [GROUPS[i], GROUPS[j], GROUPS[k], GROUPS[l]];
          const advancing = GROUPS.filter((group) => !eliminated.includes(group));
          const matchups = assignMatchups(advancing);
          if (!matchups) continue;

          scenarios.push({
            id: counter++,
            eliminated,
            advancing,
            matchups,
          });
        }
      }
    }
  }

  return scenarios;
}

function parseWikipediaScenarios(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('table.wikitable tr');
  const scenarios = [];

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td, th'));
    if (cells.length < 21) return;

    const id = parseInt(cells[0].textContent.trim(), 10);
    if (Number.isNaN(id)) return;

    const advancing = [];
    for (let index = 0; index < 12; index++) {
      const letter = cells[index + 1].textContent.trim();
      if (/^[A-L]$/.test(letter)) advancing.push(letter);
    }

    if (advancing.length !== 8) return;
    const eliminated = GROUPS.filter((group) => !advancing.includes(group));

    const offset = cells.length === 22 ? 14 : 13;
    const matchups = cells
      .slice(offset, offset + 8)
      .map((cell) => cell.textContent.trim().replace(/^3/, ''));

    if (matchups.length !== 8 || !matchups.every((m) => /^[A-L]$/.test(m))) return;

    scenarios.push({ id, advancing, eliminated, matchups });
  });

  return scenarios.sort((a, b) => a.id - b.id);
}

export default function WorldCupApp() {
  const [scenarios, setScenarios] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(WIKI_URL);
        const data = await response.json();
        if (!data?.parse?.text?.['*']) throw new Error('Invalid API response');

        const parsed = parseWikipediaScenarios(data.parse.text['*']);
        if (parsed.length === 0) throw new Error('No scenarios parsed');

        setScenarios(parsed);
        setIsOfficial(true);
      } catch {
        setScenarios(generateFallbackData());
        setIsOfficial(false);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();
  }, []);

  const normalizedQuery = searchQuery
    .toUpperCase()
    .trim()
    .replace(/1([A-L])(?:\s*(?:VS|V|-|AGAINST)\s*|\s*)3([A-L])/g, '1$1-3$2');

  const searchTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((scenario) => {
      if (!selectedGroups.every((group) => scenario.advancing.includes(group))) {
        return false;
      }

      if (searchTokens.length === 0) return true;

      const rowMatchups = HOSTS.map((host, i) => `1${host}-3${scenario.matchups[i]}`);
      const rowData = [`#${scenario.id}`, ...scenario.advancing.map((g) => `3${g}`), ...rowMatchups].join(' | ');
      return searchTokens.every((token) => rowData.includes(token));
    });
  }, [scenarios, selectedGroups, searchTokens]);

  const toggleGroup = (group) => {
    setSelectedGroups((current) =>
      current.includes(group) ? current.filter((g) => g !== group) : [...current, group]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGroups([]);
  };

  const quickRun = () => {
    setSearchQuery('1L vs 3I');
    setSelectedGroups(['A', 'B', 'G']);
  };

  const jump297 = () => {
    setSearchQuery('#297');
    setSelectedGroups([]);
  };

  const statusText = isLoaded
    ? isOfficial
      ? 'Data synced with Official Annex C.'
      : 'Offline Mode: Simulated data active.'
    : 'Fetching official data...';

  return (
    <main className="container">
      <AppHeader />
      <FilterPanel
        groups={GROUPS}
        selectedGroups={selectedGroups}
        searchQuery={searchQuery}
        isLoaded={isLoaded}
        statusText={statusText}
        isOfficial={isOfficial}
        onSearchChange={setSearchQuery}
        onToggleGroup={toggleGroup}
        onReset={resetFilters}
        onQuickRun={quickRun}
        onJump297={jump297}
      />
      <ScenarioTable scenarios={filteredScenarios} searchTokens={searchTokens} />
    </main>
  );
}
