"use client";

import { useState } from "react";

type TabType = "business" | "personal";

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
};

const fmtPlain = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

// KPI Card Component
const KPICard = ({
  label,
  value,
  subValue,
  trend,
  trendPositive,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
}) => (
  <div
    style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
      borderRadius: 12,
      padding: "20px 24px",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      flex: 1,
      minWidth: 200,
    }}
  >
    <div
      style={{
        fontSize: 10,
        color: "#8A8F98",
        fontFamily: "'Orbitron', monospace",
        letterSpacing: 1.5,
        marginBottom: 10,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: color || "#F5F7FA",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </span>
      {trend && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: trendPositive ? "#10B981" : "#EF4444",
          }}
        >
          {trendPositive ? "↑" : "↓"} {trend}
        </span>
      )}
    </div>
    {subValue && (
      <div style={{ fontSize: 11, color: "#6B7186", marginTop: 6 }}>{subValue}</div>
    )}
  </div>
);

// Section Header
const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#F5F7FA",
        fontFamily: "'Orbitron', monospace",
        letterSpacing: 2,
        marginBottom: subtitle ? 4 : 0,
      }}
    >
      {title}
    </div>
    {subtitle && (
      <div style={{ fontSize: 11, color: "#6B7186" }}>{subtitle}</div>
    )}
  </div>
);

