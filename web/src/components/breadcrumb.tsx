
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Breadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav className="text-sm text-zinc-400 mb-4 w-full overflow-x-auto">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs sm:text-sm whitespace-nowrap">
                {segments.map((segment, index) => {
                    const href = '/' + segments.slice(0, index + 1).join('/');
                    const isLast = index === segments.length - 1;
                    const isFirst = index === 0;

                    return (
                        <li key={href} className="flex items-center gap-x-1 text-xs">
                            {!isFirst && (
                                <span>/</span>
                            )}
                            {isLast ? (
                                <span className="capitalize text-zinc-300 text-xs">{decodeURIComponent(segment)}</span>
                            ) : (
                                <Link
                                    href={href}
                                    className="hover:underline capitalize text-white font-medium"
                                >
                                    {decodeURIComponent(segment)}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
