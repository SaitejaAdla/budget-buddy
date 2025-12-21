import React from "react";

const Footer = () => {
  return (
    <footer className="bg-indigo-600 text-[#CBD5E1] py-8 px-4 text-center text-sm sm:text-base rounded-b-lg">
      <div className="max-w-4xl mx-auto space-y-2">
        <p className="font-medium">
          © {new Date().getFullYear()} Expense Tracker. All rights reserved.
        </p>

        <p className="text-[#94A3B8]">
          Expense Tracker is currently under active development. Features and content may
          change.
        </p>

        <div className="space-x-3">
          <a
            href="/home"
            className="underline hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-[#CBD5E1]">|</span>
          <a
            href="/home"
            className="underline hover:text-white transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
