import React, {createContext, useState} from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [themeMode, setTheme] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const setThemeMode = (value) => {
        setTheme(value);
      }
    

    return (
        <AppContext.Provider
          value={{
            themeMode,
            setThemeMode,
            searchValue,
            setSearchValue
          }}
        >
          {children}
        </AppContext.Provider>
      );
    };
    