import { useId, useState } from 'react';
import './SitePlan.css';

// Square-foot areas transcribed from the supplied C5 drawing. They are drawing-
// reported areas, not surveyed, approved, or independently verified dimensions.
export const lotData = [
  { id: 1, area: 10023, frontage: 'Webster Lane' },
  { id: 2, area: 10014, frontage: 'Webster Lane' },
  { id: 3, area: 10014, frontage: 'Webster Lane' },
  { id: 4, area: 10014, frontage: 'Webster Lane' },
  { id: 5, area: 10856, frontage: 'Internal street' },
  { id: 6, area: 9834, frontage: 'Internal street' },
  { id: 7, area: 9552, frontage: 'Internal street' },
  { id: 8, area: 11251, frontage: 'Internal street' },
  { id: 9, area: 13701, frontage: 'Internal street' },
  { id: 10, area: 8439, frontage: 'Dexter Lane' },
  { id: 11, area: 8435, frontage: 'Dexter Lane' },
  { id: 12, area: 9080, frontage: 'Dexter Lane' },
  { id: 13, area: 9396, frontage: 'Internal street' },
  { id: 14, area: 9655, frontage: 'Internal street' },
];

// Traced in the supplied north-up C5 image's coordinate system. Curved parcel
// edges use short polygon segments; the map is a concept, not a survey overlay.
const lotGeometry = [
  { id: 1, points: '193,377 403,367 403,458 193,469', label: [297, 421] },
  { id: 2, points: '193,469 403,458 403,550 194,560', label: [298, 513] },
  { id: 3, points: '194,560 403,550 403,641 195,651', label: [299, 604] },
  { id: 4, points: '195,651 403,641 404,731 196,742', label: [300, 695] },
  { id: 5, points: '403,367 606,358 649,414 638,420 626,433 619,443 615,453 403,458', label: [507, 410] },
  { id: 6, points: '403,458 615,453 611,472 610,498 610,542 403,550', label: [503, 504] },
  { id: 7, points: '403,550 610,542 610,580 612,601 619,623 592,633 403,641', label: [501, 592] },
  { id: 8, points: '403,641 592,633 619,623 628,639 649,654 635,679 611,719 404,731', label: [519, 686] },
  { id: 9, points: '604,132 700,128 700,403 649,414 606,358', label: [652, 261] },
  { id: 10, points: '700,128 879,119 880,206 700,216', label: [790, 172] },
  { id: 11, points: '700,216 880,206 880,297 700,306', label: [790, 261] },
  { id: 12, points: '700,306 880,297 881,395 700,403', label: [790, 355] },
  { id: 13, points: '649,654 662,660 682,664 704,660 706,856 612,861 611,719 635,679', label: [659, 770] },
  { id: 14, points: '704,660 723,655 741,641 755,624 766,603 773,583 817,724 722,854 706,856', label: [751, 721] },
];

export default function SitePlan({ onSelectLot, selectedLot }) {
  const titleId = useId();
  const descriptionId = useId();
  const [localSelection, setLocalSelection] = useState(null);
  const activeLot = selectedLot === undefined ? localSelection : selectedLot;

  function selectLot(id) {
    if (selectedLot === undefined) setLocalSelection(id);
    onSelectLot?.(id);
  }

  function handleKeyDown(event, id) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectLot(id);
    }
  }

  return (
    <div className="siteplan">
      <svg
        className="siteplan__map"
        viewBox="0 0 800 800"
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <title id={titleId}>Dexter Acres proposed 14-lot concept plan</title>
        <desc id={descriptionId}>
          North is up. Select a numbered lot with a click, or use Tab and Enter
          or Space. Lots 1 through 4 face Webster Lane; lots 10 through 12 face
          Dexter Lane. Other lots face the internal dead-end street. An unbuilt
          stormwater parcel lies east of the turning bulb. Traced from the
          supplied C5 drawing; this concept plan does not establish approval,
          availability, or surveyed boundaries.
        </desc>

        <g transform="translate(-118 -68) scale(.92)">
          <g className="siteplan__compass" aria-hidden="true" transform="translate(300 188)">
            <text x="0" y="-30" textAnchor="middle">N</text>
            <path d="M0 -16 L9 12 L0 7 L-9 12 Z" />
            <path className="siteplan__compass-tail" d="M0 7 V27" />
          </g>

          <g aria-hidden="true">
            <path className="siteplan__street-edge" d="M161 339 L164 791" />
            <path className="siteplan__street" d="M161 339 L164 791" />
            <path className="siteplan__street-edge" d="M925 91 L925 392 Q925 477 965 528 L980 543" />
            <path className="siteplan__street" d="M925 91 L925 392 Q925 477 965 528 L980 543" />
          </g>

          <path
            className="siteplan__reserve"
            d="M787 486 L882 479 Q893 529 933 559 L817 724 L773 583 L771 501 Q770 490 787 486 Z"
            aria-hidden="true"
          />

          <g aria-hidden="true">
            <path
              className="siteplan__right-of-way"
              d="M884 409 L700 417 C645 419 614 444 612 494 L612 577 C612 635 638 662 680 663 C733 665 772 631 773 583 C774 551 755 530 735 518 C724 511 720 507 723 501 L884 489 Z"
            />
            <path
              className="siteplan__internal-street"
              d="M929 431 L704 428 C659 430 631 449 628 493 L628 574 C628 620 645 645 681 646 C719 649 750 622 751 585 C753 558 739 541 718 529 C701 519 693 510 696 494 C698 482 707 479 726 479 L929 468 Z"
            />
          </g>

          <g className="siteplan__lots">
            {lotGeometry.map(({ id, points, label }) => {
              const lot = lotData[id - 1];
              const isSelected = activeLot === id;
              return (
                <g
                  key={id}
                  className={`siteplan__lot${isSelected ? ' siteplan__lot--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lot ${id}, ${lot.area.toLocaleString('en-US')} square feet reported on drawing, ${lot.frontage}`}
                  aria-pressed={isSelected}
                  onClick={() => selectLot(id)}
                  onKeyDown={(event) => handleKeyDown(event, id)}
                >
                  <polygon className="siteplan__parcel" points={points} />
                  <text className="siteplan__lot-number" x={label[0]} y={label[1]} aria-hidden="true">
                    {id.toString().padStart(2, '0')}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="siteplan__labels" aria-hidden="true">
            <text className="siteplan__street-name" transform="translate(164 565) rotate(-90)" textAnchor="middle">WEBSTER LANE</text>
            <text className="siteplan__street-name" transform="translate(927 259) rotate(-90)" textAnchor="middle">DEXTER LANE</text>
            <text className="siteplan__internal-name" transform="translate(651 548) rotate(-90)" textAnchor="middle">INTERNAL STREET</text>
            <text className="siteplan__reserve-label" x="842" y="560" textAnchor="middle">
              <tspan x="842">STORMWATER</tspan>
              <tspan x="842" dy="17">PARCEL</tspan>
            </text>
          </g>
        </g>
      </svg>

      <div className="siteplan__legend" aria-hidden="true">
        <span><i className="siteplan__swatch" />Proposed lots</span>
        <span className="siteplan__concept">Concept plan</span>
      </div>
    </div>
  );
}
