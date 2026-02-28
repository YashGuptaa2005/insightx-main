from collections import Counter, defaultdict
from statistics import mean
from typing import Dict, Any, List, Tuple

from data_loader import get_records


def _as_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _is_success(status: Any) -> bool:
    return status == "SUCCESS"


def _is_fraud(flag: Any) -> bool:
    if flag in (1, "1", True, "True", "true"):
        return True
    return False


def get_failure_analysis(peak_only: bool = False) -> dict:
    data = get_records()
    if peak_only:
        filtered = [
            r
            for r in data
            if r.get("hour_of_day") not in (None, "")
            and 18 <= int(r["hour_of_day"]) <= 22
        ]
    else:
        filtered = data

    total = len(filtered)
    failed = [r for r in filtered if r.get("transaction_status") == "FAILED"]

    by_network = Counter(r.get("network_type") for r in failed if r.get("network_type"))
    by_device = Counter(r.get("device_type") for r in failed if r.get("device_type"))
    by_bank = Counter(r.get("sender_bank") for r in failed if r.get("sender_bank"))
    by_bank_top5 = dict(by_bank.most_common(5))

    p2m_failed = [
        r
        for r in failed
        if r.get("transaction_type") == "P2M" and r.get("merchant_category")
    ]
    by_merchant = Counter(r["merchant_category"] for r in p2m_failed)

    failure_count = len(failed)
    failure_rate = round(failure_count / total * 100, 2) if total else 0.0

    return {
        "total_transactions": total,
        "total_failures": failure_count,
        "failure_rate": failure_rate,
        "by_network": dict(by_network),
        "by_device": dict(by_device),
        "by_bank": by_bank_top5,
        "by_merchant_category": dict(by_merchant),
        "peak_only": peak_only,
    }


def get_success_rate_by_segment(
    transaction_type: str = None, min_amount: float = None
) -> dict:
    data = get_records()

    filtered: List[Dict[str, Any]] = []
    for r in data:
        if transaction_type and r.get("transaction_type") != transaction_type:
            continue
        amount = _as_float(r.get("amount_inr"))
        if min_amount is not None and amount < min_amount:
            continue
        filtered.append(r)

    # success rate by (age_group, device_type)
    segment_stats: Dict[Tuple[str, str], Dict[str, int]] = {}
    for r in filtered:
        age_group = r.get("sender_age_group") or "Unknown"
        device_type = r.get("device_type") or "Unknown"
        key = (age_group, device_type)
        stat = segment_stats.setdefault(key, {"total": 0, "success": 0})
        stat["total"] += 1
        if _is_success(r.get("transaction_status")):
            stat["success"] += 1

    segments = []
    for (age_group, device_type), stat in segment_stats.items():
        total = stat["total"]
        success = stat["success"]
        success_rate = round(success / total * 100, 2) if total else 0.0
        segments.append(
            {
                "age_group": age_group,
                "device_type": device_type,
                "success_rate": success_rate,
            }
        )

    top_segments = sorted(
        segments, key=lambda x: x["success_rate"], reverse=True
    )[:5]

    # success rate by merchant_category
    merchant_stats: Dict[str, Dict[str, int]] = {}
    for r in filtered:
        merchant = r.get("merchant_category")
        if not merchant:
            continue
        stat = merchant_stats.setdefault(merchant, {"total": 0, "success": 0})
        stat["total"] += 1
        if _is_success(r.get("transaction_status")):
            stat["success"] += 1

    success_by_merchant: Dict[str, float] = {}
    for merchant, stat in merchant_stats.items():
        total = stat["total"]
        success = stat["success"]
        success_rate = round(success / total * 100, 2) if total else 0.0
        success_by_merchant[merchant] = success_rate

    fraud_flags = [_is_fraud(r.get("fraud_flag")) for r in filtered]
    fraud_rate = (
        round(sum(fraud_flags) / len(fraud_flags) * 100, 2) if fraud_flags else 0.0
    )

    return {
        "filters": {"transaction_type": transaction_type, "min_amount": min_amount},
        "sample_size": len(filtered),
        "top_segments_by_success": top_segments,
        "success_by_merchant": success_by_merchant,
        "fraud_flag_rate": fraud_rate,
    }


