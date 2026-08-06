import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";
import { matchRoute, TEST_MATCH } from "../fixtures/test-data";

/**
 * Page Object for the Match Detail page - `/matches/[matchId]`
 *
 * The whole page is client-side rendered: `match-root.tsx` fetches the match in a `useEffect`,
 * so `navigate()` waits for either the detail container or one of the empty states.
 */
export class MatchDetailPage extends BasePage {
  async navigate(
    matchId: string = TEST_MATCH.matchId,
    profileIds: Array<number | string> | null = TEST_MATCH.profileIds,
  ): Promise<void> {
    await this.goto(matchRoute(matchId, profileIds));
  }

  /** Wait until the client-side fetch settled into one of its three states. */
  async waitForSettled(): Promise<void> {
    await expect(
      this.matchDetail.or(this.notFoundMessage).or(this.errorCard).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  get matchDetail(): Locator {
    return this.getByTestId("match-detail");
  }

  get title(): Locator {
    return this.getByTestId("match-detail-title");
  }

  get notFoundMessage(): Locator {
    return this.getByTestId("match-not-found");
  }

  get errorCard(): Locator {
    return this.getByTestId("error-card");
  }

  // ------------------------------------------------------------------ rosters

  get axisTable(): Locator {
    return this.getByTestId("match-players-table-axis");
  }

  get alliesTable(): Locator {
    return this.getByTestId("match-players-table-allies");
  }

  axisRows(): Locator {
    return this.axisTable.locator("tbody tr");
  }

  alliesRows(): Locator {
    return this.alliesTable.locator("tbody tr");
  }

  // ------------------------------------------------------------------- charts

  get mapCard(): Locator {
    return this.getByTestId("match-card-map");
  }

  get dmgDoneCard(): Locator {
    return this.getByTestId("match-card-dmg-done");
  }

  get unitsKilledCard(): Locator {
    return this.getByTestId("match-card-units-killed");
  }

  get vehiclesKilledCard(): Locator {
    return this.getByTestId("match-card-vehicles-killed");
  }

  get capturedPointsCard(): Locator {
    return this.getByTestId("match-card-captured-points");
  }

  get replayCard(): Locator {
    return this.getByTestId("match-card-replay");
  }

  /** All four Nivo pie charts of the match. */
  get chartCards(): Locator[] {
    return [
      this.dmgDoneCard,
      this.unitsKilledCard,
      this.vehiclesKilledCard,
      this.capturedPointsCard,
    ];
  }

  get replayButton(): Locator {
    return this.replayCard.getByRole("button", { name: "Replay" });
  }
}
