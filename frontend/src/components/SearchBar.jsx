import { useEffect, useRef, useState } from "react";
import {
  FaLocationDot,
  FaMagnifyingGlass,
  FaLocationArrow,
} from "react-icons/fa6";
import "./SearchBar.css";

function SearchBar({ onSearch, onNormalSearch }) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchBoxRef = useRef(null);
  const requestRef = useRef(null);

  // ==========================================
  // LOCATION SEARCH WHILE TYPING
  // ==========================================
  useEffect(() => {
    const query = searchText.trim();

    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    if (requestRef.current) {
      requestRef.current.abort();
    }

    const controller = new AbortController();
    requestRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setShowSuggestions(true);

       const url =
  "http://localhost:5000/api/locations?query=" +
  encodeURIComponent(query);
        console.log("Location URL:", url);

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        console.log("Location response:", data);

        if (
          response.ok &&
          data &&
          data.success === true &&
          Array.isArray(data.locations)
        ) {
          const indianPlaces = data.locations.filter(
            (place) =>
              !place.countryCode ||
              String(place.countryCode).toUpperCase() === "IN"
          );

          setSuggestions(indianPlaces);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Location search error:", error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchText]);

  // ==========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ==========================================
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ==========================================
  // SELECT SUGGESTION
  // ==========================================
  const handleSuggestionClick = (place) => {
    const selectedPlace = {
      id: place.id,

      name: place.name || place.city || "",

      mandal: place.mandal || "",

      district: place.district || "",

      state: place.state || "Andhra Pradesh",

      latitude:
        place.latitude !== undefined &&
        place.latitude !== null
          ? Number(place.latitude)
          : null,

      longitude:
        place.longitude !== undefined &&
        place.longitude !== null
          ? Number(place.longitude)
          : null,
    };

    console.log("Selected location:", selectedPlace);

    setSearchText(selectedPlace.name);

    setShowSuggestions(false);

    setSuggestions([]);

    if (onSearch) {
      onSearch(selectedPlace);
    }
  };

  // ==========================================
  // NORMAL SEARCH BUTTON
  // ==========================================
  const handleSearchClick = () => {
    const value = searchText.trim();

    if (!value) {
      return;
    }

    setShowSuggestions(false);

    if (onNormalSearch) {
      onNormalSearch(value);
    }
  };

  // ==========================================
  // ENTER KEY
  // ==========================================
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else {
        handleSearchClick();
      }
    }
  };

  // ==========================================
  // PLACE DETAILS
  // ==========================================
  const getPlaceDetails = (place) => {
    const parts = [];

    if (place.mandal) {
      parts.push(place.mandal);
    }

    if (place.district) {
      parts.push(place.district);
    }

    if (place.state) {
      parts.push(place.state);
    }

    parts.push("India");

    return parts.filter(Boolean).join(" · ");
  };

  return (
    <div
      className="search-wrapper"
      ref={searchBoxRef}
    >
      {/* SEARCH BAR */}
      <div className="search-box">
        <FaMagnifyingGlass className="search-icon" />

        <input
          type="text"
          value={searchText}
          placeholder="Search for a city or place..."
          autoComplete="off"
          onChange={(event) => {
            const value = event.target.value;

            setSearchText(value);

            if (value.trim().length >= 1) {
              setShowSuggestions(true);
            } else {
              setShowSuggestions(false);
              setSuggestions([]);
            }
          }}
          onFocus={() => {
            if (searchText.trim().length >= 1) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className="search-button"
          onClick={handleSearchClick}
        >
          <FaMagnifyingGlass />
          <span>Search</span>
        </button>

        <button
          type="button"
          className="location-button"
          title="Use location"
        >
          <FaLocationArrow />
        </button>
      </div>

      {/* ==========================================
          SUGGESTIONS
         ========================================== */}
      {showSuggestions &&
        searchText.trim().length >= 1 && (
          <div className="suggestions-box">
            {/* LOADING */}
            {loading && (
              <div className="suggestion-message">
                Searching places...
              </div>
            )}

            {/* RESULTS */}
            {!loading &&
              suggestions.length > 0 &&
              suggestions.map((place, index) => (
                <button
                  type="button"
                  className="suggestion-item"
                  key={
                    place.id ||
                    `${place.name}-${place.latitude}-${place.longitude}-${index}`
                  }
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSuggestionClick(place);
                  }}
                >
                  <div className="suggestion-icon">
                    <FaLocationDot />
                  </div>

                  <div className="suggestion-content">
                    <strong>
                      {place.name ||
                        place.city ||
                        "Unknown place"}
                    </strong>

                    <span>
                      {getPlaceDetails(place)}
                    </span>
                  </div>
                </button>
              ))}

            {/* NO RESULTS */}
            {!loading &&
              suggestions.length === 0 && (
                <div className="suggestion-message">
                  No places found
                </div>
              )}
          </div>
        )}
    </div>
  );
}

export default SearchBar;