/**
 * FooterSection Component - 4-column footer with links
 *
 * Dark footer with brand info, product links, resources, and company links.
 */

import { Github, MessageCircle, Twitter } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Try Demo", href: "#demo" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing (Free!)", href: "#pricing" },
      { label: "Roadmap", href: "https://github.com/pouryaak/lokul/projects", external: true },
      { label: "Changelog", href: "https://github.com/pouryaak/lokul/releases", external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://docs.lokul.app", external: true },
      { label: "FAQ", href: "#faq" },
      { label: "Blog", href: "https://blog.lokul.app", external: true },
      { label: "GitHub", href: "https://github.com/lokul/lokul", external: true },
      { label: "Discord", href: "https://discord.gg/lokul", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "https://lokul.app/about", external: true },
      { label: "Privacy Policy", href: "https://lokul.app/privacy", external: true },
      { label: "Terms of Service", href: "https://lokul.app/terms", external: true },
      { label: "Contact", href: "mailto:hello@lokul.app" },
      { label: "Press Kit", href: "https://lokul.app/press", external: true },
    ],
  },
];

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const socialLinks: SocialLink[] = [
  {
    icon: <Github className="h-5 w-5" />,
    href: "https://github.com/pouryaak/lokul",
    label: "GitHub",
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    href: "https://discord.gg/lokul",
    label: "Discord",
  },
  {
    icon: <Twitter className="h-5 w-5" />,
    href: "https://twitter.com/lokulapp",
    label: "Twitter",
  },
];

export function FooterSection() {
  const handleLinkClick = (link: FooterLink) => {
    if (link.external) {
      window.open(link.href, "_blank");
    } else if (link.href.startsWith("#")) {
      const element = document.getElementById(link.href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (link.href.startsWith("mailto:")) {
      window.location.href = link.href;
    }
  };

  return (
    <footer className="border-t border-gray-800 bg-[#1A1A1A]">
      <div className="content-container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#FF6B35]/30 blur-lg" />
                <img src="/lokul-logo.png" alt="" className="relative h-8 w-8" />
              </div>
              <span
                className="text-xl font-bold text-white"
                style={{
                  fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
                  fontStyle: "italic",
                }}
              >
                Lokul
              </span>
            </div>

            <p
              className="mb-4 text-gray-400"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              Your AI. Your browser. Your privacy.
            </p>

            <p
              className="mb-6 text-sm text-gray-500"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              ChatGPT-quality AI that runs 100% in your browser.
            </p>

            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              © 2026 Lokul
              <br />
              Open source. MIT License.
            </p>
          </div>

          {footerColumns.map((column, index) => (
            <div key={index}>
              <h3
                className="mb-4 font-semibold text-white"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="cursor-pointer text-left text-gray-400 transition-colors hover:text-[#FF6B35]"
                      style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-[#FF6B35]"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              Made with <span className="text-red-500">♥</span> for privacy by{" "}
              <a
                className="font-semibold text-[#FF6B35] hover:underline"
                href="https://pourya.space"
              >
                Pourya Akrami
              </a>
            </p>

            <a
              href="https://github.com/pouryaak/lokul"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-[#FF6B35]"
              style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
            >
              <span>★</span>
              Star us on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
