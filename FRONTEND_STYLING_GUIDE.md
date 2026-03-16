# Frontend Styling and Sizing Guide

## Overview
This document provides guidelines for styling and sizing components in the frontend of the Asset Management System. The goal is to maintain a consistent, modern, and responsive design across the application.

---

## General Styling

### Framework
- **Tailwind CSS**: Used for styling the application.
- **Responsive Design**: Ensures the application works seamlessly on all screen sizes.

### Theme
- **Colors**:
  - Primary: `#1D4ED8` (Blue)
  - Secondary: `#9333EA` (Purple)
  - Accent: `#F59E0B` (Yellow)
  - Neutral: `#374151` (Gray)
  - Background: `#F3F4F6` (Light Gray)
- **Typography**:
  - Font Family: `Inter`, `sans-serif`
  - Font Sizes: Defined in `tailwind.config.js` for consistency.

### Utilities
- **Spacing**: Use Tailwind's `p-`, `m-`, and `gap-` utilities for padding, margins, and grid gaps.
- **Borders**: Use `rounded` classes for consistent border radii.
- **Shadows**: Use `shadow-md` for subtle depth effects.

---

## Component Sizing

### Buttons
- **Default**:
  - Padding: `px-4 py-2`
  - Font Size: `text-sm`
  - Border Radius: `rounded-md`
- **Variants**:
  - Primary: `bg-blue-500 text-white hover:bg-blue-600`
  - Secondary: `bg-gray-500 text-white hover:bg-gray-600`

### Cards
- **Default**:
  - Width: `w-full md:w-1/3`
  - Padding: `p-4`
  - Border Radius: `rounded-lg`
  - Shadow: `shadow-lg`

### Tables
- **Default**:
  - Width: `w-full`
  - Padding: `p-2`
  - Border: `border border-gray-300`
  - Text Alignment: `text-left`
- **Responsive**:
  - Use `overflow-x-auto` for horizontal scrolling on smaller screens.

---

## Layout Guidelines

### Navbar
- **Position**: Fixed at the top.
- **Height**: `h-16`
- **Background**: `bg-gray-800`
- **Text**: `text-white`

### Sidebar
- **Position**: Fixed on the left.
- **Width**: `w-64`
- **Background**: `bg-gray-900`
- **Text**: `text-gray-300`
- **Collapsible**: Use `hidden md:block` for responsive behavior.

### Content Area
- **Layout**: Flexible grid layout.
- **Padding**: `p-6`
- **Background**: `bg-white`
- **Shadow**: `shadow-sm`

---

## Best Practices
1. **Consistency**: Use predefined classes from `tailwind.config.js`.
2. **Responsiveness**: Test components on multiple screen sizes.
3. **Accessibility**: Ensure proper contrast ratios and keyboard navigation.
4. **Reusability**: Create reusable components for buttons, cards, and tables.

---
