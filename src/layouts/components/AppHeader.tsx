import { Avatar, Dropdown } from "antd";
import { useState } from "react";

import { LogoutIcon } from "@/assets/icons";
import { getUserData } from "@/utils/auth";

import styles from "./AppHeader.module.scss";

/** 系统名称 */
const APP_TITLE = "统一待办SPA应用";

/**
 * 顶栏是否展示用户信息(姓名/部门/头像 + 退出登录下拉)。
 *
 * 由环境变量 `VITE_SHOW_USER_INFO` 控制,默认展示;
 * 显式填 `false` / `0` / `off` / `no`(不区分大小写,忽略首尾空格)时隐藏。
 * 隐藏后顶栏只剩系统标题 + 页面插槽。
 */
const SHOW_USER_INFO = !/^(false|0|off|no)$/i.test(
  (import.meta.env.VITE_SHOW_USER_INFO ?? "").trim(),
);

/**
 * 顶栏:左侧系统标识 + 插槽容器(内容由各页面通过 HeaderSlot 投入),
 * 右侧用户信息。
 */
export function AppHeader({
  slotRef,
}: {
  slotRef: (element: HTMLDivElement | null) => void;
}) {
  // 用户信息从门户写入的 portal_userData 读取(name / orgName 字段)
  const [userData] = useState(() => getUserData());
  const userName = userData?.name || userData?.userName || "未知用户";
  const userDept = userData?.orgName || "";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{APP_TITLE}</h1>
        {/* 页面插槽:tab / 文案 / 操作区,没内容时自动隐藏 */}
        <div className={styles.slot} ref={slotRef} />
      </div>
      {/* 右侧用户信息:由 VITE_SHOW_USER_INFO 控制展示/隐藏 */}
      {SHOW_USER_INFO && (
        <div className={styles.actions}>
          <Dropdown
            menu={{
              items: [
                // TODO: 接入登出接口
                {
                  key: "logout",
                  icon: <LogoutIcon />,
                  label: "退出登录",
                  danger: true,
                },
              ],
            }}
          >
            <div className={styles.userInfo}>
              <div className={styles.userMeta}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.userDept}>{userDept}</span>
              </div>
              <Avatar className={styles.avatar}>{userName.slice(0, 1)}</Avatar>
            </div>
          </Dropdown>
        </div>
      )}
    </header>
  );
}
