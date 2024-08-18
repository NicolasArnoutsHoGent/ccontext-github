"use client";

// components/Header.tsx
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";

const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <a href="/">
          <h1 className="text-2xl font-bold">GitHub CContext</h1>
          <h2 className="text-sm">Chat with any github codebase you want!</h2>
        </a>

        <div>
          <Link href="/credit-store" className="text-sm font-medium">
            Credit Store
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Header;
