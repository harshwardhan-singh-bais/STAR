# =============================================================================
# STAR — Contextual Tag Engine
# Orthogonal red-flag layer that runs BESIDE TGNN, not inside it.
# TGNN answers "what structural pattern" — this answers "why is it dangerous".
# Zero changes to TGNN architecture. Pure post-hoc enrichment.
# =============================================================================
from __future__ import annotations
from typing import Any, Dict, List

# ── Lookup Tables ─────────────────────────────────────────────────────────────

CASH_INTENSIVE_BUSINESSES = {
    "restaurant", "cafe", "bar", "nightclub", "salon", "beauty parlor",
    "laundromat", "car wash", "carwash", "pawn shop", "pawnshop",
    "jewelry", "jewellery", "casino", "arcade", "valet", "convenience store",
}

CRYPTO_FORMATS = {"Bitcoin", "Reinvestment"}
HIGH_RISK_FORMATS = {"ACH", "Bitcoin", "Cash", "Reinvestment"}
CRYPTO_CURRENCIES = {"BTC", "BTC", "ETH", "XMR", "USDT"}

HIGH_RISK_KYC = {"None", "Agent", "agent_referral"}
SHELL_COMPANY_TYPES = {"Company", "Shell", "Holding", "SPV", "Trust"}

# Severity levels for UI colour-coding
SEVERITY_COLOR = {
    "critical": "#EF4444",   # red
    "high":     "#F97316",   # orange
    "medium":   "#EAB308",   # yellow
    "low":      "#3B82F6",   # blue
}


