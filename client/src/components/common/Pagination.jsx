import { useId } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

// Dikhne wale page numbers: pehla, aakhri, aur maujooda ke aas paas wale. Beech ka farq "…" se dikhta hai
const getVisiblePages = (page, pageCount) => {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((number) => number >= 1 && number <= pageCount).sort((a, b) => a - b);

  const items = [];
  sorted.forEach((number, index) => {
    if (index > 0 && number - sorted[index - 1] > 1) items.push("gap-" + number);
    items.push(number);
  });
  return items;
};

// page: maujooda page (1 se shuru), pageCount: kul pages, onChange(newPage)
// pageSize, onPageSizeChange(size), totalItems dein to "Per page" (5/10/15/20) dropdown bhi aata hai
const Pagination = ({ page, pageCount, onChange, pageSize, onPageSizeChange, totalItems = 0 }) => {
  const selectId = useId();

  // Dropdown tab kaam ka hai jab items sab se chhote page size se zyada hon
  const showSizeSelect = Boolean(onPageSizeChange) && totalItems > PAGE_SIZE_OPTIONS[0];
  const showPages = pageCount > 1;

  // Na pages, na dropdown: kuch dikhane ki zaroorat nahi
  if (!showSizeSelect && !showPages) return null;

  return (
    <div className="pagination-bar">
      {showSizeSelect && (
        <div className="page-size">
          <label htmlFor={selectId} className="page-size-label">
            Per page
          </label>
          <select
            id={selectId}
            className="field page-size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(event.target.value)}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {showPages && (
        <nav className="pagination" aria-label="Pagination">
          <button
            type="button"
            className="page-btn"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <FiChevronLeft aria-hidden="true" />
          </button>

          {getVisiblePages(page, pageCount).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="page-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`page-btn ${item === page ? "page-btn-active" : ""}`}
                onClick={() => onChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="page-btn"
            onClick={() => onChange(page + 1)}
            disabled={page === pageCount}
            aria-label="Next page"
          >
            <FiChevronRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;