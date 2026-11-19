# Chanel Client Care Dashboard - Project Brief
I want to create an executive-facing React and TypeScript prototype for prior-day Client Care operations at Chanel encompassing 24 months of fake data. All values are aggregated November 2026 mock data for demonstration only.

Dashboard should have a navigation pane on the left side with Quality Assessment section active and Product Reviews section **PLANNED** for Phase 2. **Planned** are non-interactive (greyed-out) and have keyboard-accessible release guidance.

Filter/slicer section should be on top and centered. 

Business Objective for Quality Assessment Reporting
The Quality Assessment Reporting Dashboard will provide Client Care leadership, operations managers, quality analysts, and team leads with visibility into advisor quality performance, coaching opportunities, trends, and compliance with service standards.
The dashboard should support both strategic and operational decision-making by allowing stakeholders to:
- Monitor overall quality performance.
- Identify quality trends over time.
- Compare advisor, team, and location performance.
- Detect coaching and training opportunities.
- Track progress against quality targets.
- Measure quality impact on customer experience
- Display Avg QA Scores by Advisor (create some fake names), Team (Team Lead, QA, Self_Assessment, Calibration, Nesting), Chanel (Chat, Email, Phone), Status (Completed, Open, Disputed), Create Date/Month/Year, Completed Date/Month/Year
- Dashboard should span all 12 months of 2026 with December 2026 as default filter value

Quality Assessment (QA) reporting overview:

1. Executive KPI Section (below filter/slicer section)