def get_regional_analysis(
    transaction_type: str = None, weekend_only: bool = False
) -> dict:
    data = get_records()

    filtered: List[Dict[str, Any]] = []
    for r in data:
        if transaction_type and r.get("transaction_type") != transaction_type:
            continue
        if weekend_only:
            is_weekend = r.get("is_weekend")
            if is_weekend not in (1, "1", True, "True", "true"):
                continue
        filtered.append(r)

    # by_state aggregations
    state_stats: Dict[str, Dict[str, Any]] = {}
    for r in filtered:
        state = r.get("sender_state") or "Unknown"
        amount = _as_float(r.get("amount_inr"))
        stat = state_stats.setdefault(
            state, {"total_transactions": 0, "amounts": [], "successes": 0}
        )
        stat["total_transactions"] += 1
        stat["amounts"].append(amount)
        if _is_success(r.get("transaction_status")):
            stat["successes"] += 1

    by_state_records = []
    for state, stat in state_stats.items():
        total = stat["total_transactions"]
        amounts = stat["amounts"]
        successes = stat["successes"]
        avg_amount = mean(amounts) if amounts else 0.0
        success_rate = round(successes / total * 100, 2) if total else 0.0
        by_state_records.append(
            {
                "sender_state": state,
                "total_transactions": total,
                "avg_amount": avg_amount,
                "success_rate": success_rate,
            }
        )

    by_state_records.sort(key=lambda x: x["total_transactions"], reverse=True)

    # worst state/bank combinations by success_rate
    state_bank_stats: Dict[Tuple[str, str], Dict[str, int]] = {}
    for r in filtered:
        state = r.get("sender_state") or "Unknown"
        bank = r.get("sender_bank") or "Unknown"
        key = (state, bank)
        stat = state_bank_stats.setdefault(key, {"total": 0, "success": 0})
        stat["total"] += 1
        if _is_success(r.get("transaction_status")):
            stat["success"] += 1

    worst_combinations = []
    for (state, bank), stat in state_bank_stats.items():
        total = stat["total"]
        success = stat["success"]
        success_rate = round(success / total * 100, 2) if total else 0.0
        worst_combinations.append(
            {"state": state, "bank": bank, "success_rate": success_rate}
        )

    worst_combinations.sort(key=lambda x: x["success_rate"])
    worst_combinations = worst_combinations[:5]

    # network_by_state: {network_type: {state: count}}
    network_by_state: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for r in filtered:
        state = r.get("sender_state") or "Unknown"
        network = r.get("network_type") or "Unknown"
        network_by_state[network][state] += 1

    network_by_state_dict: Dict[str, Dict[str, int]] = {
        network: dict(states) for network, states in network_by_state.items()
    }

    return {
        "filters": {"transaction_type": transaction_type, "weekend_only": weekend_only},
        "sample_size": len(filtered),
        "by_state": by_state_records,
        "worst_state_bank_combinations": worst_combinations,
        "network_by_state": network_by_state_dict,
    }


def get_transaction_trends() -> dict:
    data = get_records()

    # by hour of day
    hour_stats: Dict[Any, Dict[str, Any]] = {}
    for r in data:
        hour = r.get("hour_of_day")
        if hour in (None, ""):
            continue
        amount = _as_float(r.get("amount_inr"))
        stat = hour_stats.setdefault(
            hour, {"count": 0, "amounts": [], "successes": 0}
        )
        stat["count"] += 1
        stat["amounts"].append(amount)
        if _is_success(r.get("transaction_status")):
            stat["successes"] += 1

    by_hour = []
    for hour, stat in hour_stats.items():
        count = stat["count"]
        amounts = stat["amounts"]
        successes = stat["successes"]
        avg_amount = mean(amounts) if amounts else 0.0
        success_rate = round(successes / count * 100, 2) if count else 0.0
        by_hour.append(
            {
                "hour_of_day": int(hour),
                "count": count,
                "avg_amount": avg_amount,
                "success_rate": success_rate,
            }
        )

    by_hour.sort(key=lambda x: x["hour_of_day"])

    # by day of week
    day_stats: Dict[Any, Dict[str, Any]] = {}
    for r in data:
        day = r.get("day_of_week")
        if day in (None, ""):
            continue
        amount = _as_float(r.get("amount_inr"))
        stat = day_stats.setdefault(day, {"count": 0, "amounts": []})
        stat["count"] += 1
        stat["amounts"].append(amount)

    by_day = []
    for day, stat in day_stats.items():
        count = stat["count"]
        amounts = stat["amounts"]
        avg_amount = mean(amounts) if amounts else 0.0
        by_day.append(
            {"day_of_week": day, "count": count, "avg_amount": avg_amount}
        )

    # amount stats by transaction type (lightweight describe)
    type_stats: Dict[str, Dict[str, Any]] = {}
    for r in data:
        t_type = r.get("transaction_type") or "Unknown"
        amount = _as_float(r.get("amount_inr"))
        stat = type_stats.setdefault(
            t_type, {"count": 0, "amounts": [], "min": None, "max": None}
        )
        stat["count"] += 1
        stat["amounts"].append(amount)
        stat["min"] = (
            amount
            if stat["min"] is None
            else min(stat["min"], amount)
        )
        stat["max"] = (
            amount
            if stat["max"] is None
            else max(stat["max"], amount)
        )

    amount_stats_by_type: Dict[str, Dict[str, Any]] = {}
    for t_type, stat in type_stats.items():
        amounts = stat["amounts"]
        amount_stats_by_type[t_type] = {
            "count": stat["count"],
            "mean": round(mean(amounts), 2) if amounts else 0.0,
            "min": round(stat["min"], 2) if stat["min"] is not None else 0.0,
            "max": round(stat["max"], 2) if stat["max"] is not None else 0.0,
        }

    return {
        "by_hour": by_hour,
        "by_day_of_week": by_day,
        "amount_stats_by_type": amount_stats_by_type,
    }