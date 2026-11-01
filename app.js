// AgentBazaar AI - Main App Controller & Navigation Router
// Manages routing, modals, toasts, role guards, and human approval flow

class AppController {
  constructor() {
    this.currentView = "loginPage";
  }

  init() {
    // Check initial session
    const user = window.db.getCurrentUser();
    if (user) {
      if (user.role === "seller") {
        this.navigateTo("sellerDashboard");
      } else {
        this.navigateTo("buyerDashboard");
      }
    } else {
      this.navigateTo("loginPage");
    }

    this.updateUserNavDisplay();
  }

  // Navigation Router
  navigateTo(viewId, param = null) {
    const user = window.db.getCurrentUser();

    // Role-based route guard
    if (viewId === "sellerDashboard") {
      if (!user || user.role !== "seller") {
        this.showToast("Seller Dashboard is restricted to registered sellers.", "warning");
        if (!user) {
          this.activateLoginTab("seller");
          this.navigateTo("loginPage");
          return;
        }
      }
    }

    if (viewId === "buyerDashboard" || viewId === "negotiationRoom") {
      if (!user) {
        this.showToast("Please log in to access the Buyer AI features.", "warning");
        this.activateLoginTab("buyer");
        this.navigateTo("loginPage");
        return;
      }
    }

    // Hide all view containers
    const views = document.querySelectorAll(".app-view");
    views.forEach(v => v.style.display = "none");

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
      target.style.display = "block";
      this.currentView = viewId;
    }

    // Update active nav link
    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.dataset.view === viewId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Render view contents
    if (viewId === "buyerDashboard") {
      window.buyerDashboard.renderDashboard();
    } else if (viewId === "sellerDashboard") {
      window.sellerDashboard.renderDashboard();
    } else if (viewId === "negotiationRoom") {
      if (!window.db.getActiveNegotiation()) {
        window.negotiationRoom.startSession();
      } else {
        window.negotiationRoom.renderRoom();
      }
    } else if (viewId === "orderTracking") {
      window.orderTracking.renderOrderTracking(param);
    } else if (viewId === "analytics") {
      window.analytics.renderAnalytics();
    }

    this.updateUserNavDisplay();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  activateLoginTab(role) {
    const buyerTab = document.getElementById("tab-buyer");
    const sellerTab = document.getElementById("tab-seller");
    const buyerCard = document.getElementById("authBuyerCard");
    const sellerCard = document.getElementById("authSellerCard");

    if (role === "buyer") {
      buyerTab?.classList.add("active");
      sellerTab?.classList.remove("active");
      if (buyerCard) buyerCard.style.display = "block";
      if (sellerCard) sellerCard.style.display = "none";
    } else {
      sellerTab?.classList.add("active");
      buyerTab?.classList.remove("active");
      if (sellerCard) sellerCard.style.display = "block";
      if (buyerCard) buyerCard.style.display = "none";
    }
  }

  updateUserNavDisplay() {
    const user = window.db.getCurrentUser();
    const userNav = document.getElementById("userNavSection");
    const sellerNavTab = document.getElementById("navSellerDashboard");
    const buyerNavTab = document.getElementById("navBuyerDashboard");

    if (!userNav) return;

    if (user) {
      userNav.innerHTML = `
        <div class="user-pill">
          <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div style="font-size:0.8rem; line-height:1.2;">
            <div style="font-weight:700;">${user.name}</div>
            <div class="text-xs text-muted" style="color:#94a3b8; text-transform:capitalize;">${user.role}</div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" style="color:#cbd5e1; border-color:rgba(255,255,255,0.2);" onclick="window.auth.logout()">
          Logout
        </button>
      `;

      if (user.role === "buyer") {
        if (buyerNavTab) buyerNavTab.style.display = "flex";
        if (sellerNavTab) sellerNavTab.style.display = "none";
      } else {
        if (buyerNavTab) buyerNavTab.style.display = "none";
        if (sellerNavTab) sellerNavTab.style.display = "flex";
      }
    } else {
      userNav.innerHTML = `
        <button class="btn btn-accent btn-sm" onclick="window.app.navigateTo('loginPage')">
          Login / Register
        </button>
      `;
      if (buyerNavTab) buyerNavTab.style.display = "flex";
      if (sellerNavTab) sellerNavTab.style.display = "none";
    }
  }