// Table Component
const DataTable = ({
  headers,
  rows,
  highlightLast,
}: {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  highlightLast?: boolean;
}) => (
  <div
    style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}
  >
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: "12px 16px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 10,
                fontWeight: 600,
                color: "#8A8F98",
                fontFamily: "'Orbitron', monospace",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => {
          const isLast = highlightLast && rowIndex === rows.length - 1;
          return (
            <tr
              key={rowIndex}
              style={{
                borderBottom:
                  rowIndex < rows.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
                background: isLast
                  ? "rgba(16, 185, 129, 0.1)"
                  : rowIndex % 2 === 1
                  ? "rgba(255,255,255,0.01)"
                  : "transparent",
              }}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: "12px 16px",
                    textAlign: cellIndex === 0 ? "left" : "right",
                    fontSize: 13,
                    fontWeight: isLast ? 700 : 500,
                    color: isLast ? "#10B981" : "#F5F7FA",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Progress Bar Component
const ProgressBar = ({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#F5F7FA",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: percentage >= 100 ? "#10B981" : "#F5F7FA",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {percentage}%
      </span>
    </div>
    <div
      style={{
        height: 8,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(percentage, 150)}%`,
          maxWidth: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: 4,
          position: "relative",
        }}
      >
        {percentage > 100 && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: `${((percentage - 100) / percentage) * 100}%`,
              background: "#10B981",
              borderRadius: "0 4px 4px 0",
            }}
          />
        )}
      </div>
    </div>
  </div>
);

// Metric Card (smaller)
const MetricCard = ({
  label,
  value,
  color,
  subtext,
}: {
  label: string;
  value: string;
  color?: string;
  subtext?: string;
}) => (
  <div
    style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 10,
      padding: "14px 18px",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div
      style={{
        fontSize: 9,
        color: "#6B7186",
        fontFamily: "'Orbitron', monospace",
        letterSpacing: 1,
        marginBottom: 6,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: color || "#F5F7FA",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {value}
    </div>
    {subtext && (
      <div style={{ fontSize: 10, color: "#6B7186", marginTop: 4 }}>
        {subtext}
      </div>
    )}
  </div>
);

// Portfolio Item
const PortfolioItem = ({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}
  >
    <span
      style={{
        fontSize: 13,
        color: "#F5F7FA",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {label}
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#F5F7FA",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </span>
      {change && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: positive ? "#10B981" : "#EF4444",
            background: positive
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {positive ? "+" : ""}
          {change}
        </span>
      )}
    </div>
  </div>
);

// Business Tab Content
const BusinessTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
    {/* Row 1 — The Big Numbers */}
    <div>
      <SectionHeader title="THE BIG NUMBERS" subtitle="Month-to-date performance" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPICard
          label="Total Revenue (MTD)"
          value="$127,450"
          trend="23%"
          trendPositive={true}
        />
        <KPICard label="Total Revenue (YTD)" value="$1.24M" subValue="On track for $1.8M annual" />
        <KPICard
          label="Net Profit (MTD)"
          value="$89,200"
          subValue="70% margin"
          color="#10B981"
        />
        <KPICard label="Cash Position" value="$342,500" subValue="Operating account" />
      </div>
    </div>

    {/* Row 2 — Cash Flow */}
    <div>
      <SectionHeader title="CASH FLOW" subtitle="Money movement" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <MetricCard label="Operating Cash Flow" value="+$94,300" color="#10B981" />
        <MetricCard label="Accounts Receivable" value="$45,200" subtext="Outstanding invoices" />
        <MetricCard label="Accounts Payable" value="$12,800" subtext="Due within 30 days" />
        <MetricCard label="Runway" value="8.2 months" subtext="At current burn rate" />
      </div>
    </div>

    {/* Row 3 — Revenue Breakdown by Offer */}
    <div>
      <SectionHeader title="REVENUE BREAKDOWN BY OFFER" />
      <DataTable
        headers={["Offer", "Revenue", "% of Total"]}
        rows={[
          ["Done For You ($50K)", "$100,000", "78%"],
          ["Workshop ($5K)", "$15,000", "12%"],
          ["VIP Challenge ($97)", "$8,250", "6%"],
          ["Book Sales", "$4,200", "4%"],
        ]}
      />
    </div>

    {/* Row 4 — Revenue by Channel */}
    <div>
      <SectionHeader title="REVENUE BY CHANNEL" subtitle="Attribution analysis" />
      <DataTable
        headers={["Channel", "Revenue", "CPA", "ROAS"]}
        rows={[
          ["Paid Ads", "$62,000", "$42", "4.2x"],
          ["Organic", "$38,000", "$0", "∞"],
          ["Referrals", "$18,000", "$0", "∞"],
          ["Partnerships", "$9,450", "—", "—"],
        ]}
      />
    </div>

    {/* Row 5 — Expenses Breakdown */}
    <div>
      <SectionHeader title="EXPENSES BREAKDOWN" subtitle="Where the money goes" />
      <DataTable
        headers={["Category", "Amount", "% of Revenue"]}
        rows={[
          ["Advertising", "$18,200", "14%"],
          ["Payroll & Contractors", "$12,400", "10%"],
          ["Software & Tools", "$3,200", "2.5%"],
          ["Operations", "$2,100", "1.6%"],
          ["Other", "$2,350", "1.8%"],
          ["Total Expenses", "$38,250", "30%"],
        ]}
        highlightLast={true}
      />
    </div>

    {/* Row 6 — Key Metrics */}
    <div>
      <SectionHeader title="KEY METRICS" subtitle="Unit economics & efficiency" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <MetricCard label="Gross Margin" value="78%" color="#10B981" />
        <MetricCard label="Net Margin" value="70%" color="#10B981" />
        <MetricCard label="Customer LTV" value="$4,250" />
        <MetricCard label="CAC" value="$142" />
        <MetricCard label="LTV:CAC Ratio" value="30:1" color="#10B981" />
        <MetricCard label="MRR" value="$8,500" subtext="Recurring revenue" />
      </div>
    </div>

    {/* Row 7 — Budget vs Actual */}
    <div>
      <SectionHeader title="BUDGET VS ACTUAL" subtitle="Tracking against plan" />
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: 20,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <ProgressBar label="Revenue" percentage={112} color="#10B981" />
        <ProgressBar label="Expenses" percentage={94} color="#7B61FF" />
        <ProgressBar label="Net Profit" percentage={118} color="#2F80FF" />
      </div>
    </div>

    {/* Row 8 — 90-Day Forecast */}
    <div>
      <SectionHeader title="90-DAY FORECAST" subtitle="Looking ahead" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPICard
          label="Projected Revenue"
          value="$420,000"
          subValue="Based on current pipeline"
        />
        <KPICard
          label="Projected Expenses"
          value="$126,000"
          subValue="30% of revenue target"
        />
        <KPICard
          label="Projected Net Profit"
          value="$294,000"
          subValue="70% margin maintained"
          color="#10B981"
        />
      </div>
    </div>
  </div>
);

// Personal Tab Content
const PersonalTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
    {/* Row 1 — Net Worth Overview */}
    <div>
      <SectionHeader title="NET WORTH OVERVIEW" subtitle="Total financial position" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPICard
          label="Total Net Worth"
          value="$2.4M"
          color="#10B981"
        />
        <KPICard label="Liquid Assets" value="$485,000" subValue="Immediately accessible" />
        <KPICard label="Investments" value="$890,000" subValue="Stocks, crypto, private" />
        <KPICard label="Real Estate Equity" value="$720,000" />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <KPICard label="Business Equity" value="$850,000" subValue="AIM + 239 Capital" />
        <KPICard
          label="Total Liabilities"
          value="-$545,000"
          color="#EF4444"
          subValue="Mortgages & debt"
        />
      </div>
    </div>

    {/* Row 2 — Monthly Personal Cash Flow */}
    <div>
      <SectionHeader title="MONTHLY PERSONAL CASH FLOW" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <MetricCard label="Income (All Sources)" value="$125,000" color="#10B981" />
        <MetricCard label="Personal Expenses" value="$28,500" />
        <MetricCard label="Savings/Investment" value="$96,500" color="#10B981" />
        <MetricCard label="Savings Rate" value="77%" color="#10B981" subtext="Exceptional" />
      </div>
    </div>

    {/* Row 3 — Income Sources */}
    <div>
      <SectionHeader title="INCOME SOURCES" subtitle="Where the money comes from" />
      <DataTable
        headers={["Source", "Monthly", "Annual"]}
        rows={[
          ["AIM Distributions", "$85,000", "$1.02M"],
          ["239 Capital", "$25,000", "$300K"],
          ["Investment Income", "$12,000", "$144K"],
          ["Other", "$3,000", "$36K"],
        ]}
      />
    </div>

    {/* Row 4 — Personal Expenses */}
    <div>
      <SectionHeader title="PERSONAL EXPENSES" subtitle="Monthly breakdown" />
      <DataTable
        headers={["Category", "Monthly"]}
        rows={[
          ["Housing (mortgage, taxes, insurance)", "$8,500"],
          ["Family & Living", "$6,200"],
          ["Travel", "$4,800"],
          ["Vehicles", "$2,400"],
          ["Insurance & Health", "$3,100"],
          ["Giving/Tithe", "$12,500"],
          ["Other", "$3,000"],
        ]}
      />
    </div>

    {/* Row 5 — Investment Portfolio */}
    <div>
      <SectionHeader title="INVESTMENT PORTFOLIO" subtitle="Asset allocation" />
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: 20,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <PortfolioItem
          label="Stocks/ETFs"
          value="$340,000"
          change="+12% YTD"
          positive={true}
        />
        <PortfolioItem
          label="Real Estate"
          value="$720,000"
          change="+8% YTD"
          positive={true}
        />
        <PortfolioItem
          label="Crypto"
          value="$85,000"
          change="+45% YTD"
          positive={true}
        />
        <PortfolioItem
          label="Private Investments"
          value="$465,000"
        />
      </div>
    </div>

    {/* Row 6 — Liabilities */}
    <div>
      <SectionHeader title="LIABILITIES" subtitle="Outstanding debt" />
      <DataTable
        headers={["Liability", "Balance", "Payment"]}
        rows={[
          ["Primary Mortgage", "$380,000", "$2,800/mo"],
          ["Investment Property", "$165,000", "$1,400/mo"],
          ["Vehicles", "$0", "Paid off ✓"],
        ]}
      />
    </div>

    {/* Row 7 — Tax Planning */}
    <div>
      <SectionHeader title="TAX PLANNING" subtitle="2026 tax year" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <MetricCard
          label="Est. Tax Liability (YTD)"
          value="$245,000"
          subtext="Federal + State"
        />
        <MetricCard
          label="Quarterly Estimates Paid"
          value="$180,000"
          color="#10B981"
        />
        <MetricCard
          label="Remaining Due"
          value="$65,000"
          color="#F59E0B"
          subtext="Next payment Q2"
        />
      </div>
    </div>
  </div>
);

export default function Financials() {
  const [activeTab, setActiveTab] = useState<TabType>("business");

  return (
    <div
      style={{
        padding: "32px 40px",
        minHeight: "100vh",
        background: "#0B0F19",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 32 }}>💵</span>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(90deg, #10B981, #2F80FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              letterSpacing: 3,
            }}
          >
            FINANCIALS
          </h1>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#6B7186",
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Complete Financial Picture — Business & Personal
        </p>
      </div>

      {/* Tab Toggle */}
      <div
        style={{
          display: "inline-flex",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 32,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => setActiveTab("business")}
          style={{
            padding: "12px 32px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.2s ease",
            background:
              activeTab === "business"
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : "transparent",
            color: activeTab === "business" ? "#0B0F19" : "#8A8F98",
            boxShadow:
              activeTab === "business"
                ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                : "none",
          }}
        >
          💼 Business
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          style={{
            padding: "12px 32px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.2s ease",
            background:
              activeTab === "personal"
                ? "linear-gradient(135deg, #7B61FF 0%, #5B45CC 100%)"
                : "transparent",
            color: activeTab === "personal" ? "#FFFFFF" : "#8A8F98",
            boxShadow:
              activeTab === "personal"
                ? "0 4px 12px rgba(123, 97, 255, 0.3)"
                : "none",
          }}
        >
          👤 Personal
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "business" ? <BusinessTab /> : <PersonalTab />}
    </div>
  );
}
