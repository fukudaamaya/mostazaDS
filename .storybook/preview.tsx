import type { Preview, Decorator } from '@storybook/react';
import React, { useEffect } from 'react';
import '../src/index.css';

export const globalTypes = {
  platform: {
    description: 'Platform',
    defaultValue: 'web',
    toolbar: {
      title: 'Platform',
      icon: 'mobile',
      items: [
        { value: 'web',    right: '🖥',  title: 'Web' },
        { value: 'mobile', right: '📱',  title: 'Mobile' },
      ],
      dynamicTitle: true,
    },
  },
  theme: {
    description: 'Theme',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'dark',  title: 'Dark',  icon: 'moon' },
      ],
      dynamicTitle: true,
    },
  },
};

const withTokens: Decorator = (Story, context) => {
  const platform = (context.globals.platform as string) ?? 'web';
  const theme    = (context.globals.theme    as string) ?? 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-platform', platform);
    root.setAttribute('data-theme',    theme);
    root.style.background = theme === 'dark' ? '#0C1111' : '#FAFAFA';
  }, [platform, theme]);

  return (
    <div
      data-platform={platform}
      data-theme={theme}
      style={{ padding: '24px', minHeight: '100vh' }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTokens],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
  },
};

export default preview;