def evaluate_contextual_tags(
    tx_data: Dict[str, Any],
    all_transactions: List[Dict[str, Any]],
    tx_index: int,
) -> List[Dict[str, Any]]:
    """
    Evaluate all contextual red-flag tags for a single transaction.

    Each tag has:
        tag        — machine-readable identifier
        label      — human-readable label for UI badges
        severity   — critical / high / medium / low
        reason     — one-line explanation shown in the alert card
        category   — grouping label (Identity Risk, Digital Risk, etc.)
        fired      — always True (only fired tags are returned)
    """
    tags: List[Dict[str, Any]] = []

    from_account   = tx_data.get("from_account", "")
    to_account     = tx_data.get("to_account", "")
    amount         = float(tx_data.get("amount", 0))
    currency       = tx_data.get("currency", "USD")
    payment_format = tx_data.get("payment_format", "Wire")
    account_age    = tx_data.get("account_age_days")           # may be None
    account_type   = tx_data.get("account_type", "Personal")
    declared_biz   = (tx_data.get("declared_business") or "").lower().strip()
    kyc_method     = tx_data.get("kyc_method", "Branch")

    # ── 1. NEW ACCOUNT ────────────────────────────────────────────────────────
    if account_age is not None and 0 <= account_age < 30:
        tags.append({
            "tag": "NEW_ACCOUNT",
            "label": "New Account",
            "severity": "high",
            "reason": (
                f"Sender account is only {account_age} day(s) old — "
                "below 30-day new-account threshold. "
                "Example: Account opened 12 days ago immediately receives $9,500 and disperses to 4 accounts."
            ),
            "category": "Identity Risk",
            "fired": True,
        })

    # ── 2. DORMANT ACCOUNT REACTIVATION ──────────────────────────────────────
    if account_age is not None and account_age > 365:
        tags.append({
            "tag": "DORMANT_REACTIVATION",
            "label": "Dormant Reactivated",
            "severity": "high",
            "reason": (
                f"Account dormant for {account_age} days before this high-value transfer. "
                "Example: An account opened 5 years ago, silent for 2 years, "
                f"suddenly executes a ${amount:,.0f} wire — classic dormant reactivation."
            ),
            "category": "Behavioral Anomaly",
            "fired": True,
        })

    # ── 3. STRUCTURING PROXIMITY (CTR evasion) ────────────────────────────────
    if 8_000 < amount < 10_000:
        tags.append({
            "tag": "STRUCTURING_PROXIMITY",
            "label": "Structuring Proximity",
            "severity": "critical",
            "reason": (
                f"Amount ${amount:,.0f} falls within $8,000–$10,000 CTR reporting band. "
                "Example: Three transfers of $9,500, $9,400, $9,200 from same account "
                "over 3 days — each just below the $10,000 Currency Transaction Report threshold."
            ),
            "category": "Threshold Evasion",
            "fired": True,
        })

    # ── 4. HIGH-VALUE TRANSFER ────────────────────────────────────────────────
    if amount > 100_000:
        tags.append({
            "tag": "HIGH_VALUE_TRANSFER",
            "label": "High Value",
            "severity": "medium",
            "reason": (
                f"Transfer amount ${amount:,.0f} exceeds $100,000 enhanced-scrutiny threshold. "
                "Example: A personal account with declared income of $60k/yr sends $250,000 "
                "to an offshore account."
            ),
            "category": "Amount Risk",
            "fired": True,
        })

    # ── 5. CRYPTO EXIT / OFF-RAMP ─────────────────────────────────────────────
    if payment_format in CRYPTO_FORMATS or currency in CRYPTO_CURRENCIES:
        tags.append({
            "tag": "CRYPTO_EXIT",
            "label": "Crypto Exit",
            "severity": "high",
            "reason": (
                f"Payment format '{payment_format}' / currency '{currency}' "
                "indicates a crypto off-ramp. "
                "Example: A chain of 3 cash deposits → bank transfer → Bitcoin wallet "
                "— layering that exits into untraceable crypto."
            ),
            "category": "Digital Risk",
            "fired": True,
        })

    # ── 6. HIGH-RISK PAYMENT FORMAT ───────────────────────────────────────────
    elif payment_format in HIGH_RISK_FORMATS:
        tags.append({
            "tag": "HIGH_RISK_FORMAT",
            "label": "High-Risk Format",
            "severity": "medium",
            "reason": (
                f"Payment format '{payment_format}' is on the high-risk format watchlist. "
                "Example: Repeated ACH micro-transactions between related accounts "
                "to avoid SWIFT monitoring."
            ),
            "category": "Transaction Risk",
            "fired": True,
        })

    # ── 7. CASH-INTENSIVE BUSINESS (Front Business) ───────────────────────────
    if declared_biz in CASH_INTENSIVE_BUSINESSES:
        if payment_format == "Cash" or amount > 20_000:
            tags.append({
                "tag": "CASH_INTENSIVE_BIZ",
                "label": "Cash Front Business",
                "severity": "high",
                "reason": (
                    f"Declared business '{declared_biz}' is a classic cash-intensive "
                    f"front business. Amount: ${amount:,.0f}. "
                    "Example: A laundromat declaring $180,000/month in cash revenue "
                    "but only 2 machines — blending illicit cash into declared revenue."
                ),
                "category": "Front Business",
                "fired": True,
            })

    # ── 8. PROFILE MISMATCH ───────────────────────────────────────────────────
    if declared_biz and declared_biz in CASH_INTENSIVE_BUSINESSES and amount > 50_000:
        tags.append({
            "tag": "PROFILE_MISMATCH",
            "label": "Profile Mismatch",
            "severity": "high",
            "reason": (
                f"Declared business '{declared_biz}' is inconsistent with "
                f"${amount:,.0f} transfer volume. "
                "Example: A two-employee restaurant declaring $500k monthly wire transfers "
                "— transaction volume far exceeds declared business capacity."
            ),
            "category": "KYC Risk",
            "fired": True,
        })

    # ── 9. MULE RECRUITMENT PATTERN ───────────────────────────────────────────
    if kyc_method in HIGH_RISK_KYC and account_age is not None and account_age < 30:
        tags.append({
            "tag": "MULE_RECRUITMENT",
            "label": "Mule Recruitment",
            "severity": "critical",
            "reason": (
                f"Agent-referred account only {account_age} days old. "
                "Example: A student recruited via WhatsApp job offer, account opened via "
                "agent with minimal KYC, receives and immediately forwards $9,500 — "
                "classic UPI/mobile mule."
            ),
            "category": "Identity Risk",
            "fired": True,
        })

    # ── 10. SHELL COMPANY INDICATOR ───────────────────────────────────────────
    if account_type in SHELL_COMPANY_TYPES and kyc_method in {"None", "Online"} and amount > 50_000:
        tags.append({
            "tag": "SHELL_COMPANY",
            "label": "Shell Company",
            "severity": "critical",
            "reason": (
                f"'{account_type}' account with minimal KYC '{kyc_method}' "
                f"transacting ${amount:,.0f}. "
                "Example: Company A → Company B → Company C → Trust D, all registered "
                "at the same address, no employees, beneficial owner untraceable."
            ),
            "category": "Entity Risk",
            "fired": True,
        })

    # ── Graph-level checks (require looking at all transactions) ──────────────

    # ── 11. VELOCITY SPIKE ────────────────────────────────────────────────────
    sender_count = sum(1 for t in all_transactions if t.get("from_account") == from_account)
    if sender_count >= 4:
        tags.append({
            "tag": "VELOCITY_SPIKE",
            "label": "Velocity Spike",
            "severity": "medium",
            "reason": (
                f"Account '{from_account}' appears as sender in {sender_count} transactions "
                "within this session. "
                "Example: An account sends 7 transactions in 2 hours — "
                "velocity far above normal baseline."
            ),
            "category": "Behavioral Anomaly",
            "fired": True,
        })

    # ── 12. RAPID PASSTHROUGH (Account is both sender AND receiver) ───────────
    is_also_receiver = any(
        t.get("to_account") == from_account for t in all_transactions
    )
    if is_also_receiver:
        tags.append({
            "tag": "RAPID_PASSTHROUGH",
            "label": "Rapid Passthrough",
            "severity": "high",
            "reason": (
                f"'{from_account}' acts as both a receiver and a sender — "
                "money-mule passthrough pattern. "
                "Example: Account receives $50k wire then immediately sends $49k "
                "onward — textbook layering node."
            ),
            "category": "Structural Risk",
            "fired": True,
        })

    # ── 13. CROSS-CURRENCY FX ROUTING ─────────────────────────────────────────
    other_currencies = {
        t.get("currency", "USD")
        for j, t in enumerate(all_transactions)
        if j != tx_index
    }
    if currency not in other_currencies and len(other_currencies) > 0:
        tags.append({
            "tag": "CROSS_CURRENCY",
            "label": "Cross-Currency",
            "severity": "medium",
            "reason": (
                f"Currency '{currency}' differs from other transactions in this flow. "
                "Example: A chain USD → EUR → BTC — three-hop FX conversion "
                "to break the transaction trail."
            ),
            "category": "Cross-Border Risk",
            "fired": True,
        })

    # ── 14. LOAN-BACK INDICATOR ───────────────────────────────────────────────
    # Detected when: Company/Trust type accounts transact with Personal accounts
    # in both directions (loan looks like it goes out, comes back as "repayment")
    reverse_tx = any(
        t.get("from_account") == to_account and t.get("to_account") == from_account
        for t in all_transactions
    )
    if reverse_tx and amount > 10_000:
        tags.append({
            "tag": "LOAN_BACK",
            "label": "Loan-Back Scheme",
            "severity": "high",
            "reason": (
                f"Bidirectional transfers detected between '{from_account}' and "
                f"'{to_account}'. "
                "Example: Dirty money parked offshore is 'lent back' to the launderer "
                "by a shell company — the loan proceeds are now clean."
            ),
            "category": "Layering Risk",
            "fired": True,
        })

    return tags
