"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SearchButton } from "@/components/search";
import { Moon, Sun, Monitor } from "lucide-react";

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ breadcrumbs }: HeaderProps) {
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            {breadcrumbs.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === breadcrumbs.length - 1;
              const isMiddle = !isFirst && !isLast;
              const shouldHideOnMobile = isMiddle && breadcrumbs.length > 2;

              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem className={shouldHideOnMobile ? "hidden sm:flex" : ""}>
                    {!isLast ? (
                      <BreadcrumbLink href={item.href || "#"} className="truncate max-w-24 sm:max-w-none">
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="truncate max-w-32 sm:max-w-none">{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className={shouldHideOnMobile ? "hidden sm:flex" : ""} />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="ml-auto flex items-center gap-2">
        <SearchButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
