import React from 'react';
import MyLayout from './Layout';
import { theme, ConfigProvider } from "antd";

function App() {
  const [currentTheme, setCurrentTheme] = React.useState(() => {
    // If the browser has the property
    if (window.matchMedia) {
      // Watch the theme changes
      const browserThemeChange = (event) => {
        if (event.matches) {
          return { "algorithm": theme.darkAlgorithm }
        }
        return { "algorithm": theme.defaultAlgorithm }
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', browserThemeChange);

      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return { "algorithm": theme.defaultAlgorithm }
      } else {
        return { "algorithm": theme.darkAlgorithm }
      }
    }
    return { "algorithm": theme.defaultAlgorithm }
  });

  React.useEffect(() => {
    configCSSManually();
  }, [currentTheme])
  const configCSSManually = () => {
    // Customize the body theme
    let dropdownLoginMenu = document.querySelector('.dropdown-login-menu');
    if (currentTheme.algorithm === theme.defaultAlgorithm) {
      document.body.style.backgroundColor = "white";
      if (dropdownLoginMenu) { dropdownLoginMenu.classList.remove('black'); }

    } else {
      document.body.style.backgroundColor = "black";
      if (dropdownLoginMenu) { dropdownLoginMenu.classList.add('black'); }
    }
  };
  const changeTheme = (checked) => {
    setCurrentTheme(() => {
      if (checked) {
        return { "algorithm": theme.darkAlgorithm }
      }
      return { "algorithm": theme.defaultAlgorithm }
    });
  };

  return (
    <ConfigProvider theme={currentTheme}>
      <MyLayout currentTheme={currentTheme} changeTheme={changeTheme} configCSSManually={configCSSManually} />
    </ConfigProvider>

  );
}

export default App;
