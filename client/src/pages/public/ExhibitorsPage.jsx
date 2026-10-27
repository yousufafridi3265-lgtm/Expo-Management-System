import { useMemo, useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ExhibitorCard from "../../components/common/ExhibitorCard";
import Button from "../../components/common/Button";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import { getExhibitors } from "../../apis/exhibitorApi";

const ExhibitorsPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Har harf par request na jaye, is liye typing rukne ke baad hi search chalta hai
  const debouncedSearch = useDebounce(search.trim());
  const hasFilters = Boolean(debouncedSearch || category);

  // Backend filter karta hai: ?search= (company ya product ka naam) aur ?category=
  const { data: exhibitors, loading, error, reload } = useFetch(
    () => getExhibitors({ search: debouncedSearch || undefined, category: category || undefined }),
    [debouncedSearch, category]
  );

  // Backend ke paas categories ki alag list nahi hai. Dropdown ke liye ek baar sab approved exhibitors la kar
  // un ki categories nikaal lete hain
  const { data: allExhibitors } = useFetch(() => getExhibitors(), []);
  const categoryOptions = useMemo(() => {
    const names = [...new Set((allExhibitors || []).map((exhibitor) => exhibitor.category))].sort();
    return names.map((name) => ({ value: name, label: name }));
  }, [allExhibitors]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
  };

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading exhibitors..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (exhibitors.length === 0) {
      return (
        <EmptyState
          title="No exhibitors found"
          message={
            hasFilters
              ? "No exhibitor matches your search. Try different words or clear the filters."
              : "No exhibitors have been approved yet."
          }
        >
          {hasFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </EmptyState>
      );
    }

    return (
      <div className="event-grid">
        {exhibitors.map((exhibitor) => (
          <ExhibitorCard key={exhibitor._id} exhibitor={exhibitor} />
        ))}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container-wide">
        <PageHeader title="Exhibitors" subtitle="Find companies by name, product or category" />

        <div className="filter-bar">
          <Input
            label="Search"
            type="search"
            placeholder="Company or product name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Category"
            placeholder="All categories"
            options={categoryOptions}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>

        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default ExhibitorsPage;