// Host-side tree filter for the Analytics tab: Cadence Owner → Cadence Name.
// Options are fetched from the model via searchdata; the selected cadence
// (leaf) names are handed back to the tab, which pushes them to the liveboard
// as a runtime filter on the Cadence Name column.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchOwnerCadenceHierarchy, HierarchyNode } from '../lib/thoughtspot';

interface Props {
  /** Called with the selected cadence names (empty = no filter / show all). */
  onApply: (cadences: string[]) => void;
}

type OwnerState = 'none' | 'some' | 'all';

export default function OwnerCadenceFilter({ onApply }: Props) {
  const { username, password } = useAuth();
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set()); // cadence names
  const [appliedCount, setAppliedCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setNodes(await fetchOwnerCadenceHierarchy(username, password));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load filter options.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the panel on outside click.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const allCadences = useMemo(() => nodes.flatMap((n) => n.cadences), [nodes]);

  // Filter the tree by the search box (matches owner names and cadence names).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    return nodes
      .map((n) => {
        const ownerMatch = n.owner.toLowerCase().includes(q);
        const cadences = ownerMatch
          ? n.cadences
          : n.cadences.filter((c) => c.toLowerCase().includes(q));
        return ownerMatch || cadences.length ? { owner: n.owner, cadences } : null;
      })
      .filter((n): n is HierarchyNode => n != null);
  }, [nodes, query]);

  function ownerState(n: HierarchyNode): OwnerState {
    const sel = n.cadences.filter((c) => selected.has(c)).length;
    if (sel === 0) return 'none';
    return sel === n.cadences.length ? 'all' : 'some';
  }
  function toggleExpand(owner: string) {
    setExpanded((p) => {
      const s = new Set(p);
      s.has(owner) ? s.delete(owner) : s.add(owner);
      return s;
    });
  }
  function toggleCadence(c: string) {
    setSelected((p) => {
      const s = new Set(p);
      s.has(c) ? s.delete(c) : s.add(c);
      return s;
    });
  }
  function toggleOwner(n: HierarchyNode) {
    const all = ownerState(n) === 'all';
    setSelected((p) => {
      const s = new Set(p);
      n.cadences.forEach((c) => (all ? s.delete(c) : s.add(c)));
      return s;
    });
  }
  const allSelected = allCadences.length > 0 && allCadences.every((c) => selected.has(c));
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allCadences));
  }
  function apply() {
    const list = [...selected];
    onApply(list);
    setAppliedCount(list.length);
    setOpen(false);
  }
  function clearAll() {
    setSelected(new Set());
    onApply([]);
    setAppliedCount(0);
    setOpen(false);
  }

  const label =
    appliedCount === 0
      ? 'All owners & cadences'
      : `${appliedCount} cadence${appliedCount === 1 ? '' : 's'} selected`;

  return (
    <div className="sl-hfilter" ref={rootRef}>
      <button className="sl-hfilter-trigger" onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal size={15} />
        <span>{label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="sl-hfilter-panel">
          <div className="sl-hfilter-search">
            <Search size={15} />
            <input
              placeholder="Search owners or cadences…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          {loading && <div className="sl-hfilter-state">Loading…</div>}
          {error && <div className="sl-hfilter-state sl-hfilter-error">{error}</div>}

          {!loading && !error && (
            <>
              <label className="sl-tree-row sl-tree-all">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                <span>Select all</span>
              </label>

              <div className="sl-tree">
                {filtered.map((n) => {
                  const st = ownerState(n);
                  const isOpen = expanded.has(n.owner) || !!query;
                  return (
                    <div key={n.owner}>
                      <div className="sl-tree-row sl-tree-parent">
                        <button
                          className="sl-tree-caret"
                          onClick={() => toggleExpand(n.owner)}
                          aria-label={isOpen ? 'Collapse' : 'Expand'}
                        >
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <input
                          type="checkbox"
                          checked={st === 'all'}
                          ref={(el) => {
                            if (el) el.indeterminate = st === 'some';
                          }}
                          onChange={() => toggleOwner(n)}
                        />
                        <span className="sl-tree-parent-name">{n.owner}</span>
                      </div>
                      {isOpen &&
                        n.cadences.map((c) => (
                          <label key={c} className="sl-tree-row sl-tree-child">
                            <input
                              type="checkbox"
                              checked={selected.has(c)}
                              onChange={() => toggleCadence(c)}
                            />
                            <span>{c}</span>
                          </label>
                        ))}
                    </div>
                  );
                })}
                {filtered.length === 0 && <div className="sl-hfilter-state">No matches</div>}
              </div>

              <div className="sl-hfilter-actions">
                <button className="sl-hfilter-clear" onClick={clearAll}>
                  Clear
                </button>
                <button className="sl-hfilter-apply" onClick={apply}>
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
