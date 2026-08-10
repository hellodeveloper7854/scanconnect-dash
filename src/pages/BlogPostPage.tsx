import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';
import { getBlogPost } from '../lib/blogPosts';
import { ChevronRight } from 'lucide-react';

export const BlogPostPage: React.FC<{ slug: string }> = ({ slug }) => {
  const post = getBlogPost(slug);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="Blog"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path =
            nav === 'How it works' ? '/' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      {!post ? (
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-neutral-500">This article could not be found.</p>
        </main>
      ) : (
        <main className="flex-1">
          {/* Header block */}
          <div className="bg-[#F7F5EF] py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <nav className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
                <a href="/" className="hover:text-neutral-900">
                  Home
                </a>
                <ChevronRight className="w-3.5 h-3.5" />
                <a href="/blog" className="hover:text-neutral-900">
                  Blog
                </a>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-neutral-900">{post.title}</span>
              </nav>

              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                {post.date} &middot; {post.category}
              </p>

              <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                {post.title}
              </h1>

              <p className="text-neutral-500 text-lg max-w-2xl">{post.excerpt}</p>
            </div>
          </div>

          {/* Content card */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="h-[200px] sm:h-[280px] bg-[#EDEAE0] flex items-center justify-center text-neutral-400 text-sm font-semibold px-6 text-center">
                {post.title}
              </div>
              <div className="p-8 sm:p-10 space-y-6">
                {post.body.map((paragraph, idx) =>
                  paragraph.split(' ').length <= 8 && !paragraph.endsWith('.') ? (
                    <h2 key={idx} className="text-2xl font-black text-neutral-900 pt-2">
                      {paragraph}
                    </h2>
                  ) : (
                    <p key={idx} className="text-base text-neutral-600 leading-relaxed italic">
                      {paragraph}
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      <DashboardFooter />
    </div>
  );
};
