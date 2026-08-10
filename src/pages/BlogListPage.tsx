import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';
import { BLOG_POSTS } from '../lib/blogPosts';
import { ArrowRight } from 'lucide-react';

export const BlogListPage: React.FC = () => {
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

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">Blog</h1>
            <p className="text-neutral-500 text-lg">Guides, tips, and stories from the Sampark team.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-neutral-200/60 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-[180px] bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs font-semibold px-4 text-center">
                  {post.title}
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{post.date}</p>
                  <h2 className="text-xl font-black text-neutral-900 leading-snug group-hover:text-[#F2BA03] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-neutral-500 line-clamp-2">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4">
                    Read article
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
