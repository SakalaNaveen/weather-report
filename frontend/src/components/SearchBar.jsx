import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!city.trim()) return;

    onSearch(city.trim());
  };

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <FaMagnifyingGlass />

        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <button type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchBar;