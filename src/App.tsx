import * as React from 'react';
import { Menu } from '@base-ui/react/menu';

const TABLES = [
  'Accounts',
  'Campaigns',
  'Contacts',
  'Contracts',
  'Deals',
  'Employees',
  'Events',
  'Expenses',
  'Invoices',
  'Leads',
  'Meetings',
  'Orders',
  'Partners',
  'Products',
  'Projects',
  'Screenings',
  'Scripts',
  'Suppliers',
  'Tasks',
  'Vendors',
];

export function App() {
  const [slow, setSlow] = React.useState(true);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--exit-duration', slow ? '2000ms' : '200ms');
  }, [slow]);

  return (
    <main className="App">
      <header className="Header">
        <p className="Eyebrow">@base-ui/react 1.9.0 · Menu filtering</p>
        <h1>Filtered menu shows the full list while closing</h1>
        <ol className="Steps">
          <li>Open a menu</li>
          <li>Type anything</li>
          <li>Close it</li>
        </ol>
      </header>

      <label className="Toggle">
        <input
          className="Switch"
          type="checkbox"
          role="switch"
          checked={slow}
          onChange={(event) => setSlow(event.target.checked)}
        />
        Slow-motion exit
        <span className="Muted">{slow ? '2000ms' : '200ms'}</span>
      </label>

      <div className="Cards">
        <Case
          status="ok"
          title="Built-in filtering"
          code="<Menu.FilterProvider>"
          description="Keeps the filtered list while it fades out."
        >
          <BuiltInFilterMenu />
        </Case>
        <Case
          status="bug"
          title="External filtering"
          code="<Menu.FilterProvider filter={null} value onValueChange>"
          description="Shows the full list again while it fades out."
        >
          <ExternalFilterMenu />
        </Case>
      </div>
    </main>
  );
}

function Case(props: {
  status: 'ok' | 'bug';
  title: string;
  code: string;
  description: string;
  children: React.ReactNode;
}) {
  const { status, title, code, description, children } = props;
  return (
    <section className="Card">
      <div className="CardHeader">
        <h2>{title}</h2>
        <span className="Badge" data-status={status}>
          {status === 'ok' ? 'Works' : 'Bug'}
        </span>
      </div>
      <code className="CardCode">{code}</code>
      <p className="CardDescription">{description}</p>
      {children}
    </section>
  );
}

function BuiltInFilterMenu() {
  const log = useEventLog();

  return (
    <React.Fragment>
      <Menu.FilterProvider onValueChange={log.valueChange}>
        <Menu.Root onOpenChange={log.openChange} onOpenChangeComplete={log.openChangeComplete}>
          <MenuTrigger />
          <MenuPopup>
            {TABLES.map((table) => (
              <Menu.Item key={table} className="Item">
                {table}
              </Menu.Item>
            ))}
          </MenuPopup>
        </Menu.Root>
      </Menu.FilterProvider>
      <EventLog entries={log.entries} />
    </React.Fragment>
  );
}

function ExternalFilterMenu() {
  const log = useEventLog();
  const { contains } = Menu.useFilter();
  const [query, setQuery] = React.useState('');
  const results = TABLES.filter((table) => contains(table, query));

  return (
    <React.Fragment>
      <Menu.FilterProvider
        filter={null}
        value={query}
        onValueChange={(value, details) => {
          log.valueChange(value, details);
          setQuery(value);
        }}
      >
        <Menu.Root onOpenChange={log.openChange} onOpenChangeComplete={log.openChangeComplete}>
          <MenuTrigger />
          <MenuPopup>
            {results.map((table) => (
              <Menu.Item key={table} className="Item">
                {table}
              </Menu.Item>
            ))}
          </MenuPopup>
        </Menu.Root>
      </Menu.FilterProvider>
      <EventLog entries={log.entries} />
    </React.Fragment>
  );
}

function MenuTrigger() {
  return (
    <Menu.Trigger className="Trigger">
      Tables
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M3 4.5 6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </Menu.Trigger>
  );
}

function MenuPopup({ children }: { children: React.ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Positioner className="Positioner" sideOffset={6} align="start">
        <Menu.Popup className="Popup">
          <Menu.Input className="Input" aria-label="Search tables" placeholder="Search tables…" />
          <Menu.Empty className="Empty">No tables found.</Menu.Empty>
          <Menu.List className="List">{children}</Menu.List>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

interface LogEntry {
  time: string;
  message: string;
}

// Logs callback timings relative to the moment the menu starts closing.
function useEventLog() {
  const [entries, setEntries] = React.useState<LogEntry[]>([]);
  const closeStartRef = React.useRef(0);

  function push(message: string) {
    const time = `+${Math.round(performance.now() - closeStartRef.current)}ms`;
    setEntries((prev) => [...prev, { time, message }]);
  }

  return {
    entries,
    openChange(open: boolean, details: Menu.Root.ChangeEventDetails) {
      if (open) {
        setEntries([]);
        return;
      }
      closeStartRef.current = performance.now();
      push(`onOpenChange(false, "${details.reason}")`);
    },
    valueChange(value: string, details: Menu.FilterProvider.ChangeEventDetails) {
      if (details.reason === 'input-change') {
        return;
      }
      push(`onValueChange(${JSON.stringify(value)}, "${details.reason}")`);
    },
    openChangeComplete(open: boolean) {
      if (!open) {
        push('onOpenChangeComplete(false)');
      }
    },
  };
}

function EventLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="Log">
      <p className="LogTitle">Event log</p>
      {entries.length === 0 ? (
        <p className="LogEmpty">Close the menu to see callback timing.</p>
      ) : (
        <ol className="LogList">
          {entries.map((entry, index) => (
            <li key={index}>
              <span className="LogTime">{entry.time}</span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
