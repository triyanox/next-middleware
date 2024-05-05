'use client';
import link$ from '@/lib/link$';
import { useRouter } from 'next/navigation';
import {
  SolarLinkMinimalisticLineDuotone,
  SolarLockLineDuotone,
  SolarLockUnlockedLineDuotone,
} from './_components/icons';
import { cn } from './_components/utils';

type ContentType = {
  title: string;
  description: string;
  href: string;
  isProtected: boolean;
};

type Content = ContentType[];

const content: Content = [
  {
    title: 'Posts',
    description: 'View all the posts on the site',
    isProtected: false,
    href: link$({
      href: '/posts',
    }),
  },
  {
    title: 'Admin',
    description: 'Admin panel',
    isProtected: true,
    href: link$({
      href: '/admin',
    }),
  },
];

export default function Home() {
  return (
    <main className="flex z-10 flex-col min-h-screen items-center justify-between p-24">
      <div className="flex gap-4 flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold text-black">
          @triyanox/next-middleware
        </h1>
        <p className="text-center max-w-md text-md text-zinc-700">
          This is a basic example showcasing the usage of
          @triyanox/next-middleware with Next.js
        </p>
        <div className="p-4 rounded-2xl bg-zinc-100 mt-8">
          <p className="text-center max-w-2xl text-md text-zinc-700">
            In this example we are using the middleware to protect some of the
            mock paid content and the admin part. We are using
            "@triyanox/next-routes" to generate the routes object on the fly and
            we are using the "@triyanox/next-middleware" to protect the routes
            using the middleware pattern in Next.js.
          </p>
        </div>
        <div className="flex w-full flex-col justify-center mt-4 items-center gap-4">
          <h3 className="text-2xl font-semibold text-black">Site content</h3>
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            {content.map((item) => (
              <LinkCard
                key={item.title}
                title={item.title}
                description={item.description}
                href={item.href}
                isProtected={item.isProtected}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const LinkCard = ({ description, href, isProtected, title }: ContentType) => {
  const router = useRouter();
  return (
    <div className="p-4 rounded-2xl bg-zinc-100 w-full flex justify-between items-center">
      <div className="flex flex-col justify-center items-start">
        <h3 className="font-medium text-lg text-black">{title}</h3>
        <p className="text-zinc-700 max-w-md text-md text-center">
          {description}
        </p>
      </div>
      <div className="flex justify-center h-full items-center gap-1">
        <button
          onClick={() => router.push(href)}
          className="p-2 rounded-xl bg-black/90 text-white text-sm"
        >
          <SolarLinkMinimalisticLineDuotone />
        </button>
        <div
          className={cn(
            'p-2 rounded-xl bg-white/90 text-black ring-1 ring-black text-sm',
            {
              'ring-red-500': isProtected,
              'text-red-500': isProtected,
            },
          )}
        >
          {isProtected ? (
            <SolarLockLineDuotone />
          ) : (
            <SolarLockUnlockedLineDuotone />
          )}
        </div>
      </div>
    </div>
  );
};
