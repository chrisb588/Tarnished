import { useNavigate } from "react-router-dom";
import "./MerchantItem.css";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(t) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function groupSchedule(operating_days) {
  // Group by same start+end time
  const timeGroups = {};
  for (const s of operating_days) {
    const key = `${s.start_time}|${s.end_time}`;
    if (!timeGroups[key])
      timeGroups[key] = { days: [], start: s.start_time, end: s.end_time };
    timeGroups[key].days.push(s.day);
  }

  return Object.values(timeGroups).map(({ days, start, end }) => {
    // Sort days by week order
    const sorted = days
      .slice()
      .sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b));

    // Group consecutive days
    const ranges = [];
    let rangeStart = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      const curr = sorted[i];
      const prevIdx = WEEK.indexOf(prev);
      const currIdx = WEEK.indexOf(curr);

      if (curr && currIdx === prevIdx + 1) {
        prev = curr;
      } else {
        ranges.push(
          rangeStart === prev ? rangeStart : `${rangeStart} - ${prev}`,
        );
        rangeStart = curr;
        prev = curr;
      }
    }

    return {
      days: ranges.join(", "),
      start: formatTime(start),
      end: formatTime(end),
    };
  });
}

export default function MerchantItem({ merchant, onSelect }) {
  return (
    <article
      className={`
    merchant-card
  `}
      onClick={onSelect ? () => onSelect(merchant) : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* IMAGE */}
      <div className="merchant-card__image">
        {merchant.location_photo ? (
          <img
            src={merchant.location_photo}
            alt={merchant.name}
            loading="lazy"
          />
        ) : (
          <div className="merchant-card__placeholder">🥬</div>
        )}
      </div>

      {/* INFO */}
      <div className="merchant-card__info">
        <h3 className="merchant-card__name">{merchant.name}</h3>
        {/* LOCATION */}
        {merchant.location && (
          <p className="listing-card__vendor">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {merchant.location}
          </p>
        )}

        {/* SCHEDULE */}
        {merchant.operating_days && merchant.operating_days.length > 0 && (
          <div className="merchant-card__schedule">
            {groupSchedule(merchant.operating_days).map((entry, i) => (
              <div key={i} className="merchant-card__schedule-entry">
                <span className="schedule-day">{entry.days}</span>{" "}
                <span className="schedule-time">
                  {entry.start} – {entry.end}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY */}
        <div>
          {merchant.category &&
            merchant.category.map((c) => (
              <span className="merchant-card__chip">{c}</span>
            ))}
        </div>
      </div>
    </article>
  );
}
