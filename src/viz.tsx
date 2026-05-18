import * as React from 'react';
import csvText from '../data/global-data-center-dataset.csv?raw';

type DataCenterMetric =
  | 'total_data_centers'
  | 'hyperscale_data_centers'
  | 'colocation_data_centers'
  | 'floor_space_sqft_total'
  | 'power_capacity_MW_total'
  | 'average_renewable_energy_usage_percent'
  | 'internet_penetration_percent'
  | 'avg_latency_to_global_hubs_ms'
  | 'number_of_fiber_connections'
  | 'growth_rate_of_data_centers_percent_per_year';

type VisualizationType =
  | 'bars'
  | 'columns'
  | 'scatter'
  | 'bubble'
  | 'donut'
  | 'radar'
  | 'heatmap'
  | 'treemap'
  | 'rankline'
  | 'table';

type SortDirection = 'desc' | 'asc';

type DataCenterCountry = {
  country: string;
  tier_distribution: string;
  key_operators: string;
  cloud_provider: string;
  cooling_technologies_common: string;
  green_dc_initiatives_description: string;
} & Record<DataCenterMetric, number>;

const metrics: DataCenterMetric[] = [
  'total_data_centers',
  'hyperscale_data_centers',
  'colocation_data_centers',
  'floor_space_sqft_total',
  'power_capacity_MW_total',
  'average_renewable_energy_usage_percent',
  'internet_penetration_percent',
  'avg_latency_to_global_hubs_ms',
  'number_of_fiber_connections',
  'growth_rate_of_data_centers_percent_per_year'
];

const metricLabels: Record<DataCenterMetric, string> = {
  total_data_centers: 'Total data centers',
  hyperscale_data_centers: 'Hyperscale data centers',
  colocation_data_centers: 'Colocation data centers',
  floor_space_sqft_total: 'Floor space',
  power_capacity_MW_total: 'Power capacity',
  average_renewable_energy_usage_percent: 'Renewable usage',
  internet_penetration_percent: 'Internet penetration',
  avg_latency_to_global_hubs_ms: 'Latency',
  number_of_fiber_connections: 'Fiber connections',
  growth_rate_of_data_centers_percent_per_year: 'Growth rate'
};

const metricUnits: Partial<Record<DataCenterMetric, string>> = {
  floor_space_sqft_total: 'sq ft',
  power_capacity_MW_total: 'MW',
  average_renewable_energy_usage_percent: '%',
  internet_penetration_percent: '%',
  avg_latency_to_global_hubs_ms: 'ms',
  growth_rate_of_data_centers_percent_per_year: '%'
};

const viewLabels: Record<VisualizationType, string> = {
  bars: 'Bars',
  columns: 'Columns',
  scatter: 'Scatter',
  bubble: 'Bubble',
  donut: 'Donut',
  radar: 'Radar',
  heatmap: 'Heatmap',
  treemap: 'Treemap',
  rankline: 'Rank line',
  table: 'Table'
};

const palette = ['#F3F0E8', '#D9FF62', '#A7F3D0', '#67E8F9', '#F9A8D4', '#FDBA74', '#C4B5FD', '#FDE047'];