Display as KPI cards at the top of the report:
- Average QA Score (#.#) with ranges between 0-135
- Evaluation Volume (#) representing the total count of QA assessments
- Overall QA Pass Rate (%) measuring the % of records where Overall QA Score = "Yes"
- Average Client Experience Resolution Score (%) with ranges between 0%-100%
- Average Client Experience Discovery Score (%) with ranges between 0%-100%
- Average Client Experience Process & Procedure Score (%) with ranges between 0%-100%
- Average Client Experience Communication Score (%) with ranges between 0%-100%
- QA Score Target (#) showing a static value of 80
- Variance to QA Target (#.#) calculated as Avg QA Score - QA Score Target

2. Trend line section (below Executive KPI section on the left side)
Average QA Score by Month

3. Quality Distribution section (below Executive KPI section on the right side)
Stacked bar showing for all 4 categories (Resolution, Discovery, Process & Procedure, Communications):
- Exceeds Expectations (weight value 120)
- 100% - Meeting All Expecatations (weight value 100)
- 80% - Mostly Meeting Expectations (weight value 80)
- 60% - Patially Meets Expectations (weight value 60)
- 0% - Opportunity to Improve (weight value 0)

4. Team comparison section (below Trend line section)
- Rank teams by QA Score

5. Channel Performance section (below Quality Distribution sectionn)
- Compare phone, email, chat

## Case Management project plan
Business Objective for a single-page executive Case Management Reporting

The Case Management & Resolution Dashboard will provide Client Care leadership, operations managers, team leaders, and support teams with visibility into case volumes, case outcomes, resolution effectiveness, boutique collaboration, escalations, and operational bottlenecks.
The purpose of the dashboard is to help stakeholders answer:
•	How many client cases are being handled?
•	Are cases being resolved efficiently and effectively?
•	Where are operational bottlenecks occurring?
•	Which case types require the most effort?
•	How often are cases escalated?
•	How dependent is Client Care on boutique support?
•	Are boutiques responding to Client Care inquiries in a timely manner?
•	Which case categories drive the highest workload?
•	Are clients receiving resolution in a timely manner?
•	What trends are emerging that require operational attention?


Group metrics into a few business stories that leadership can quickly understand:
- Workload
- Case Types
- Resolution Effectiveness
- Operational Risk
- Case Lifecycle


Case Management Reporting overview:

1. Executive KPI Section (below filter/slicer section)
•	Total Case Count
•	Open Technical Bugs
•	Escalated Case Count
•	Requires Follow-Up Case Count
•	First Call Resolution (%)

Business Questions Answered
•	How much work are we handling?
•	How many cases require attention?
•	How healthy is the operation today?


2. Horizontal bar chart section with case counts by reason 
Business Question
Which case types/reasons generate the highest volume for Client Care?



3. Dual-Axis Line Chart with Case Resolution Trend

Measures:
•	Case Resolution Time
•	First Call Resolution (%)
Over:
•	Week
•	Month

Business Questions
Are we resolving cases faster?
Is faster resolution leading to better first-contact resolution?


4. Scatter Plot with Operational Risk Matrix
X-Axis:
•	Average Case Duration
Y-Axis:
•	Escalation Rate
Bubble Size:
•	Total Cases
Legend:
•	Case Type
Examples:
•	Returns
•	Repairs
•	Technical Bugs
•	Click & Collect
Why? This is the most valuable visual on the dashboard.
Leadership can instantly identify:
•	High-volume/high-risk processes
•	Slow-moving case categories
•	Escalation hotspots
Business Question
Which case types create the greatest operational burden?

5. Stacked Column Chart with Open Workload & Follow-Up Analysis
Measures:
•	Open Cases
•	Requires Follow-Up Cases
•	Escalated Cases
Category:
•	Team or Boutique
Why? Highlights where unresolved workload is accumulating.
Business Questions
Which teams or boutiques need intervention?
Where are cases getting stuck?
 
 6. Histogram or Stacked Bar with Case Aging Distribution
Buckets:
•	Same Day
•	1-3 Days
•	4-7 Days
•	8-14 Days
•	15+ Days
Measure:
•	Case Count
Using:
•	Case Duration Time
Why? Executives immediately understand backlog risk.
Business Questions
How old are our open cases?
Is backlog under control?


## Data Source
Salesforce Quality Assessment object with potential key fields:
- Assessment ID
- Team
- Status
- Case Number
- Created Date
- Completed Date
- Advisor
- Manager
- Channel (Phone, Email, Chat)
- Overall QA Pass Flag Y/N
- QA Score
- Client Experience Resolution Score 
- Client Experience Discovery Score
- Client Experience Process & Procedure Score
- Client Experience Communication Score

For Case Management page, the Case object from Salesforce in the main data source of data.

## Canvas Size and Design
- Max-width 1920px 
- Max-Length 900px

## Links for logos
Refer to Chanel website for styling, logos, and colors:
- https://www.chanel.com/us/

## Brand guide
Below is json file with brand styling:
{
"name":"Colorblind Safe",
"dataColors":["#000000","#FD625E","#B887AD","#8AD4EB","#FEC0BF","#FFD5C2","#456A76","#003BFF","#3599B8","#DFBFBF","#4AC5BB","#5F6B6D","#FB8281","#F4D25A","#7F898A","#A4DDEE","#FDAB89","#B687AC","#28738A","#A78F8F","#168980","#293537","#BB4A4A","#B59525","#475052","#6A9FB0","#BD7150","#7B4F71","#1B4D5C","#706060","#0F5C55","#1C2325"],
"background":"#FFFFFF",
"foreground":"#070f25",
"tableAccent":"#0F1934",
"textClasses":
{
"label":{"fontFace":"ABChanel Corpo Regular"},
"callout":{"fontFace":"'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif"},
"title":{"fontFace":"'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif"},
"header":{"fontFace":"'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif"}
}
}


## Refresh data cycle
Footer with last refreshed date. The intended production cadence is a scheduled overnight load into curated gold-layer tables in Federated Data Platform (FDP). Source ingestion and reconciliation should complete before 5:00 AM Eastern; the dashboard then publishes the most recently completed business day. Data sources come from Salesforce, Genesys, Medallia, Emplifi, PFS Web Sales, Product data.

## Existing prototype website to refer
Reference the entire project based on the Lucas Museum Dashboard prototype with the link to github below:
- https://github.com/michaelbodellslalom/lucas-museum-dashboard