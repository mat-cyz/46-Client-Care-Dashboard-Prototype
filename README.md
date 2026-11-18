# Chanel Client Care Quality Assessment Dashboard

Executive-facing React and TypeScript prototype for prior-day Client Care operations. It covers 24 months of data (December 2024 through November 2026, data through Nov 30, 2026) with November 2026 as the default filter. All values are aggregated mock data for demonstration only. Structure and navigation patterns follow the Lucas Museum dashboard prototype.

## Run locally

```
npm install
npm run dev
```

Use `npm run build` for a production build.

## Prototype structure

- `src/data/constants.ts` holds picklist values, rating weights, the QA target (80), and chart colors from the Colorblind Safe brand palette.
- `src/data/mockData.ts` generates deterministic Salesforce-style Quality Assessment records (seeded, covering Dec 2024 - Nov 2026 with the same 18 advisors throughout).
- `src/types/dashboard.ts` defines the record, filter, and dashboard data contracts.
- `src/services/dashboardService.ts` provides the `DashboardDataAdapter` boundary. `MockDashboardAdapter` can be replaced by an FDP gold-layer API or Power BI semantic-model adapter without changing the UI.
- `src/components` contains the sidebar, filter bar, KPI cards, charts, and tables.
- `src/pages/QualityAssessmentPage.tsx` composes the KPI, trend, distribution, team ranking, channel, and advisor sections plus the refresh footer.

## Behavior notes

- Filters: date basis (Created or Completed), year, month, team, channel, status, and advisor. Open assessments have no completed date and drop out under the Completed Date basis.
- The trend line follows the Year filter and ignores the Month filter, so each selected year shows its months with data (for example, 2026 shows Jan-Nov); selected months are highlighted. With several years selected, each month combines them.
- QA score ranges 0-135: each of the four Client Experience dimensions is worth up to 33.75 points (Exceeds Expectations scores above the 25-point base). In the CX score averages, Exceeds Expectations is weighted 120 and the other ratings 100, 80, 60, and 0, so an average can exceed 100%.
- Overall QA pass is "Yes" when the QA score is at least 80 and Resolution is not rated "0% - Opportunity to Improve".
- Product Reviews is marked Planned for Phase 2: non-interactive, greyed out, and focusable with release guidance on hover or focus (Escape dismisses it).
- Layout is capped at a 1920px wide by 900px tall canvas. From 1500px wide the KPI cards sit in one row and the advisor table sits beside the charts; narrower windows stack the sections. The Chanel logo is a text wordmark placeholder; replace it with the approved brand asset. ABChanel Corpo falls back to Helvetica when the font is not installed.

## Refresh cycle

The intended production cadence is a scheduled overnight load into curated gold-layer tables in Federated Data Platform (FDP). Source ingestion and reconciliation should complete before 5:00 AM Eastern; the dashboard then publishes the most recently completed business day. Sources: Salesforce, Genesys, Medallia, Emplifi, PFS Web Sales, Product data.
