#!/usr/bin/env python3
"""
Old Oyo Kingdom simulation.

This educational model simulates how leadership balance and cultural life can
shape stability, legitimacy, and prosperity over time.

Note:
- This is a simplified historical simulation for learning and exploration.
- It is not a definitive historical reconstruction.
"""

from __future__ import annotations

import argparse
import random
from dataclasses import dataclass, field
from typing import List


@dataclass
class LeadershipCouncil:
    name: str
    influence: float


@dataclass
class KingdomState:
    year: int = 0
    prosperity: float = 55.0
    legitimacy: float = 58.0
    military_strength: float = 60.0
    cultural_cohesion: float = 62.0
    political_balance: float = 57.0
    trade_network: float = 54.0

    population_index: float = 50.0
    provincial_loyalty: float = 56.0

    alaafin_authority: float = 60.0
    oyo_mesi: LeadershipCouncil = field(
        default_factory=lambda: LeadershipCouncil("Oyo Mesi", 0.60)
    )
    ogboni: LeadershipCouncil = field(
        default_factory=lambda: LeadershipCouncil("Ogboni", 0.55)
    )

    event_log: List[str] = field(default_factory=list)


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def festival_cycle(state: KingdomState) -> None:
    """Seasonal rites, festivals, and oral traditions reinforce identity."""
    base_gain = random.uniform(1.5, 4.5)
    trade_boost = random.uniform(0.5, 2.5)

    state.cultural_cohesion = clamp(state.cultural_cohesion + base_gain)
    state.legitimacy = clamp(state.legitimacy + base_gain * 0.45)
    state.trade_network = clamp(state.trade_network + trade_boost)

    state.event_log.append(
        f"Festivals and ritual observances strengthen cohesion (+{base_gain:.1f})."
    )


def cavalry_and_security(state: KingdomState) -> None:
    """Mounted military readiness impacts tribute routes and provincial control."""
    training_outcome = random.uniform(-2.5, 3.5)
    state.military_strength = clamp(state.military_strength + training_outcome)

    if training_outcome >= 0:
        loyalty_gain = random.uniform(0.4, 2.1)
        state.provincial_loyalty = clamp(state.provincial_loyalty + loyalty_gain)
        state.event_log.append(
            f"Cavalry readiness improved (+{training_outcome:.1f}); loyalty rises."
        )
    else:
        loyalty_loss = abs(training_outcome) * random.uniform(0.4, 0.8)
        state.provincial_loyalty = clamp(state.provincial_loyalty - loyalty_loss)
        state.event_log.append(
            f"Military strain reduced readiness ({training_outcome:.1f}); loyalty weakens."
        )


def governance_cycle(state: KingdomState) -> None:
    """
    The Alaafin leads, while Oyo Mesi and Ogboni moderate excess and arbitrate
    legitimacy. Better balance usually improves stability.
    """
    tension = state.alaafin_authority - (state.oyo_mesi.influence + state.ogboni.influence) * 50

    if tension > 8:
        # Central overreach can reduce trust.
        legitimacy_drop = random.uniform(1.5, 4.0)
        balance_drop = random.uniform(1.0, 3.5)
        state.legitimacy = clamp(state.legitimacy - legitimacy_drop)
        state.political_balance = clamp(state.political_balance - balance_drop)
        state.event_log.append(
            "Royal authority overreached council norms; elite trust declines."
        )

    elif tension < -8:
        # Excessive elite fragmentation may weaken command.
        military_drop = random.uniform(0.8, 2.8)
        prosperity_drop = random.uniform(0.7, 2.4)
        state.military_strength = clamp(state.military_strength - military_drop)
        state.prosperity = clamp(state.prosperity - prosperity_drop)
        state.event_log.append(
            "Council factionalism limits decisive rule; campaign capacity falls."
        )

    else:
        # Healthy negotiation between palace and institutions.
        gain = random.uniform(1.0, 3.8)
        state.political_balance = clamp(state.political_balance + gain)
        state.legitimacy = clamp(state.legitimacy + gain * 0.55)
        state.event_log.append(
            "Palace, Oyo Mesi, and Ogboni align; governance legitimacy improves."
        )

    # Council influence drifts over time.
    state.oyo_mesi.influence = clamp(
        state.oyo_mesi.influence + random.uniform(-0.03, 0.03), 0.35, 0.80
    )
    state.ogboni.influence = clamp(
        state.ogboni.influence + random.uniform(-0.03, 0.03), 0.35, 0.80
    )
    state.alaafin_authority = clamp(
        state.alaafin_authority + random.uniform(-2.0, 2.0), 35.0, 80.0
    )


