import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        <div className="mt-4 text-center text-sm">
          {footerText}{" "}
          <Link href={footerLinkHref} className="underline">
            {footerLinkText}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
