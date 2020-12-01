import React, { useContext, useState } from 'react';

const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222',
  },
};
const ThemeContext = React.createContext(themes.light);

function Toolbar({ onChange }) {
  return (
    <div>
      <ThemedButton onChange={onChange} />
    </div>
  );
}

function ThemedButton({ onChange }) {
  const theme = useContext(ThemeContext);
  return (
    <button onClick={onChange} style={theme}>
      I am styled by theme context!
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState(themes.light);

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar onChange={() => setTheme({ ...themes.dark })} />
    </ThemeContext.Provider>
  );
}
