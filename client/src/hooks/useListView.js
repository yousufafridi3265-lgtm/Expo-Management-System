import { useMemo, useState } from "react";

// Ek hi list par search + status filter + pagination (client par). Backend poori list bhejta hai.
// items: poori list. getSearchText(item): jis text mein search hoga. getStatus(item): item ka status
// getSearchText aur getStatus module level par likhein (component ke andar nahi), taake har render par naye na bane
const useListView = ({ items, getSearchText, getStatus, initialPageSize = 5 }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const term = search.trim().toLowerCase();

  const filtered = useMemo(() => items.filter((item) =>
    (!status || getStatus(item) === status) && (!term || getSearchText(item).toLowerCase().includes(term))),
    [items, status, term, getSearchText, getStatus]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Cancel ke baad list chhoti ho jaye to aakhri page se aage na rahein
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filter badalte hi pehle page par wapas
  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };
  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };
  // Page size badalne par bhi pehle page par wapas
  const changePageSize = (value) => {
    setPageSize(Number(value));
    setPage(1);
  };
  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return {
    search,
    status,
    page: currentPage,
    pageCount,
    pageSize,
    filtered,
    pageItems,
    hasFilters: Boolean(term || status),
    changeSearch,
    changeStatus,
    changePageSize,
    clearFilters,
    setPage
  };
};

export default useListView;