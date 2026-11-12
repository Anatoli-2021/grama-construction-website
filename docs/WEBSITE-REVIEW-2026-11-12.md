# Grama Development website review — November 12, 2026

## Decision and scope

Tony confirmed the exact public spelling **Grama Development** in the Grama Website chat on November 12. The website remains the existing React/Vite/GSAP product in `Anatoli-2021/grama-construction-website`, hosted in Railway project `earnest-wisdom`. This is an incremental review candidate, not a rebuild. Name confirmation does not approve the identity design, legal-name change, trademark clearance or production release.

Branch: `feature/website-mobile-enquiry-2026-11-12`, based on Nail's architectural candidate `7e5c4a192a9162069ad563a6b835beaa29c29e5b` / [PR #14](https://github.com/Anatoli-2021/grama-construction-website/pull/14). The PR is stacked on that branch so its new changes can be reviewed separately. Main is older than the current live Contact and multipage work; starting from main would drop functionality.

## Competitor evidence and original adaptations

Primary websites were reviewed on November 12. Text/navigation review covered all six. Browser screenshots additionally showed Focus, Sterling Bay, Related and Golub; Magellan and Belgravia initially showed loading states, so no visual or animation conclusions are drawn from those captures. This is a design study, not a competitor mobile/performance audit. Their headquarters were not independently verified.

| Reference | Observed pattern | Original Grama direction |
| --- | --- | --- |
| [Sterling Bay](https://sterlingbay.com/) / [portfolio](https://sterlingbay.com/our-portfolio/) | Named project imagery, location captions and portfolio-led discovery. | Keep Grama's actual completed residence as the homepage proof; retain real case links and restrained captions. |
| [Magellan](https://www.magellandevelopment.com/) / [St. Regis case](https://www.magellandevelopment.com/projects/thestregischicago/) | Connected company, expertise and project narrative; structured project information and a partnership action. | Explain Grama's site planning, design coordination and construction scope, then offer specific project discussions. |
| [Related](https://www.related.com/) / [luxury residential](https://www.related.com/residential/luxury-condominiums) | Distinct residential content, architecture and neighborhood stories; visitor-interest paths. | Preserve homeowner intent from a completed case into Contact; avoid borrowing amenities or commercial claims. |
| [Focus](https://workwithfocus.com/) / [portfolio](https://workwithfocus.com/portfolio/) | Development, Construction and Investments are distinct; project role/location and enquiry purpose are visible. | Make landowner, developer and investment-partner choices explicit, using Grama's existing allowed enquiry topics. |
| [Belgravia](https://belgraviagroup.com/developments) | New and completed development categories with location and project-specific status. | Keep completed work separate from proposed Dexter Acres; retain the honest empty current-listings state. |
| [Golub](https://golubandcompany.com/capabilities/) / [portfolio](https://golubandcompany.com/portfolio/) | Capabilities connect to project evidence; current/past work and investor access are separate. | Keep public project proof and protected investor presentations separate; connect capabilities to cases and relevant enquiries. |

No competitor assets, logos, copy, fonts or branded compositions were copied or downloaded into the repository. The implemented layout, copy and code are original additions to the existing Grama design.

## Implemented in this increment

- Homepage: luxury-home positioning and clear scope from site planning/design coordination through construction. A restrained development-opportunities section routes landowners, developers and investment partners into their respective Contact topics.
- Portfolio: existing rail gains Arrow Left/Right and Home/End keyboard controls, an accessible usage hint and resize reconciliation. Existing motion preference determines scroll behavior; no new autoplay is added.
- Completed cases: separate custom-home and development enquiry actions preserve the intended Contact tab/topic without a stale Dexter lot.
- Mobile menu: focus enters the menu, Tab/Shift+Tab stay within the header, Escape restores the trigger, page content becomes inert, background scrolling pauses, and desktop resize restores normal interaction. Menu links have at least 44px touch height and the menu can scroll on short screens.
- Identity review: records the confirmed spelling while retaining design/production approval gates and the existing original SVG studies.

## Ownership and release

- Nail (`axmatea`) owns Animated Experience at `feature/animated-experience`, inspected at `aa8eb97`. This branch and the architectural candidate diverge after the Contact integration. No timeline, animated assets or branch history is overwritten or merged in this increment. Coordination was posted on PR #14; an acknowledgement/integration checkpoint remains pending.
- Claude Code owns Development OS; the infrastructure task acknowledged website boundaries. Its locked package files, OS code, central underscore handoff and staging-os remain untouched. See [PR #15](https://github.com/Anatoli-2021/grama-construction-website/pull/15) for OS coordination.
- Current inspected production source is `feature/contact-enquiry-delivery` at `bf33cf4`, with the existing Railway domain and `gramadevelopment.com`. Production and DNS are not changed by this task.
- Website review uses only the existing `humorous-delight` service in `staging-website`, with no production variables/accounts copied. Contact delivery stays disabled; private presentation data/accounts stay absent. No new service or paid-plan change is needed.
- Exact deployment, verification and remaining actions are recorded in [TEAM-HANDOFF.md](TEAM-HANDOFF.md). Tony must approve the identity and exact release commit before production changes.

## Proposed next design increment

After Tony reviews this staging candidate: select the identity direction; agree the Animated Experience integration with Nail; then connect capability explanations to selected existing case studies. Keep motion restrained, prioritize mobile loading, and publish only approved facts. Broader typography, page ordering or motion changes should be reviewed against the candidate rather than replacing the site wholesale.
