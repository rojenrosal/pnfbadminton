'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-gray-800 text-white shadow relative">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <a href="/" data-testid="navBar-home-btn">
          <Image
            src="/pnfblack.jpg"
            alt="logo"
            width={180}
            height={60}
            className="mb-3 mt-3 mr-3 ml-3"
          />
        </a>
        {/* Hamburger Button */}
        <button
          className="block lg:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMenuOpen
                  ? 'M6 18L18 6M6 6l12 12' // X icon
                  : 'M4 6h16M4 12h16m-7 6h7' // Hamburger icon
              }
            />
          </svg>
        </button>

        {/* Menu Links */}
        <ul
          className={`lg:flex lg:space-x-4 lg:items-center ${
            isMenuOpen ? 'block' : 'hidden'
          } absolute top-full left-0 w-full bg-gray-800 lg:static lg:w-auto transition-all duration-300 z-50`}
        >
          <li className="border-b lg:border-none">
            <Link
              href="/"
              onClick={handleCloseMenu}
              className="block px-4 py-2 hover:text-yellow-400 lg:inline-block"
            >
              Home
            </Link>
          </li>
          <li className="border-b lg:border-none">
            <Link
              href="/teams"
              onClick={handleCloseMenu}
              className="block px-4 py-2 hover:text-yellow-400 lg:inline-block"
            >
              Teams
            </Link>
          </li>
          <li className="border-b lg:border-none">
            <Link
              href="/matches"
              onClick={handleCloseMenu}
              className="block px-4 py-2 hover:text-yellow-400 lg:inline-block"
            >
              Matches
            </Link>
          </li>
          <li className="border-b lg:border-none">
            <Link
              href="/leaderboard"
              onClick={handleCloseMenu}
              className="block px-4 py-2 hover:text-yellow-400 lg:inline-block"
            >
              Leaderboard
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
