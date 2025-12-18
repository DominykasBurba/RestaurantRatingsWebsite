import React from 'react'

export const UtensilsIcon = ({ className = '', width = 24, height = 24 }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 2V8C3 9.65685 4.34315 11 6 11C7.65685 11 9 9.65685 9 8V2H7V8C7 8.55228 6.55228 9 6 9C5.44772 9 5 8.55228 5 8V2H3Z"
      fill="currentColor"
    />
    <path
      d="M11 2V22H13V14C13 12.3431 14.3431 11 16 11C17.6569 11 19 12.3431 19 14V22H21V14C21 11.2386 18.7614 9 16 9C13.2386 9 11 11.2386 11 14V2Z"
      fill="currentColor"
    />
  </svg>
)

export const StarIcon = ({ className = '', width = 24, height = 24, filled = false }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
)

