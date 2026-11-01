// AgentBazaar AI - Authentication & Role Guard System
// Provides Buyer and Seller registration/login with DEMO OTP mode

class AuthService {
  constructor() {
    this.demoOtpCode = "123456";
    this.otpTimerInterval = null;
    this.otpSecondsLeft = 30;
    this.pendingAuthData = null;
  }

  // Preset demo logins for fast presentation
  quickLoginAs(role, sellerId = null) {
    if (role === "buyer") {
      const buyer = {
        id: "BUYER_001",
        name: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        phone: "+91 98711 23456",
        role: "buyer",
        deliveryAddress: "Flat 402, Lotus Greens Boulevard, Sector 150, Noida, UP - 201310",
        savedPaymentUPI: "priyasharma@okhdfcbank",
        agentConfig: {
          agentId: "BUYER_AGENT_001",
          agentName: "BazaarCopilot AI",
          negotiationIntensity: "balanced",
          minQualityThreshold: 75,
          strictSecurityMode: true
        }
      };
      window.db.setCurrentUser(buyer);
      window.app.showToast("Logged in as Buyer: Priya Sharma", "success");
      window.app.navigateTo("buyerDashboard");
      return;
    }

    if (role === "seller") {
      const seller = window.db.getSellerById(sellerId || "SELLER_A");
      if (seller) {
        const sellerUser = {
          id: seller.id,
          name: seller.owner,
          businessName: seller.name,
          email: seller.email,
          phone: seller.phone,
          role: "seller",
          sellerDetails: seller
        };
        window.db.setCurrentUser(sellerUser);
        window.app.showToast(`Logged in as Seller: ${seller.name}`, "success");
        window.app.navigateTo("sellerDashboard");
      }
    }
  }

  // Request OTP for Buyer
  requestBuyerOtp(emailOrPhone, isRegister = false, extraData = {}) {
    if (!emailOrPhone || emailOrPhone.trim() === "") {
      window.app.showToast("Please enter a valid Gmail address or Phone number", "error");
      return false;
    }

    this.pendingAuthData = {
      role: "buyer",
      isRegister,
      identifier: emailOrPhone.trim(),
      ...extraData
    };

    this.startOtpTimer();
    return true;
  }

  // Request OTP for Seller
  requestSellerOtp(businessName, emailOrPhone, isRegister = false, extraData = {}) {
    if (!businessName || !emailOrPhone) {
      window.app.showToast("Please provide your Business Name and Gmail/Phone", "error");
      return false;
    }

    this.pendingAuthData = {
      role: "seller",
      isRegister,
      businessName,
      identifier: emailOrPhone.trim(),
      ...extraData
    };

    this.startOtpTimer();
    return true;
  }

