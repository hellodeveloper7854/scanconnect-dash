import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';
import { Markdown } from '../components/Markdown';
import { fetchCmsPage, type SitePage } from '../lib/content';

/** The standard public page frame (header, footer) around admin-managed content. */
export const CmsFrame: React.FC<{ title: string; children: React.ReactNode; updatedAt?: string }> = ({
  title,
  children,
  updatedAt,
}) => (
  <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
    <DashboardHeader
      userData={{ fullName: '', mobileNumber: '', email: '' }}
      onLogout={() => {}}
      activeNav=""
      isLoggedIn={false}
      onNavClick={(nav) => {
        window.location.href = nav === 'How it works' ? '/#how-it-works' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
      }}
    />
    <main className="flex-1">
      <div className="py-12 sm:py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900">{title}</h1>
          {updatedAt && (
            <p className="text-xs text-neutral-400 mt-2">
              Last updated {new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <div className="mt-8">{children}</div>
        </article>
      </div>
    </main>
    <DashboardFooter />
  </div>
);

/** Sets the browser tab title and meta description for a CMS page. */
const useDocumentMeta = (page: SitePage | null) => {
  useEffect(() => {
    if (!page) return;
    const previousTitle = document.title;
    document.title = `${page.title} | Scan Connect`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    if (page.metaDescription) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = page.metaDescription;
    }
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [page]);
};

/** A page created in the admin panel, served at /p/<slug>. */
export const CmsPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [page, setPage] = useState<SitePage | null | undefined>(undefined); // undefined = loading
  useEffect(() => {
    let alive = true;
    fetchCmsPage(slug).then((p) => alive && setPage(p));
    return () => {
      alive = false;
    };
  }, [slug]);
  useDocumentMeta(page ?? null);

  if (page === undefined) {
    return (
      <CmsFrame title="">
        <div className="h-40" />
      </CmsFrame>
    );
  }
  if (page === null) {
    return (
      <CmsFrame title="Page not found">
        <p className="text-neutral-600">This page doesn&apos;t exist or isn&apos;t available.</p>
        <a href="/" className="inline-block mt-4 font-bold text-[#B58500] underline">
          Back to home
        </a>
      </CmsFrame>
    );
  }
  return (
    <CmsFrame title={page.title} updatedAt={page.updatedAt}>
      <Markdown>{page.content}</Markdown>
    </CmsFrame>
  );
};

/**
 * Wraps one of the website's built-in pages (terms, shipping policy, refund policy).
 * If an admin has published content for that slug it is shown instead; otherwise - or if
 * the content can't be loaded - the built-in page is shown exactly as before.
 */
export const CmsOverride: React.FC<{ slug: string; children: React.ReactNode }> = ({ slug, children }) => {
  const [page, setPage] = useState<SitePage | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    fetchCmsPage(slug).then((p) => alive && setPage(p));
    return () => {
      alive = false;
    };
  }, [slug]);
  useDocumentMeta(page ?? null);

  if (page === undefined) return null; // brief: avoids flashing the old text before the new text arrives
  if (page === null) return <>{children}</>;
  return (
    <CmsFrame title={page.title} updatedAt={page.updatedAt}>
      <Markdown>{page.content}</Markdown>
    </CmsFrame>
  );
};
