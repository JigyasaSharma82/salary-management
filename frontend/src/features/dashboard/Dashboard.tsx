import type { DashboardSummary, SalaryInsight } from '../../types/employee';

type DashboardProps = {
  summary: DashboardSummary;
  insights: SalaryInsight[];
};

const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function Dashboard({ summary, insights }: DashboardProps) {
  return (
    <section className="dashboard" aria-label="Salary dashboard">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Workforce overview</p>
          <h1>Salary Dashboard</h1>
        </div>
        <p className="muted">Live view of the organisation&apos;s salary data.</p>
      </div>
      <div className="metric-grid">
        <article className="metric-card"><span>Total employees</span><strong>{compactNumber.format(summary.totalEmployees)}</strong></article>
        <article className="metric-card"><span>Active employees</span><strong>{compactNumber.format(summary.activeEmployees)}</strong></article>
        <article className="metric-card"><span>Inactive employees</span><strong>{compactNumber.format(summary.inactiveEmployees)}</strong></article>
      </div>
      <article className="insight-card">
        <div><p className="eyebrow">Salary insight</p><h2>Average salary by currency</h2></div>
        <div className="insight-list">
          {insights.map((insight) => (
            <div className="insight-row" key={insight.currency}>
              <span>{insight.currency}</span>
              <span>{new Intl.NumberFormat('en', { style: 'currency', currency: insight.currency, maximumFractionDigits: 0 }).format(Number(insight.averageSalary))}</span>
              <small>{compactNumber.format(insight.employeeCount)} employees</small>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
