import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './SearchBar.module.css';

const defaultSuggestionPool = [
  '华为 nova 14 Ultra',
  '小米 15 Pro',
  '机械革命 极光X',
  '暗影精灵11',
  '海尔 家宴冰箱',
  '小天鹅 洗烘一体机',
  '兰蔻 小黑瓶',
  '安热沙 小金瓶',
  '特步 两千公里五代',
  '70迈 记录仪',
];

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [inputValue, setInputValue] = useState(state.searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionPool = state.products.length > 0 ? state.products.slice(0, 10).map((product) => product.name) : defaultSuggestionPool;

  const suggestions = suggestionPool.filter((suggestion) =>
    inputValue.trim() ? suggestion.toLowerCase().includes(inputValue.trim().toLowerCase()) : false,
  );

  const handleSearch = (query?: string) => {
    const nextQuery = (query ?? inputValue).trim();

    dispatch({ type: 'SET_SEARCH_QUERY', payload: nextQuery });
    setInputValue(nextQuery);
    setShowSuggestions(false);
    navigate(nextQuery ? '/search' : '/');
  };

  useEffect(() => {
    setInputValue(state.searchQuery);
  }, [state.searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <form
        className={styles.searchBox}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setShowSuggestions(event.target.value.trim().length > 0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setShowSuggestions(false);
          }}
          onFocus={() => setShowSuggestions(inputValue.trim().length > 0)}
          placeholder="搜索手机、游戏本、空调、精华、防晒"
          className={styles.searchInput}
        />

        <button className={styles.searchButton} type="submit" aria-label="搜索商品">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.searchButtonText}>搜索</span>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 ? (
        <div className={styles.suggestions}>
          {suggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              className={styles.suggestionItem}
              type="button"
              onClick={() => handleSearch(suggestion)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
