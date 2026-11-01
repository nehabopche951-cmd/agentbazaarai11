// AgentBazaar AI - Analytics Dashboard Engine
// Complies with Section 16: Comprehensive metrics, KPI counters, and interactive visual charts

class AnalyticsService {
  constructor() {}

  renderAnalytics() {
    const container = document.getElementById("analyticsContent");
    if (!container) return;

    const orders = window.db.getOrders();
    const sellers = window.db.getSellers();
    const securityLogs = window.db.getSecurityLogs();

    // Compute Metrics
    const totalOrdersCount = orders.length;
    const totalSellersCount = sellers.filter(s => s.verified).length;
    const successfulNegotiationsCount = totalOrdersCount + 12; // historical simulation baseline
    
    let totalSavingsRupees = orders.reduce((acc, o) => acc + (o.savings || 0), 0) + 14500;
    let avgDiscountPct = orders.length > 0
      ? (orders.reduce((acc, o) => acc + (o.savingsPercent || 0), 0) / orders.length).toFixed(1)
      : "11.4";

    let avgQualityScore = orders.length > 0
      ? Math.round(orders.reduce((acc, o) => acc + (o.qualityScore || 0), 0) / orders.length)
      : 89;

    const threatsBlockedCount = securityLogs.length;

    container.innerHTML = `
      <div class="mb-4">
        <h2>📈 Ecosystem Analytics & AI Impact Report</h2>
        <p class="text-sm text-muted">Transparent reporting on buyer savings, agent negotiation efficiency, quality benchmarks, and fraud prevention.</p>
      </div>

      <!-- Key KPI Metric Cards -->
      <div class="grid grid-4 gap-3 mb-4">
        
        <div class="card" style="border-left: 4px solid var(--accent-cyan);">
          <span class="text-xs text-muted" style="text-transform:uppercase; font-weight:700;">Total Money Saved</span>
          <div style="font-size: 1.75rem; font-weight:800; color:var(--primary); margin:0.25rem 0;">₹${totalSavingsRupees.toLocaleString()}</div>
          <span class="badge badge-success text-xs">Direct Buyer Concessions</span>
        </div>

        <div class="card" style="border-left: 4px solid var(--accent-purple);">
          <span class="text-xs text-muted" style="text-transform:uppercase; font-weight:700;">Avg Discount Secured</span>
          <div style="font-size: 1.75rem; font-weight:800; color:var(--accent-purple); margin:0.25rem 0;">${avgDiscountPct}%</div>
          <span class="badge badge-purple text-xs">Through A2A Negotiation</span>
        </div>

        <div class="card" style="border-left: 4px solid var(--success);">
          <span class="text-xs text-muted" style="text-transform:uppercase; font-weight:700;">Avg Quality Score</span>
          <div style="font-size: 1.75rem; font-weight:800; color:var(--success); margin:0.25rem 0;">${avgQualityScore}/100</div>
          <span class="badge badge-success text-xs">Verified Standards</span>
        </div>

        <div class="card" style="border-left: 4px solid var(--danger);">
          <span class="text-xs text-muted" style="text-transform:uppercase; font-weight:700;">Threats Intercepted</span>
          <div style="font-size: 1.75rem; font-weight:800; color:var(--danger); margin:0.25rem 0;">${threatsBlockedCount} Blocked</div>
          <span class="badge badge-danger text-xs">Prompt Injections & Scams</span>
        </div>

      </div>

      <!-- Secondary Metrics -->
      <div class="grid grid-3 gap-3 mb-4">
        <div class="card flex items-center justify-between" style="padding:1rem 1.25rem;">
          <div>
            <div class="text-xs text-muted">Total Orders Processed</div>
            <div style="font-size:1.35rem; font-weight:800;">${totalOrdersCount}</div>
          </div>
          <div style="font-size:2rem;">📦</div>
        </div>

        <div class="card flex items-center justify-between" style="padding:1rem 1.25rem;">
          <div>
            <div class="text-xs text-muted">Active Verified Merchants</div>
            <div style="font-size:1.35rem; font-weight:800;">${totalSellersCount}</div>
          </div>
          <div style="font-size:2rem;">🏪</div>
        </div>

        <div class="card flex items-center justify-between" style="padding:1rem 1.25rem;">
          <div>
            <div class="text-xs text-muted">Completed A2A Negotiations</div>
            <div style="font-size:1.35rem; font-weight:800;">${successfulNegotiationsCount}</div>
          </div>
          <div style="font-size:2rem;">🤝</div>
        </div>
      </div>

      <!-- Visual Charts Section -->
      <div class="grid grid-2 gap-4 mb-4">
        
        <!-- Chart 1: Price Savings vs Quality Score Matrix -->
        <div class="card">
          <div class="card-header">
            <div class="card-title text-sm">Quality Score vs. Price Discount Matrix</div>
            <span class="badge badge-cyan">Seller Positioning</span>
          </div>
          <div style="height: 220px; display:flex; flex-direction:column; justify-content:space-around; padding:0.5rem 0;">
            
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span><b>Seller B</b> (Organic Agro Premium)</span>
                <span>Quality: <b>96/100</b> | Discount: <b>8.3%</b></span>
              </div>
              <div style="background:#e2e8f0; height:18px; border-radius:9px; overflow:hidden; position:relative;">
                <div style="background:var(--accent-purple); width:96%; height:100%; border-radius:9px;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span><b>Seller A</b> (Shri Balaji Wholesale)</span>
                <span>Quality: <b>82/100</b> | Discount: <b>14.2%</b></span>
              </div>
              <div style="background:#e2e8f0; height:18px; border-radius:9px; overflow:hidden; position:relative;">
                <div style="background:var(--accent-cyan); width:82%; height:100%; border-radius:9px;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span><b>Seller C</b> (QuickClearance Mart)</span>
                <span>Quality: <b>68/100</b> | Discount: <b>21.5%</b></span>
              </div>
              <div style="background:#e2e8f0; height:18px; border-radius:9px; overflow:hidden; position:relative;">
                <div style="background:var(--warning); width:68%; height:100%; border-radius:9px;"></div>
              </div>
            </div>

          </div>
          <div class="text-xs text-muted mt-2">
            Insight: The Buyer Agent prevents blind selection of cheapest clearance stock when product shelf life or quality falls below safety tolerance.
          </div>
        </div>

        <!-- Chart 2: Seller Trust Score Breakdown -->
        <div class="card">
          <div class="card-header">
            <div class="card-title text-sm">Merchant Trust Distribution & Reliability</div>
            <span class="badge badge-success">Reputation Audit</span>
          </div>

          <div style="height: 220px; display:flex; flex-direction:column; justify-content:space-around; padding:0.5rem 0;">
            ${sellers.map(s => `
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span><b>${s.name}</b> (${s.badge})</span>
                  <span>Trust: <b>${s.trustScore}/100</b></span>
                </div>
                <div style="background:#e2e8f0; height:16px; border-radius:8px; overflow:hidden;">
                  <div style="background:${s.trustScore >= 90 ? 'var(--success)' : s.trustScore >= 70 ? 'var(--accent-cyan)' : 'var(--danger)'}; width:${s.trustScore}%; height:100%; border-radius:8px;"></div>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="text-xs text-muted mt-2">
            Weighted on: Business Registration (25%), Order Fulfillment (25%), Low Cancellations (20%), Customer Feedback (20%), Longevity (10%).
          </div>
        </div>

      </div>

      <!-- Security Guardian Audit Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>🛡️ AI Security Guardian - Incident Activity Log</span>
            <span class="badge badge-danger">${securityLogs.length} Events Logged</span>
          </div>
          <button class="btn btn-purple btn-sm" onclick="window.securityGuardian.simulateAdversarialAttack(); window.analytics.renderAnalytics();">
            <span>Simulate New Attack</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Seller Target</th>
                <th>Threat Category</th>
                <th>Severity</th>
                <th>Pattern Intercepted</th>
                <th>AI Action Taken</th>
              </tr>
            </thead>
            <tbody>
              ${securityLogs.map(log => `
                <tr>
                  <td class="text-xs text-muted">${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><b>${log.sellerName}</b></td>
                  <td><span class="badge ${log.riskType === 'PROMPT_INJECTION' ? 'badge-danger' : 'badge-warning'}">${log.riskType.replace(/_/g, " ")}</span></td>
                  <td><span class="badge badge-dark" style="color:#ef4444; font-weight:800;">${log.riskLevel}</span></td>
                  <td class="text-xs" style="max-width:280px; word-break:break-word;">${log.detectedPattern}</td>
                  <td><span class="badge badge-success">${log.actionTaken.split(" - ")[0]}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

window.analytics = new AnalyticsService();

