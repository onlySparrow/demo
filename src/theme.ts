import type { ThemeConfig } from 'antd'

/**
 * antd 主题 —— 色号与 src/assets/styles/_tokens.scss 同源,改色两边同步。
 * cssVar 开启后 token 落成 CSS 变量,降低 cssinjs 运行时开销,也为换肤留口子。
 */
export const antdTheme: ThemeConfig = {
  cssVar: {},
  token: {
    colorPrimary: '#005daa',
    colorInfo: '#214ae2',
    colorSuccess: '#2e7d32',
    colorWarning: '#934600',
    colorError: '#ba1a1a',

    colorText: '#333333',
    colorTextSecondary: '#404753',

    colorBgLayout: '#f7f9fc',
    colorBgContainer: '#ffffff',

    colorBorder: '#c0c7d6',
    colorBorderSecondary: '#e0e3e6',

    borderRadius: 6,
  },
}