  // Verify OTP
  verifyOtp(enteredOtp) {
    if (!this.pendingAuthData) {
      window.app.showToast("No active OTP request found. Please request a new code.", "error");
      return false;
    }

    if (enteredOtp !== this.demoOtpCode) {
      window.app.showToast("Invalid OTP code. In DEMO mode, use: 123456", "error");
      return false;
    }

    // Success - create session
    clearInterval(this.otpTimerInterval);
    const data = this.pendingAuthData;
    let user;

    if (data.role === "buyer") {
      user = {
        id: "BUYER_" + Math.floor(100 + Math.random() * 900),
        name: data.name || "Buyer User",
        email: data.identifier.includes("@") ? data.identifier : "buyer@demo.in",
        phone: data.identifier.includes("@") ? "+91 98711 00000" : data.identifier,
        role: "buyer",
        deliveryAddress: "Sector 62, Noida, Uttar Pradesh - 201309",
        savedPaymentUPI: "buyer@okhdfcbank",
        agentConfig: {
          agentId: "BUYER_AGENT_" + Math.floor(100 + Math.random() * 900),
          agentName: "BazaarCopilot AI",
          negotiationIntensity: "balanced",
          minQualityThreshold: 75,
          strictSecurityMode: true
        }
      };
      window.db.setCurrentUser(user);
      window.app.showToast("Buyer identity verified successfully!", "success");
      window.app.navigateTo("buyerDashboard");
    } else {
      // Find or create seller
      const existing = window.db.getSellers().find(s => s.email === data.identifier || s.phone === data.identifier);
      if (existing) {
        user = {
          id: existing.id,
          name: existing.owner,
          businessName: existing.name,
          email: existing.email,
          phone: existing.phone,
          role: "seller",
          sellerDetails: existing
        };
      } else {
        const newSeller = {
          id: "SELLER_" + Date.now().toString(36).toUpperCase(),
          name: data.businessName,
          owner: data.ownerName || "Business Owner",
          email: data.identifier.includes("@") ? data.identifier : "seller@business.com",
          phone: data.identifier.includes("@") ? "+91 98000 11111" : data.identifier,
          type: "budget",
          badge: "Verified Merchant",
          tagline: "Quality goods at competitive trade pricing",
          city: data.city || "Mumbai, MH",
          gstin: data.gstin || "27AAACR1234F1Z1",
          verified: true,
          rating: 4.5,
          reviewsCount: 1,
          trustScore: 82,
          trustFactors: {
            businessVerification: 90,
            fulfillmentRate: 92,
            cancellationRate: 90,
            buyerFeedback: 85,
            platformLongevity: 70
          },
          metrics: {
            totalOrders: 0,
            onTimeDelivery: "100%",
            cancellationRate: "0%",
            avgResponseMinutes: 5
          },
          agentPersona: {
            code: "SELLER_AGENT_" + Date.now().toString(36).toUpperCase(),
            name: `${data.businessName} AI Agent`,
            strategy: "Budget & Volume",
            description: "Automated business negotiations with margin safeguards.",
            marginTolerancePercent: 10,
            bulkDiscountThreshold: 20,
            deliveryGuaranteeDays: 3,
            allowNegotiationRounds: 3
          }
        };
        window.db.state.sellers.push(newSeller);
        window.db.save();

        user = {
          id: newSeller.id,
          name: newSeller.owner,
          businessName: newSeller.name,
          email: newSeller.email,
          phone: newSeller.phone,
          role: "seller",
          sellerDetails: newSeller
        };
      }
      window.db.setCurrentUser(user);
      window.app.showToast("Seller identity verified successfully!", "success");
      window.app.navigateTo("sellerDashboard");
    }

    this.pendingAuthData = null;
    return true;
  }

  startOtpTimer() {
    this.otpSecondsLeft = 30;
    clearInterval(this.otpTimerInterval);
    this.updateOtpTimerDisplay();
    this.otpTimerInterval = setInterval(() => {
      this.otpSecondsLeft--;
      this.updateOtpTimerDisplay();
      if (this.otpSecondsLeft <= 0) {
        clearInterval(this.otpTimerInterval);
      }
    }, 1000);
  }

  updateOtpTimerDisplay() {
    const el = document.getElementById("otpResendCountdown");
    if (el) {
      if (this.otpSecondsLeft > 0) {
        el.innerHTML = `Resend OTP in <b>${this.otpSecondsLeft}s</b>`;
        el.style.pointerEvents = "none";
        el.style.opacity = "0.6";
      } else {
        el.innerHTML = `<a href="javascript:void(0)" onclick="window.auth.resendOtp()" style="color:var(--accent-cyan); font-weight:700;">Resend OTP Now</a>`;
        el.style.pointerEvents = "auto";
        el.style.opacity = "1";
      }
    }
  }

  resendOtp() {
    this.startOtpTimer();
    window.app.showToast("DEMO OTP resent! Code: 123456", "warning");
  }

  logout() {
    window.db.setCurrentUser(null);
    window.app.showToast("Logged out successfully", "success");
    window.app.navigateTo("loginPage");
  }

  // Check if current user has role permission
  checkPermission(requiredRole) {
    const user = window.db.getCurrentUser();
    if (!user) {
      window.app.showToast("Please log in to continue", "warning");
      window.app.navigateTo("loginPage");
      return false;
    }
    if (requiredRole && user.role !== requiredRole) {
      window.app.showToast(`Access Restricted: This section requires a ${requiredRole} account.`, "error");
      window.app.navigateTo(user.role === "buyer" ? "buyerDashboard" : "sellerDashboard");
      return false;
    }
    return true;
  }
}

window.auth = new AuthService();