def trade_and_tribute(state: KingdomState) -> None:
    """Regional trade and tribute flows drive prosperity."""
    trade_volatility = random.uniform(-3.0, 4.0)
    tribute_efficiency = (
        0.35 * state.legitimacy + 0.35 * state.military_strength + 0.30 * state.provincial_loyalty
    ) / 100.0

    prosperity_delta = trade_volatility + (tribute_efficiency - 0.5) * 6.0
    state.prosperity = clamp(state.prosperity + prosperity_delta)
    state.trade_network = clamp(state.trade_network + random.uniform(-1.8, 2.2))

    if prosperity_delta >= 0:
        state.event_log.append(
            f"Trade and tribute perform well this year (+{prosperity_delta:.1f} prosperity)."
        )
    else:
        state.event_log.append(
            f"Trade headwinds and tribute friction reduce wealth ({prosperity_delta:.1f})."
        )


def shock_events(state: KingdomState) -> None:
    """Irregular events: succession disputes, frontier conflict, or exceptional harvests."""
    roll = random.random()

    if roll < 0.10:
        # Succession stress.
        leg_loss = random.uniform(4.0, 8.0)
        bal_loss = random.uniform(3.0, 7.0)
        state.legitimacy = clamp(state.legitimacy - leg_loss)
        state.political_balance = clamp(state.political_balance - bal_loss)
        state.event_log.append(
            "Succession dispute emerges; palace-council relations become tense."
        )
    elif roll < 0.22:
        # Frontier campaign success.
        mil_gain = random.uniform(2.0, 5.5)
        loyalty_gain = random.uniform(1.5, 4.0)
        state.military_strength = clamp(state.military_strength + mil_gain)
        state.provincial_loyalty = clamp(state.provincial_loyalty + loyalty_gain)
        state.event_log.append(
            "Frontier campaign succeeds; military prestige and loyalty increase."
        )
    elif roll < 0.34:
        # Market expansion.
        pros_gain = random.uniform(2.0, 5.0)
        trade_gain = random.uniform(2.0, 5.0)
        state.prosperity = clamp(state.prosperity + pros_gain)
        state.trade_network = clamp(state.trade_network + trade_gain)
        state.event_log.append(
            "Regional market corridor expands; commerce and wealth surge."
        )


def update_population(state: KingdomState) -> None:
    """Population index responds to prosperity, cohesion, and conflict pressures."""
    growth_signal = (
        0.45 * state.prosperity + 0.35 * state.cultural_cohesion + 0.20 * state.legitimacy
    ) / 100.0
    conflict_penalty = max(0.0, (45.0 - state.military_strength) / 40.0)

    delta = (growth_signal - 0.5) * 3.2 - conflict_penalty
    state.population_index = clamp(state.population_index + delta)


def yearly_step(state: KingdomState) -> None:
    state.year += 1
    state.event_log = []

    festival_cycle(state)
    governance_cycle(state)
    cavalry_and_security(state)
    trade_and_tribute(state)
    shock_events(state)
    update_population(state)


def stability_score(state: KingdomState) -> float:
    return round(
        (
            0.20 * state.legitimacy
            + 0.20 * state.political_balance
            + 0.18 * state.cultural_cohesion
            + 0.17 * state.provincial_loyalty
            + 0.15 * state.military_strength
            + 0.10 * state.prosperity
        ),
        1,
    )


def run_simulation(years: int, seed: int | None) -> KingdomState:
    if seed is not None:
        random.seed(seed)

    state = KingdomState()

    print("=" * 72)
    print("OLD OYO KINGDOM SIMULATION")
    print("Culture, Governance, and Leadership Dynamics")
    print("=" * 72)

    for _ in range(years):
        yearly_step(state)
        print(f"\nYear {state.year}")
        print("-" * 72)
        for event in state.event_log:
            print(f"- {event}")

        print(
            "State: "
            f"Prosperity={state.prosperity:.1f}, "
            f"Legitimacy={state.legitimacy:.1f}, "
            f"Military={state.military_strength:.1f}, "
            f"Cohesion={state.cultural_cohesion:.1f}, "
            f"Balance={state.political_balance:.1f}, "
            f"Loyalty={state.provincial_loyalty:.1f}, "
            f"PopulationIdx={state.population_index:.1f}"
        )

    print("\n" + "=" * 72)
    print("FINAL ASSESSMENT")
    print("=" * 72)
    print(f"Stability Score: {stability_score(state):.1f} / 100")

    if stability_score(state) >= 70:
        outlook = "High stability: institutions and culture are mutually reinforcing."
    elif stability_score(state) >= 52:
        outlook = "Moderate stability: strong core, but sensitive to political shocks."
    else:
        outlook = "Low stability: legitimacy and governance balance need restoration."

    print(f"Outlook: {outlook}")
    print(
        "Leadership Snapshot: "
        f"Alaafin authority={state.alaafin_authority:.1f}, "
        f"Oyo Mesi influence={state.oyo_mesi.influence:.2f}, "
        f"Ogboni influence={state.ogboni.influence:.2f}"
    )

    return state


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Simulate Old Oyo leadership style and cultural dynamics."
    )
    parser.add_argument(
        "--years",
        type=int,
        default=12,
        help="Number of years to simulate (default: 12).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional random seed for reproducible outcomes.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    years = max(1, args.years)
    run_simulation(years=years, seed=args.seed)


if __name__ == "__main__":
    main()