function parseCsvRows(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseNumber(value: string | undefined) {
  const cleaned = value?.replaceAll(',', '').replace(/[><~%+]/g, '').trim() || '';
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDataCenterCsv(csv: string): DataCenterCountry[] {
  const [headers, ...rows] = parseCsvRows(csv);

  return rows.map((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']));

    return {
      country: record.country || 'Unknown',
      total_data_centers: parseNumber(record.total_data_centers),
      hyperscale_data_centers: parseNumber(record.hyperscale_data_centers),
      colocation_data_centers: parseNumber(record.colocation_data_centers),
      floor_space_sqft_total: parseNumber(record.floor_space_sqft_total),
      power_capacity_MW_total: parseNumber(record.power_capacity_MW_total),
      average_renewable_energy_usage_percent: parseNumber(record.average_renewable_energy_usage_percent),
      internet_penetration_percent: parseNumber(record.internet_penetration_percent),
      avg_latency_to_global_hubs_ms: parseNumber(record.avg_latency_to_global_hubs_ms),
      number_of_fiber_connections: parseNumber(record.number_of_fiber_connections),
      growth_rate_of_data_centers_percent_per_year: parseNumber(record.growth_rate_of_data_centers_percent_per_year),
      tier_distribution: record.tier_distribution || '',
      key_operators: record.key_operators || '',
      cloud_provider: record.cloud_provider || '',
      cooling_technologies_common: record.cooling_technologies_common || '',
      green_dc_initiatives_description: record.green_dc_initiatives_description || ''
    };
  });
}

function formatMetric(value: number, metric: DataCenterMetric) {
  const unit = metricUnits[metric];

  if (metric === 'floor_space_sqft_total') {
    return `${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M ${unit}`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M${unit ? ` ${unit}` : ''}`;
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`;
}

function getMax(rows: DataCenterCountry[], metric: DataCenterMetric) {
  return Math.max(1, ...rows.map(row => row[metric]));
}

function getColor(index: number) {
  return palette[index % palette.length];
}

function Bars({ rows, metric }: { rows: DataCenterCountry[]; metric: DataCenterMetric }) {
  const maxValue = getMax(rows, metric);

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div className="group" key={row.country}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-stone-400">
            <span className="truncate">{row.country}</span>
            <span>{formatMetric(row[metric], metric)}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700 group-hover:brightness-125"
              style={{ width: `${(row[metric] / maxValue) * 100}%`, backgroundColor: getColor(index) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Columns({ rows, metric }: { rows: DataCenterCountry[]; metric: DataCenterMetric }) {
  const maxValue = getMax(rows, metric);

  return (
    <div className="flex h-[360px] items-end gap-3 overflow-x-auto border-b border-white/15 pb-4">
      {rows.map((row, index) => (
        <div className="flex min-w-16 flex-1 flex-col items-center gap-3" key={row.country}>
          <div className="text-[10px] text-stone-400">{formatMetric(row[metric], metric)}</div>
          <div
            className="w-full min-w-10 rounded-t-md transition-all duration-700 hover:brightness-125"
            style={{ height: `${Math.max(4, (row[metric] / maxValue) * 290)}px`, backgroundColor: getColor(index) }}
          />
          <div className="w-20 truncate text-center text-xs text-stone-300">{row.country}</div>
        </div>
      ))}
    </div>
  );
}

function Scatter({
  rows,
  xMetric,
  yMetric,
  bubbleMetric
}: {
  rows: DataCenterCountry[];
  xMetric: DataCenterMetric;
  yMetric: DataCenterMetric;
  bubbleMetric?: DataCenterMetric;
}) {
  const maxX = getMax(rows, xMetric);
  const maxY = getMax(rows, yMetric);
  const maxBubble = bubbleMetric ? getMax(rows, bubbleMetric) : 1;

  return (
    <div className="relative h-[420px] overflow-hidden rounded-md border border-white/15 bg-black/20">
      <div className="absolute inset-6 border-l border-b border-white/20" />
      {rows.map((row, index) => {
        const size = bubbleMetric ? 12 + (row[bubbleMetric] / maxBubble) * 42 : 16;
        return (
          <div
            className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/50 shadow-[0_0_30px_rgba(255,255,255,0.16)]"
            key={row.country}
            style={{
              left: `${8 + (row[xMetric] / maxX) * 84}%`,
              top: `${92 - (row[yMetric] / maxY) * 84}%`,
              width: size,
              height: size,
              backgroundColor: getColor(index)
            }}
            title={`${row.country}: ${metricLabels[xMetric]} ${formatMetric(row[xMetric], xMetric)}, ${metricLabels[yMetric]} ${formatMetric(row[yMetric], yMetric)}`}
          >
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-stone-950 px-2 py-1 text-xs text-stone-100 group-hover:block">
              {row.country}
            </span>
          </div>
        );
      })}
      <span className="absolute bottom-2 left-6 text-xs uppercase tracking-[0.18em] text-stone-500">{metricLabels[xMetric]}</span>
      <span className="absolute left-2 top-6 origin-left rotate-90 text-xs uppercase tracking-[0.18em] text-stone-500">{metricLabels[yMetric]}</span>
    </div>
  );
}

function Donut({ rows, metric }: { rows: DataCenterCountry[]; metric: DataCenterMetric }) {
  const total = rows.reduce((sum, row) => sum + row[metric], 0) || 1;
  let offset = 0;

  const gradient = rows.map((row, index) => {
    const start = offset;
    offset += (row[metric] / total) * 100;
    return `${getColor(index)} ${start}% ${offset}%`;
  }).join(', ');

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <div
        className="mx-auto grid aspect-square w-full max-w-80 place-items-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="grid h-40 w-40 place-items-center rounded-full bg-[#10100f] text-center">
          <span className="px-4 text-sm uppercase tracking-[0.2em] text-stone-300">{metricLabels[metric]}</span>
        </div>
      </div>
      <div className="grid content-center gap-3">
        {rows.map((row, index) => (
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2" key={row.country}>
            <span className="flex items-center gap-3 text-sm text-stone-200">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getColor(index) }} />
              {row.country}
            </span>
            <span className="text-sm text-stone-400">{((row[metric] / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Radar({ rows }: { rows: DataCenterCountry[] }) {
  const radarMetrics: DataCenterMetric[] = [
    'total_data_centers',
    'hyperscale_data_centers',
    'colocation_data_centers',
    'power_capacity_MW_total',
    'internet_penetration_percent',
    'growth_rate_of_data_centers_percent_per_year'
  ];
  const size = 360;
  const center = size / 2;
  const radius = 135;

  function point(metric: DataCenterMetric, metricIndex: number, row: DataCenterCountry) {
    const angle = (Math.PI * 2 * metricIndex) / radarMetrics.length - Math.PI / 2;
    const value = row[metric] / getMax(rows, metric);
    return `${center + Math.cos(angle) * radius * value},${center + Math.sin(angle) * radius * value}`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[380px]">
        {[0.25, 0.5, 0.75, 1].map(scale => (
          <circle key={scale} cx={center} cy={center} r={radius * scale} fill="none" stroke="rgba(255,255,255,.12)" />
        ))}
        {radarMetrics.map((metric, index) => {
          const angle = (Math.PI * 2 * index) / radarMetrics.length - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return <line key={metric} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,.12)" />;
        })}
        {rows.slice(0, 4).map((row, index) => (
          <polygon
            key={row.country}
            points={radarMetrics.map((metric, metricIndex) => point(metric, metricIndex, row)).join(' ')}
            fill={`${getColor(index)}33`}
            stroke={getColor(index)}
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="grid content-center gap-3">
        {rows.slice(0, 4).map((row, index) => (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4" key={row.country}>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getColor(index) }} />
              <span className="font-medium">{row.country}</span>
            </div>
            <p className="text-sm text-stone-400">{row.key_operators || 'Operator details unavailable'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap({ rows }: { rows: DataCenterCountry[] }) {
  const heatMetrics: DataCenterMetric[] = [
    'total_data_centers',
    'hyperscale_data_centers',
    'colocation_data_centers',
    'power_capacity_MW_total',
    'internet_penetration_percent',
    'growth_rate_of_data_centers_percent_per_year'
  ];

  return (
    <div className="overflow-auto">
      <div className="grid min-w-[820px] gap-2" style={{ gridTemplateColumns: `160px repeat(${heatMetrics.length}, minmax(90px, 1fr))` }}>
        <div />
        {heatMetrics.map(metric => <div className="text-xs uppercase tracking-[0.16em] text-stone-500" key={metric}>{metricLabels[metric]}</div>)}
        {rows.map(row => (
          <React.Fragment key={row.country}>
            <div className="py-2 text-sm text-stone-200">{row.country}</div>
            {heatMetrics.map(metric => {
              const intensity = row[metric] / getMax(rows, metric);
              return (
                <div
                  className="rounded px-2 py-3 text-xs text-stone-950"
                  key={metric}
                  style={{ backgroundColor: `color-mix(in srgb, #D9FF62 ${Math.max(10, intensity * 100)}%, #27272a)` }}
                >
                  {formatMetric(row[metric], metric)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Treemap({ rows, metric }: { rows: DataCenterCountry[]; metric: DataCenterMetric }) {
  const total = rows.reduce((sum, row) => sum + row[metric], 0) || 1;

  return (
    <div className="flex h-[420px] flex-wrap content-stretch gap-2">
      {rows.map((row, index) => (
        <div
          className="flex min-h-24 flex-col justify-between rounded-md p-4 text-stone-950"
          key={row.country}
          style={{
            flexBasis: `${Math.max(14, (row[metric] / total) * 100)}%`,
            flexGrow: row[metric],
            backgroundColor: getColor(index)
          }}
        >
          <span className="text-sm font-semibold">{row.country}</span>
          <span className="text-xs">{formatMetric(row[metric], metric)}</span>
        </div>
      ))}
    </div>
  );
}

function RankLine({ rows, metric }: { rows: DataCenterCountry[]; metric: DataCenterMetric }) {
  const maxValue = getMax(rows, metric);
  const points = rows.map((row, index) => {
    const x = 40 + (index / Math.max(1, rows.length - 1)) * 720;
    const y = 330 - (row[metric] / maxValue) * 280;
    return { row, x, y };
  });

  return (
    <svg viewBox="0 0 800 380" className="h-[420px] w-full overflow-visible">
      {[0, 1, 2, 3, 4].map(index => (
        <line key={index} x1="40" x2="760" y1={50 + index * 70} y2={50 + index * 70} stroke="rgba(255,255,255,.1)" />
      ))}
      <polyline
        fill="none"
        stroke="#D9FF62"
        strokeWidth="3"
        points={points.map(point => `${point.x},${point.y}`).join(' ')}
      />
      {points.map((point, index) => (
        <g key={point.row.country}>
          <circle cx={point.x} cy={point.y} r="6" fill={getColor(index)} />
          <text x={point.x} y="365" textAnchor="middle" fill="#d6d3d1" fontSize="11">
            {point.row.country.slice(0, 10)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DataTable({ rows }: { rows: DataCenterCountry[] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-white/15 text-left text-xs uppercase tracking-[0.16em] text-stone-500">
            <th className="py-3">Country</th>
            <th>Total</th>
            <th>Hyperscale</th>
            <th>Colocation</th>
            <th>Power</th>
            <th>Renewable</th>
            <th>Internet</th>
            <th>Growth</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr className="border-b border-white/10 text-stone-300 hover:bg-white/[0.04]" key={row.country}>
              <td className="py-4 font-medium text-stone-100">{row.country}</td>
              <td>{formatMetric(row.total_data_centers, 'total_data_centers')}</td>
              <td>{formatMetric(row.hyperscale_data_centers, 'hyperscale_data_centers')}</td>
              <td>{formatMetric(row.colocation_data_centers, 'colocation_data_centers')}</td>
              <td>{formatMetric(row.power_capacity_MW_total, 'power_capacity_MW_total')}</td>
              <td>{formatMetric(row.average_renewable_energy_usage_percent, 'average_renewable_energy_usage_percent')}</td>
              <td>{formatMetric(row.internet_penetration_percent, 'internet_penetration_percent')}</td>
              <td>{formatMetric(row.growth_rate_of_data_centers_percent_per_year, 'growth_rate_of_data_centers_percent_per_year')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DataCenterDashboard() {
  const data = React.useMemo(() => parseDataCenterCsv(csvText), []);
  const [view, setView] = React.useState<VisualizationType>('bars');
  const [selectedMetric, setSelectedMetric] = React.useState<DataCenterMetric>('total_data_centers');
  const [xMetric, setXMetric] = React.useState<DataCenterMetric>('internet_penetration_percent');
  const [yMetric, setYMetric] = React.useState<DataCenterMetric>('total_data_centers');
  const [bubbleMetric, setBubbleMetric] = React.useState<DataCenterMetric>('power_capacity_MW_total');
  const [selectedCountry, setSelectedCountry] = React.useState('All');
  const [topN, setTopN] = React.useState(10);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  const filteredData = selectedCountry === 'All'
    ? data
    : data.filter(row => row.country === selectedCountry);

  const sortedData = [...filteredData]
    .sort((a, b) => sortDirection === 'desc' ? b[selectedMetric] - a[selectedMetric] : a[selectedMetric] - b[selectedMetric])
    .slice(0, topN);

  const totalDataCenters = data.reduce((sum, row) => sum + row.total_data_centers, 0);
  const totalPower = data.reduce((sum, row) => sum + row.power_capacity_MW_total, 0);
  const totalFloorSpace = data.reduce((sum, row) => sum + row.floor_space_sqft_total, 0);
  const renewableRows = data.filter(row => row.average_renewable_energy_usage_percent > 0);
  const avgRenewable = renewableRows.length
    ? renewableRows.reduce((sum, row) => sum + row.average_renewable_energy_usage_percent, 0) / renewableRows.length
    : 0;
  const topCountry = [...data].sort((a, b) => b[selectedMetric] - a[selectedMetric])[0];

  function renderVisualization() {
    if (view === 'bars') return <Bars rows={sortedData} metric={selectedMetric} />;
    if (view === 'columns') return <Columns rows={sortedData} metric={selectedMetric} />;
    if (view === 'scatter') return <Scatter rows={sortedData} xMetric={xMetric} yMetric={yMetric} />;
    if (view === 'bubble') return <Scatter rows={sortedData} xMetric={xMetric} yMetric={yMetric} bubbleMetric={bubbleMetric} />;
    if (view === 'donut') return <Donut rows={sortedData} metric={selectedMetric} />;
    if (view === 'radar') return <Radar rows={sortedData} />;
    if (view === 'heatmap') return <Heatmap rows={sortedData} />;
    if (view === 'treemap') return <Treemap rows={sortedData} metric={selectedMetric} />;
    if (view === 'rankline') return <RankLine rows={sortedData} metric={selectedMetric} />;
    return <DataTable rows={sortedData} />;
  }

  return (
    <main className="min-h-screen bg-[#10100f] text-[#f3f0e8]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,255,98,0.18),transparent_28%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
          <div className="flex min-h-[360px] flex-col justify-between">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-stone-400">
              <span className="h-2 w-2 rounded-full bg-[#D9FF62]" />
              GDCD interactive atlas
            </div>
            <div>
              <h1 className="max-w-4xl text-6xl font-semibold leading-[0.9] tracking-normal text-[#F3F0E8] md:text-8xl">
                Global data center intelligence.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-stone-400">
                Explore infrastructure scale, power, connectivity, sustainability, and growth patterns across countries.
              </p>
            </div>
          </div>

          <div className="grid content-end gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Countries</p>
                <p className="mt-3 text-4xl font-semibold">{data.length}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-[#D9FF62] p-5 text-stone-950">
                <p className="text-xs uppercase tracking-[0.18em]">Data centers</p>
                <p className="mt-3 text-4xl font-semibold">{totalDataCenters.toLocaleString()}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Power capacity</p>
                <p className="mt-3 text-4xl font-semibold">{formatMetric(totalPower, 'power_capacity_MW_total')}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Avg renewable</p>
                <p className="mt-3 text-4xl font-semibold">{avgRenewable.toFixed(1)}%</p>
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Current leader</p>
              <p className="mt-3 text-3xl font-semibold">{topCountry?.country}</p>
              <p className="mt-2 text-sm text-stone-400">{metricLabels[selectedMetric]} · {formatMetric(topCountry?.[selectedMetric] ?? 0, selectedMetric)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(viewLabels) as VisualizationType[]).map(option => (
              <button
                className={`rounded-full border px-4 py-2 text-sm transition ${view === option ? 'border-[#D9FF62] bg-[#D9FF62] text-stone-950' : 'border-white/15 bg-white/[0.03] text-stone-300 hover:border-white/40'}`}
                key={option}
                onClick={() => setView(option)}
                type="button"
              >
                {viewLabels[option]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <select className="rounded-md border border-white/15 bg-[#171715] px-3 py-2 text-sm" value={selectedMetric} onChange={(event) => setSelectedMetric(event.target.value as DataCenterMetric)}>
              {metrics.map(metric => <option key={metric} value={metric}>{metricLabels[metric]}</option>)}
            </select>
            <select className="rounded-md border border-white/15 bg-[#171715] px-3 py-2 text-sm" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}>
              <option value="All">All countries</option>
              {data.map(row => <option key={row.country} value={row.country}>{row.country}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs uppercase tracking-[0.16em] text-stone-500">
            Top N
            <input className="accent-[#D9FF62]" max="30" min="5" onChange={(event) => setTopN(Number(event.target.value))} step="1" type="range" value={topN} />
            <span className="text-sm normal-case tracking-normal text-stone-200">{topN} countries</span>
          </label>
          <label className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs uppercase tracking-[0.16em] text-stone-500">
            Sort
            <select className="rounded bg-[#171715] px-3 py-2 text-sm normal-case tracking-normal text-stone-100" value={sortDirection} onChange={(event) => setSortDirection(event.target.value as SortDirection)}>
              <option value="desc">Highest first</option>
              <option value="asc">Lowest first</option>
            </select>
          </label>
          <label className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs uppercase tracking-[0.16em] text-stone-500">
            X metric
            <select className="rounded bg-[#171715] px-3 py-2 text-sm normal-case tracking-normal text-stone-100" value={xMetric} onChange={(event) => setXMetric(event.target.value as DataCenterMetric)}>
              {metrics.map(metric => <option key={metric} value={metric}>{metricLabels[metric]}</option>)}
            </select>
          </label>
          <label className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs uppercase tracking-[0.16em] text-stone-500">
            Y metric
            <select className="rounded bg-[#171715] px-3 py-2 text-sm normal-case tracking-normal text-stone-100" value={yMetric} onChange={(event) => setYMetric(event.target.value as DataCenterMetric)}>
              {metrics.map(metric => <option key={metric} value={metric}>{metricLabels[metric]}</option>)}
            </select>
          </label>
          <label className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs uppercase tracking-[0.16em] text-stone-500">
            Bubble size
            <select className="rounded bg-[#171715] px-3 py-2 text-sm normal-case tracking-normal text-stone-100" value={bubbleMetric} onChange={(event) => setBubbleMetric(event.target.value as DataCenterMetric)}>
              {metrics.map(metric => <option key={metric} value={metric}>{metricLabels[metric]}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="rounded-md border border-white/10 bg-[#151513] p-5 shadow-2xl shadow-black/40">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{viewLabels[view]}</p>
              <h2 className="mt-2 text-3xl font-semibold">{metricLabels[selectedMetric]}</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-400">
              Showing {sortedData.length} of {filteredData.length} countries. Scatter and bubble views use the X, Y, and size controls.
            </p>
          </div>
          {renderVisualization()}
        </div>

        <aside className="grid gap-5">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Scale</p>
            <p className="mt-3 text-3xl font-semibold">{formatMetric(totalFloorSpace, 'floor_space_sqft_total')}</p>
            <p className="mt-2 text-sm leading-6 text-stone-400">Combined floor space in the source dataset.</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Top rows</p>
            <div className="mt-4 grid gap-3">
              {sortedData.slice(0, 5).map((row, index) => (
                <div className="flex items-center justify-between gap-3" key={row.country}>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs">{index + 1}</span>
                    {row.country}
                  </span>
                  <span className="text-sm text-stone-400">{formatMetric(row[selectedMetric], selectedMetric)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-[#D9FF62] p-5 text-stone-950">
            <p className="text-xs uppercase tracking-[0.2em]">Dataset notes</p>
            <p className="mt-3 text-sm leading-6">
              Numerical fields are parsed from the CSV at runtime. Missing or blank values are treated as zero in visual comparisons.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
