import csv
import os
from typing import Dict, List, Any

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/upi_transactions_2024.csv")

_records: List[Dict[str, Any]] | None = None


def _normalize_column(name: str) -> str:
    return (
        name.strip()
        .replace(" ", "_")
        .replace("(", "")
        .replace(")", "")
        .lower()
    )


def get_records() -> List[Dict[str, Any]]:
    """
    Lightweight in‑memory representation of the CSV data using
    built‑in types only (no pandas / numpy).
    """
    global _records
    if _records is not None:
        return _records

    print("Loading dataset...")
    records: List[Dict[str, Any]] = []

    with open(DATA_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        field_map = {_name: _normalize_column(_name) for _name in reader.fieldnames or []}

        for row in reader:
            normalized: Dict[str, Any] = {}
            for raw_key, value in row.items():
                key = field_map.get(raw_key, raw_key)
                normalized[key] = value
            records.append(normalized)

    _records = records
    print(f"Dataset loaded: {len(_records)} rows")
    if _records:
        print(f"Columns: {sorted(_records[0].keys())}")
    return _records


def get_summary() -> dict:
    data = get_records()
    if not data:
        return {
            "total_transactions": 0,
            "date_range": {"start": None, "end": None},
            "transaction_types": {},
            "success_rate": 0.0,
            "total_amount_crores": 0.0,
            "states": 0,
            "banks": 0,
        }

    total_transactions = len(data)

    timestamps = [row.get("timestamp") for row in data if row.get("timestamp")]
    start = min(timestamps) if timestamps else None
    end = max(timestamps) if timestamps else None

    transaction_types: Dict[str, int] = {}
    success_count = 0
    total_amount = 0.0
    states = set()
    banks = set()

    for row in data:
        t_type = row.get("transaction_type")
        if t_type:
            transaction_types[t_type] = transaction_types.get(t_type, 0) + 1

        if row.get("transaction_status") == "SUCCESS":
            success_count += 1

        amount_raw = row.get("amount_inr")
        if amount_raw not in (None, ""):
            try:
                total_amount += float(amount_raw)
            except ValueError:
                pass

        state = row.get("sender_state")
        if state:
            states.add(state)

        bank = row.get("sender_bank")
        if bank:
            banks.add(bank)

    success_rate = round(success_count / total_transactions * 100, 2) if total_transactions else 0.0
    total_amount_crores = round(total_amount / 1e7, 2)

    return {
        "total_transactions": total_transactions,
        "date_range": {
            "start": str(start) if start is not None else None,
            "end": str(end) if end is not None else None,
        },
        "transaction_types": transaction_types,
        "success_rate": success_rate,
        "total_amount_crores": total_amount_crores,
        "states": len(states),
        "banks": len(banks),
    }