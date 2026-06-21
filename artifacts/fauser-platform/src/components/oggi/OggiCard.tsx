import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function OggiCard({
  title,
  icon,
  cta,
  children,
}: {
  title: string;
  icon?: ReactNode;
  cta?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {cta && (
          <Link href={cta.href}>
            <Button size="sm" variant="secondary">{cta.label}</Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}
