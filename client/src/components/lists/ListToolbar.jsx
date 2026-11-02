import Input from "../forms/Input";
import Select from "../forms/Select";

// Search box + status dropdown. Parent (useListView) ki values seedhi pass karein
const ListToolbar = ({ search, onSearchChange, searchPlaceholder, status, onStatusChange, statusOptions }) => {
  return (
    <div className="list-filters">
      <Input
        label="Search"
        type="search"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Select
        label="Status"
        placeholder="All statuses"
        options={statusOptions}
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      />
    </div>
  );
};

export default ListToolbar;