  // Toast System
  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "⚠️" : type === "warning" ? "🔔" : "ℹ️";
    toast.innerHTML = `<span style="font-size:1.1rem;">${icon}</span><span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(30px)";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Section 13: Final Deal Approval Modal (Human-in-the-Loop)
  openApprovalModal(sellerId) {
    const activeNeg = window.db.getActiveNegotiation();
    const offer = activeNeg?.offers?.[sellerId] || window.negotiationRoom?.offers?.[sellerId] || window.agentEngine.generateSellerOfferB({}, 3);
    this.pendingApprovalDeal = offer;
    const seller = window.db.getSellerById(offer.sellerId) || window.db.getSellers()[0];

    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 620px;" onclick="event.stopPropagation()">
          
          <div class="modal-header" style="background:#1e3e62; color:#fff; border-top-left-radius:var(--radius-xl); border-top-right-radius:var(--radius-xl);">
            <div>
              <div class="card-title" style="color:#fff;">
                <span>🤝 Final Deal Authorization Required</span>
              </div>
              <div class="text-xs" style="color:#cbd5e1;">Review the AI-negotiated terms before granting payment approval.</div>
            </div>
            <button class="modal-close-btn" style="color:#fff;" onclick="window.app.closeModal()">&times;</button>
          </div>

          <div class="modal-body" style="padding:1.5rem;">
            
            <div class="card mb-3" style="background:#f8fafc; border:1px solid var(--border); padding:1.25rem;">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <span class="badge ${seller.type === 'premium' ? 'badge-purple' : 'badge-success'}">${seller.badge}</span>
                  <h3 class="mt-1" style="font-size:1.2rem;">${offer.sellerName}</h3>
                </div>
                <div class="score-circle score-high" style="width:48px; height:48px;">
                  ${offer.trustScore}
                  <small>TRUST</small>
                </div>
              </div>
              
              <div class="flex flex-col gap-1 text-sm border-top pt-2">
                <div class="flex justify-between"><span>Product & Batch:</span><b>${offer.productName}</b></div>
                <div class="flex justify-between"><span>Order Quantity:</span><b>${offer.quantity} Units</b></div>
                <div class="flex justify-between"><span>Verified Quality Score:</span><b style="color:var(--accent-purple);">${offer.qualityScore}/100 (Certified)</b></div>
                <div class="flex justify-between"><span>Expiry Date:</span><span>${offer.expiryDate}</span></div>
                <div class="flex justify-between"><span>Guaranteed Delivery:</span><b>${offer.deliveryDays} Days (${offer.deliveryDate})</b></div>
                <div class="flex justify-between"><span>Agreed Payment Terms:</span><span>${offer.paymentTerms}</span></div>
              </div>
            </div>

            <!-- Price Breakdown Summary -->
            <div class="card mb-3" style="background:#ffffff; border:1px solid #bfdbfe; padding:1.25rem;">
              <div class="flex justify-between text-sm mb-1">
                <span>Original Catalog Total:</span>
                <s>₹${offer.originalTotal.toLocaleString()}</s>
              </div>
              <div class="flex justify-between text-sm mb-1" style="color:var(--success); font-weight:700;">
                <span>AI-Negotiated Bulk Concession:</span>
                <span>-₹${offer.discountAmount.toLocaleString()} (${offer.discountPercent}% Off)</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-top" style="font-size:1.25rem; font-weight:800; color:var(--primary);">
                <span>Final Deal Amount:</span>
                <span>₹${offer.finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div class="card" style="background:#ecfdf5; border:1px solid #a7f3d0; padding:0.75rem 1rem;">
              <div class="flex items-center gap-2 text-xs" style="color:#065f46;">
                <span style="font-size:1.1rem;">🛡️</span>
                <span>
                  <b>Human Authorization Safeguard:</b> As mandated by system policy, the AI agent will not trigger funds transfer without your explicit approval.
                </span>
              </div>
            </div>

          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-outline btn-danger" onclick="window.app.rejectDeal('${offer.sellerId}')">
              <span>✕ Reject Deal</span>
            </button>
            <button class="btn btn-accent btn-lg" onclick="window.app.approveDeal()">
              <span>✓ Approve Deal & Pay</span>
            </button>
          </div>

        </div>
      </div>
    `;
  }

  approveDeal(dealData) {
    const deal = dealData || this.pendingApprovalDeal;
    this.closeModal();
    this.showToast("Deal Approved by Buyer! Launching Mock Payment...", "success");
    window.paymentGateway.openPaymentModal(deal);
  }

  rejectDeal(sellerId) {
    this.closeModal();
    this.showToast("Deal rejected. You can re-negotiate or choose another seller.", "warning");
  }

  closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById("genericModal");
    if (modal) modal.innerHTML = "";
  }
}

window.app = new AppController();

document.addEventListener("DOMContentLoaded", () => {
  window.app.init();
});
